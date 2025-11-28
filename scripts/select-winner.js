const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x6698C0c2B8f6943DC65Db98f2aba0F4Ac2701b51";

  console.log("🎲 Selecting winner...");
  console.log("");

  // Get contract instance
  const DecentralizedRaffle = await ethers.getContractFactory("DecentralizedRaffle");
  const raffle = DecentralizedRaffle.attach(CONTRACT_ADDRESS);

  // Check if winner already selected
  const winnerSelected = await raffle.winnerSelected();
  if (winnerSelected) {
    console.log("❌ Winner already selected!");
    const winner = await raffle.winner();
    console.log("   Winner:", winner);
    console.log("");
    console.log("Winner should claim prize by running:");
    console.log("   node scripts/claim-prize.js");
    return;
  }

  // Check conditions
  const info = await raffle.getRaffleInfo();
  const ticketsSold = info[3];
  const maxTickets = info[2];
  const timeRemaining = info[5];

  console.log("📊 Current Status:");
  console.log("   Tickets Sold:", ticketsSold.toString(), "/", maxTickets.toString());
  console.log("   Time Remaining:", timeRemaining.toString(), "seconds");
  console.log("");

  if (ticketsSold < maxTickets && timeRemaining > 0n) {
    console.log("❌ Cannot select winner yet!");
    console.log("   Need either:");
    console.log("   - All tickets sold, OR");
    console.log("   - Time to expire");
    return;
  }

  if (ticketsSold === 0n) {
    console.log("❌ No participants! Cannot select winner.");
    return;
  }

  console.log("🔄 Sending transaction...");
  
  try {
    const tx = await raffle.selectWinner();
    
    console.log("⏳ Waiting for confirmation...");
    console.log("   Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    
    console.log("");
    console.log("✅ SUCCESS! Winner selected!");
    console.log("   Block:", receipt.blockNumber);
    console.log("   Gas used:", receipt.gasUsed.toString());
    console.log("");

    // Get winner
    const winner = await raffle.winner();
    const prizePool = info[4];

    console.log("🏆 WINNER ANNOUNCEMENT");
    console.log("━".repeat(50));
    console.log("👑 Winner:", winner);
    console.log("💰 Prize:", ethers.formatEther(prizePool), "ETH");
    console.log("");

    // Check if you won
    const [signer] = await ethers.getSigners();
    if (winner.toLowerCase() === signer.address.toLowerCase()) {
      console.log("🎉 CONGRATULATIONS! YOU WON! 🎉");
      console.log("");
      console.log("Claim your prize by running:");
      console.log("   node scripts/claim-prize.js");
    } else {
      console.log("😢 Better luck next time!");
      console.log("");
      console.log("The winner can claim by running:");
      console.log("   node scripts/claim-prize.js");
    }

  } catch (error) {
    console.log("");
    console.log("❌ Transaction failed!");
    console.log("   Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });