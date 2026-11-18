package com.cafeleaf.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "farm_lots")
public class FarmLot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "lot_index", nullable = false)
    private Integer lotIndex;

    @Column(name = "lot_name", nullable = false, length = 100)
    private String lotName;

    @Column(length = 255)
    private String description = "";

    public FarmLot() {}

    public FarmLot(Long userId, Integer lotIndex, String lotName, String description) {
        this.userId = userId;
        this.lotIndex = lotIndex;
        this.lotName = lotName;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getLotIndex() { return lotIndex; }
    public void setLotIndex(Integer lotIndex) { this.lotIndex = lotIndex; }

    public String getLotName() { return lotName; }
    public void setLotName(String lotName) { this.lotName = lotName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}