// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LexChain {
    uint256 public docCount;
    address public admin;

    struct Document {
        uint256 id;
        string ipfsHash;
        string docHash;
        address uploader;
        address verifier;
        uint256 timestamp;
        bool isVerified;
    }

    mapping(string => Document) public documents;

    event DocumentUploaded(uint256 id, string docHash, address uploader);
    event DocumentVerified(uint256 id, string docHash, address verifier);

    constructor() {
        admin = msg.sender; // The wallet that deploys this becomes the admin
    }

    function uploadDocument(string memory _ipfsHash, string memory _docHash) public {
        require(documents[_docHash].timestamp == 0, "Document already exists");
        docCount++;
        documents[_docHash] = Document(docCount, _ipfsHash, _docHash, msg.sender, address(0), block.timestamp, false);
        emit DocumentUploaded(docCount, _docHash, msg.sender);
    }

    function verifyDocument(string memory _docHash) public {
        require(documents[_docHash].timestamp != 0, "Document does not exist");
        require(!documents[_docHash].isVerified, "Already verified");
        
        documents[_docHash].isVerified = true;
        documents[_docHash].verifier = msg.sender;
        emit DocumentVerified(documents[_docHash].id, _docHash, msg.sender);
    }

    function verify(string memory _docHash) public view returns (bool, string memory, uint256) {
        Document memory doc = documents[_docHash];
        return (doc.isVerified, doc.ipfsHash, doc.timestamp);
    }
}