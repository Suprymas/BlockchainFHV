const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xd6df32E1a465f987259516Abe6616319b5a450cB";

  console.log("Pausing Raffle...");
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
    console.log("Only the owner can pause raffles.");
    return;
  }
  console.log("You are the owner");
  console.log("");

  // Check current status
  const info = await raffle.getRaffleInfo();
  const isActive = info[6];
  const ticketsSold = info[3];
  
  if (!isActive) {
    console.log("Raffle is already paused!");
    return;
  }

  if (ticketsSold > 0n) {
    console.log("Cannot pause raffle with participants!");
    console.log("Tickets sold:", ticketsSold.toString());
    console.log("");
    console.log("You must wait for the raffle to complete.");
    return;
  }

  console.log("Pausing raffle...");

  try {
    const tx = await raffle.pauseRaffle();
    
    console.log("Waiting for confirmation...");
    console.log("Transaction hash:", tx.hash);
    
    await tx.wait();
    
    console.log("");
    console.log("Raffle paused!");
    console.log("");
    console.log("You can now:");
    console.log("1. Change price: npx hardhat run scripts/change-price.js --network sepolia");
    console.log("2. Start raffle again: npx hardhat run scripts/start-raffle.js --network sepolia");

  } catch (error) {
    console.log("");
    console.log("Failed to pause raffle!");
    console.log("   Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });