package com.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;


@RestController
@CrossOrigin(origins = "http://localhost:8888")
public class SortController {

    @Autowired
    private ProgressWebSocketHandler progressWebSocketHandler;

    @GetMapping("/start-sort")
    public void startSort() {
        progressWebSocketHandler.startSort();
    }
}