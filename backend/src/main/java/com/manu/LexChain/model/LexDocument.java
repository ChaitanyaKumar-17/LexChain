package com.manu.LexChain.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "documents")
public class LexDocument {

    @Id
    private String id;

    private String docHash; // The local SHA-256 hash
    private String ipfsHash; // The Pinata CID

    private String uploaderAddress; // The Creator who uploaded it

    private String status; // e.g., "PENDING_SIGNATURES", "FULLY_EXECUTED"

    private LocalDateTime timestamp;

    private List<String> requiredSigners = new ArrayList<>();
    private List<String> actualSigners = new ArrayList<>();
    private int signatureCount = 0;
}
