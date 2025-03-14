// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Donation {
    struct Organization {
        string name;
        address payable wallet;
        uint256 totalDonations;
    }

    struct FundTransfer {
        uint256 orgId;
        uint256 amount;
        uint256 timestamp;
    }

    struct EmergencyWithdrawRecord {
        uint256 orgId;
        uint256 amount;
        uint256 timestamp;
    }

    struct Donator {
        uint256 totalAmount;
        bool exists;
    }

    address public manager;
    uint256 public minimumContribution = 0.01 ether;
    mapping(address => Donator) public donators;
    mapping(uint256 => Organization) public organizations;
    uint256 public donatorsCount;
    uint256 public orgCount;
    uint256 public deadline;
    bool public isDonationClosed;

    FundTransfer[] public fundTransfers;
    EmergencyWithdrawRecord[] public emergencyWithdrawals;
    address[] public donatorList;

    modifier beforeDeadline() {
        require(block.timestamp < deadline, "Donation period has ended");
        _;
    }

    modifier onlyOrganization(uint256 orgId) {
        require(msg.sender == organizations[orgId].wallet, "Only the organization can withdraw");
        _;
    }

    event ContributionMade(address indexed donator, uint256 amount, uint256 orgId);
    event DonatorUpdated(address indexed donator, uint256 totalAmount);
    event OrganizationAdded(uint256 indexed orgId, string name, address wallet);
    event FundsTransferred(uint256 indexed orgId, uint256 amount);
    event EmergencyWithdrawal(uint256 indexed orgId, uint256 amount);
    event RefundIssued(address indexed donator, uint256 amount);

    constructor(uint256 _duration) {
        manager = msg.sender;
        deadline = block.timestamp + _duration;
    }

    function addOrganization(string memory _name, address payable _wallet) public {
        require(msg.sender == manager, "Only manager can add organizations");
        organizations[orgCount] = Organization(_name, _wallet, 0);
        orgCount++;
        emit OrganizationAdded(orgCount - 1, _name, _wallet);
    }

    function contribute(uint256 orgId) public payable beforeDeadline {
        require(msg.value >= minimumContribution, "Contribution below minimum amount");
        require(orgId < orgCount, "Invalid organization ID");

        organizations[orgId].totalDonations += msg.value;

        if (!donators[msg.sender].exists) {
            donators[msg.sender] = Donator(msg.value, true);
            donatorList.push(msg.sender);
            donatorsCount++;
        } else {
            donators[msg.sender].totalAmount += msg.value;
        }

        emit ContributionMade(msg.sender, msg.value, orgId);
        emit DonatorUpdated(msg.sender, donators[msg.sender].totalAmount);
    }

    function transferFunds() public {
        require(block.timestamp >= deadline, "Donation period is not over yet");
        require(!isDonationClosed, "Funds already transferred");

        for (uint256 i = 0; i < orgCount; i++) {
            uint256 amount = organizations[i].totalDonations;
            if (amount > 0) {
                organizations[i].wallet.transfer(amount);
                fundTransfers.push(FundTransfer(i, amount, block.timestamp));
                emit FundsTransferred(i, amount);
            }
        }

        isDonationClosed = true;
    }

    function emergencyWithdraw(uint256 orgId, uint256 amount) public onlyOrganization(orgId) {
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= organizations[orgId].totalDonations, "Not enough funds available");

        organizations[orgId].totalDonations -= amount;
        organizations[orgId].wallet.transfer(amount);
        emergencyWithdrawals.push(EmergencyWithdrawRecord(orgId, amount, block.timestamp));

        emit EmergencyWithdrawal(orgId, amount);
    }

    function refundDonation() public {
        require(!isDonationClosed, "Donations already transferred, refund not possible");
        require(donators[msg.sender].exists, "You have not made any donations");
        require(donators[msg.sender].totalAmount > 0, "No funds available for refund");

        uint256 refundAmount = donators[msg.sender].totalAmount;
        donators[msg.sender].totalAmount = 0;
        payable(msg.sender).transfer(refundAmount);

        emit RefundIssued(msg.sender, refundAmount);
    }

    function getFundTransfers() public view returns (FundTransfer[] memory) {
        return fundTransfers;
    }

    function getEmergencyWithdrawals() public view returns (EmergencyWithdrawRecord[] memory) {
        return emergencyWithdrawals;
    }

    function getDonators() public view returns (address[] memory) {
        return donatorList;
    }

    function getDonatorInfo(address _donator) public view returns (uint256 totalAmount) {
        require(donators[_donator].exists, "Donator not found");
        return donators[_donator].totalAmount;
    }
}
