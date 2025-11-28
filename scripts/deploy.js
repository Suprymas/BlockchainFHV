const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DecentralizedRaffle contract...");

  // Configuration
  const TICKET_PRICE = ethers.parseEther("0.01"); // 0.01 ETH per ticket
  const MAX_TICKETS = 10; // Maximum 10 tickets per raffle
  const RAFFLE_DURATION = 24 * 60 * 60; // 24 hours in seconds

  // Get the contract factory
  const DecentralizedRaffle = await ethers.getContractFactory("DecentralizedRaffle");

  // Deploy the contract
  const raffle = await DecentralizedRaffle.deploy(
    TICKET_PRICE,
    MAX_TICKETS,
    RAFFLE_DURATION
  );

  await raffle.waitForDeployment();

  const address = await raffle.getAddress();

  console.log("✅ DecentralizedRaffle deployed to:", address);
  console.log("\nConfiguration:");
  console.log("- Ticket Price:", ethers.formatEther(TICKET_PRICE), "ETH");
  console.log("- Max Tickets:", MAX_TICKETS);
  console.log("- Raffle Duration:", RAFFLE_DURATION / 3600, "hours");

  console.log("\n📋 Save this address for interaction!");
  console.log("\n⏳ Waiting for block confirmations...");

  // Wait for a few block confirmations
  await raffle.deploymentTransaction().wait(5);

  console.log("\n✅ Contract confirmed on blockchain!");
  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });