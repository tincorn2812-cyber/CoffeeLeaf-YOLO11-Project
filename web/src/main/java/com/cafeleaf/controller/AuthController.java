package com.cafeleaf.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cafeleaf.entity.User;
import com.cafeleaf.service.AuthService;
import com.cafeleaf.service.FarmManagementService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final FarmManagementService farmService;

    public AuthController(AuthService authService, FarmManagementService farmService) {
        this.authService = authService;
        this.farmService = farmService;
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(String action, String rawMsg) {
        String field = "general";
        String msg = rawMsg != null ? rawMsg : "Dữ liệu không hợp lệ.";
        if (msg.contains("|")) {
            int idx = msg.indexOf('|');
            field = msg.substring(0, idx);
            msg = msg.substring(idx + 1);
        }
        System.err.println("[AUTH " + action + " ERROR] field=" + field + " | message=" + msg);
        Map<String, Object> err = new java.util.LinkedHashMap<>();
        err.put("status", "ERROR");
        err.put("code", 400);
        err.put("field", field);
        err.put("message", msg);
        err.put("error", msg);
        err.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.badRequest().body(err);
    }

    @GetMapping("/accounts")
    public ResponseEntity<?> listAccounts() {
        return ResponseEntity.ok(authService.listQuickAccounts());
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkAvailability(@RequestParam(value = "un", required = false) String un,
                                            @RequestParam(value = "email", required = false) String email) {
        Map<String, Object> res = authService.checkAvailability(un, email);
        res.put("status", "OK");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String secret = body.getOrDefault("authHash", body.get("pw"));
            User u = authService.login(body.get("id"), secret);
            System.out.println("[AUTH LOGIN SUCCESS] userId=" + u.getId() + ", username=" + u.getUsername());
            Map<String, Object> payload = new java.util.LinkedHashMap<>(farmService.buildBootstrapPayload(u.getId()));
            payload.put("status", "SUCCESS");
            payload.put("message", "Đăng nhập thành công!");
            return ResponseEntity.ok(payload);
        } catch (IllegalArgumentException e) {
            return buildErrorResponse("LOGIN", e.getMessage());
        } catch (Exception e) {
            return buildErrorResponse("LOGIN", "general|Lỗi xử lý đăng nhập: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            String secret = body.getOrDefault("authHash", body.get("pw"));
            User u = authService.register(
                body.get("un"),
                body.get("email"),
                secret,
                body.get("name"),
                body.get("phone"),
                body.get("prov")
            );
            System.out.println("[AUTH REGISTER SUCCESS] userId=" + u.getId() + ", username=" + u.getUsername() + ", email=" + u.getEmail());
            Map<String, Object> payload = new java.util.LinkedHashMap<>(farmService.buildBootstrapPayload(u.getId()));
            payload.put("status", "SUCCESS");
            payload.put("message", "Đăng ký tài khoản thành công!");
            return ResponseEntity.ok(payload);
        } catch (IllegalArgumentException e) {
            return buildErrorResponse("REGISTER", e.getMessage());
        } catch (Exception e) {
            return buildErrorResponse("REGISTER", "general|Không thể tạo tài khoản: " + e.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> body) {
        try {
            Object userIdObj = body.get("userId");
            if (userIdObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu userId"));
            }
            Long userId = Long.valueOf(String.valueOf(userIdObj));
            User u = authService.updateProfile(
                userId,
                (String) body.get("name"),
                (String) body.get("un"),
                (String) body.get("phone"),
                (String) body.get("prov"),
                (String) body.get("ph")
            );
            return ResponseEntity.ok(farmService.buildBootstrapPayload(u.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, Object> body) {
        try {
            Object userIdObj = body.get("userId");
            if (userIdObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu userId"));
            }
            Long userId = Long.valueOf(String.valueOf(userIdObj));
            authService.changePassword(
                userId,
                (String) body.get("oldPw"),
                (String) body.get("newPw")
            );
            return ResponseEntity.ok(Map.of("message", "Đã đổi mật khẩu thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}