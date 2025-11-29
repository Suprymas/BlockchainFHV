# Decentralized Raffle Smart Contract

A fully functional decentralized raffle/lottery system built with Solidity and Hardhat. Participants can buy tickets, and after reaching the maximum number of tickets or time expiration, a winner is randomly selected who can claim the entire prize pool.

## Features

- **Buy Tickets**: Purchase one or multiple raffle tickets with ETH, default price of ticket is 0.01 ETH. Can be changed by the owner
- **Automatic Winner Selection**: Winner chosen randomly when max tickets sold or time expires
- **Prize Claiming**: Winner can claim the entire prize pool
- **Transparent**: All participants and ticket counts are seen by everyone

## Smart Contract Details

### Main Functions

#### For Participants

- `buyTicket(uint256 _numberOfTickets)` - Purchase raffle tickets
  - **Parameters**: Number of tickets to buy
  - **Payment**: Must send exact amount (ticketPrice × numberOfTickets)
  - **Requirements**: Raffle must be active and tickets available

- `selectWinner()` - Trigger winner selection
  - **Requirements**: Max tickets sold OR time expired
  - **Anyone can call**: But only works when conditions met

- `claimPrize()` - Winner claims the prize pool
  - **Requirements**: Must be the winner
  - **Effect**: Transfers entire balance and starts new raffle

- `getRaffleInfo()` - Get current raffle information
  - **Returns**: Raffle ID, ticket price, max tickets, tickets sold, prize pool, time remaining, status

- `getMyTickets()` - Check your ticket count
  - **Returns**: Number of tickets you own in current raffle

- `getParticipants()` - View all participants
  - **Returns**: Array of participant addresses (includes duplicates for multiple tickets)

#### For Owner Only

- `updateTicketPrice(uint256 _newPrice)` - Change ticket price
- `updateMaxTickets(uint256 _newMax)` - Change maximum tickets
- `updateRaffleDuration(uint256 _newDuration)` - Change raffle duration

**Note**: Owner functions only work when no raffle is active (no tickets sold) or it is paused

## Installation & Setup

### Prerequisites

- Node.js v16+ and npm installed
- MetaMask wallet with Sepolia ETH
- Alchemy or Infura account for RPC endpoint

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd decentralized-raffle

# Install dependencies
npm install
```

### Step 2: Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_wallet_private_key
```


## Deployment

### Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Save the contract address** printed in the console!

## Interacting with the Contract

### Method 1: Using the Interaction Script

Edit `scripts/interact.js` and add your contract address:

```javascript
const CONTRACT_ADDRESS = "0xYourContractAddress";
```

Run the script:

```bash
npx hardhat run scripts/interact.js --network sepolia
```

### Method 2: Using Hardhat Console

```bash
npx hardhat console --network sepolia
```

Then in the console:

```javascript
// Attach to deployed contract
const Raffle = await ethers.getContractFactory("DecentralizedRaffle");
const raffle = Raffle.attach("YOUR_CONTRACT_ADDRESS");

// Get raffle info
const info = await raffle.getRaffleInfo();
console.log("Tickets sold:", info[3].toString());

// Buy ticket
const ticketPrice = await raffle.ticketPrice();
await raffle.buyTicket(1, { value: ticketPrice });

// Check your tickets
const myTickets = await raffle.getMyTickets();
console.log("My tickets:", myTickets.toString());

// Select winner (when conditions met)
await raffle.selectWinner();

// Check winner
const winner = await raffle.winner();
console.log("Winner:", winner);

// Claim prize (if you're the winner)
await raffle.claimPrize();
```

## Example Usage Flow

1. **Deploy Contract**: Owner deploys with initial settings
2. **User A buys 3 tickets**: Sends 0.03 ETH
3. **User B buys 2 tickets**: Sends 0.02 ETH  
4. **User C buys 5 tickets**: Sends 0.05 ETH
5. **Max tickets reached**: Raffle ends (if max was 10)
6. **Anyone calls selectWinner()**: Random winner chosen
7. **Winner claims prize**: Receives 0.10 ETH (minus gas)
8. **Owner needs to start ne raffle**

## Contract Parameters

### Default Deployment Settings

```javascript
TICKET_PRICE = 0.01 ETH
MAX_TICKETS = 10
RAFFLE_DURATION = 24 hours
```

### Randomness Note

The contract uses `block.timestamp`, `block.prevrandao`, and participant data for randomness.

## Testing

Run the test suite:

```bash
npx hardhat test
```

## Project Structure

```
decentralized-raffle/
├── contracts/
│   └── DecentralizedRaffle.sol    # Main smart contract
├── scripts/
│   ├── buy-tickets.js             # Helper to buy tickets
│   ├── change-price.js            # ONLY OWNER: helper to change raffle ticket price
│   ├── claim-price.js             # Can be triggered by anyone to claim the prize
│   ├── deploy.js                  # Deployment script
│   ├── interact.js                # Interaction examples
│   ├── pause-raffle.js            # ONLY OWNER: lets pause the raffle when no tickets were bought
│   ├── select-winner.js           # Can be triggered by anyone to determine winner
│   └── start-raffle.js            # ONLY OWNER: starts the raffle
│   
├── test/
│   └── DecentralizedRaffle.test.js # Tests
├── hardhat.config.js              # Hardhat configuration
├── .env                           # Environment variables
├── package.json
└── README.md                      # This file
```

## Security Considerations

- **ReentrancyGuard**: Protects against reentrancy attacks
- **Access Control**: Owner functions properly restricted
- **Input Validation**: All inputs checked before execution
- **Pull Payment Pattern**: Winner must claim their prize

## Common Issues & Troubleshooting

### "Raffle has ended"
- The max tickets were sold or time expired
- Wait for winner selection and prize claim to start new raffle

### "Not enough tickets available"
- Someone else bought tickets before you

### "Winner not yet selected"
- Call `selectWinner()` first (if conditions are met)
- Check raffle status with `getRaffleInfo()`

### "You are not the winner"
- Only the winner can claim the prize
- Check winner address with `winner()`
