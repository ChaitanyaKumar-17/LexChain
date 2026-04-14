package com.manu.LexChain.repository;

import com.manu.LexChain.model.CreatorWhitelist;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WhitelistRepository extends MongoRepository<CreatorWhitelist, String> {
    boolean existsByWalletAddressIgnoreCase(String walletAddress);
}
