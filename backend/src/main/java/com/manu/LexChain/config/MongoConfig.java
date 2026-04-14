package com.manu.LexChain.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {
    // Pulls just the connection string from your application.yml
    @Value("${spring.data.mongodb.uri}")
    private String uri;

    @Override
    protected @NonNull String getDatabaseName() {
        return "lexchain_db";
    }

    @Override
    public @NonNull MongoClient mongoClient() {
        return MongoClients.create(uri);
    }
}
