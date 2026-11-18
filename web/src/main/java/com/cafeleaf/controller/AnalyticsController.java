package com.cafeleaf.controller;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cafeleaf.dto.DiseaseCountStat;
import com.cafeleaf.dto.ScanSummary;
import com.cafeleaf.repository.ScanRecordRepository;
import com.cafeleaf.service.YoloAiService;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final YoloAiService yoloAiService;
    private final ScanRecordRepository scanRepo;

    public AnalyticsController(YoloAiService yoloAiService, ScanRecordRepository scanRepo) {
        this.yoloAiService = yoloAiService;
        this.scanRepo = scanRepo;
    }

    @PostMapping("/predict")
    public ResponseEntity<?> predictImage(@RequestParam("userId") Long userId,
                                        @RequestParam(value = "lot", defaultValue = "0") Integer lot,
                                        @RequestParam(value = "model", defaultValue = "best.pt") String model,
                                        @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File trống"));
            }
            Map<String, Object> res = yoloAiService.scanSingle(userId, lot, file);
            res.put("model_used", model);
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "data", res));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/compare")
    public ResponseEntity<?> compareModels(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File trống"));
            }
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "data", yoloAiService.compareModels(file)));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/benchmark")
    public ResponseEntity<?> getSystemBenchmark() {
        try {
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "data", yoloAiService.runBenchmark()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/benchmark")
    public ResponseEntity<?> postSystemBenchmark() {
        try {
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "data", yoloAiService.runBenchmark()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getScanHistory(
            @PathVariable(required = false) Long userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "50") int size) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Lỗi userId"));
            }
            int safePage = Math.max(0, page);
            int safeSize = Math.max(1, Math.min(size, 200));
            Pageable pageable = PageRequest.of(safePage, safeSize);
            List<ScanSummary> records = scanRepo.findSummariesByUserId(userId, pageable);
            List<Object> responseList = new ArrayList<>();

            for (ScanSummary r : records) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("scanId", r.getId());
                map.put("diseaseId", r.getDiseaseId());
                map.put("confidence", r.getConfidence());
                map.put("scannedAt", r.getScannedAt());
                map.put("modelUsed", r.getAiMode());
                map.put("imageUrl", r.getAnnotatedUrl() != null ? r.getAnnotatedUrl() : r.getImageUrl());
                responseList.add(map);
            }

            return ResponseEntity.ok(Map.of("status", "SUCCESS", "page", safePage, "size", safeSize, "totalReturned", records.size(), "data", responseList));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDiseaseStatistics() {
        try {
            Map<String, Long> stats = new LinkedHashMap<>();
            stats.put("leaf_rust", 0L);
            stats.put("cercospora", 0L);
            stats.put("leaf_miner", 0L);
            stats.put("red_spider_mite", 0L);
            stats.put("healthy", 0L);

            for (DiseaseCountStat item : scanRepo.countGroupedByDisease()) {
                if (item.getDiseaseId() != null) {
                    stats.put(item.getDiseaseId(), item.getCount());
                }
            }

            long total = 0L;
            for (Long v : stats.values()) {
                if (v != null) {
                    total += v;
                }
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("total_scans", total);
            result.put("disease_distribution", stats);

            return ResponseEntity.ok(Map.of("status", "SUCCESS", "data", result));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}