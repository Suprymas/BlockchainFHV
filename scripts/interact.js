const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x6698C0c2B8f6943DC65Db98f2aba0F4Ac2701b51";

  console.log("🎟️  Connecting to DecentralizedRaffle...");
  console.log("📍 Contract:", CONTRACT_ADDRESS);
  console.log("");

  // Get contract instance
  const DecentralizedRaffle = await ethers.getContractFactory("DecentralizedRaffle");
  const raffle = DecentralizedRaffle.attach(CONTRACT_ADDRESS);

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("👤 Your address:", signer.address);
  
  // Get balance
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("💰 Your balance:", ethers.formatEther(balance), "ETH");
  console.log("");

  // Get raffle info
  console.log("📊 CURRENT RAFFLE INFO");
  console.log("━".repeat(50));
  
  const info = await raffle.getRaffleInfo();
  console.log("🎲 Raffle ID:", info[0].toString());
  console.log("🎫 Ticket Price:", ethers.formatEther(info[1]), "ETH");
  console.log("📊 Max Tickets:", info[2].toString());
  console.log("✅ Tickets Sold:", info[3].toString());
  console.log("💵 Prize Pool:", ethers.formatEther(info[4]), "ETH");
  console.log("⏰ Time Remaining:", info[5].toString(), "seconds");
  console.log("🏁 Raffle Ended:", info[6]);
  console.log("🏆 Winner Selected:", info[7]);
  
  if (info[7]) {
    console.log("👑 Winner:", info[8]);
  }
  console.log("");

  // Get your tickets
  const myTickets = await raffle.getMyTickets();
  console.log("🎟️  Your Tickets:", myTickets.toString());
  console.log("");

  // Get all participants
  const participants = await raffle.getParticipants();
  if (participants.length > 0) {
    console.log("👥 PARTICIPANTS (" + participants.length + " tickets sold)");
    console.log("━".repeat(50));
    const uniqueParticipants = [...new Set(participants)];
    for (const participant of uniqueParticipants) {
      const count = participants.filter(p => p === participant).length;
      console.log(`  ${participant}: ${count} ticket(s)`);
    }
    console.log("");
  }

  // Interactive menu
  console.log("🎮 WHAT WOULD YOU LIKE TO DO?");
  console.log("━".repeat(50));
  console.log("To buy tickets, run:");
  console.log("  node scripts/buy-ticket.js [number_of_tickets]");
  console.log("");
  console.log("To select winner (when ready), run:");
  console.log("  node scripts/select-winner.js");
  console.log("");
  console.log("To claim prize (if you won), run:");
  console.log("  node scripts/claim-prize.js");
  console.log("");
  console.log("Or use Hardhat console for manual interaction:");
  console.log("  npx hardhat console --network sepolia");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });