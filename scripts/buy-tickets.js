const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xd6df32E1a465f987259516Abe6616319b5a450cB";

  console.log("Buying ticket...");
  console.log("");

  // Get contract instance
  const DecentralizedRaffle = await ethers.getContractFactory("DecentralizedRaffle");
  const raffle = DecentralizedRaffle.attach(CONTRACT_ADDRESS);

  // Get ticket price
  const ticketPrice = await raffle.ticketPrice();
  const totalCost = ticketPrice * BigInt(numberOfTickets);

  console.log("Ticket Price:", ethers.formatEther(ticketPrice), "ETH");
  console.log("");

  // Get signer
  const [signer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(signer.address);
  
  if (balance < totalCost) {
    console.log("Insufficient balance!");
    console.log("   You have:", ethers.formatEther(balance), "ETH");
    console.log("   You need:", ethers.formatEther(totalCost), "ETH");
    return;
  }

  console.log("Sending transaction...");
  
  try {
    const tx = await raffle.buyTicket(numberOfTickets, {
      value: totalCost
    });

    console.log("Waiting for confirmation...");
    console.log("Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    
    console.log("");
    console.log("SUCCESS! Tickets purchased!");
    console.log("   Block:", receipt.blockNumber);
    console.log("   Gas used:", receipt.gasUsed.toString());
    console.log("");

    // Show updated info
    const myTickets = await raffle.getMyTickets();
    const info = await raffle.getRaffleInfo();
    
    console.log("UPDATED RAFFLE INFO");
    console.log("━".repeat(50));
    console.log("Your Ticket:", myTickets.toString());
    console.log("Total Tickets Sold:", info[3].toString(), "/", info[2].toString());
    console.log("Prize Pool:", ethers.formatEther(info[4]), "ETH");
    
    if (info[3] >= info[2]) {
      console.log("");
      console.log("MAX TICKETS REACHED! Ready to select winner!");
      console.log(" Run: npx hardhat run scripts/select-winner.js --network sepolia");
    }

  } catch (error) {
    console.log("");
    console.log("Transaction failed!");
    
    if (error.message.includes("Raffle has ended")) {
      console.log("   Reason: Raffle has already ended");
    } else if (error.message.includes("Not enough tickets available")) {
      console.log("   Reason: Not enough tickets available");
      const info = await raffle.getRaffleInfo();
      const available = info[2] - info[3];
      console.log("   Available tickets:", available.toString());
    } else if (error.message.includes("Incorrect payment amount")) {
      console.log("   Reason: Incorrect payment amount");
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