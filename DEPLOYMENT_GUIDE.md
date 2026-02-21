# Deployment Guide - Decentralized Voting System on Solana

## Project Overview
This guide covers deploying your Solana-based decentralized voting system with:
- **Frontend**: React + TypeScript + Vite + Solana Web3.js
- **Backend**: Node.js + Express + Sequelize
- **Database**: SQLite (development) / MySQL (production)
- **Smart Contract**: Solana Program (already deployed on devnet)
- **Domain**: .com.np domain from register.com.np
- **DNS**: Cloudflare
- **Hosting**: Vercel (frontend) + Render/Railway (backend) - Free tier

---

## Prerequisites Checklist

- [x] GitHub account with your project repository
- [x] Cloudflare account (free)
- [x] Vercel account (free)
- [x] .com.np domain registered
- [ ] Render.com or Railway.app account (free - for backend)
- [ ] PlanetScale or Supabase account (free - for MySQL database)

---

## Part 1: Database Setup (Free Options)

### Option A: Railway.app MySQL (Recommended - Free $5 credit)

1. **Create Account**: Go to https://railway.app/
2. **Create New Project**:
   - Click "New Project"
   - Select "Provision MySQL"
   - Name: `voting-system-db`

3. **Get Connection Details**:
   - Click on MySQL service
   - Go to "Variables" tab
   - Copy these values:
   ```
   MYSQLHOST=containers-us-west-xxx.railway.app
   MYSQLPORT=6379
   MYSQLDATABASE=railway
   MYSQLUSER=root
   MYSQLPASSWORD=your_password
   ```

4. **Format for your backend**:
   ```
   DB_HOST=containers-us-west-xxx.railway.app
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=railway
   DB_PORT=6379
   ```

### Option B: Supabase PostgreSQL (Free Forever)

1. **Create Account**: Go to https://supabase.com/
2. **Create Project**:
   - Click "New Project"
   - Name: `voting-system`
   - Database Password: Create strong password
   - Region: Choose closest
   - Plan: Free

3. **Get Connection String**:
   - Go to Project Settings → Database
   - Copy "Connection string" (URI format)
   - Format: `postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres`

4. **Update Sequelize for PostgreSQL**:
   - Install: `npm install pg pg-hstore`
   - In `backend/src/config/database.ts`, change dialect to `'postgres'`

### Option C: Use SQLite (Simplest - No external DB needed)

Your project already uses SQLite! For a free deployment:

1. **Keep SQLite** (already configured in your project)
2. **Pros**: 
   - Zero configuration
   - Free forever
   - Works on Render free tier
   - Perfect for demo/final year project
3. **Cons**: 
   - File-based (data resets on Render free tier restarts)
   - Not suitable for production scale

**For SQLite, use these environment variables**:
```
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

**Recommended**: Use SQLite for initial deployment, migrate to Supabase if you need persistence.

---

## Part 2: Backend Deployment (Render.com - Free)

### Step 1: Prepare Backend for Deployment

1. **Update `backend/package.json`** - Add engines:
   ```json
   "engines": {
     "node": ">=18.0.0",
     "npm": ">=9.0.0"
   }
   ```

2. **Create `backend/Dockerfile`** (optional, for Docker deployment):
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

3. **Update CORS in `backend/src/server.ts`**:
   ```typescript
   app.use(cors({
     origin: [
       'http://localhost:5173',
       'https://yourdomain.com.np',
       'https://your-app.vercel.app'
     ],
     credentials: true
   }));
   ```

### Step 2: Deploy to Render

1. **Sign up**: Go to https://render.com/
2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Service**:
   ```
   Name: voting-backend
   Region: Choose closest region
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Free
   ```

4. **Add Environment Variables**:
   
   **For SQLite (Simplest)**:
   ```
   NODE_ENV=production
   PORT=5000
   
   # Database (SQLite - no external DB needed)
   DB_DIALECT=sqlite
   DB_STORAGE=./database.sqlite
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   JWT_EXPIRE=7d
   
   # Solana
   SOLANA_NETWORK=devnet
   PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
   ```
   
   **For Railway MySQL**:
   ```
   NODE_ENV=production
   PORT=5000
   
   # Database (from Railway)
   DB_HOST=containers-us-west-xxx.railway.app
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=railway
   DB_PORT=6379
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   JWT_EXPIRE=7d
   
   # Solana
   SOLANA_NETWORK=devnet
   PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
   ```
   
   **For Supabase PostgreSQL**:
   ```
   NODE_ENV=production
   PORT=5000
   
   # Database (from Supabase)
   DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   JWT_EXPIRE=7d
   
   # Solana
   SOLANA_NETWORK=devnet
   PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
   ```

5. **Deploy**: Click "Create Web Service"
6. **Note Backend URL**: e.g., `https://voting-backend.onrender.com`

