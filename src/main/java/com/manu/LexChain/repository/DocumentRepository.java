package com.manu.LexChain.repository;

import com.manu.LexChain.model.LexDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends MongoRepository<LexDocument, String> {
    // Spring magically implements these based on the method names!
    Optional<LexDocument> findByDocHash(String docHash);
    List<LexDocument> findByStatus(String status);
}
