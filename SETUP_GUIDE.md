# Complete Setup Guide - Solana Voting System

## Prerequisites Installation

### 1. Install Node.js
Download and install Node.js v16+ from https://nodejs.org/

### 2. Install Rust and Solana CLI
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Verify installation
solana --version
```

### 3. Install Anchor Framework
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### 4. Install MySQL
Download and install MySQL from https://dev.mysql.com/downloads/

## Project Setup

### Step 1: Configure Solana for Devnet

```bash
# Set Solana to devnet
solana config set --url devnet

# Create a new keypair (if you don't have one)
solana-keygen new

# Get some devnet SOL (airdrop)
solana airdrop 2

# Check balance
solana balance
```

### Step 2: Build and Deploy Smart Contract

```bash
cd smart-contract

# Build the program
anchor build

# Get the program ID
solana address -k target/deploy/voting_system-keypair.json

# Update the program ID in:
# - Anchor.toml (programs.devnet section)
# - src/lib.rs (declare_id! macro)

# Deploy to devnet
anchor deploy

# Note: Save the program ID for backend configuration
```

### Step 3: Setup MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE voting_system;

# Create user (optional)
CREATE USER 'voting_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON voting_system.* TO 'voting_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 4: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your configuration:
# - Database credentials
# - JWT secret
# - Solana program ID from Step 2

# Start the server
npm run dev
```

The backend will run on http://localhost:5000

### Step 5: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on http://localhost:3000

## Testing the Application

### 1. Install Phantom Wallet
- Install Phantom wallet extension for your browser
- Create a new wallet or import existing one
- Switch to Devnet in wallet settings
- Get devnet SOL: https://solfaucet.com/

### 2. Test the Application

1. Open http://localhost:3000
2. Click "Register" and create an account
3. Connect your Phantom wallet
4. Create a new poll
5. Vote on the poll
6. View results

## Database Schema

The application uses the following tables:

- **users**: User accounts with wallet addresses
- **polls**: Poll information and blockchain addresses
- **options**: Poll options
- **votes**: Vote records with transaction signatures

## Troubleshooting

### Smart Contract Issues

**Error: Insufficient funds**
```bash
solana airdrop 2
```

**Error: Program deployment failed**
- Check your Solana balance
- Verify you're on devnet: `solana config get`
- Try rebuilding: `anchor clean && anchor build`

### Backend Issues

**Database connection error**
- Verify MySQL is running
- Check database credentials in .env
- Ensure database exists

**Port already in use**
- Change PORT in .env file
- Kill process using port: `lsof -ti:5000 | xargs kill`

### Frontend Issues

**Wallet connection fails**
- Ensure Phantom wallet is installed
- Switch wallet to Devnet
- Refresh the page

**API calls fail**
- Verify backend is running on port 5000
- Check CORS settings
- Verify JWT token in localStorage

## Production Deployment

### Smart Contract
1. Switch to mainnet: `solana config set --url mainnet-beta`
2. Ensure sufficient SOL for deployment
3. Deploy: `anchor deploy`
4. Update program ID in backend

### Backend
1. Use production database
2. Set strong JWT_SECRET
3. Enable HTTPS
4. Use environment variables
5. Deploy to services like Heroku, AWS, or DigitalOcean

### Frontend
1. Update API endpoint to production backend
2. Build: `npm run build`
3. Deploy to Vercel, Netlify, or similar

## Security Considerations

- Never commit .env files
- Use strong passwords and JWT secrets
- Validate all user inputs
- Implement rate limiting
- Use HTTPS in production
- Regularly update dependencies
- Audit smart contract before mainnet deployment

## Additional Resources

- Solana Documentation: https://docs.solana.com/
- Anchor Framework: https://www.anchor-lang.com/
- Phantom Wallet: https://phantom.app/
- React Documentation: https://react.dev/

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Solana and Anchor documentation
3. Check GitHub issues
4. Contact project maintainer
