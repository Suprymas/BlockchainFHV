pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DecentralizedRaffle
 * @dev A decentralized raffle contract where users can buy tickets and a random winner is selected
 */
contract DecentralizedRaffle is Ownable, ReentrancyGuard {
    uint256 public ticketPrice;
    uint256 public maxTickets;
    uint256 public raffleDuration;
    uint256 public raffleEndTime;
    
    address[] public participants;
    mapping(address => uint256) public ticketCount;
    
    address public winner;
    bool public raffleEnded;
    bool public winnerSelected;
    
    uint256 public raffleId;
    
    event TicketPurchased(address indexed buyer, uint256 ticketCount, uint256 raffleId);
    event WinnerSelected(address indexed winner, uint256 prize, uint256 raffleId);
    event PrizeClaimed(address indexed winner, uint256 amount, uint256 raffleId);
    event RaffleStarted(uint256 raffleId, uint256 ticketPrice, uint256 maxTickets, uint256 endTime);
    
    constructor(
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _raffleDuration
    ) Ownable(msg.sender) {
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_maxTickets > 1, "Must allow at least 2 tickets");
        require(_raffleDuration > 0, "Duration must be greater than 0");
        
        ticketPrice = _ticketPrice;
        maxTickets = _maxTickets;
        raffleDuration = _raffleDuration;
        raffleId = 1;
        
        _startNewRaffle();
    }
    
    function _startNewRaffle() private {
        raffleEndTime = block.timestamp + raffleDuration;
        raffleEnded = false;
        winnerSelected = false;
        winner = address(0);
        delete participants;
        
        emit RaffleStarted(raffleId, ticketPrice, maxTickets, raffleEndTime);
    }
    
    function buyTicket(uint256 _numberOfTickets) external payable nonReentrant {
        require(!raffleEnded, "Raffle has ended");
        require(block.timestamp < raffleEndTime, "Raffle time has expired");
        require(_numberOfTickets > 0, "Must buy at least 1 ticket");
        require(
            participants.length + _numberOfTickets <= maxTickets,
            "Not enough tickets available"
        );
        require(
            msg.value == ticketPrice * _numberOfTickets,
            "Incorrect payment amount"
        );
        
        for (uint256 i = 0; i < _numberOfTickets; i++) {
            participants.push(msg.sender);
        }
        
        ticketCount[msg.sender] += _numberOfTickets;
        
        emit TicketPurchased(msg.sender, _numberOfTickets, raffleId);
        
        if (participants.length == maxTickets) {
            raffleEnded = true;
        }
    }
    
    function selectWinner() external nonReentrant {
        require(
            participants.length == maxTickets || block.timestamp >= raffleEndTime,
            "Raffle conditions not met"
        );
        require(participants.length > 0, "No participants");
        require(!winnerSelected, "Winner already selected");
        
        raffleEnded = true;
        
        uint256 randomIndex = _generateRandomNumber() % participants.length;
        winner = participants[randomIndex];
        winnerSelected = true;
        
        uint256 prize = address(this).balance;
        
        emit WinnerSelected(winner, prize, raffleId);
    }
    
    function claimPrize() external nonReentrant {
        require(winnerSelected, "Winner not yet selected");
        require(msg.sender == winner, "You are not the winner");
        require(address(this).balance > 0, "Prize already claimed");
        
        uint256 prize = address(this).balance;
        winner = address(0);
        
        (bool success, ) = payable(msg.sender).call{value: prize}("");
        require(success, "Transfer failed");
        
        emit PrizeClaimed(msg.sender, prize, raffleId);
        
        raffleId++;
        
        for (uint256 i = 0; i < participants.length; i++) {
            ticketCount[participants[i]] = 0;
        }
        
        _startNewRaffle();
    }
    
    function _generateRandomNumber() private view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    participants.length,
                    participants
                )
            )
        );
    }
    
    function getRaffleInfo() external view returns (
        uint256 currentRaffleId,
        uint256 currentTicketPrice,
        uint256 currentMaxTickets,
        uint256 ticketsSold,
        uint256 prizePool,
        uint256 timeRemaining,
        bool isEnded,
        bool isWinnerSelected,
        address currentWinner
    ) {
        uint256 remaining = 0;
        if (block.timestamp < raffleEndTime) {
            remaining = raffleEndTime - block.timestamp;
        }
        
        return (
            raffleId,
            ticketPrice,
            maxTickets,
            participants.length,
            address(this).balance,
            remaining,
            raffleEnded,
            winnerSelected,
            winner
        );
    }
    
    function getParticipants() external view returns (address[] memory) {
        return participants;
    }
    
    function getMyTickets() external view returns (uint256) {
        return ticketCount[msg.sender];
    }
    
    function updateTicketPrice(uint256 _newPrice) external onlyOwner {
        require(participants.length == 0, "Cannot change during active raffle");
        require(_newPrice > 0, "Price must be greater than 0");
        ticketPrice = _newPrice;
    }
    
    function updateMaxTickets(uint256 _newMax) external onlyOwner {
        require(participants.length == 0, "Cannot change during active raffle");
        require(_newMax > 1, "Must allow at least 2 tickets");
        maxTickets = _newMax;
    }
    
    function updateRaffleDuration(uint256 _newDuration) external onlyOwner {
        require(participants.length == 0, "Cannot change during active raffle");
        require(_newDuration > 0, "Duration must be greater than 0");
        raffleDuration = _newDuration;
    }
}