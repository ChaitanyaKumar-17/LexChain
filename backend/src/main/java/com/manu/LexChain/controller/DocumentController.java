package com.manu.LexChain.controller;

import com.manu.LexChain.model.LexDocument;
import com.manu.LexChain.service.DocumentService;
import com.manu.LexChain.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentRepository documentRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<LexDocument>> getPendingDocuments() {
        List<LexDocument> pendingDocs = documentService.getPendingDocuments();
        return ResponseEntity.ok(pendingDocs);
    }

    @PostMapping
    public ResponseEntity<?> saveDocument(@RequestBody Map<String, Object> payload) {
        try {
            String docHash = (String) payload.get("docHash");
            String ipfsHash = (String) payload.get("ipfsHash");
            String uploader = (String) payload.get("uploaderAddress");

            @SuppressWarnings("unchecked")
            List<String> requiredSigners = (List<String>) payload.get("requiredSigners");

            Optional<LexDocument> existingDocOpt = documentRepository.findByDocHash(docHash);

            if (existingDocOpt.isPresent()) {

                LexDocument existingDoc = existingDocOpt.get();
                existingDoc.setIpfsHash(ipfsHash);
                existingDoc.setRequiredSigners(requiredSigners);

                if (!"PENDING_SIGNATURES".equals(existingDoc.getStatus())) {
                    existingDoc.setStatus("PENDING_SIGNATURES");
                }

                LexDocument savedDoc = documentRepository.save(existingDoc);
                return ResponseEntity.ok(savedDoc);
            }

            LexDocument savedDoc = documentService.saveNewDocument(docHash, ipfsHash, uploader, requiredSigners);
            return ResponseEntity.ok(savedDoc);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to save document metadata: " + e.getMessage());
        }
    }

    @PutMapping("/verify/{docHash}")
    public ResponseEntity<?> verifyDocument(@PathVariable String docHash) {
        documentService.markAsVerified(docHash);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/signatory/{walletAddress}")
    public ResponseEntity<List<LexDocument>> getMyPendingDocs(@PathVariable String walletAddress) {
        List<LexDocument> myDocs = documentService.getPendingSignaturesForUser(walletAddress);
        return ResponseEntity.ok(myDocs);
    }
}