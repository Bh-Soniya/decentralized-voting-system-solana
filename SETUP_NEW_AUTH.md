# Setup Guide for New Role-Based Authentication System

## Quick Start

### Step 1: Delete Old Database
The new system has updated models, so you need to recreate the database.

**Windows (PowerShell)**:
```powershell
cd backend
Remove-Item database.sqlite
```

**Mac/Linux**:
```bash
cd backend
rm database.sqlite
```

### Step 2: Install Dependencies (if needed)
```bash
cd backend
npm install

cd ../frontend
npm install
```

### Step 3: Start Backend
```bash
cd backend
npm run dev
```

The backend will automatically create new tables with the updated schema.

### Step 4: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 5: Test the System

1. **Open browser**: Navigate to `http://localhost:3000`
2. **Click**: "Login / Register" in navbar
3. **Try Admin Registration**:
   - Click "Register"
   - Select "Admin" role
   - Connect your Solana wallet
   - Fill in the form
   - Submit

4. **Try Voter Registration**:
   - Click "Register"
   - Select "Voter" role
   - Connect your Solana wallet
   - Fill in the form
   - Save your Voter ID!
   - Submit

## What's New?

### Backend Changes
✅ Updated `User` model with required `walletAddress` and `role` field
✅ Created new `Voter` model with citizenship hashing
✅ New unified auth controller (`unifiedAuthController.ts`)
✅ New unified auth routes (`/api/unified-auth/register` and `/api/unified-auth/login`)
✅ Password validation with strict requirements
✅ Duplicate prevention for email, wallet, and citizenship

### Frontend Changes
✅ New unified authentication page (`UnifiedAuth.tsx`)
✅ Beautiful gradient UI with role selection
✅ Real-time password strength indicator
✅ Wallet connection integration
✅ Dynamic form fields based on role
✅ Responsive design for all devices

### Security Improvements
✅ Citizenship numbers are hashed before storage
✅ Wallet addresses must be unique
✅ Strong password requirements enforced
✅ JWT tokens include role information
✅ Role-based route protection

## Database Schema Changes

### Before:
- `users` table: walletAddress was optional
- `voters` table: Simple structure with plain citizenship

### After:
- `users` table: walletAddress required, role field added
- `voters` table: Enhanced with email, password, hashed citizenship, wallet, eligibility

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access `/auth` page
- [ ] Can toggle between Login/Register
- [ ] Can toggle between Admin/Voter roles
- [ ] Can connect Solana wallet
- [ ] Can register as Admin
- [ ] Can register as Voter
- [ ] Voter ID is generated and displayed
- [ ] Can login as Admin
- [ ] Can login as Voter
- [ ] Admin redirects to `/dashboard`
- [ ] Voter redirects to `/voter/dashboard`
- [ ] Password validation works
- [ ] Duplicate email prevention works
- [ ] Duplicate wallet prevention works
- [ ] Duplicate citizenship prevention works

## Common Issues

### Issue: Backend won't start
**Solution**: 
```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

### Issue: Frontend shows errors
**Solution**:
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Issue: Database errors
**Solution**: Delete `backend/database.sqlite` and restart backend

### Issue: Wallet won't connect
**Solution**: 
1. Install Phantom or Solflare wallet extension
2. Create/import a wallet
3. Switch to Devnet in wallet settings
4. Refresh the page

## Environment Setup

Make sure you have `.env` file in backend:

```env
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
PORT=5000
```

## Next Steps

After successful setup:

1. **Create a Poll** (as Admin):
   - Login as Admin
   - Go to Dashboard
   - Click "Create New Poll"
   - Fill in poll details
   - Add options with images
   - Submit

2. **Vote in a Poll** (as Voter):
   - Login as Voter
   - Go to Voter Dashboard
   - Select an active poll
   - Cast your vote
   - Transaction will be recorded on Solana blockchain

## Support

If you encounter any issues:
1. Check console logs (browser and terminal)
2. Verify all dependencies are installed
3. Ensure database is recreated
4. Check that ports 3000 and 5000 are available
5. Review `ROLE_BASED_AUTH_SYSTEM.md` for detailed documentation

## Success Indicators

You'll know everything is working when:
- ✅ No errors in backend terminal
- ✅ No errors in frontend terminal
- ✅ Beautiful gradient auth page loads
- ✅ Can switch between roles smoothly
- ✅ Wallet connection works
- ✅ Registration creates accounts
- ✅ Login redirects to correct dashboard
- ✅ Voter ID is generated and saved

Enjoy your new role-based authentication system! 🎉
