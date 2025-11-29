const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xd6df32E1a465f987259516Abe6616319b5a450cB";

  console.log("Claiming prize...");
  console.log("");

  // Get contract instance
  const DecentralizedRaffle = await ethers.getContractFactory("DecentralizedRaffle");
  const raffle = DecentralizedRaffle.attach(CONTRACT_ADDRESS);

  // Check if winner is selected
  const winnerSelected = await raffle.winnerSelected();
  if (!winnerSelected) {
    console.log("Winner not selected yet!");
    console.log("");
    console.log("Select winner first by running:");
    console.log("   npx hardhat run scripts/select-winner.js --network sepolia");
    return;
  }

  // Get winner address
  const winner = await raffle.winner();
  const [signer] = await ethers.getSigners();

  console.log("Winner:", winner);
  console.log("Your address:", signer.address);
  console.log("");

  // Check if you're the winner
  if (winner.toLowerCase() !== signer.address.toLowerCase()) {
    console.log("You are not the winner!");
    console.log("Only the winner can claim the prize.");
    return;
  }

  // Get prize amount
  const prizePool = await ethers.provider.getBalance(CONTRACT_ADDRESS);
  
  if (prizePool === 0n) {
    console.log("Prize already claimed!");
    return;
  }

  console.log("Prize Amount:", ethers.formatEther(prizePool), "ETH");
  console.log("");
  console.log("Sending transaction...");
  
  try {
    // Get balance before
    const balanceBefore = await ethers.provider.getBalance(signer.address);
    
    const tx = await raffle.claimPrize();
    
    console.log("Waiting for confirmation...");
    console.log("Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    
    // Get balance after
    const balanceAfter = await ethers.provider.getBalance(signer.address);
    const received = balanceAfter - balanceBefore;
    
    console.log("");
    console.log("SUCCESS! Prize claimed!");
    console.log("   Block:", receipt.blockNumber);
    console.log("   Gas used:", receipt.gasUsed.toString());
    console.log("");
    console.log("PRIZE RECEIVED");
    console.log("━".repeat(50));
    console.log("   Prize Pool:", ethers.formatEther(prizePool), "ETH");
    console.log("   You received:", ethers.formatEther(received), "ETH (after gas)");
    console.log("   New Balance:", ethers.formatEther(balanceAfter), "ETH");
    console.log("");
    console.log("Congratulations!");
    console.log("");

  } catch (error) {
    console.log("");
    console.log("Transaction failed!");
    
    if (error.message.includes("You are not the winner")) {
      console.log("   Reason: You are not the winner");
    } else if (error.message.includes("Prize already claimed")) {
        console.log("Reason: Prize is already claimed");
    }

  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
