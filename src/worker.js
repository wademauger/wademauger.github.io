/**
 * Cloudflare Worker for Recipe AI Chat Proxy and Spotify API
 * - Proxies chat requests to various AI providers (Grok, Mistral, OpenAI)
 * - Provides Spotify Web API search functionality for album artwork and data
 */

// AI Provider configurations
const AI_PROVIDERS = {
  grok: {
    baseUrl: 'https://api.x.ai/v1',
    model: 'grok-beta',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  },
  mistral: {
    baseUrl: 'https://api.mistral.ai/v1',
    model: 'mistral-large-latest',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  }
};

// Spotify API configuration
const SPOTIFY_CONFIG = {
  tokenUrl: 'https://accounts.spotify.com/api/token',
  searchUrl: 'https://api.spotify.com/v1/search',
  tokenCache: null,
  tokenExpiry: 0
};

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

// Spotify API Functions
async function getSpotifyToken(env) {
  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }
  
  // Check if we have a valid cached token
  if (SPOTIFY_CONFIG.tokenCache && Date.now() < SPOTIFY_CONFIG.tokenExpiry) {
    return SPOTIFY_CONFIG.tokenCache;
  }
  
  const response = await fetch(SPOTIFY_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  
  if (!response.ok) {
    throw new Error(`Spotify token request failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Cache the token with expiry buffer
  SPOTIFY_CONFIG.tokenCache = data.access_token;
  SPOTIFY_CONFIG.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // 60 second buffer
  
  return data.access_token;
}

async function searchSpotify(query, type, env) {
  const token = await getSpotifyToken(env);
  
  const searchParams = new URLSearchParams({
    q: query,
    type: type,
    limit: '20',
    market: 'US'
  });
  
  const response = await fetch(`${SPOTIFY_CONFIG.searchUrl}?${searchParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Spotify search failed: ${response.status}`);
  }
  
  return await response.json();
}

async function handleSpotifySearch(request, env) {
  try {
    const { artist, album, track, searchType } = await request.json();
    
    if (!artist) {
      return new Response(JSON.stringify({ error: 'Artist name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) }
      });
    }
    
    let query;
    let type;
    
    switch (searchType) {
      case 'artist-albums':
        query = `artist:"${artist}"`;
        type = 'album';
        break;
      case 'album':
        if (album) {
          query = `artist:"${artist}" album:"${album}"`;
          type = 'album,track';
        } else {
          query = `artist:"${artist}"`;
          type = 'album';
        }
        break;
      default:
        // Default search for tracks
        query = `artist:"${artist}"`;
        if (track) query += ` track:"${track}"`;
        if (album) query += ` album:"${album}"`;
        type = 'track,album';
    }
    
    const data = await searchSpotify(query, type, env);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) }
    });
    
  } catch (error) {
    console.error('Spotify search error:', error);
    return new Response(JSON.stringify({ 
      error: 'Spotify search failed',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) }
    });
  }
}

function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowedOrigins = env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',') : [
    'https://wademauger.github.io',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  
  if (allowedOrigins.includes(origin)) {
    return {
      ...CORS_HEADERS,
      'Access-Control-Allow-Origin': origin
    };
  }
  
  return CORS_HEADERS;
}

// Handle OPTIONS preflight requests
function handleOptions(request, env) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request, env)
  });
}

// Transform conversation history to OpenAI format
function formatMessages(userMessage, recipeContext, conversationHistory = [], isFullRecipeRequest = false) {
  const messages = [];
  
  // Different system prompts based on request type
  let systemPrompt;
  
  if (isFullRecipeRequest) {
    systemPrompt = `You are a professional chef and recipe developer. You have EXACTLY 3 response options:

OPTION 1 - RECIPE SUGGESTION(S):
Format: "<intro comment> \`\`\`json<recipe JSON>\`\`\` <repeat as needed>"
Use this for specific recipe requests.

Recipe JSON format:
{
  "title": "Recipe Name",
  "description": "Brief description of the dish",
  "prepTime": "15 minutes",
  "cookTime": "30 minutes",
  "totalTime": "45 minutes",
  "servings": "4 people",
  "difficulty": "Easy|Medium|Hard",
  "ingredients": [
    {
      "quantity": "2",
      "unit": "cups", 
      "name": "all-purpose flour",
      "notes": "sifted (optional)"
    }
  ],
  "steps": [
    "Step 1",
    "Step 2"
  ],
  "notes": ["tip 1", "tip 2"],
  "tags": ["tag1", "tag2"],
  "nutrition": {
    "calories": "250 per serving",
    "protein": "4g",
    "carbs": "35g",
    "fat": "12g"
  }
}

For complex recipes with multiple components, use grouped ingredients:
"ingredients": {
  "For the Cake": [
    {"quantity": "2", "unit": "cups", "name": "flour", "notes": ""},
    {"quantity": "1", "unit": "cup", "name": "sugar", "notes": ""}
  ],
  "For the Frosting": [
    {"quantity": "1", "unit": "cup", "name": "butter", "notes": "softened"}
  ]
}

OPTION 2 - RECIPE SUGGESTION LIST:
Format: "<intro comment>\`\`\`json<recipe suggestion list JSON>\`\`\` <outro comment>"
Use when user needs multiple recipe ideas or browsing options.

Recipe suggestion list JSON format:
{
  "suggestions": [
    {
      "title": "Recipe Name 1",
      "description": "Brief description",
      "difficulty": "Easy|Medium|Hard",
      "tags": ["tag1", "tag2"]
    },
    {
      "title": "Recipe Name 2", 
      "description": "Brief description",
      "difficulty": "Easy|Medium|Hard",
      "tags": ["tag1", "tag2"]
    }
  ]
}

OPTION 3 - CLARIFYING QUESTIONS ONLY:
Use ONLY for clarifying questions or discussing cooking options.
Reply with just a comment - NO JSON required.

CRITICAL RULE: For ALL other responses, you MUST include AT LEAST ONE recipe JSON or recipe suggestion list JSON.`;
  } else {
    systemPrompt = `You are an expert culinary assistant helping with recipe development and cooking advice. You have EXACTLY 3 response options:

OPTION 1 - RECIPE SUGGESTION(S):
Format: "<intro comment> \`\`\`json<recipe JSON>\`\`\` <repeat as needed>"
Use this for specific recipe requests.

Recipe JSON format:
{
  "title": "Recipe Name",
  "description": "Brief description of the dish",
  "prepTime": "15 minutes",
  "cookTime": "30 minutes", 
  "totalTime": "45 minutes",
  "servings": "4 people",
  "difficulty": "Easy|Medium|Hard",
  "ingredients": [
    {
      "quantity": "2",
      "unit": "cups", 
      "name": "all-purpose flour",
      "notes": "sifted (optional)"
    }
  ],
  "steps": [
    "Step 1",
    "Step 2"
  ],
  "notes": ["tip 1", "tip 2"],
  "tags": ["tag1", "tag2"],
  "nutrition": {
    "calories": "250 per serving",
    "protein": "4g",
    "carbs": "35g",
    "fat": "12g"
  }
}

OPTION 2 - RECIPE SUGGESTION LIST:
Format: "<intro comment>\`\`\`json<recipe suggestion list JSON>\`\`\` <outro comment>"
Use when user needs multiple recipe ideas.

Recipe suggestion list JSON format:
{
  "suggestions": [
    {
      "title": "Recipe Name 1",
      "description": "Brief description",
      "difficulty": "Easy|Medium|Hard",
      "tags": ["tag1", "tag2"]
    },
    {
      "title": "Recipe Name 2", 
      "description": "Brief description",
      "difficulty": "Easy|Medium|Hard",
      "tags": ["tag1", "tag2"]
    }
  ]
}

OPTION 3 - CLARIFYING QUESTIONS ONLY:
Use ONLY for clarifying questions or discussing cooking options.
Reply with just a comment - NO JSON required.

CRITICAL RULE: For ALL other responses, you MUST include AT LEAST ONE recipe JSON or recipe suggestion list JSON.

Current Recipe Context:
${recipeContext ? JSON.stringify(recipeContext, null, 2) : 'No recipe loaded'}

Guidelines:
- Be helpful, specific, and actionable
- Focus on practical cooking advice
- Consider food safety and best practices`;
  }

  messages.push({ role: 'system', content: systemPrompt });
  
  // Add conversation history
  for (const msg of conversationHistory.slice(-8)) { // Limit to recent messages
    if (msg.type === 'user') {
      messages.push({ role: 'user', content: msg.content });
    } else if (msg.type === 'ai') {
      messages.push({ role: 'assistant', content: msg.content });
    }
  }
  
  // Add current user message
  messages.push({ role: 'user', content: userMessage });
  
  return messages;
}

// Call AI provider
async function callAIProvider(provider, messages, env, isFullRecipeRequest = false) {
  const config = AI_PROVIDERS[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  
  // Get API key from environment
  const apiKeyVar = `${provider.toUpperCase()}_API_KEY`;
  const apiKey = env[apiKeyVar];
  
  if (!apiKey) {
    throw new Error(`API key not configured for ${provider}`);
  }
  
  // Adjust max_tokens based on request type
  const maxTokens = isFullRecipeRequest ? 2000 : 1000;
  
  const requestBody = {
    model: config.model,
    messages: messages,
    max_tokens: maxTokens,
    temperature: 0.7,
    stream: false
  };
  
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: config.headers(apiKey),
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`${provider} API error:`, response.status, errorText);
    throw new Error(`${provider} API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response generated';
}

// Main request handler
async function handleRequest(request, env) {
  try {
    const { 
      userMessage, 
      recipeContext, 
      conversationHistory, 
      preferredProvider,
      isFullRecipeRequest = false,
      requestType
    } = await request.json();
    
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'Missing userMessage' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) }
      });
    }
    
    console.log('🔄 Worker processing request:', { 
      userMessage: userMessage.substring(0, 50) + '...', 
      isFullRecipeRequest,
      requestType,
      preferredProvider 
    });
    
    const messages = formatMessages(userMessage, recipeContext, conversationHistory, isFullRecipeRequest);
    
    // Try providers in order of preference
    const providers = preferredProvider 
      ? [preferredProvider, 'grok', 'mistral', 'openai']
      : ['grok', 'mistral', 'openai'];
    
    let lastError;
    let usedProvider;
    let response;
    
    for (const provider of providers) {
      try {
        console.log(`Trying provider: ${provider} (full recipe: ${isFullRecipeRequest})`);
        response = await callAIProvider(provider, messages, env, isFullRecipeRequest);
        usedProvider = provider;
        break;
      } catch (error) {
        console.error(`Provider ${provider} failed:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    if (!response) {
      // All providers failed, return fallback response with ChatGPT link
      const fallbackResponse = {
        response: 'I\'m having trouble connecting to AI services right now. You can try asking your question directly in ChatGPT for immediate help.',
        provider: 'fallback',
        chatGptLink: `https://chat.openai.com/?q=${encodeURIComponent(userMessage)}`,
        error: lastError?.message || 'All AI providers unavailable'
      };
      
      return new Response(JSON.stringify(fallbackResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) }
      });
    }
    
    return new Response(JSON.stringify({
      response,
      provider: usedProvider,
      model: AI_PROVIDERS[usedProvider].model
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) }
    });
    
  } catch (error) {
    console.error('Request handling error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) }
    });
  }
}

// Main entry point
export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env);
    }
    
    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: getCorsHeaders(request, env)
      });
    }
    
    // Route requests based on URL path
    const url = new URL(request.url);
    
    if (url.pathname === '/api/spotify-search') {
      return handleSpotifySearch(request, env);
    } else {
      // Default to AI chat handler
      return handleRequest(request, env);
    }
  }
};
