package com.example;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class ProgressWebSocketHandler extends TextWebSocketHandler {

    private final AtomicInteger progress = new AtomicInteger(0);
    private WebSocketSession session;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        this.session = session;
        System.out.println("WebSocket connection established: " + session.getId());
    }

    public void sendProgressUpdate() throws IOException {
        if (this.session != null && this.session.isOpen()) {
            String message = String.valueOf(progress.get());
            this.session.sendMessage(new TextMessage(message));
        }
    }

    // Simulate the sorting process and send updates
    public void startSort() {
        new Thread(() -> {
            try {
                for (int i = 0; i <= 100; i++) {
                    progress.set(i);
                    sendProgressUpdate();
                    Thread.sleep(100); // Simulate work
                }
            } catch (InterruptedException | IOException e) {
                Thread.currentThread().interrupt();
                System.err.println("Error during sorting process: " + e.getMessage());
            }
        }).start();
    }
}
