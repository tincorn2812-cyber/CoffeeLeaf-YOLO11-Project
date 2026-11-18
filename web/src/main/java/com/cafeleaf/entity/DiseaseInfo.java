package com.cafeleaf.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "disease_info")
public class DiseaseInfo {

    @Id
    @Column(length = 50)
    private String id; // leaf_rust, cercospora, leaf_miner, red_spider_mite, healthy

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "scientific_name", length = 150)
    private String scientificName;

    @Column(name = "risk_level", length = 50)
    private String riskLevel;

    @Column(name = "color_hex", length = 20)
    private String colorHex;

    @Column(name = "cause_why", columnDefinition = "TEXT")
    private String causeWhy;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(columnDefinition = "TEXT")
    private String prevention;

    @Column(name = "steps_list", columnDefinition = "TEXT")
    private String stepsList; // Separated by ||

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    public DiseaseInfo() {}

    public DiseaseInfo(String id, String name, String scientificName, String riskLevel,
                    String colorHex, String causeWhy, String symptoms, String prevention,
                    String stepsList, Integer displayOrder) {
        this.id = id;
        this.name = name;
        this.scientificName = scientificName;
        this.riskLevel = riskLevel;
        this.colorHex = colorHex;
        this.causeWhy = causeWhy;
        this.symptoms = symptoms;
        this.prevention = prevention;
        this.stepsList = stepsList;
        this.displayOrder = displayOrder;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getScientificName() { return scientificName; }
    public void setScientificName(String scientificName) { this.scientificName = scientificName; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getColorHex() { return colorHex; }
    public void setColorHex(String colorHex) { this.colorHex = colorHex; }

    public String getCauseWhy() { return causeWhy; }
    public void setCauseWhy(String causeWhy) { this.causeWhy = causeWhy; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getPrevention() { return prevention; }
    public void setPrevention(String prevention) { this.prevention = prevention; }

    public String getStepsList() { return stepsList; }
    public void setStepsList(String stepsList) { this.stepsList = stepsList; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}