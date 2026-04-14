package com.manu.LexChain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "documents")
public class LexDocument {

    @Id
    private String id;

    private String docHash; // The local SHA-256 hash
    private String ipfsHash; // The Pinata CID

    private String uploaderAddress; // The Creator who uploaded it

    private String status; // e.g., "PENDING_SIGNATURES", "FULLY_EXECUTED"

    private LocalDateTime timestamp;

    @Builder.Default
    private List<String> requiredSigners = new ArrayList<>();

    @Builder.Default
    private List<String> actualSigners = new ArrayList<>();

    @Builder.Default
    private int signatureCount = 0;

    public void addSignature(String signerAddress) {
        if (!this.actualSigners.contains(signerAddress)) {
            this.actualSigners.add(signerAddress);
            this.signatureCount++;
        }
    }
}