# 🪙 Token Minting System Documentation

## Overview
The Token Minting System implements a blockchain-based voting token mechanism where admins mint unique voting tokens for eligible voters. Each token represents the right to vote in a specific poll, and tokens are collected back by the admin after voting.

## System Architecture

### Flow Diagram
```
Admin → Mint Tokens → Voter Wallet
Voter → Cast Vote → Token Collected → Admin Wallet
```

## Key Features

### 1. Token Minting (Admin Only)
- **Who**: Only Admin users can mint tokens
- **What**: Creates one unique voting token per eligible voter for a specific poll
- **How**: 
  - Admin selects a poll from Token Management page
  - Clicks "Mint Tokens for All Voters"
  - System creates tokens for all eligible voters
  - Each token is sent to voter's wallet address

### 2. Token Validation (Voting)
- **Who**: Voters
- **What**: System checks if voter has a valid token before allowing vote
- **How**:
  - When voter attempts to vote, system checks for token
  - Token status must be "minted" (not used/collected)
  - If no token found, voting is blocked
  - Error message: "No valid voting token found. Please contact admin to mint a token for you."

### 3. Token Collection (After Voting)
- **Who**: Automatic system process
- **What**: Token is marked as "collected" after successful vote
- **How**:
  - Vote is recorded on blockchain
  - Token status changes from "minted" to "collected"
  - Token is marked with transaction signature
  - Voter cannot vote again (no token available)

## Database Schema

### VotingToken Model
```typescript
{
  id: number;
  tokenId: string;              // Unique token identifier
  voterId: number;              // Reference to Voter
  voterWalletAddress: string;   // Voter's wallet
  pollId: number;               // Reference to Poll
  status: 'minted' | 'used' | 'collected';
  mintedBy: number;             // Admin who minted
  mintTransactionSignature: string;
  transferTransactionSignature?: string;
  mintedAt: Date;
  usedAt?: Date;
}
```

## API Endpoints

### Admin Endpoints

#### 1. Mint Tokens for Poll
```
POST /api/tokens/mint/:pollId
Headers: Authorization: Bearer <admin_token>
Response: {
  message: "Token minting completed",
  totalVoters: 10,
  successfulMints: 10,
  failedMints: 0,
  mintedTokens: [...]
}
```

#### 2. Get Poll Tokens
```
GET /api/tokens/poll/:pollId
Headers: Authorization: Bearer <admin_token>
Response: {
  summary: {
    total: 10,
    minted: 5,
    used: 0,
    collected: 5
  },
  tokens: [...]
}
```

### Voter Endpoints

#### 1. Get My Tokens
```
GET /api/tokens/my-tokens
Headers: Authorization: Bearer <voter_token>
Response: {
  total: 3,
  available: 1,
  used: 2,
  tokens: [...]
}
```

#### 2. Check Token Status for Poll
```
GET /api/tokens/status/:pollId
Headers: Authorization: Bearer <voter_token>
Response: {
  hasToken: true,
  tokenId: "VT-poll_123-VID-20240224-ABC",
  status: "minted",
  canVote: true,
  mintedAt: "2024-02-24T10:00:00Z"
}
```

## Security Features

### 1. One Token Per Voter Per Poll
- System checks for existing tokens before minting
- Prevents duplicate token creation
- Database constraint ensures uniqueness

### 2. Token Status Validation
- Only "minted" tokens can be used for voting
- "collected" tokens cannot be reused
- Status transitions are one-way (minted → collected)

### 3. Role-Based Access Control
- Only admins can mint tokens
- Only voters can use tokens
- Admins cannot vote (no token validation for admin votes)

### 4. Blockchain Verification
- All transactions recorded on Solana blockchain
- Transaction signatures stored for audit trail
- Immutable voting records

## User Interface

### Admin: Token Management Page
**Location**: `/token-management`

**Features**:
- Poll selector (left sidebar)
- Token summary cards (Total, Available, Collected)
- Token table with details:
  - Token ID
  - Voter ID
  - Voter Name
  - Wallet Address
  - Status
  - Minted At
  - Used At
