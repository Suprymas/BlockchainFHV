const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DecentralizedRaffle contract...");

  const TICKET_PRICE = ethers.parseEther("0.01");
  const MAX_TICKETS = 10;
  const RAFFLE_DURATION = 24 * 60 * 60;

  const DecentralizedRaffle = await ethers.getContractFactory("DecentralizedRaffle");

  const raffle = await DecentralizedRaffle.deploy(
    TICKET_PRICE,
    MAX_TICKETS,
    RAFFLE_DURATION
  );

  await raffle.waitForDeployment();

  const address = await raffle.getAddress();

  console.log("DecentralizedRaffle deployed to:", address);
  console.log("- Ticket Price:", ethers.formatEther(TICKET_PRICE), "ETH");
  console.log("- Max Tickets:", MAX_TICKETS);
  console.log("- Raffle Duration:", RAFFLE_DURATION / 3600, "hours");


  await raffle.deploymentTransaction().wait(5);

  console.log("\nContract confirmed on blockchain!");
  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });