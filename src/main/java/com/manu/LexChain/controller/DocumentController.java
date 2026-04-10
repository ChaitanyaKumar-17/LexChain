package com.manu.LexChain.controller;

import com.manu.LexChain.model.LexDocument;
import com.manu.LexChain.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService documentService;

    /**
     * GET /api/documents/pending
     * This perfectly matches the fetch request in your React admin.jsx!
     */
    @GetMapping("/pending")
    public ResponseEntity<List<LexDocument>> getPendingDocuments() {
        List<LexDocument> pendingDocs = documentService.getPendingDocuments();
        return ResponseEntity.ok(pendingDocs);
    }

    /**
     * POST /api/documents
     * React will call this to save document metadata to MongoDB AFTER
     * a successful MetaMask transaction.
     */
    @PostMapping
    public ResponseEntity<?> saveDocument(@RequestBody Map<String, String> payload) {
        try {
            String docHash = payload.get("docHash");
            String ipfsHash = payload.get("ipfsHash");
            String uploader = payload.get("uploaderAddress");

            LexDocument savedDoc = documentService.saveNewDocument(docHash, ipfsHash, uploader);
            return ResponseEntity.ok(savedDoc);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to save document metadata: " + e.getMessage());
        }
    }

    /**
     * PUT /api/documents/verify/{docHash}
     * React Admin calls this after successfully approving the document on-chain.
     */
    @PutMapping("/verify/{docHash}")
    public ResponseEntity<?> verifyDocument(@PathVariable String docHash) {
        documentService.markAsVerified(docHash);
        return ResponseEntity.ok().build();
    }
}