- "Mint Tokens" button

**Access**: Admin only (protected route)

### Voter: Token Status Display
**Location**: Poll Details page (when voting)

**Features**:
- Token availability indicator
- Token ID display
- Status badge
- Error message if no token

## How It Works: Step-by-Step

### Step 1: Admin Creates Poll
1. Admin logs in
2. Creates a new poll with options
3. Poll is saved to database

### Step 2: Admin Mints Tokens
1. Admin navigates to Token Management
2. Selects the poll
3. Clicks "Mint Tokens for All Voters"
4. System creates one token per eligible voter
5. Tokens are recorded in database
6. Status: "minted"

### Step 3: Voter Attempts to Vote
1. Voter logs in
2. Views available polls
3. Selects a poll to vote
4. System checks for valid token
5. If token exists (status = "minted"):
   - Voting interface is shown
   - Voter can cast vote
6. If no token:
   - Error message displayed
   - Voting blocked

### Step 4: Voter Casts Vote
1. Voter selects an option
2. Connects wallet
3. Signs blockchain transaction
4. Vote is recorded
5. Token status changes to "collected"
6. Token marked with transaction signature
7. Voter cannot vote again

### Step 5: Admin Views Results
1. Admin can see token statistics
2. Track which voters have voted (collected tokens)
3. Track which voters haven't voted (minted tokens)
4. View complete audit trail

## Benefits for Your Project

### 1. Blockchain Integration ✅
- Real blockchain token concept
- Solana wallet integration
- Transaction signatures

### 2. Security ✅
- Prevents double voting
- One person = One vote
- Immutable records

### 3. Transparency ✅
- All transactions visible
- Admin can track token usage
- Voters can verify their tokens

### 4. Scalability ✅
- Works for any number of voters
- Automated token minting
- Efficient database queries

### 5. Audit Trail ✅
- Complete voting history
- Transaction signatures
- Timestamp records

## Viva/Presentation Talking Points

### Explain the Concept:
"In our system, the admin mints exactly one voting token per verified voter for each poll. The voter can cast their vote only if they hold this token. Once the vote is cast, the token is collected by the admin, making it impossible to vote again. This ensures one-person-one-vote using blockchain smart contract logic."

### Technical Implementation:
"We use Solana blockchain for transaction recording. Each token has a unique ID and is associated with a voter's wallet address. The token status transitions from 'minted' to 'collected' after voting, enforced by our backend validation and recorded on the blockchain."

### Security Measures:
"The system prevents double voting through multiple layers: database constraints ensure one token per voter per poll, token status validation prevents reuse, and blockchain transactions provide an immutable audit trail."

### Real-World Application:
"This approach can be used for elections, corporate voting, DAO governance, or any scenario requiring secure, transparent, and verifiable voting with guaranteed one-person-one-vote enforcement."

## Future Enhancements

1. **Token Burning**: Instead of collecting, burn tokens after use
2. **Token Transfer**: Allow voters to transfer unused tokens
3. **Token Expiry**: Auto-expire tokens after poll ends
4. **Batch Minting**: Mint tokens for specific voter groups
5. **Token Analytics**: Advanced statistics and reporting
6. **NFT Tokens**: Use Solana NFTs as voting tokens
7. **Token Marketplace**: Trade voting rights (if applicable)

## Troubleshooting

### Issue: "No valid voting token found"
**Solution**: Admin needs to mint tokens for the poll

### Issue: Token already minted error
**Solution**: Token already exists, check token status

### Issue: Cannot vote after token minted
**Solution**: Check token status, ensure it's "minted" not "collected"

### Issue: Token not showing in voter's list
**Solution**: Verify voter is eligible, check database records

## Conclusion

The Token Minting System adds a robust, blockchain-based voting mechanism to your project. It demonstrates understanding of:
- Blockchain concepts
- Token economics
- Smart contract logic
- Security best practices
- Database design
- Full-stack development

This feature significantly strengthens your project for academic evaluation and real-world application.
