# Vercel Frontend Deployment - Quick Guide

## ✅ Completed Steps

1. **Created API Configuration** (`frontend/src/config/api.ts`)
   - Centralized API URL management
   - Uses `import.meta.env.VITE_API_URL` environment variable
   - Falls back to localhost for development

2. **Updated All API Calls**
   - ✅ AuthContext.tsx
   - ✅ CreatePoll.tsx
   - ✅ Dashboard.tsx
   - ✅ Home.tsx
   - ✅ PollDetails.tsx
   - ✅ Profile.tsx

3. **Created Production Environment File** (`frontend/.env.production`)
   ```env
   VITE_API_URL=https://voting-backend-svbq.onrender.com/api
   VITE_SOLANA_NETWORK=devnet
   VITE_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
   ```

4. **Fixed TypeScript Issues**
   - Created `vite-env.d.ts` for environment variable types
   - Removed unused imports
   - Build tested successfully ✅

5. **Committed and Pushed to GitHub** ✅

---

## 🚀 Next Steps: Deploy to Vercel

### Step 1: Sign in to Vercel
1. Go to https://vercel.com/
2. Sign in with your GitHub account

### Step 2: Import Your Project
1. Click **"Add New"** → **"Project"**
2. Select your repository: `decentralized-voting-system-solana`
3. Click **"Import"**

### Step 3: Configure Build Settings
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node.js Version: 18.x (or latest)
```

### Step 4: Add Environment Variables
In the Vercel project settings, add these environment variables:

```
VITE_API_URL=https://voting-backend-svbq.onrender.com/api
VITE_SOLANA_NETWORK=devnet
VITE_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

**Note**: These are already in your `.env.production` file, but Vercel needs them configured in the dashboard for security.

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for the build to complete (2-3 minutes)
3. You'll get a URL like: `https://your-project.vercel.app`

### Step 6: Update Backend CORS
Once deployed, you need to update your backend to allow requests from your Vercel domain.

In `backend/src/server.ts`, update the CORS configuration:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-project.vercel.app',  // Add your Vercel URL here
    'https://yourdomain.com.np'         // Your custom domain (later)
  ],
  credentials: true
}));
```

Then redeploy your backend on Render.

---

## 🌐 Configure Custom Domain (Optional)

### Step 1: Add Domain in Vercel
1. Go to your project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `yourdomain.com.np`
4. Click **"Add"**

### Step 2: Configure DNS in Cloudflare
1. Go to Cloudflare dashboard
2. Select your domain
3. Go to **DNS** → **Records**
4. Add CNAME record:
   ```
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```
5. Add CNAME for www:
   ```
   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

### Step 3: Verify Domain
- Vercel will automatically verify the domain
- SSL certificate will be issued (takes a few minutes)
- Your site will be live at `https://yourdomain.com.np`

### Step 4: Update Backend CORS Again
Add your custom domain to the CORS whitelist:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-project.vercel.app',
    'https://yourdomain.com.np',
    'https://www.yourdomain.com.np'
  ],
  credentials: true
}));
```

---

## 🔍 Testing Checklist

After deployment, test these features:

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Phantom wallet connection works
- [ ] Create poll functionality
- [ ] View polls on dashboard
- [ ] Vote on a poll
- [ ] View poll results
- [ ] Profile page loads
- [ ] Update profile works

---

## 🐛 Troubleshooting

### Issue: "Network Error" or CORS errors
**Solution**: Make sure you updated the backend CORS settings with your Vercel URL

### Issue: Environment variables not working
**Solution**: 
1. Check they're added in Vercel dashboard (not just .env.production)
2. Redeploy the project after adding variables

### Issue: Build fails on Vercel
**Solution**: 
1. Check build logs in Vercel dashboard
2. Make sure all dependencies are in package.json
3. Verify Node.js version compatibility

### Issue: Wallet connection fails
**Solution**: 
1. Ensure you're on Solana devnet
2. Check PROGRAM_ID is correct
3. Verify Phantom wallet is installed

### Issue: API calls return 404
**Solution**: 
1. Verify VITE_API_URL is correct (should end with `/api`)
2. Check backend is running on Render
3. Test backend directly: `https://voting-backend-svbq.onrender.com/api/polls`

---

## 📊 Deployment Status

| Component | Status | URL |
|-----------|--------|-----|
| Backend | ✅ Deployed | https://voting-backend-svbq.onrender.com |
| Frontend | ⏳ Ready to Deploy | - |
| Database | ✅ SQLite on Render | - |
| Smart Contract | ✅ Deployed on Devnet | Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS |
| Custom Domain | ⏳ Pending | yourdomain.com.np |

---

## 🎉 Success!

Once deployed, your decentralized voting system will be live and accessible to anyone with the URL. Share it with your professors, classmates, and include it in your final year project report!

**Pro Tip**: Take screenshots of your deployed application for your project documentation and presentation.
