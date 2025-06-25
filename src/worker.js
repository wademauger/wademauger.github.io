/**
 * Cloudflare Worker for Recipe AI Chat Proxy
 * Proxies chat requests to various AI providers (Grok, Mistral, OpenAI)
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

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

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
      'Access-Control-Allow-Origin': origin,
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
function formatMessages(userMessage, recipeContext, conversationHistory = []) {
  const messages = [];
  
  // System prompt for recipe assistance
  const systemPrompt = `You are an expert culinary assistant helping with recipe development and cooking advice. 

Current Recipe Context:
${recipeContext ? JSON.stringify(recipeContext, null, 2) : 'No recipe loaded'}

Guidelines:
- Be helpful, specific, and actionable
- Focus on practical cooking advice
- Suggest measurements, techniques, and timing
- Consider food safety and best practices
- If asked to generate a complete recipe, format it clearly with ingredients, instructions, and notes
- Keep responses concise but informative`;

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
async function callAIProvider(provider, messages, env) {
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
  
  const requestBody = {
    model: config.model,
    messages: messages,
    max_tokens: 1000,
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
    const { userMessage, recipeContext, conversationHistory, preferredProvider } = await request.json();
    
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'Missing userMessage' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request, env) }
      });
    }
    
    const messages = formatMessages(userMessage, recipeContext, conversationHistory);
    
    // Try providers in order of preference
    const providers = preferredProvider 
      ? [preferredProvider, 'grok', 'mistral', 'openai']
      : ['grok', 'mistral', 'openai'];
    
    let lastError;
    let usedProvider;
    let response;
    
    for (const provider of providers) {
      try {
        console.log(`Trying provider: ${provider}`);
        response = await callAIProvider(provider, messages, env);
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
        response: `I'm having trouble connecting to AI services right now. You can try asking your question directly in ChatGPT for immediate help.`,
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
  async fetch(request, env, ctx) {
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
    
    // Handle the main request
    return handleRequest(request, env);
  }
};
