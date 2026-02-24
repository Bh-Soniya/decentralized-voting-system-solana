# Role-Based Authentication System

## Overview
A comprehensive role-based authentication system for the decentralized voting platform with two distinct user roles: **Admin** and **Voter**.

## Features

### 🔐 Security Features
- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Authentication**: 7-day token expiry
- **Citizenship Hashing**: Voter citizenship numbers are hashed before storage
- **Unique Constraints**: Email, wallet address, and citizenship number must be unique
- **Input Validation**: All inputs validated on both frontend and backend
- **Role-Based Access Control**: Separate dashboards and permissions for each role

### 👤 User Roles

#### Admin
**Purpose**: Create and manage polls

**Registration Fields**:
- Username
- Email (unique)
- Password (strong requirements)
- Wallet Address (required, unique, connected via Solana wallet)

**Capabilities**:
- Create polls
- View all polls
- Manage own polls
- View poll results
- Cannot vote (observer role)

**Database Table**: `users`

#### Voter
**Purpose**: Participate in voting

**Registration Fields**:
- Username
- Email (unique)
- Password (strong requirements)
- Citizenship Number (5-20 digits, unique, hashed)
- Citizenship Issue Date
- Wallet Address (required, unique, connected via Solana wallet)

**Auto-Generated**:
- Voter ID (format: VID-YYYYMMDD-XXXXX)
- Eligibility Status (default: true)

**Capabilities**:
- View active polls
- Cast votes (one per poll)
- View voting history
- Cannot create polls

**Database Table**: `voters`

## Password Requirements

