package com.cafeleaf.controller;

import com.cafeleaf.service.FarmManagementService;
import com.cafeleaf.service.YoloAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scan")
public class ScanController {

    private final YoloAiService yoloAiService;
    private final FarmManagementService farmService;

    public ScanController(YoloAiService yoloAiService, FarmManagementService farmService) {
        this.yoloAiService = yoloAiService;
        this.farmService = farmService;
    }

@PostMapping("/single")
public ResponseEntity<?> scanSingle(@RequestParam("userId") Long userId,
                                        @RequestParam(value = "lot", defaultValue = "0") Integer lot,
                                        @RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> res = yoloAiService.scanSingle(userId, lot, file);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/batch")
    public ResponseEntity<?> scanBatch(@RequestParam("userId") Long userId,
                                    @RequestParam(value = "lot", defaultValue = "0") Integer lot,
                                    @RequestParam("files") List<MultipartFile> files) {
        try {
            Map<String, Object> res = yoloAiService.scanBatch(userId, lot, files);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sample")
    public ResponseEntity<?> scanSample(@RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.valueOf(String.valueOf(body.get("userId")));
            Integer lot = body.get("lot") != null ? Integer.valueOf(String.valueOf(body.get("lot"))) : 0;
            Map<String, Object> res = yoloAiService.scanSample(userId, lot);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/feedback")
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, Object> body) {
        try {
            Long userId = body.get("userId") != null ? Long.valueOf(String.valueOf(body.get("userId"))) : null;
            Long scanId = (body.get("scanId") != null && !String.valueOf(body.get("scanId")).isBlank())
                    ? Long.valueOf(String.valueOf(body.get("scanId")))
                    : null;
            String rawSrc = body.get("rawSrc") != null ? String.valueOf(body.get("rawSrc")) : null;
            String oldDiseaseId = body.get("oldDiseaseId") != null ? String.valueOf(body.get("oldDiseaseId")) : null;
            String newDiseaseId = body.get("newDiseaseId") != null ? String.valueOf(body.get("newDiseaseId")) : null;
            String userNote = body.get("userNote") != null ? String.valueOf(body.get("userNote")) : null;
            Integer lot = body.get("lot") != null ? Integer.valueOf(String.valueOf(body.get("lot"))) : 0;

            Map<String, Object> res = yoloAiService.submitFeedbackAndLearn(
                    userId, scanId, rawSrc, oldDiseaseId, newDiseaseId, userNote, lot
            );
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{scanId}")
    public ResponseEntity<?> deleteScan(@PathVariable Long scanId, @RequestParam("userId") Long userId) {
        farmService.deleteScan(userId, scanId);
        return ResponseEntity.ok(Map.of("deleted", scanId));
    }
}