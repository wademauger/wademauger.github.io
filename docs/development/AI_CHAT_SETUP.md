# AI Chat Setup Instructions

## Overview

The AI Recipe Chat feature allows users to create recipes either manually or with AI assistance. When using AI mode, the system preserves the original recipe title and URL slug from the form, ensuring consistent naming and URL structure.

## Features

### 🔄 Title and Slug Preservation
- When users enter a recipe title and click "Create Recipe with AI", the original title and slug are preserved
- AI-generated recipes use the original title and slug, not the AI-suggested title
- This ensures consistent URLs and user intent is respected
- Visual indicator shows which title/slug will be used when saving

### 🎨 Format Detection and Labels  
- AI responses are automatically analyzed for format type
- Color-coded labels show: JSON Recipe, Markdown Recipe, Text Recipe, Chat Response
- Helps users understand the AI response structure

### 📝 Robust Recipe Parsing
- Supports JSON, Markdown, and plain text recipe formats
- Intelligent ingredient and instruction detection
- Handles various formatting styles and edge cases
- Graceful fallback when parsing fails

### 💬 Interactive Chat Interface
- Real-time conversation with AI recipe assistant
- Conversation history maintained throughout session
- "Save Recipe" button appears when AI provides recipe content
- "Back to Form" option to return to manual entry

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

## Testing

1. Start your React app: `npm start`
2. Go to the recipes section
3. Try asking the AI chat questions like:
   - "Create a recipe for chocolate chip cookies"
   - "How can I make this more flavorful?"
   - "What cooking temperature should I use?"
   
The AI will now return recipes in a structured JSON format for better parsing and display, but also supports markdown as a fallback.

### New JSON Recipe Format

When you ask for a complete recipe, the AI returns structured data like:
```json
{
  "title": "Recipe Name",
  "description": "Brief description",
  "prepTime": "15 minutes",
  "cookTime": "30 minutes", 
  "servings": "4 people",
  "difficulty": "Easy",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "steps": ["step 1", "step 2"],
  "notes": ["tip 1", "tip 2"],
  "tags": ["tag1", "tag2"]
}
```

### Grouped Ingredients Support

For complex recipes with multiple components (like cakes with frosting, dishes with sauces, etc.), the AI can now return grouped ingredients:

```json
{
  "title": "Layered Chocolate Cake",
  "description": "Rich chocolate cake with buttercream frosting",
  "ingredients": {
    "For the Cake": [
      {
        "quantity": "2",
        "unit": "cups", 
        "name": "all-purpose flour",
        "notes": ""
      },
      {
        "quantity": "3/4",
        "unit": "cup",
        "name": "cocoa powder", 
        "notes": "unsweetened"
      }
    ],
    "For the Frosting": [
      {
        "quantity": "1",
        "unit": "cup",
        "name": "butter",
        "notes": "softened"
      },
      {
        "quantity": "4", 
        "unit": "cups",
        "name": "powdered sugar",
        "notes": "sifted"
      }
    ]
  },
  "steps": ["Make cake batter", "Bake cake layers", "Make frosting", "Assemble cake"]
}
```

**Key Features:**
- **Flexible Format**: Supports both simple arrays and grouped objects for ingredients
- **Organized Display**: Grouped ingredients are displayed with clear section headers
- **Preserved Structure**: The original grouping is maintained when saving recipes
- **Backward Compatible**: Still works with simple ingredient lists

This provides:
- **Better parsing reliability** - No more regex parsing failures
- **Rich metadata** - Cooking times, difficulty, tags, nutrition info
- **Enhanced UI** - Beautiful recipe cards with emojis and structured layout
- **Organized Ingredients** - Clear separation for complex multi-component recipes
- **Extensible format** - Easy to add new fields like nutrition data

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

### JSON Response Issues

**Problem**: AI returns JSON but it's labeled as "Chat Response" instead of "JSON Recipe", and no save button appears

**Cause**: This can happen for two reasons:
1. Worker not sending JSON formatting instructions (fixed above)
2. Malformed JSON with syntax errors (like trailing commas)

**Solution**: Enhanced JSON recognition and parsing:
- Frontend now detects JSON structure even if parsing fails
- Automatic fixing of common JSON syntax errors (trailing commas, empty values)
- Improved format detection that looks for JSON structure patterns
- Better complete recipe detection for JSON responses

**Common JSON issues that are now auto-fixed**:
```json
{
  "title": "Recipe Name",
  "tags": ,          // ← Fixed: Empty value after comma
  "nutrition": {
    "calories": "",
  }                  // ← Fixed: Trailing comma
}
```

**To apply the fix**: Redeploy the worker after updating the code:
```bash
cd /root/development/wademauger.github.io
npm run deploy-worker-simple
# OR
wrangler deploy
```

**Verify the fix**: 
1. Start your React app: `npm start`
2. Try creating a recipe with AI: "Create a recipe for chocolate chip cookies"
3. The AI should now return structured JSON instead of plain text
4. JSON responses should be labeled "JSON Recipe" (blue label)
5. Save button should appear for complete JSON recipes
6. Check browser console for logs showing `isFullRecipeRequest: true`
