// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Consultation {
    enum Status { Pending, Active, Completed, Disputed, Cancelled }
    
    struct ConsultationData {
        uint256 id;
        address payable seeker;
        address payable consultant;
        uint256 amount;
        Status status;
        uint256 createdAt;
        uint256 completedAt;
        bool seekerApproved;
        bool consultantApproved;
        string metadataHash; // IPFS hash or database reference
    }
    
    mapping(uint256 => ConsultationData) public consultations;
    uint256 public nextConsultationId = 1;
    
    // Events
    event ConsultationInitiated(uint256 indexed consultationId, address indexed seeker, address indexed consultant, uint256 amount);
    event ConsultationCompleted(uint256 indexed consultationId);
    event ConsultationDisputed(uint256 indexed consultationId);
    event ConsultationCancelled(uint256 indexed consultationId);
    event PaymentReleased(uint256 indexed consultationId, address indexed consultant, uint256 amount);
    event RefundIssued(uint256 indexed consultationId, address indexed seeker, uint256 amount);
    
    // Modifiers
    modifier onlySeeker(uint256 consultationId) {
        require(consultations[consultationId].seeker == msg.sender, "Only seeker can call this");
        _;
    }
    
    modifier onlyConsultant(uint256 consultationId) {
        require(consultations[consultationId].consultant == msg.sender, "Only consultant can call this");
        _;
    }
    
    modifier onlyParticipant(uint256 consultationId) {
        require(
            consultations[consultationId].seeker == msg.sender || 
            consultations[consultationId].consultant == msg.sender,
            "Only consultation participants can call this"
        );
        _;
    }
    
    modifier validConsultation(uint256 consultationId) {
        require(consultationId > 0 && consultationId < nextConsultationId, "Invalid consultation ID");
        _;
    }
    
    // Initiate a consultation with payment
    function initiateConsultation(
        address payable _consultant,
        string memory _metadataHash
    ) external payable returns (uint256) {
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(_consultant != address(0), "Invalid consultant address");
        require(_consultant != msg.sender, "Cannot consult with yourself");
        
        uint256 consultationId = nextConsultationId++;
        
        consultations[consultationId] = ConsultationData({
            id: consultationId,
            seeker: payable(msg.sender),
            consultant: _consultant,
            amount: msg.value,
            status: Status.Pending,
            createdAt: block.timestamp,
            completedAt: 0,
            seekerApproved: false,
            consultantApproved: false,
            metadataHash: _metadataHash
        });
        
        emit ConsultationInitiated(consultationId, msg.sender, _consultant, msg.value);
        return consultationId;
    }
    
    // Consultant accepts the consultation
    function acceptConsultation(uint256 consultationId) 
        external 
        validConsultation(consultationId)
        onlyConsultant(consultationId) 
    {
        require(consultations[consultationId].status == Status.Pending, "Consultation not in pending status");
        
        consultations[consultationId].status = Status.Active;
    }
    
    // Mark consultation as completed (requires both parties to approve)
    function approveCompletion(uint256 consultationId) 
        external 
        validConsultation(consultationId)
        onlyParticipant(consultationId) 
    {
        require(consultations[consultationId].status == Status.Active, "Consultation not active");
        
        if (msg.sender == consultations[consultationId].seeker) {
            consultations[consultationId].seekerApproved = true;
        } else {
            consultations[consultationId].consultantApproved = true;
        }
        
        // If both parties approved, complete the consultation and release payment
        if (consultations[consultationId].seekerApproved && consultations[consultationId].consultantApproved) {
            _completeConsultation(consultationId);
        }
    }
    
    // Internal function to complete consultation and release payment
    function _completeConsultation(uint256 consultationId) internal {
        consultations[consultationId].status = Status.Completed;
        consultations[consultationId].completedAt = block.timestamp;
        
        uint256 amount = consultations[consultationId].amount;
        address payable consultant = consultations[consultationId].consultant;
        
        // Transfer payment to consultant
        consultant.transfer(amount);
        
        emit ConsultationCompleted(consultationId);
        emit PaymentReleased(consultationId, consultant, amount);
    }
    
    // Dispute a consultation
    function disputeConsultation(uint256 consultationId) 
        external 
        validConsultation(consultationId)
        onlyParticipant(consultationId) 
    {
        require(
            consultations[consultationId].status == Status.Active || 
            consultations[consultationId].status == Status.Pending,
            "Cannot dispute completed or cancelled consultation"
        );
        
        consultations[consultationId].status = Status.Disputed;
        emit ConsultationDisputed(consultationId);
    }
    
    // Cancel consultation (only if pending and by seeker)
    function cancelConsultation(uint256 consultationId) 
        external 
        validConsultation(consultationId)
        onlySeeker(consultationId) 
    {
        require(consultations[consultationId].status == Status.Pending, "Can only cancel pending consultations");
        
        consultations[consultationId].status = Status.Cancelled;
        
        // Refund the seeker
        uint256 amount = consultations[consultationId].amount;
        consultations[consultationId].seeker.transfer(amount);
        
        emit ConsultationCancelled(consultationId);
        emit RefundIssued(consultationId, consultations[consultationId].seeker, amount);
    }
    
    // Emergency refund function (for disputed consultations - simplified dispute resolution)
    function emergencyRefund(uint256 consultationId) 
        external 
        validConsultation(consultationId)
        onlySeeker(consultationId) 
    {
        require(consultations[consultationId].status == Status.Disputed, "Consultation must be disputed");
        require(
            block.timestamp > consultations[consultationId].createdAt + 7 days,
            "Must wait 7 days after dispute to claim refund"
        );
        
        consultations[consultationId].status = Status.Cancelled;
        
        // Refund the seeker
        uint256 amount = consultations[consultationId].amount;
        consultations[consultationId].seeker.transfer(amount);
        
        emit RefundIssued(consultationId, consultations[consultationId].seeker, amount);
    }
    
    // Get consultation details
    function getConsultation(uint256 consultationId) 
        external 
        view 
        validConsultation(consultationId)
        returns (ConsultationData memory) 
    {
        return consultations[consultationId];
    }
    
    // Get consultation status
    function getConsultationStatus(uint256 consultationId) 
        external 
        view 
        validConsultation(consultationId)
        returns (Status) 
    {
        return consultations[consultationId].status;
    }
    
    // Get consultations for a user (seeker or consultant)
    function getUserConsultations(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory userConsultations = new uint256[](nextConsultationId - 1);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextConsultationId; i++) {
            if (consultations[i].seeker == user || consultations[i].consultant == user) {
                userConsultations[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userConsultations[i];
        }
        
        return result;
    }
    
    // Get contract balance (for debugging)
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}