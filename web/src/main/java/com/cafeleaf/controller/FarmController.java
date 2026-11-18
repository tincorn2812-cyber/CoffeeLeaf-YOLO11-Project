package com.cafeleaf.controller;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cafeleaf.entity.JournalEntry;
import com.cafeleaf.entity.YieldRecord;
import com.cafeleaf.service.FarmManagementService;

@RestController
@RequestMapping("/api/farm")
public class FarmController {

    private final FarmManagementService farmService;

    public FarmController(FarmManagementService farmService) {
        this.farmService = farmService;
    }

    private static Long extractLong(Map<String, Object> body, String key) {
        Object v = body.get(key);
        if (v == null) throw new IllegalArgumentException("Thiếu trường bắt buộc: " + key);
        return Long.valueOf(String.valueOf(v));
    }

    @GetMapping("/bootstrap/{userId}")
    public ResponseEntity<?> bootstrap(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(farmService.buildBootstrapPayload(userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/state")
    public ResponseEntity<?> updateState(@RequestBody Map<String, Object> body) {
        Long userId = extractLong(body, "userId");
        String cd = (String) body.get("cd");
        Integer lot = body.get("lot") != null ? Integer.valueOf(String.valueOf(body.get("lot"))) : null;
        farmService.updateStatePreference(userId, cd, lot);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/treatment/toggle")
    public ResponseEntity<?> toggleStep(@RequestBody Map<String, Object> body) {
        Long userId = extractLong(body, "userId");
        String diseaseId = String.valueOf(body.get("diseaseId"));
        Integer stepIndex = Integer.valueOf(String.valueOf(body.get("stepIndex")));
        return ResponseEntity.ok(farmService.toggleTreatmentStep(userId, diseaseId, stepIndex));
    }

    @PostMapping("/journal")
    public ResponseEntity<?> addJournal(@RequestBody Map<String, Object> body) {
        Long userId = extractLong(body, "userId");
        String txt = body.get("txt") != null ? String.valueOf(body.get("txt")) : "";
        Integer days = body.get("days") != null ? Integer.valueOf(String.valueOf(body.get("days"))) : 0;
        boolean auto = Boolean.TRUE.equals(body.get("auto"));
        JournalEntry saved = farmService.addJournal(userId, txt, days, auto);
        Map<String, Object> out = new HashMap<>();
        out.put("id", saved.getId());
        out.put("t", saved.getRecordedAt());
        out.put("txt", saved.getContent());
        out.put("days", saved.getQuarantineDays());
        out.put("auto", Boolean.TRUE.equals(saved.getAutoLogged()) ? 1 : 0);
        return ResponseEntity.ok(out);
    }

    @PostMapping("/yield")
    public ResponseEntity<?> addYield(@RequestBody Map<String, Object> body) {
        Long userId = extractLong(body, "userId");
        Integer lot = Integer.valueOf(String.valueOf(body.get("lot")));
        Double kg = Double.valueOf(String.valueOf(body.get("kg")));
        YieldRecord saved = farmService.addYield(userId, lot, kg);
        Map<String, Object> out = new HashMap<>();
        out.put("id", saved.getId());
        out.put("t", saved.getRecordedAt());
        out.put("lot", saved.getLotIndex());
        out.put("kg", saved.getWeightKg());
        return ResponseEntity.ok(out);
    }

    @PutMapping("/coop")
    public ResponseEntity<?> updateCoop(@RequestBody Map<String, Object> body) {
        Long userId = extractLong(body, "userId");
        String coop = (String) body.get("coop");
        farmService.updateCooperative(userId, coop);
        return ResponseEntity.ok(Map.of("coop", coop == null ? "" : coop.trim()));
    }

    @GetMapping("/export/history.csv")
    public ResponseEntity<byte[]> exportHistoryCsv(@RequestParam("userId") Long userId) {
        String csv = farmService.generateHistoryCsv(userId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"lich-su-chan-doan.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv.getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/export/journal.csv")
    public ResponseEntity<byte[]> exportJournalCsv(@RequestParam("userId") Long userId) {
        String csv = farmService.generateJournalCsv(userId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"nhat-ky-vuon.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv.getBytes(StandardCharsets.UTF_8));
    }
}
