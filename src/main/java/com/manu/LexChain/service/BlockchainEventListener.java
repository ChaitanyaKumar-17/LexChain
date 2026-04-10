package com.manu.LexChain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.*;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.request.Transaction;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BlockchainEventListener {
    private final Web3j web3j;
    private final DocumentService documentService;

    @Value("${blockchain.contract.address}")
    private String contractAddress;

    /**
     * This method automatically fires up as soon as your Spring Boot app finishes booting.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void startListening() {
        log.info("Starting Web3 Event Listener on contract: {}", contractAddress);

        // 1. Define the exact signature of your DocumentUploaded event
        Event documentUploadedEvent = new Event("DocumentUploaded",
                Arrays.asList(
                        new TypeReference<Uint256>(false) {},    // id
                        new TypeReference<Utf8String>(false) {}, // docHash
                        new TypeReference<Address>(false) {}     // uploader
                )
        );

        // 2. Generate the cryptographic topic hash of the event
        String eventTopic = EventEncoder.encode(documentUploadedEvent);

        // 3. Create a filter to only listen to this specific contract and topic
        EthFilter filter = new EthFilter(
                DefaultBlockParameterName.LATEST,
                DefaultBlockParameterName.LATEST,
                contractAddress
        );
        filter.addSingleTopic(eventTopic);

        // 4. Subscribe to the live blockchain stream
        web3j.ethLogFlowable(filter).subscribe(
                logData -> {
                    // Decode the raw hexadecimal log data into Java objects
                    List<Type> results = FunctionReturnDecoder.decode(
                            logData.getData(), documentUploadedEvent.getNonIndexedParameters());

                    String docHash = (String) results.get(1).getValue();
                    String uploaderAddress = (String) results.get(2).getValue();

                    log.info("Caught DocumentUploaded event for hash: {}", docHash);

                    // Fetch the missing IPFS hash directly from the contract state
                    String ipfsHash = fetchIpfsHashFromContract(docHash);

                    // Save to MongoDB
                    documentService.saveNewDocument(docHash, ipfsHash, uploaderAddress);
                    log.info("Successfully indexed document to MongoDB.");
                },
                error -> log.error("Error in blockchain listener: ", error)
        );
    }

    /**
     * Helper method to read the 'documents' mapping from your smart contract.
     */
    private String fetchIpfsHashFromContract(String docHash) throws Exception {
        // Define the read function: documents(string)
        Function function = new Function("documents",
                Collections.singletonList(new Utf8String(docHash)),
                Arrays.asList(
                        new TypeReference<Uint256>() {},   // id
                        new TypeReference<Utf8String>() {},// ipfsHash (This is what we want!)
                        new TypeReference<Utf8String>() {},// docHash
                        new TypeReference<Address>() {},   // uploader
                        new TypeReference<Address>() {},   // verifier
                        new TypeReference<Uint256>() {},   // timestamp
                        new TypeReference<Bool>() {}       // isVerified
                ));

        String encodedFunction = FunctionEncoder.encode(function);

        // Execute the read-only call (costs 0 gas)
        org.web3j.protocol.core.methods.response.EthCall response = web3j.ethCall(
                        Transaction.createEthCallTransaction(null, contractAddress, encodedFunction),
                        DefaultBlockParameterName.LATEST)
                .send();

        // Decode the returned data and grab the second item (index 1), which is the ipfsHash
        List<Type> decoded = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
        return (String) decoded.get(1).getValue();
    }
}
