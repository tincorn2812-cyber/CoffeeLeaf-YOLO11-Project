package com.cafeleaf.dto;

public interface ScanSummary {
    Long getId();
    String getDiseaseId();
    Double getConfidence();
    Long getScannedAt();
    String getThumbnailBase64();
    String getAnnotatedUrl();
    String getImageUrl();
    Integer getLotIndex();
    String getNote();
    String getAiMode();
}
