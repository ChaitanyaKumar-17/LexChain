package com.manu.LexChain.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.*;
import org.springframework.stereotype.Service;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthLog;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BlockchainPollingService {
    private final Web3j web3j;
    private final DocumentService documentService;

    @Value("${blockchain.contract.address}")
    private String contractAddress;

    private BigInteger lastBlockChecked;

    private final Event documentUploadedEvent = new Event("DocumentUploaded", Arrays.asList(
            new TypeReference<Uint256>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Address>(false) {}
    ));

    private final Event documentVerifiedEvent = new Event("DocumentVerified", Arrays.asList(
            new TypeReference<Uint256>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Address>(false) {}
    ));

    // NEW: Define the DocumentSigned event matching your ABI
    private final Event documentSignedEvent = new Event("DocumentSigned", Arrays.asList(
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Address>(false) {}
    ));

    @PostConstruct
    public void init() {
        try {
            lastBlockChecked = web3j.ethBlockNumber().send().getBlockNumber();
            log.info("📌 Polling started from block: {}", lastBlockChecked);
        } catch (Exception e) {
            log.error("Failed to get initial block number", e);
        }
    }

    @Scheduled(fixedDelay = 5000)
    public void pollForEvents() {
        if (lastBlockChecked == null) return;

        try {
            BigInteger latestBlock = web3j.ethBlockNumber().send().getBlockNumber();
            if (latestBlock.compareTo(lastBlockChecked) <= 0) return;

            BigInteger startBlock = lastBlockChecked.add(BigInteger.ONE);

            // --- 1. Process Uploads ---
            EthFilter uploadFilter = new EthFilter(DefaultBlockParameter.valueOf(startBlock), DefaultBlockParameter.valueOf(latestBlock), contractAddress);
            uploadFilter.addSingleTopic(EventEncoder.encode(documentUploadedEvent));
            List<EthLog.LogResult> uploadLogs = web3j.ethGetLogs(uploadFilter).send().getLogs();

            for (EthLog.LogResult logResult : uploadLogs) {
                org.web3j.protocol.core.methods.response.Log ethLog = (org.web3j.protocol.core.methods.response.Log) logResult.get();
                List<Type> results = FunctionReturnDecoder.decode(ethLog.getData(), documentUploadedEvent.getNonIndexedParameters());

                String docHash = (String) results.get(1).getValue();
                String uploader = (String) results.get(2).getValue();
                log.info("\n🔥 New Document Detected! Hash: {}", docHash);

                try {
                    String ipfsHash = fetchIpfsHashFromContract(docHash);
                    // Required signers are now saved via REST API first, this acts as a fallback/sync.
                    // For safety, you might skip DB creation here if the REST API handles it,
                    // but keeping it ensures decentralized resilience.
                    documentService.saveNewDocument(docHash, ipfsHash, uploader, null);
                } catch (Exception e) {
                    log.error("Error saving DB: {}", e.getMessage());
                }
            }

            // --- 2. Process Signatures ---
            EthFilter signFilter = new EthFilter(DefaultBlockParameter.valueOf(startBlock), DefaultBlockParameter.valueOf(latestBlock), contractAddress);
            signFilter.addSingleTopic(EventEncoder.encode(documentSignedEvent));
            List<EthLog.LogResult> signLogs = web3j.ethGetLogs(signFilter).send().getLogs();

            for (EthLog.LogResult logResult : signLogs) {
                org.web3j.protocol.core.methods.response.Log ethLog = (org.web3j.protocol.core.methods.response.Log) logResult.get();
                List<Type> results = FunctionReturnDecoder.decode(ethLog.getData(), documentSignedEvent.getNonIndexedParameters());

                String docHash = (String) results.get(0).getValue();
                String signer = (String) results.get(1).getValue();
                log.info("\n✍️ Document Signed! Hash: {} by {}", docHash, signer);

                try {
                    documentService.addSignatureToDocument(docHash, signer);
                } catch (Exception e) {
                    log.error("Error updating signature in DB: {}", e.getMessage());
                }
            }

            // --- 3. Process Verifications ---
            EthFilter verifyFilter = new EthFilter(DefaultBlockParameter.valueOf(startBlock), DefaultBlockParameter.valueOf(latestBlock), contractAddress);
            verifyFilter.addSingleTopic(EventEncoder.encode(documentVerifiedEvent));
            List<EthLog.LogResult> verifyLogs = web3j.ethGetLogs(verifyFilter).send().getLogs();

            for (EthLog.LogResult logResult : verifyLogs) {
                org.web3j.protocol.core.methods.response.Log ethLog = (org.web3j.protocol.core.methods.response.Log) logResult.get();
                List<Type> results = FunctionReturnDecoder.decode(ethLog.getData(), documentVerifiedEvent.getNonIndexedParameters());

                String docHash = (String) results.get(1).getValue();
                log.info("\n✅ Document Verified by Admin! Hash: {}", docHash);

                try {
                    documentService.markAsVerified(docHash);
                } catch (Exception e) {
                    log.error("Error updating DB: {}", e.getMessage());
                }
            }

            lastBlockChecked = latestBlock;

        } catch (Exception e) {
            log.warn("⚠️ Network hiccup during polling (safe to ignore): {}", e.getMessage());
        }
    }

    private String fetchIpfsHashFromContract(String docHash) throws Exception {
        Function function = new Function("documents",
                Collections.singletonList(new Utf8String(docHash)),
                Arrays.asList(
                        new TypeReference<Uint256>() {},
                        new TypeReference<Utf8String>() {},
                        new TypeReference<Utf8String>() {},
                        new TypeReference<Address>() {},
                        new TypeReference<Address>() {},
                        new TypeReference<Uint256>() {},
                        new TypeReference<Bool>() {}
                ));

        String encodedFunction = FunctionEncoder.encode(function);
        org.web3j.protocol.core.methods.response.EthCall response = web3j.ethCall(
                Transaction.createEthCallTransaction(null, contractAddress, encodedFunction),
                DefaultBlockParameterName.LATEST).send();

        List<Type> decoded = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
        return (String) decoded.get(1).getValue();
    }
}