All users must create passwords with:
- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 lowercase letter (a-z)
- ✅ At least 1 number (0-9)
- ✅ At least 1 special character (@$!%*?&#)

**Example Valid Passwords**:
- `SecurePass123!`
- `MyVote@2024`
- `Admin#Pass99`

## API Endpoints

### Registration
```
POST /api/unified-auth/register
```

**Admin Payload**:
```json
{
  "role": "admin",
  "username": "john_admin",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
}
```

**Voter Payload**:
```json
{
  "role": "voter",
  "username": "jane_voter",
  "email": "jane@example.com",
  "password": "MyVote@2024",
  "citizenshipNumber": "1234567890",
  "issueDate": "2020-01-15",
  "walletAddress": "8yKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV"
}
```

### Login
```
POST /api/unified-auth/login
```

**Admin Payload**:
```json
{
  "role": "admin",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Voter Payload**:
```json
{
  "role": "voter",
  "voterId": "VID-20260223-ABC12",
  "citizenshipNumber": "1234567890",
  "issueDate": "2020-01-15"
}
```

## Frontend UI

### Unified Authentication Page (`/auth`)

**Features**:
1. **Mode Toggle**: Switch between Login and Register
2. **Role Selector**: Choose Admin or Voter with visual cards
3. **Dynamic Form**: Fields change based on selected role
4. **Real-time Validation**: Password strength indicator
5. **Wallet Integration**: Connect Solana wallet for registration
6. **Responsive Design**: Works on all devices

**Design Elements**:
- Gradient background (purple theme)
- Card-based layout with shadows
- Smooth animations and transitions
- Color-coded role buttons:
  - Voter: Pink/Red gradient
  - Admin: Blue/Cyan gradient
- Visual feedback for all interactions

### Navigation
- Single "Login / Register" link when not authenticated
- Role-specific dashboards after login:
  - Admin → `/dashboard`
  - Voter → `/voter/dashboard`

## Database Schema

### Users Table (Admins)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  walletAddress VARCHAR(44) UNIQUE NOT NULL,
  role ENUM('admin') DEFAULT 'admin',
  createdAt DATETIME,
  updatedAt DATETIME
);
```

### Voters Table
```sql
CREATE TABLE voters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  voterId VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  citizenshipNumber VARCHAR(20) UNIQUE NOT NULL,
  citizenshipHash VARCHAR(255) NOT NULL,
  issueDate DATE NOT NULL,
  walletAddress VARCHAR(44) UNIQUE NOT NULL,
  role ENUM('voter') DEFAULT 'voter',
  isEligible BOOLEAN DEFAULT TRUE,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

## Security Measures

### 1. Password Security
- Hashed using bcrypt with 10 salt rounds
- Never stored in plain text
- Validated against regex pattern on both frontend and backend

### 2. Citizenship Number Security
- Stored in two forms:
  - Plain text (for uniqueness check)
  - Hashed (for verification)
- Used for voter authentication
- Cannot be retrieved once hashed

### 3. Wallet Address Security
- Must be unique across both users and voters tables
- Verified through Solana wallet connection
- Required for all registrations

### 4. JWT Tokens
- Signed with secret key
- Include user ID, email, and role
- 7-day expiration
- Stored in localStorage

### 5. Input Validation
- Frontend: Real-time validation with visual feedback
- Backend: Server-side validation before database operations
- Prevents duplicate registrations
- Validates data formats and constraints

## Error Handling

### Common Error Messages
- "Invalid role. Must be admin or voter."
- "Password must be at least 8 characters long..."
- "Wallet address is required"
- "Wallet address is already registered"
- "Email is already registered"
- "Citizenship number is already registered"
- "Invalid credentials"

## Testing Guide

### Test Admin Registration
1. Navigate to `/auth`
2. Click "Register"
3. Select "Admin" role
4. Connect Solana wallet
5. Fill in:
   - Username: `testadmin`
   - Email: `admin@test.com`
   - Password: `Admin@123`
6. Submit and verify redirect to `/dashboard`

### Test Voter Registration
1. Navigate to `/auth`
2. Click "Register"
3. Select "Voter" role
4. Connect Solana wallet
5. Fill in:
   - Username: `testvoter`
   - Email: `voter@test.com`
   - Password: `Voter@123`
   - Citizenship: `1234567890`
   - Issue Date: `2020-01-15`
6. Submit and save the generated Voter ID
7. Verify redirect to `/voter/dashboard`

### Test Login
1. Navigate to `/auth`
2. Click "Login"
3. Select appropriate role
4. Enter credentials
5. Verify successful login and redirect

## File Structure

### Backend
```
backend/src/
├── models/
│   ├── User.ts (Admin model)
│   └── Voter.ts (Voter model)
├── controllers/
│   └── unifiedAuthController.ts
├── routes/
│   └── unifiedAuthRoutes.ts
└── server.ts
```

### Frontend
```
frontend/src/
├── pages/
│   └── UnifiedAuth.tsx
├── styles/
│   └── UnifiedAuth.css
├── components/
│   └── Navbar.tsx
└── App.tsx
```

## Environment Variables

```env
JWT_SECRET=your_secret_key_here
NODE_ENV=development
PORT=5000
```

## Future Enhancements

1. **Two-Factor Authentication**: Add 2FA for enhanced security
2. **Password Reset**: Implement forgot password functionality
3. **Voter ID Recovery**: Allow voters to recover their Voter ID
4. **Email Verification**: Verify email addresses before activation
5. **Social Login**: Add OAuth providers (Google, GitHub)
6. **Audit Logs**: Track all authentication attempts
7. **Rate Limiting**: Prevent brute force attacks
8. **Session Management**: Allow users to view and revoke active sessions

## Troubleshooting

### Issue: "Wallet address is already registered"
**Solution**: Each wallet can only be used once. Use a different wallet or check if you already have an account.

### Issue: Password validation fails
**Solution**: Ensure password meets all requirements (8+ chars, uppercase, lowercase, number, special char).

### Issue: Voter ID not showing after registration
**Solution**: Check the alert dialog and save the Voter ID immediately. It's also shown in the success toast.

### Issue: Cannot login as voter
**Solution**: Ensure you're using the correct Voter ID, citizenship number, and issue date. All three must match exactly.

## Support

For issues or questions:
1. Check this documentation
2. Review error messages carefully
3. Verify all requirements are met
4. Check browser console for detailed errors
5. Ensure backend server is running

## License

This authentication system is part of the Decentralized Voting System project.
