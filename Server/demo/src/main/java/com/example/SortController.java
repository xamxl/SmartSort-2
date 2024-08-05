package com.example;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ModelAttribute;


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

            // Start the sorting process
            progressWebSocketHandler.startSort(table, weights, groups, finalParams, counts);

        } catch (Exception e) {
            System.err.println("Error processing request data: " + e.getMessage());
            // Handle the error accordingly
        }
    }

    @CrossOrigin(origins = "http://localhost:8888")
    @PostMapping("/createAccount")
    public String handleFormCreateAccount(@ModelAttribute CreateAccountInput createAccountInput) {
            String checks = AccountServices.checkUsernameAndPasswordCA(createAccountInput.getEmail(), createAccountInput.getPassword(), createAccountInput.getConfirmPassword());
            if (! checks.equals("VALID"))
                return "{\"text\":\"" + checks + "\"}";
            AccountServices.createAccount(createAccountInput.getEmail(), createAccountInput.getPassword());
            return "{\"text\":\"" + "Account created." + "\"}";
    }

    @CrossOrigin(origins = "http://localhost:8888")
    @PostMapping("/login")
    public String handleFormLogin(@ModelAttribute LoginInput loginInput) {
            if (! AccountServices.checkUsernameAndPasswordL(loginInput.getEmail(), loginInput.getPassword()))
                return "{\"text\":\"INVALID\"}";
            return "{\"text\":\"" + AccountServices.login(loginInput.getEmail()) + "\"}";
    }

    @CrossOrigin(origins = "http://localhost:8888")
    @PostMapping("/verifyLogin")
    public String handelVerifyLogin(@ModelAttribute VerifyLoginInput verifyLoginInput) {
            if (! AccountServices.verifyLogin(verifyLoginInput.getEmail(), verifyLoginInput.getKey()))
                return "{\"text\":\"INVALID\"}";
            return "{\"text\":\"VALID\"}";
    }

    @CrossOrigin(origins = "http://localhost:8888")
    @PostMapping("/signout")
    public void handelSignout(@ModelAttribute SignoutInput signoutInput) {
            if (! AccountServices.verifyLogin(signoutInput.getEmail(), signoutInput.getKey()))
                return;
            AccountServices.signout(signoutInput.getEmail());
    }

    @CrossOrigin(origins = "http://localhost:8888")
    @PostMapping("/deleteAccount")
    public String handelDeleteAccount(@ModelAttribute DeleteAccountInput deleteAccountInput) {
            if (! AccountServices.verifyLogin(deleteAccountInput.getEmail(), deleteAccountInput.getKey()))
                return "{\"text\":\"INVALID\"}";
            AccountServices.deleteAccount(deleteAccountInput.getEmail());
            return "{\"text\":\"VALID\"}";
    }
}