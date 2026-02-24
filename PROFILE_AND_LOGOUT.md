# Profile Page & Logout Functionality

## Overview
Added a comprehensive Profile page that works for both Admin and Voter users, with logout functionality.

## Features

### Profile Page (`/profile`)

**For Both Admin and Voter:**
- ✅ View profile details
- ✅ Edit username
- ✅ Change password
- ✅ Logout button
- ✅ Beautiful gradient UI
- ✅ Role-specific information

### Profile Information Displayed

**Common Fields:**
- Username
- Email
- Wallet Address
- Role (Admin/Voter)
- Member Since date

**Voter-Specific Fields:**
- Voter ID (highlighted in pink)
- Voting Status (Eligible/Not Eligible)

### Actions Available

1. **Edit Profile**
   - Update username
   - Email and wallet are read-only (cannot be changed)

2. **Change Password**
   - Enter current password
   - Enter new password (with strength validation)
   - Confirm new password
   - Real-time password strength indicator

3. **Logout**
   - Red logout button in header
   - Clears localStorage
   - Redirects to login page
   - Shows success message

## UI Design

### Layout:
- **Header**: Profile title + Logout button
- **Avatar**: Large circular avatar with first letter of username
- **Role Badge**: Shows Admin 👤 or Voter 🗳️
- **Details Card**: Clean white card with all information
- **Action Buttons**: Edit Profile and Change Password

### Colors:
- **Background**: Light gradient (#f5f7fa → #c3cfe2)
- **Card**: White with shadow
- **Avatar**: Purple gradient (#667eea → #764ba2)
- **Logout**: Red gradient (#ff6b6b → #ee5a6f)
- **Voter ID**: Pink (#f5576c)
- **Eligible Status**: Green (#10b981)

### Responsive:
- Desktop: Side-by-side layout
- Mobile: Stacked layout
- All buttons full-width on mobile

## How It Works

### Data Source:
- Reads user data from `localStorage`
- Key: `user` (JSON object)
- Contains: id, username, email, walletAddress, role, voterId (for voters), isEligible (for voters)

### Logout Process:
1. User clicks "🚪 Logout" button
2. Clears `token` from localStorage
3. Clears `user` from localStorage
4. Shows success toast
5. Redirects to `/login`

### Edit Profile:
1. Click "✏️ Edit Profile"
2. Form appears with current data
3. Can only edit username
4. Email and wallet are disabled
5. Save or Cancel

### Change Password:
1. Click "🔒 Change Password"
2. Form appears with password fields
3. Enter current password
4. Enter new password (validated)
5. Confirm new password
6. Real-time strength indicator
7. Save or Cancel

## Password Requirements

All passwords must have:
- ✅ At least 8 characters
- ✅ 1 uppercase letter (A-Z)
- ✅ 1 lowercase letter (a-z)
- ✅ 1 number (0-9)
- ✅ 1 special character (@$!%*?&#)

## Navigation

### Access Profile:
- Click "Profile" link in navbar (when logged in)
- Or navigate to `/profile`

### After Logout:
- Automatically redirected to `/login`
- Can login again with credentials

## Files Modified

1. **`frontend/src/pages/Profile.tsx`**
   - Complete rewrite
   - Works for both Admin and Voter
   - Reads from localStorage
   - Includes logout functionality
   - Beautiful UI with role-specific info

2. **`frontend/src/App.css`**
   - Added profile page styles
   - Avatar, cards, badges
   - Responsive design
   - Button styles

## Testing

### Test Admin Profile:
1. Login as Admin
2. Click "Profile" in navbar
3. Verify all admin fields show
4. Try editing username
5. Try changing password
6. Click logout
7. Verify redirect to login

### Test Voter Profile:
1. Login as Voter
2. Click "Profile" in navbar
3. Verify Voter ID shows
4. Verify voting status shows
5. Try editing username
6. Try changing password
7. Click logout
8. Verify redirect to login

## Security

- ✅ Profile requires authentication
- ✅ Data stored in localStorage
- ✅ Logout clears all data
- ✅ Password validation enforced
- ✅ Email and wallet cannot be changed (security)

## User Experience

### Visual Feedback:
- Toast notifications for all actions
- Loading states
- Error messages
- Success messages
- Smooth animations

### Intuitive Design:
- Clear labels
- Helpful icons
- Disabled fields are grayed out
- Password strength indicator
- Confirmation for password match

## Benefits

1. **Unified Experience**: Same profile page for both roles
2. **Role-Specific Info**: Shows relevant data based on role
3. **Easy Logout**: Prominent logout button
4. **Profile Management**: Edit username and password
5. **Beautiful UI**: Modern gradient design
6. **Responsive**: Works on all devices
7. **Secure**: Proper validation and data handling

## Future Enhancements

- Add profile picture upload
- Add email change with verification
- Add two-factor authentication
- Add activity log
- Add account deletion option
- Add export data feature

## Troubleshooting

### Issue: Profile not loading
**Solution**: Check if user is logged in and localStorage has `user` data

### Issue: Logout not working
**Solution**: Check browser console for errors, ensure localStorage is accessible

### Issue: Can't edit email/wallet
**Solution**: This is by design for security. These fields are read-only.

### Issue: Password change fails
**Solution**: Ensure all password requirements are met and passwords match

---

**Status**: ✅ Complete
**Date**: February 23, 2026
**Works For**: Both Admin and Voter users
