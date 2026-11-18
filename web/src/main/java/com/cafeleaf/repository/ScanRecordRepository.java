package com.cafeleaf.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cafeleaf.dto.DiseaseCountStat;
import com.cafeleaf.dto.ScanSummary;
import com.cafeleaf.entity.ScanRecord;

public interface ScanRecordRepository extends JpaRepository<ScanRecord, Long> {
    List<ScanRecord> findByUserIdOrderByScannedAtDesc(Long userId);
    List<ScanRecord> findByUserIdOrderByScannedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT r.id AS id, r.diseaseId AS diseaseId, r.confidence AS confidence, " +
        "r.scannedAt AS scannedAt, r.thumbnailBase64 AS thumbnailBase64, " +
        "r.annotatedUrl AS annotatedUrl, r.imageUrl AS imageUrl, " +
        "r.lotIndex AS lotIndex, r.note AS note, r.aiMode AS aiMode " +
        "FROM ScanRecord r WHERE r.userId = :userId ORDER BY r.scannedAt DESC")
    List<ScanSummary> findSummariesByUserId(@Param("userId") Long userId, Pageable pageable);

    Optional<ScanRecord> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT r.diseaseId AS diseaseId, COUNT(r.id) AS count FROM ScanRecord r GROUP BY r.diseaseId")
    List<DiseaseCountStat> countGroupedByDisease();

    long countByDiseaseId(String diseaseId);
}
