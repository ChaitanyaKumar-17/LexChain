// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LexChain {
    uint256 public docCount;
    
    mapping(address => bool) public isGovernor;
    mapping(address => bool) public isLawyer; // NEW: Track authorized uploaders

    struct Document {
        uint256 id;
        string ipfsHash;
        string docHash;
        address uploader;
        address verifier;
        uint256 timestamp;
        bool isVerified;
        address[] requiredSigners; 
        uint256 signatureCount;    
    }

    mapping(string => Document) public documents;
    mapping(string => mapping(address => bool)) public isRequiredSigner;
    mapping(string => mapping(address => bool)) public hasSigned;

    // Events for tracking role changes
    event DocumentUploaded(uint256 id, string docHash, address uploader);
    event DocumentVerified(uint256 id, string docHash, address verifier);
    event DocumentSigned(string docHash, address signer); 
    
    event GovernorAdded(address indexed account);
    event GovernorRemoved(address indexed account);
    event LawyerAdded(address indexed account);
    event LawyerRemoved(address indexed account);

    modifier onlyGovernor() {
        require(isGovernor[msg.sender], "Unauthorized: Governors only");
        _;
    }

    // NEW: Restricts functions to authorized Lawyers only
    modifier onlyLawyer() {
        require(isLawyer[msg.sender], "Unauthorized: Authorized Lawyers only");
        _;
    }

    constructor() {
        // The deployer becomes the supreme Governor
        isGovernor[msg.sender] = true; 
        // For testing ease, let's also make the deployer a Lawyer initially
        isLawyer[msg.sender] = true;
    }

    function addGovernor(address _account) public onlyGovernor {
        require(!isGovernor[_account], "Account is already a Governor");
        isGovernor[_account] = true;
        emit GovernorAdded(_account);
    }

    function removeGovernor(address _account) public onlyGovernor {
        require(isGovernor[_account], "Account is not a Governor");
        require(msg.sender != _account, "Safety Check: You cannot remove yourself");
        isGovernor[_account] = false;
        emit GovernorRemoved(_account);
    }

    function addLawyer(address _account) public onlyGovernor {
        require(!isLawyer[_account], "Account is already a Lawyer");
        isLawyer[_account] = true;
        emit LawyerAdded(_account);
    }

    function removeLawyer(address _account) public onlyGovernor {
        require(isLawyer[_account], "Account is not a Lawyer");
        isLawyer[_account] = false;
        emit LawyerRemoved(_account);
    }

    function uploadDocument(string memory _ipfsHash, string memory _docHash, address[] memory _signers) public onlyLawyer {
        require(documents[_docHash].timestamp == 0, "Document already exists");
        
        docCount++;
        documents[_docHash] = Document(docCount, _ipfsHash, _docHash, msg.sender, address(0), block.timestamp, false, _signers, 0);

        for (uint i = 0; i < _signers.length; i++) {
            isRequiredSigner[_docHash][_signers[i]] = true;
        }

        emit DocumentUploaded(docCount, _docHash, msg.sender);
    }

    // Open for Buyers/Sellers to sign
    function signDocument(string memory _docHash) public {
        require(documents[_docHash].timestamp != 0, "Document does not exist");
        require(!documents[_docHash].isVerified, "Document is already finalized");
        require(isRequiredSigner[_docHash][msg.sender], "Unauthorized: You are not a required signer");
        require(!hasSigned[_docHash][msg.sender], "You have already signed this document");

        hasSigned[_docHash][msg.sender] = true;
        documents[_docHash].signatureCount++;

        emit DocumentSigned(_docHash, msg.sender);
    }

    // Only Governors can execute the final verification
    function verifyDocument(string memory _docHash) public onlyGovernor {
        require(documents[_docHash].timestamp != 0, "Document does not exist");
        require(!documents[_docHash].isVerified, "Already verified");
        require(
            documents[_docHash].signatureCount == documents[_docHash].requiredSigners.length, 
            "Pending Signatures: Cannot verify until all parties have signed"
        );
        
        documents[_docHash].isVerified = true;
        documents[_docHash].verifier = msg.sender;
        emit DocumentVerified(documents[_docHash].id, _docHash, msg.sender);
    }

    // Open Read Function
    function verify(string memory _docHash) public view returns (bool, string memory, uint256, uint256, uint256) {
        Document memory doc = documents[_docHash];
        return (doc.isVerified, doc.ipfsHash, doc.timestamp, doc.signatureCount, doc.requiredSigners.length);
    }
}