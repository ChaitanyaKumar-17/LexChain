package com.manu.LexChain.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "whitelisted_creators")
public class CreatorWhitelist {
    @Id
    private String id;

    // The wallet address of the approved creator
    private String walletAddress;

    // The wallet address of the Governor who approved them
    private String approvedBy;

    private LocalDateTime approvedAt;
}
