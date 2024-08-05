package com.example;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;


@RestController
@CrossOrigin(origins = "http://localhost:8888")
public class SortController {

    @Autowired
    private ProgressWebSocketHandler progressWebSocketHandler;

    @PostMapping("/start-sort")
    public void startSort(@RequestBody Map<String, Object> requestData) {
        try {
            // Extract data from the request body
            List<Map<String, Object>> table = (List<Map<String, Object>>) requestData.get("table");
            List<Map<String, Object>> weights = (List<Map<String, Object>>) requestData.get("weights");
            List<Map<String, Object>> groups = (List<Map<String, Object>>) requestData.get("groups");
            List<Map<String, Object>> finalParams = (List<Map<String, Object>>) requestData.get("finalParams");
            List<Map<String, Object>> counts = (List<Map<String, Object>>) requestData.get("counts");

            // Log the received data for debugging
            System.out.println("Received table: " + table);
            System.out.println("Received weights: " + weights);
            System.out.println("Received groups: " + groups);
            System.out.println("Received finalParams: " + finalParams);
            System.out.println("Received counts: " + counts);

            // Process the data as needed (parsing, validation, etc.)

            // Start the sorting process
            progressWebSocketHandler.startSort();

        } catch (Exception e) {
            System.err.println("Error processing request data: " + e.getMessage());
            // Handle the error accordingly
        }
    }
}