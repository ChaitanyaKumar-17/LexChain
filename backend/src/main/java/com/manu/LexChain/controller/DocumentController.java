package com.manu.LexChain.controller;

import com.manu.LexChain.model.LexDocument;
import com.manu.LexChain.service.DocumentService;
import com.manu.LexChain.repository.DocumentRepository; // NEW IMPORT
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentRepository documentRepository; // NEW: Injected to check for duplicates

    @GetMapping("/pending")
    public ResponseEntity<List<LexDocument>> getPendingDocuments() {
        List<LexDocument> pendingDocs = documentService.getPendingDocuments();
        return ResponseEntity.ok(pendingDocs);
    }

    @PostMapping
    public ResponseEntity<?> saveDocument(@RequestBody Map<String, Object> payload) {
        try {
            String docHash = (String) payload.get("docHash");

            if (documentRepository.findByDocHash(docHash).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Document with this hash already exists off-chain.");
            }

            String ipfsHash = (String) payload.get("ipfsHash");
            String uploader = (String) payload.get("uploaderAddress");

            @SuppressWarnings("unchecked")
            List<String> requiredSigners = (List<String>) payload.get("requiredSigners");

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