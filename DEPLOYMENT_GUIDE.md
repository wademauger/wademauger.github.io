# Secure Deployment Guide

## 🚨 Security Issue Fixed
Your Spotify API secrets are now moved to a backend service instead of being exposed in the frontend.

## Deployment Options

### Option 1: Cloudflare Workers + Pages (Recommended)

#### Step 1: Deploy the Worker
```bash
npm install -g wrangler
wrangler login
```

Create `wrangler.toml`:
```toml
name = "spotify-api-worker"
main = "cloudflare-worker.js"
compatibility_date = "2023-10-30"

[vars]
ENVIRONMENT = "production"
```

Deploy:
```bash
# Set secrets
wrangler secret put SPOTIFY_CLIENT_ID
wrangler secret put SPOTIFY_CLIENT_SECRET

# Deploy worker
wrangler deploy
```

#### Step 2: Deploy the React App
```bash
# Build the app
npm run build

# Deploy to Cloudflare Pages
wrangler pages create your-songs-app
wrangler pages deploy build --project-name=your-songs-app
```

#### Step 3: Update Environment Variables
In your React app, set:
```
REACT_APP_SPOTIFY_API_ENDPOINT=https://your-worker.your-subdomain.workers.dev/api/spotify-search
```

### Option 2: Vercel

#### Step 1: Create API Route
Create `pages/api/spotify-search.js`:
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { artist, track, album } = req.body;

  try {
    // Get Spotify access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    const { access_token } = await tokenResponse.json();
    
    // Search Spotify
    let query = `track:"${track}" artist:"${artist}"`;
    if (album) query += ` album:"${album}"`;

    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      {
        headers: { 'Authorization': `Bearer ${access_token}` }
      }
    );

    const data = await searchResponse.json();
    res.json(data);

  } catch (error) {
    console.error('Spotify API error:', error);
    res.status(500).json({ error: 'Failed to search Spotify' });
  }
}
```

#### Step 2: Deploy
```bash
npm install -g vercel
vercel

# Set environment variables in Vercel dashboard:
# SPOTIFY_CLIENT_ID
# SPOTIFY_CLIENT_SECRET
```

### Option 3: Netlify

#### Step 1: Create Netlify Function
Create `netlify/functions/spotify-search.js`:
```javascript
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { artist, track, album } = JSON.parse(event.body);

  try {
    // Similar Spotify API logic as above
    // ... implementation
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to search Spotify' })
    };
  }
};
```

#### Step 2: Deploy
```bash
npm install -g netlify-cli
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

## Environment Variables

### For Development
Create `.env.local`:
```
REACT_APP_SPOTIFY_API_ENDPOINT=http://localhost:3001/api/spotify-search
```

### For Production
Set in your hosting platform:
- Vercel: Dashboard → Project → Settings → Environment Variables
- Netlify: Dashboard → Site → Environment Variables
- Cloudflare: Use `wrangler secret put`

## Security Benefits

✅ **API secrets are now server-side only**
✅ **Rate limiting can be implemented**
✅ **Request validation possible**
✅ **CORS properly configured**
✅ **No API abuse from client-side exposure**

## Next Steps

1. Choose a deployment platform
2. Set up the backend API
3. Deploy your React app
4. Set environment variables
5. Test the album art feature

## Cost Considerations

- **Cloudflare Workers**: 100k requests/day free
- **Vercel**: 100GB-hours free, then usage-based
- **Netlify**: 125k function invocations free

Choose Cloudflare for the best free tier and performance!