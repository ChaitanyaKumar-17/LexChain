package com.manu.LexChain.service;

import com.manu.LexChain.model.LexDocument;
import com.manu.LexChain.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;

    public List<LexDocument> getPendingDocuments() {
        // Adjust this method name to whatever is in your DocumentRepository
        // e.g., return documentRepository.findByStatus("PENDING_SIGNATURES");
        return documentRepository.findAll();
    }

    public LexDocument saveNewDocument(String docHash, String ipfsHash, String uploaderAddress, List<String> requiredSigners) {
        LexDocument doc = LexDocument.builder()
                .docHash(docHash)
                .ipfsHash(ipfsHash)
                .uploaderAddress(uploaderAddress)
                .timestamp(LocalDateTime.now())
                .status("PENDING_SIGNATURES")
                .requiredSigners(requiredSigners != null ? requiredSigners : new ArrayList<>())
                .build();

        if (requiredSigners != null) {
            doc.setRequiredSigners(requiredSigners);
        }

        return documentRepository.save(doc);
    }

    public void markAsVerified(String docHash) {
        documentRepository.findByDocHash(docHash).ifPresent(doc -> {
            doc.setStatus("FULLY_EXECUTED");
            documentRepository.save(doc);
        });
    }

    // NEW: Handles incoming signature events from Web3
    public void addSignatureToDocument(String docHash, String signerAddress) {
        documentRepository.findByDocHash(docHash).ifPresent(doc -> {
            doc.addSignature(signerAddress);
            documentRepository.save(doc);
        });
    }
}