---

## Part 3: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. **Create `frontend/.env.production`**:
   ```env
   VITE_API_URL=https://voting-backend.onrender.com/api
   VITE_SOLANA_NETWORK=devnet
   VITE_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
   ```

2. **Update API calls** in frontend to use `import.meta.env.VITE_API_URL`

3. **Create `vercel.json`** in project root:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "frontend/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/frontend/$1"
       }
     ],
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### Step 2: Deploy to Vercel

1. **Sign in**: Go to https://vercel.com/
2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select repository

3. **Configure Project**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**:
   ```
   VITE_API_URL=https://voting-backend.onrender.com/api
   VITE_SOLANA_NETWORK=devnet
   VITE_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
   ```

5. **Deploy**: Click "Deploy"
6. **Note Vercel URL**: e.g., `https://your-app.vercel.app`

---

## Part 4: Domain Configuration with Cloudflare

### Step 1: Add Domain to Cloudflare

1. **Login to Cloudflare**: https://dash.cloudflare.com/
2. **Add Site**:
   - Click "Add a Site"
   - Enter your domain: `yourdomain.com.np`
   - Select Free plan

3. **Update Nameservers**:
   - Cloudflare will show you 2 nameservers (e.g., `ns1.cloudflare.com`)
   - Go to register.com.np dashboard
   - Update nameservers to Cloudflare's nameservers
   - Wait 24-48 hours for propagation (usually faster)

### Step 2: Configure DNS Records

1. **In Cloudflare DNS**:
   - Go to DNS → Records
   - Add the following records:

   **For Root Domain** (yourdomain.com.np):
   ```
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

   **For WWW Subdomain**:
   ```
   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

   **For API Subdomain** (optional, if you want api.yourdomain.com.np):
   ```
   Type: CNAME
   Name: api
   Target: voting-backend.onrender.com
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

### Step 3: Configure Domain in Vercel

1. **In Vercel Dashboard**:
   - Go to your project → Settings → Domains
   - Click "Add Domain"
   - Enter: `yourdomain.com.np`
   - Click "Add"

2. **Add WWW Domain**:
   - Click "Add Domain" again
   - Enter: `www.yourdomain.com.np`
   - Set as redirect to main domain (optional)

3. **Verify Domain**:
   - Vercel will automatically verify
   - SSL certificate will be issued automatically (may take a few minutes)

### Step 4: Enable Cloudflare Features (Optional)

1. **SSL/TLS**:
   - Go to SSL/TLS → Overview
   - Set to "Full (strict)"

2. **Always Use HTTPS**:
   - SSL/TLS → Edge Certificates
   - Enable "Always Use HTTPS"

3. **Auto Minify**:
   - Speed → Optimization
   - Enable Auto Minify for JS, CSS, HTML

4. **Caching**:
   - Caching → Configuration
   - Set caching level to "Standard"

---

## Part 5: GitHub Actions CI/CD

### Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel and Render

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # Frontend deployment (Vercel handles this automatically)
  frontend-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci
        
      - name: Build frontend
        working-directory: ./frontend
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_SOLANA_NETWORK: devnet
          VITE_PROGRAM_ID: Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS

  # Backend deployment check
  backend-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install backend dependencies
        working-directory: ./backend
        run: npm ci
        
      - name: Build backend
        working-directory: ./backend
        run: npm run build
        
      - name: Trigger Render Deploy
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}

  # Smart contract check (optional)
  smart-contract-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          
      - name: Check smart contract
        working-directory: ./smart-contract
        run: cargo check
```

### Add GitHub Secrets:

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add secrets:
   ```
   VITE_API_URL=https://voting-backend.onrender.com/api
   RENDER_DEPLOY_HOOK=https://api.render.com/deploy/srv-xxxxx (get from Render dashboard)
   ```

---

## Part 6: Post-Deployment Configuration

### Update Frontend Environment

1. **Update `frontend/src/config` or API calls**:
   ```typescript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
   ```

### Update Backend CORS

