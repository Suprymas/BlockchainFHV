const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  // UPDATE THIS with your V2 contract address
  const CONTRACT_ADDRESS = "0xd6df32E1a465f987259516Abe6616319b5a450cB";

  console.log("Starting Raffle...");
  console.log("");

  // Get contract instance
  const DecentralizedRaffle = await ethers.getContractFactory("DecentralizedRaffle");
  const raffle = DecentralizedRaffle.attach(CONTRACT_ADDRESS);

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Your address:", signer.address);

  // Check if you're the owner
  const owner = await raffle.owner();
  console.log("Contract owner:", owner);
  
  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    console.log("");
    console.log("You are not the owner!");
    console.log("Only the owner can start raffles.");
    return;
  }
  console.log("You are the owner");
  console.log("");

  // Check current status
  const info = await raffle.getRaffleInfo();
  const isActive = info[6];
  
  if (isActive) {
    console.log("Raffle is already active!");
    console.log("Tickets sold:", info[3].toString());
    return;
  }

  // Show raffle settings
  console.log("RAFFLE SETTINGS");
  console.log("━".repeat(50));
  console.log("Ticket Price:", ethers.formatEther(info[1]), "ETH");
  console.log("Max Tickets:", info[2].toString());
  console.log("Duration:", info[5].toString(), "seconds");
  console.log("");

  console.log("Starting raffle...");

  try {
    const tx = await raffle.startRaffle();
    
    console.log("Waiting for confirmation...");
    console.log("Transaction hash:", tx.hash);
    
    await tx.wait();
    
    console.log("");
    console.log("RAFFLE STARTED!");
    console.log("");
    console.log("Raffle ID:", info[0].toString());
    console.log("Users can now buy tickets!");
    console.log("");
    console.log("To check status: npx hardhat run scripts/interact.js --network sepolia");

  } catch (error) {
    console.log("");
    console.log("Failed to start raffle!");
    
    if (error.message.includes("Raffle already active")) {
      console.log("   Reason: Raffle is already running");
    } else if (error.message.includes("Clear previous raffle first")) {
      console.log("   Reason: Previous raffle data still exists");
    } else {
      console.log("   Error:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });