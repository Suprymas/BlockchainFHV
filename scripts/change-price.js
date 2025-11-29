const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xd6df32E1a465f987259516Abe6616319b5a450cB";

  console.log("Changing Raffle Price...");
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
    console.log(" Only the owner can change prices.");
    return;
  }
  console.log("You are the owner");
  console.log("");

  // Check if raffle is paused
  const info = await raffle.getRaffleInfo();
  const isActive = info[6];
  
  if (isActive) {
    console.log("Cannot change price while raffle is active!");
    console.log(" Tickets sold:", info[3].toString());
    console.log("");
    console.log("You must:");
    console.log("1. Wait for raffle to complete");
    console.log("2. Winner claims prize (this pauses raffle)");
    console.log("3. Then you can change the price");
    console.log("");
    console.log("OR if no tickets sold, pause first:");
    console.log("   npx hardhat run scripts/pause-raffle.js --network sepolia");
    return;
  }

  // Show current price
  const currentPrice = await raffle.ticketPrice();
  console.log("CURRENT SETTINGS");
  console.log("━".repeat(50));
  console.log("Current Ticket Price:", ethers.formatEther(currentPrice), "ETH");
  console.log("");

  // SET YOUR NEW PRICE HERE
  const NEW_PRICE = "0.005";
  // ====================================

  const newPrice = ethers.parseEther(NEW_PRICE);

  console.log("NEW SETTINGS");
  console.log("━".repeat(50));
  console.log("New Ticket Price:", NEW_PRICE, "ETH");
  console.log("");

  console.log("Updating price...");

  try {
    const tx = await raffle.updateTicketPrice(newPrice);
    
    console.log("Waiting for confirmation...");
    console.log("Transaction hash:", tx.hash);
    
    await tx.wait();
    
    console.log("");
    console.log("PRICE UPDATED!");
    console.log("");

    // Verify the change
    const updatedPrice = await raffle.ticketPrice();
    console.log("CONFIRMED");
    console.log("━".repeat(50));
    console.log("New Ticket Price:", ethers.formatEther(updatedPrice), "ETH");
    console.log("");
    console.log("Start the raffle with new price:");
    console.log("npx hardhat run scripts/start-raffle.js --network sepolia");

  } catch (error) {
    console.log("");
    console.log("Failed to update price!");
    
    if (error.message.includes("Pause raffle first")) {
      console.log("   Reason: Raffle is currently active");
      console.log("   Solution: Wait for raffle to complete or pause it");
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