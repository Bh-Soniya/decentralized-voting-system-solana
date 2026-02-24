# Quick Reference Card

## 🚀 Quick Start (3 Steps)

```bash
# 1. Delete old database
cd backend && rm database.sqlite

# 2. Start backend
npm run dev

# 3. Start frontend (new terminal)
cd frontend && npm run dev
```

## 🔗 URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Auth Page**: http://localhost:3000/auth

## 👥 User Roles

| Role | Purpose | Dashboard |
|------|---------|-----------|
| **Admin** | Create & manage polls | `/dashboard` |
| **Voter** | Cast votes | `/voter/dashboard` |

## 📝 Registration Fields

### Admin
- Username
- Email
- Password
- Wallet (connected)

### Voter
- Username
- Email
- Password
- Citizenship Number (5-20 digits)
- Issue Date
- Wallet (connected)

## 🔐 Login Credentials

### Admin
- Email
- Password

### Voter
- Voter ID (VID-YYYYMMDD-XXXXX)
- Citizenship Number
- Issue Date

## 🔑 Password Rules

- ✅ 8+ characters
- ✅ 1 uppercase (A-Z)
- ✅ 1 lowercase (a-z)
- ✅ 1 number (0-9)
- ✅ 1 special (@$!%*?&#)

**Valid Examples**:
- `SecurePass123!`
- `MyVote@2024`
- `Admin#Pass99`

## 🌐 API Endpoints

```
POST /api/unified-auth/register
POST /api/unified-auth/login
```

## 📁 Key Files

### Backend
- `backend/src/models/User.ts` - Admin model
- `backend/src/models/Voter.ts` - Voter model
- `backend/src/controllers/unifiedAuthController.ts` - Auth logic
- `backend/src/routes/unifiedAuthRoutes.ts` - Routes

### Frontend
- `frontend/src/pages/UnifiedAuth.tsx` - Auth page
- `frontend/src/styles/UnifiedAuth.css` - Styles
- `frontend/src/App.tsx` - Routes
- `frontend/src/components/Navbar.tsx` - Navigation

## 🎨 UI Colors

- **Background**: Purple gradient (#667eea → #764ba2)
- **Voter Role**: Pink/Red (#f5576c)
- **Admin Role**: Blue/Cyan (#4facfe)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#fbbf24)

## ⚡ Common Commands

```bash
# Delete database
rm backend/database.sqlite

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Check for errors
npm run lint
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Delete `node_modules`, run `npm install` |
| Database errors | Delete `database.sqlite`, restart backend |
| Wallet won't connect | Install Phantom/Solflare, switch to Devnet |
| Password validation fails | Check all 5 requirements |
| Duplicate error | Email/wallet/citizenship already used |

## ✅ Testing Checklist

- [ ] Navigate to `/auth`
- [ ] Toggle Login/Register
- [ ] Toggle Admin/Voter
- [ ] Connect wallet
- [ ] Register as Admin
- [ ] Register as Voter
- [ ] Save Voter ID
- [ ] Login as Admin
- [ ] Login as Voter
- [ ] Verify redirects

## 📊 Database Tables

### users
```
id | username | email | password | walletAddress | role | createdAt | updatedAt
```

### voters
```
id | voterId | username | email | password | citizenshipNumber | 
citizenshipHash | issueDate | walletAddress | role | isEligible | 
createdAt | updatedAt
```

## 🔒 Security Features

- ✅ bcrypt password hashing
- ✅ Citizenship number hashing
- ✅ JWT authentication
- ✅ Unique constraints
- ✅ Input validation
- ✅ Role-based access

## 📚 Documentation Files

1. `ROLE_BASED_AUTH_SYSTEM.md` - Full documentation
2. `SETUP_NEW_AUTH.md` - Setup guide
3. `IMPLEMENTATION_SUMMARY.md` - Implementation details
4. `QUICK_REFERENCE.md` - This file

## 💡 Tips

- **Save Voter ID**: It's shown only once after registration
- **Connect Wallet First**: Required for registration
- **Use Devnet**: Switch wallet to Solana Devnet
- **Strong Passwords**: Use password manager
- **Test Both Roles**: Try admin and voter flows

## 🎯 Success Indicators

- ✅ No console errors
- ✅ Smooth animations
- ✅ Wallet connects
- ✅ Registration works
- ✅ Login redirects correctly
- ✅ Voter ID generated

## 📞 Need Help?

1. Check documentation files
2. Review console logs
3. Verify requirements met
4. Ensure database recreated
5. Check ports 3000 & 5000 available

---

**Quick Tip**: Bookmark this page for easy reference! 📌
