package com.cafeleaf.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "yield_records")
public class YieldRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "lot_index", nullable = false)
    private Integer lotIndex;

    @Column(name = "weight_kg", nullable = false)
    private Double weightKg;

    @Column(name = "recorded_at", nullable = false)
    private Long recordedAt;

    public YieldRecord() {}

    public YieldRecord(Long userId, Integer lotIndex, Double weightKg, Long recordedAt) {
        this.userId = userId;
        this.lotIndex = lotIndex;
        this.weightKg = weightKg;
        this.recordedAt = recordedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getLotIndex() { return lotIndex; }
    public void setLotIndex(Integer lotIndex) { this.lotIndex = lotIndex; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public Long getRecordedAt() { return recordedAt; }
    public void setRecordedAt(Long recordedAt) { this.recordedAt = recordedAt; }
}