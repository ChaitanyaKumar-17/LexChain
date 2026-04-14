package com.manu.LexChain.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

@Configuration
public class Web3Config {
    @Value("${blockchain.polygon.amoy.rpc-url}")
    private String rpcUrl;

    @Bean
    public Web3j web3j() {
        // Initialize the Web3j connection to the Polygon Amoy Testnet
        return Web3j.build(new HttpService(rpcUrl));
    }
}
