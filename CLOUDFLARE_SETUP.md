# 🚀 Quick Deployment Setup

## Prerequisites
1. GitHub account (✅ Done - repo created)
2. Cloudflare account (free) - [Sign up](https://dash.cloudflare.com/sign-up)
3. Google Gemini API key (✅ Already configured)

---

## Step-by-Step Deployment

### 1️⃣ Create Cloudflare Account
- Go to https://dash.cloudflare.com/sign-up
- Sign up and verify email

### 2️⃣ Deploy Frontend to Cloudflare Pages

**In Cloudflare Dashboard:**
1. Go to **Pages** → **Create a project**
2. Select **Connect to Git**
3. Authorize GitHub and select: `Sashankvejju0000/LandPricePrediction`
4. Click **Begin setup**

**Build Settings:**
```
Framework: Vite
Build command: npm run build
Output directory: dist
Root directory: (leave blank)
```

**Environment Variables (add these):**
```
VITE_GEMINI_API_KEY = AIzaSyABVb2N3W0u_eIac6gs2XvSdCplKQfkv9M
VITE_API_URL = https://api-worker.youraccount.workers.dev
```

5. Click **Save and Deploy**

**✅ Your frontend will be live at:** `https://landpred.pages.dev` (or similar)

---

### 3️⃣ Deploy Backend to Cloudflare Workers

**Install Wrangler (one-time):**
```powershell
npm install -g wrangler
```

**Login to Cloudflare:**
```powershell
wrangler login
```

**Deploy Worker:**
```powershell
cd "e:\OneDrive - K L University\Desktop\projectKAM\landPred"
wrangler deploy --name landpred-api
```

**Set API Key Secret:**
```powershell
wrangler secret put GEMINI_API_KEY
# Paste: AIzaSyABVb2N3W0u_eIac6gs2XvSdCplKQfkv9M
```

**✅ Your API will be live at:** `https://landpred-api.youraccount.workers.dev`

---

### 4️⃣ Update GitHub Secrets (for CI/CD)

**In GitHub Repository:**
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Create these secrets:

| Secret Name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | [Get from Cloudflare](https://dash.cloudflare.com/profile/api-tokens) |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID |
| `GEMINI_API_KEY` | `AIzaSyABVb2N3W0u_eIac6gs2XvSdCplKQfkv9M` |

**To find your Account ID:**
```powershell
wrangler whoami
```

---

### 5️⃣ Update Environment Variables

**In Cloudflare Pages:**
- Update `VITE_API_URL` to your deployed Worker URL

**In `.env.local` (local development):**
```env
GEMINI_API_KEY=AIzaSyABVb2N3W0u_eIac6gs2XvSdCplKQfkv9M
```

---

## 🎯 Final Check

### Test Frontend
```
https://landpred.pages.dev
```

### Test Backend API
```bash
curl -X POST https://landpred-api.youraccount.workers.dev/api/predict \
  -H "Content-Type: application/json" \
  -d '{"location":"Delhi","type":"Apartment","size":1000,"unit":"sqft","age":5,"condition":"Good","amenities":[]}'
```

---

## 📊 Architecture Deployed

```
GitHub
  ↓ (automatic trigger)
GitHub Actions CI/CD
  ↓
Cloudflare Pages (Frontend) ← https://landpred.pages.dev
  ↓ (API calls)
Cloudflare Workers (Backend) ← https://landpred-api.workers.dev
  ↓
Google Gemini API (AI predictions)
```

---

## 💡 Cost

| Service | Cost |
|---------|------|
| Cloudflare Pages | Free ✅ |
| Cloudflare Workers | Free tier: 100K req/day ✅ |
| Google Gemini | Free tier: 60 req/min ✅ |
| **TOTAL** | **FREE** ✅ |

---

## 🔐 Security Notes

- ✅ API keys stored securely in Cloudflare Secrets
- ✅ `.env.local` NOT committed to GitHub
- ✅ CORS headers configured in Worker
- ✅ Environment variables separated by environment

---

## 📚 Detailed Guide

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment documentation.

---

## 🆘 Troubleshooting

**Pages build fails?**
- Check: Settings → Build & Deployment → Logs

**Worker not responding?**
```powershell
wrangler tail
```

**CORS errors?**
- Worker already handles CORS, check browser console

---

**Questions?** Check the full [DEPLOYMENT.md](DEPLOYMENT.md) guide! 🚀
