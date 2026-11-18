package com.cafeleaf.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "scan_records", indexes = {
    @Index(name = "idx_scan_user_time", columnList = "user_id, scanned_at DESC"),
    @Index(name = "idx_scan_disease", columnList = "disease_id"),
    @Index(name = "idx_scan_ai_mode", columnList = "ai_mode")
})
public class ScanRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "disease_id", nullable = false, length = 50)
    private String diseaseId;

    @Column(nullable = false)
    private Double confidence;

    @Column(name = "lot_index", nullable = false)
    private Integer lotIndex = 0;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "annotated_url", length = 500)
    private String annotatedUrl;

    @Lob
    @Column(name = "thumbnail_base64", columnDefinition = "LONGTEXT")
    private String thumbnailBase64;

    @Column(name = "ai_mode", length = 40)
    private String aiMode = "yolo11n-cf";

    // --- BỔ SUNG CHO TUẦN 9 & YÊU CẦU MENTOR ---
    @Column(name = "inference_time_ms")
    private Double inferenceTimeMs = 0.0; // Thời gian xử lý AI (ms) phục vụ /benchmark & P50/P95

    @Column(name = "box_count")
    private Integer boxCount = 1; // Tổng số đốm bệnh phát hiện trên lá

    @Column(name = "detections_json", columnDefinition = "TEXT")
    private String detectionsJson; // Lưu mảng JSON các bounding box chi tiết
    // -------------------------------------------

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "scanned_at", nullable = false)
    private Long scannedAt;

    public ScanRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getDiseaseId() { return diseaseId; }
    public void setDiseaseId(String diseaseId) { this.diseaseId = diseaseId; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public Integer getLotIndex() { return lotIndex; }
    public void setLotIndex(Integer lotIndex) { this.lotIndex = lotIndex; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getAnnotatedUrl() { return annotatedUrl; }
    public void setAnnotatedUrl(String annotatedUrl) { this.annotatedUrl = annotatedUrl; }

    public String getThumbnailBase64() { return thumbnailBase64; }
    public void setThumbnailBase64(String thumbnailBase64) { this.thumbnailBase64 = thumbnailBase64; }

    public String getAiMode() { return aiMode; }
    public void setAiMode(String aiMode) { this.aiMode = aiMode; }

    public Double getInferenceTimeMs() { return inferenceTimeMs; }
    public void setInferenceTimeMs(Double inferenceTimeMs) { this.inferenceTimeMs = inferenceTimeMs; }

    public Integer getBoxCount() { return boxCount; }
    public void setBoxCount(Integer boxCount) { this.boxCount = boxCount; }

    public String getDetectionsJson() { return detectionsJson; }
    public void setDetectionsJson(String detectionsJson) { this.detectionsJson = detectionsJson; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Long getScannedAt() { return scannedAt; }
    public void setScannedAt(Long scannedAt) { this.scannedAt = scannedAt; }
}