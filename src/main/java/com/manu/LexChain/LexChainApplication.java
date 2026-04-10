package com.manu.LexChain;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class LexChainApplication {

	public static void main(String[] args) {
		SpringApplication.run(LexChainApplication.class, args);
	}

	// THIS Bypasses Spring Boot's config and FORCES the Atlas URI
	@Bean
	public MongoClient mongoClient(@Value("${spring.data.mongodb.uri}") String uri) {
		return MongoClients.create(uri);
	}

}