1. **In `backend/src/server.ts`**, update allowed origins:
   ```typescript
   const allowedOrigins = [
     'http://localhost:5173',
     'https://yourdomain.com.np',
     'https://www.yourdomain.com.np',
     'https://your-app.vercel.app'
   ];
   ```

### Test Deployment

1. **Frontend**: Visit `https://yourdomain.com.np`
2. **Backend Health**: Visit `https://voting-backend.onrender.com/health`
3. **API Test**: Check if frontend can connect to backend
4. **Wallet Connection**: Test Phantom wallet connection
5. **Create Poll**: Test creating a poll
6. **Vote**: Test voting functionality

---

## Part 7: Monitoring and Maintenance

### Free Monitoring Tools

1. **Vercel Analytics**: Built-in (enable in dashboard)
2. **Render Logs**: Check logs in Render dashboard
3. **Cloudflare Analytics**: View traffic in Cloudflare dashboard
4. **UptimeRobot**: https://uptimerobot.com/ (free uptime monitoring)

### Important Notes

1. **Render Free Tier**: Spins down after 15 minutes of inactivity (first request may be slow)
2. **SQLite on Render**: Data resets when service restarts (use Railway/Supabase for persistence)
3. **Railway Credit**: $5 credit lasts several months for small databases
4. **Supabase Free Tier**: 500MB database, perfect for demo projects
5. **SSL Certificates**: Auto-renewed by Vercel and Cloudflare
6. **Solana Devnet**: Remember this is devnet, not mainnet
7. **Rate Limits**: Be aware of free tier limits

---

## Troubleshooting

### Issue: Domain not resolving
- Wait 24-48 hours for DNS propagation
- Check nameservers are correctly set in register.com.np
- Verify DNS records in Cloudflare

### Issue: Backend not connecting
- Check CORS settings
- Verify environment variables in Render
- Check Render logs for errors
- Ensure database connection is working

### Issue: Database connection fails
- **SQLite**: Ensure write permissions in Render (SQLite works out of the box)
- **Railway**: Check connection string and port number
- **Supabase**: Verify DATABASE_URL format and password
- Check if database service is running

### Issue: Data loss on Render free tier
- This is normal with SQLite on Render free tier (ephemeral filesystem)
- Solution: Use Railway or Supabase for persistent storage
- Or: Upgrade to Render paid tier for persistent disk

### Issue: Frontend build fails
- Check environment variables in Vercel
- Verify all dependencies are in package.json
- Check build logs in Vercel dashboard

### Issue: Wallet connection fails
- Ensure you're on Solana devnet
- Check PROGRAM_ID is correct
- Verify Phantom wallet is installed and on devnet

---

## Cost Breakdown (All Free!)

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Vercel | Hobby | $0 | 100GB bandwidth/month |
| Render | Free | $0 | 750 hours/month, sleeps after 15min |
| Railway | Trial | $0 | $5 credit (lasts months for small DB) |
| Supabase | Free | $0 | 500MB database, 2GB bandwidth |
| SQLite | N/A | $0 | File-based, no limits |
| Cloudflare | Free | $0 | Unlimited bandwidth |
| Domain | .com.np | $0 | Free domain |
| GitHub Actions | Free | $0 | 2000 minutes/month |

---

## Next Steps After Deployment

1. Set up monitoring with UptimeRobot
2. Configure custom error pages
3. Add Google Analytics (optional)
4. Set up email notifications for downtime
5. Create backup strategy for database
6. Document API endpoints
7. Add rate limiting to backend
8. Consider upgrading to paid tiers for production use

---

## Security Checklist

- [ ] Environment variables are not committed to Git
- [ ] JWT secret is strong and unique
- [ ] CORS is properly configured
- [ ] HTTPS is enforced
- [ ] Database credentials are secure
- [ ] API rate limiting is implemented
- [ ] Input validation is in place
- [ ] SQL injection prevention (Sequelize handles this)

---

## Support and Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Cloudflare Docs**: https://developers.cloudflare.com/
- **Solana Docs**: https://docs.solana.com/
- **Your Project Docs**: See PROJECT_DOCUMENTATION.md

---

## Conclusion

Your decentralized voting system is now deployed and accessible at your custom .com.np domain! The entire stack is running on free tiers, making it perfect for a final year project demonstration.

Remember to monitor your application and be aware of free tier limitations. When you're ready for production, consider upgrading to paid tiers for better performance and reliability.

Good luck with your project! 🚀
