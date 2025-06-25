# AI Chat Setup Instructions

## Cloudflare Worker Setup

1. **Install Wrangler CLI:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Navigate to your project directory:**
   ```bash
   cd /root/development/wademauger.github.io
   # Make sure wrangler.toml exists here
   ls wrangler.toml
   ```

4. **Set up API Keys as secrets:**
   ```bash
   # Set your API keys (get these from the respective AI providers)
   # Make sure you're in the project directory with wrangler.toml
   
   # Required: Primary provider
   wrangler secret put GROK_API_KEY
   
   # Recommended: Secondary fallback
   wrangler secret put MISTRAL_API_KEY
   
   # Optional: Final fallback (can skip if you prefer ChatGPT fallback)
   wrangler secret put OPENAI_API_KEY
   
   # Required: Set allowed origins for CORS
   wrangler secret put ALLOWED_ORIGINS
   # Example value: "https://wademauger.github.io,http://localhost:3000"
   ```

5. **Deploy the worker:**
   ```bash
   # Make sure you're still in the project directory
   # Simple deploy (recommended)
   npm run deploy-worker-simple
   
   # OR use wrangler directly
   wrangler deploy
   ```

6. **Update your .env file:**
   ```
   REACT_APP_AI_WORKER_URL=https://recipe-ai-proxy.your-username.workers.dev
   ```
   Replace `your-username` with your actual Cloudflare username/account identifier.

## API Keys Required

### Grok (X.AI) - Recommended Primary
- Get API key from: https://console.x.ai/
- Model: grok-beta
- Fast and creative responses

### Mistral AI - Fallback
- Get API key from: https://console.mistral.ai/
- Model: mistral-large-latest
- Good for detailed cooking instructions

### OpenAI - Final Fallback (Optional)
- Get API key from: https://platform.openai.com/
- Model: gpt-4o-mini
- **Purpose**: Most reliable fallback when Grok/Mistral are unavailable
- **Note**: You can skip this and use ChatGPT fallback link instead

## Features

- **Multi-provider fallback**: Tries Grok → Mistral → OpenAI
- **Smart CORS handling**: Supports both local dev and production
- **ChatGPT fallback**: If all providers fail, provides ChatGPT link
- **Recipe-optimized prompts**: Specialized for cooking assistance

## Testing

1. Start your React app: `npm start`
2. Go to the recipes section
3. Try asking the AI chat questions like:
   - "Create a recipe for chocolate chip cookies"
   - "How can I make this more flavorful?"
   - "What cooking temperature should I use?"

## Troubleshooting

### Worker Deployment Issues

**Important: Make sure you're in the correct directory!**
```bash
# Navigate to the project directory first
cd /root/development/wademauger.github.io

# Verify wrangler.toml exists
ls -la wrangler.toml
```

If you get "Required Worker name missing" error:
```bash
# Try the simple deploy command instead
npm run deploy-worker-simple

# Or specify the name explicitly
wrangler deploy --name recipe-ai-proxy

# Or check if you're in the right directory
pwd
ls wrangler.toml
```

### Other Issues
- Check browser console for API errors
- Verify worker URL in .env file
- Ensure API keys are set correctly in Cloudflare
- Check CORS settings if requests are blocked
