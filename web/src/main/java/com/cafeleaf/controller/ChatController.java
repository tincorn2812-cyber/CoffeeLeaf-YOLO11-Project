package com.cafeleaf.controller;

import com.cafeleaf.service.AiChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final AiChatbotService chatbotService;

    public ChatController(AiChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/ask")
    public ResponseEntity<?> ask(@RequestBody Map<String, Object> body) {
        try {
            Object userIdObj = body.get("userId");
            if (userIdObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu userId"));
            }
            Long userId = Long.valueOf(String.valueOf(userIdObj));
            String q = body.get("q") != null ? String.valueOf(body.get("q")) : "";
            return ResponseEntity.ok(chatbotService.askAssistant(userId, q));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}