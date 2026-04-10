package com.manu.LexChain.service;

import com.manu.LexChain.model.LexDocument;
import com.manu.LexChain.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;

    // Fetch only documents waiting for the Admin's approval
    public List<LexDocument> getPendingDocuments() {
        return documentRepository.findByStatus("PENDING_SIGNATURES");
    }

    // Save a newly uploaded document from the React frontend
    public LexDocument saveNewDocument(String docHash, String ipfsHash, String uploaderAddress) {
        LexDocument newDoc = new LexDocument();
        newDoc.setDocHash(docHash);
        newDoc.setIpfsHash(ipfsHash);
        newDoc.setUploaderAddress(uploaderAddress);
        newDoc.setStatus("PENDING_SIGNATURES");
        newDoc.setTimestamp(LocalDateTime.now());

        return documentRepository.save(newDoc);
    }

    // Update a document to verified once the Admin signs it on-chain
    public void markAsVerified(String docHash) {
        documentRepository.findByDocHash(docHash).ifPresent(doc -> {
            doc.setStatus("FULLY_EXECUTED");
            documentRepository.save(doc);
        });
    }
}
