# Deployment Guide - Cloudflare Pages & Workers

This guide covers deploying the Land Price Prediction app to Cloudflare.

## Architecture

```
GitHub Repository
    ↓
Cloudflare Pages (Frontend - React/Vite)
    ↓
Cloudflare Workers (Backend - API)
    ↓
Google Gemini API
```

---

## 1. Cloudflare Pages Deployment (Frontend)

### Step 1: Create Cloudflare Account
- Go to [Cloudflare Pages](https://pages.cloudflare.com/)
- Sign up or log in

### Step 2: Connect GitHub Repository
1. Click **"Create a project"**
2. Select **"Connect to Git"**
3. Authorize and select your GitHub repository: `LandPricePrediction`
4. Click **"Begin setup"**

### Step 3: Build Settings
Fill in these settings:
- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`

### Step 4: Environment Variables
In the Pages deployment settings, add:
```
VITE_GEMINI_API_KEY=your_api_key_here
VITE_API_URL=https://api.yourdomain.com
```

### Step 5: Deploy
Click **"Save and Deploy"** - Your site will be live at `https://yourproject.pages.dev`

---

## 2. Cloudflare Workers Deployment (Backend API)

### Step 1: Install Wrangler CLI
```bash
npm install -g wrangler
```

### Step 2: Authenticate
```bash
wrangler login
```

### Step 3: Deploy Worker
```bash
# Navigate to project root
cd e:\OneDrive\ -\ K\ L\ University\Desktop\projectKAM\landPred

# Deploy the worker
wrangler deploy --name landpred-api
```

### Step 4: Add Environment Variables
```bash
# Set the GEMINI_API_KEY secret
wrangler secret put GEMINI_API_KEY
# Paste your API key when prompted
```

### Step 5: Get Your Worker URL
After deployment, your Worker will be available at:
```
https://landpred-api.youraccount.workers.dev
```

---

## 3. Connect Frontend to Backend

### Update API Endpoint
In your frontend code (`App.tsx`), update API calls to use the Worker URL:

```typescript
const API_URL = 'https://landpred-api.youraccount.workers.dev';

const response = await fetch(`${API_URL}/api/predict`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(propertyDetails)
});
```

---

## 4. Custom Domain (Optional)

### For Cloudflare Pages
1. Go to your Pages project settings
2. Add custom domain (requires domain on Cloudflare or setup DNS)
3. E.g., `app.yourdomain.com`

### For Workers
1. In Wrangler, update `wrangler.toml` with route:
```toml
route = "https://api.yourdomain.com/*"
```

---

## 5. Environment Variables Setup

### Cloudflare Pages (.env.production)
```
VITE_GEMINI_API_KEY=your_gemini_key
VITE_API_URL=https://api.yourdomain.com
```

### Cloudflare Workers (via Wrangler)
```bash
wrangler secret put GEMINI_API_KEY
```

---

## 6. Testing Deployment

### Test Frontend
```bash
# Visit your deployed Pages URL
https://yourproject.pages.dev
```

### Test Worker API
```bash
curl -X POST https://landpred-api.youraccount.workers.dev/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Delhi",
    "lat": 28.6139,
    "lng": 77.2090,
    "type": "Apartment",
    "size": 1000,
    "unit": "sqft",
    "age": 5,
    "condition": "Good",
    "amenities": ["Metro", "Schools"]
  }'
```

---

## 7. CI/CD with GitHub

### Auto-Deploy to Pages
Cloudflare Pages automatically deploys when you push to GitHub.

### Manual Worker Deploy
Add GitHub Actions workflow (`.github/workflows/deploy-worker.yml`):
```yaml
name: Deploy Worker

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          secrets: GEMINI_API_KEY
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

---

## 8. Monitoring & Debugging

### Cloudflare Pages
- Logs: https://dash.cloudflare.com/ → Pages → Your Project → Deployments

### Cloudflare Workers
```bash
# View logs
wrangler tail

# View metrics
wrangler deployments list
```

---

## Cost Estimates

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Cloudflare Pages** | Unlimited builds, 500 deployments/month | Included |
| **Cloudflare Workers** | 100,000 requests/day | $0.50 per million requests |
| **Google Gemini API** | 60 requests/min (free) | Pay-as-you-go after free tier |

---

## Troubleshooting

**Pages build fails:**
- Check build logs in Cloudflare dashboard
- Ensure `npm run build` works locally
- Verify `dist/` directory is created

**Worker API not working:**
- Check `wrangler tail` for errors
- Verify GEMINI_API_KEY secret is set
- Test with `curl` from command line

**CORS errors:**
- Worker already handles CORS headers
- Verify frontend is using correct API URL

---

## Next Steps

1. ✅ Push code to GitHub (Done)
2. ⬜ Connect GitHub to Cloudflare Pages
3. ⬜ Deploy Cloudflare Worker
4. ⬜ Add custom domain (optional)
5. ⬜ Set up monitoring & alerts

Enjoy your deployed app! 🚀
