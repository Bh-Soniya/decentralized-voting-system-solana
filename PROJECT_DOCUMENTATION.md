# Decentralized Voting System - Project Documentation

## Final Year Project Documentation

### Project Overview

This project implements a decentralized voting system using Solana blockchain technology. The system ensures transparent, secure, and immutable voting records while providing a user-friendly interface for creating and participating in polls.

### Technology Stack

#### Blockchain Layer
- **Solana**: High-performance blockchain (Devnet)
- **Anchor Framework**: Rust-based framework for Solana programs
- **Smart Contract**: Written in Rust for vote management

#### Backend Layer
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type-safe JavaScript
- **Sequelize ORM**: Database management
- **MySQL**: Relational database
- **JWT**: Authentication

#### Frontend Layer
- **React**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Solana Web3.js**: Blockchain interaction
- **Wallet Adapter**: Wallet integration

### System Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
┌────────▼────────┐ ┌─────▼──────────┐
│   Backend       │ │   Solana       │
│   (Node.js)     │ │   Blockchain   │
└────────┬────────┘ └────────────────┘
         │
┌────────▼────────┐
│   MySQL         │
│   Database      │
└─────────────────┘
```

### Key Features

1. **User Authentication**
   - Email/password registration
   - JWT-based authentication
   - Wallet address linking

2. **Poll Management**
   - Create polls with multiple options
   - Set start and end times
   - View all active polls
   - Poll status tracking

3. **Voting System**
   - Wallet-based voting
   - One vote per user per poll
   - Transaction signature recording
   - Real-time results

4. **Blockchain Integration**
   - Immutable vote records
   - Transparent vote counting
   - Decentralized verification
   - Free transactions on devnet

### Smart Contract Functions

#### initialize_poll
Creates a new poll on the blockchain with:
- Poll ID
- Description
- Start and end times
- Options array
- Vote counts initialization

#### cast_vote
Records a vote on the blockchain:
- Validates poll status and timing
- Prevents double voting
- Updates vote counts
- Creates immutable vote record

#### close_poll
Closes an active poll:
- Only poll creator can close
- Prevents further voting
- Finalizes results

### Database Schema

#### Users Table
```sql
- id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE)
- password (HASHED)
- walletAddress (UNIQUE, NULLABLE)
- createdAt
- updatedAt
```

#### Polls Table
```sql
- id (PRIMARY KEY)
- pollId (UNIQUE)
- title
- description
- creatorId (FOREIGN KEY -> users.id)
- blockchainAddress
- startTime
- endTime
- status (pending/active/closed)
- createdAt
- updatedAt
```

#### Options Table
```sql
- id (PRIMARY KEY)
- pollId (FOREIGN KEY -> polls.id)
- optionText
- optionIndex
- createdAt
- updatedAt
```

#### Votes Table
```sql
- id (PRIMARY KEY)
- pollId (FOREIGN KEY -> polls.id)
- userId (FOREIGN KEY -> users.id)
- optionIndex
- transactionSignature (UNIQUE)
- walletAddress
- createdAt
- updatedAt
```

### API Endpoints

#### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- PUT `/api/auth/wallet` - Update wallet address

#### Polls
- POST `/api/polls` - Create new poll (authenticated)
- GET `/api/polls` - Get all polls
- GET `/api/polls/:id` - Get poll by ID
- POST `/api/polls/vote` - Cast vote (authenticated)
- GET `/api/polls/:id/results` - Get poll results

### Security Features

1. **Authentication**
   - Password hashing with bcrypt
   - JWT token validation
   - Protected routes

2. **Blockchain Security**
   - Wallet signature verification
   - Immutable vote records
   - Transparent vote counting

3. **Database Security**
   - SQL injection prevention (Sequelize)
   - Input validation
   - Unique constraints

4. **Application Security**
   - CORS configuration
   - Environment variables
   - Error handling

### User Flow

1. **Registration/Login**
   - User creates account
   - Connects Phantom wallet
   - Wallet address linked to account

2. **Creating a Poll**
   - User navigates to "Create Poll"
   - Fills in poll details and options
   - Poll created in database
   - Blockchain address generated

3. **Voting**
   - User views available polls
   - Selects a poll
   - Chooses an option
   - Connects wallet to vote
   - Vote recorded on blockchain
   - Vote saved in database

4. **Viewing Results**
   - Real-time vote counting
   - Percentage calculations
   - Visual progress bars
   - Total vote count

### Advantages of Blockchain Voting

1. **Transparency**: All votes are publicly verifiable
2. **Immutability**: Votes cannot be altered or deleted
3. **Security**: Cryptographic signatures prevent fraud
4. **Decentralization**: No single point of failure
5. **Auditability**: Complete voting history available
6. **Cost-Effective**: Free transactions on devnet

### Limitations and Future Improvements

#### Current Limitations
- Devnet only (not production-ready)
- Simplified smart contract
- Basic UI/UX
- Limited poll types

#### Future Enhancements
1. **Advanced Features**
   - Weighted voting
   - Multi-choice voting
   - Anonymous voting with zero-knowledge proofs
   - Delegate voting

2. **Improved UI/UX**
   - Mobile responsive design
   - Dark mode
   - Advanced analytics
   - Notification system

3. **Scalability**
   - Caching layer (Redis)
   - Load balancing
   - Database optimization
   - CDN integration

4. **Security Enhancements**
   - Two-factor authentication
   - Rate limiting
   - DDoS protection
   - Smart contract audit

### Testing Strategy

1. **Smart Contract Testing**
   - Unit tests with Anchor
   - Integration tests
   - Security audits

2. **Backend Testing**
   - API endpoint tests
   - Database tests
   - Authentication tests

3. **Frontend Testing**
   - Component tests
   - Integration tests
   - E2E tests with Cypress

### Deployment Checklist

- [ ] Smart contract audited
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] CORS properly configured
- [ ] Error logging setup
- [ ] Backup strategy implemented
- [ ] Monitoring tools configured

### Conclusion

This decentralized voting system demonstrates the practical application of blockchain technology in creating transparent and secure voting mechanisms. The project successfully integrates modern web technologies with blockchain to provide a complete end-to-end solution suitable for a final year undergraduate project.

### References

1. Solana Documentation - https://docs.solana.com/
2. Anchor Framework - https://www.anchor-lang.com/
3. React Documentation - https://react.dev/
4. Sequelize ORM - https://sequelize.org/
5. Web3.js Documentation - https://solana-labs.github.io/solana-web3.js/

### Appendix

#### A. Installation Commands
See SETUP_GUIDE.md

#### B. API Documentation
See API endpoint section above

#### C. Smart Contract Code
See smart-contract/src/lib.rs

#### D. Database Migrations
Handled automatically by Sequelize sync
