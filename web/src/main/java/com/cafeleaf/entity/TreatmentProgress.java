package com.cafeleaf.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "treatment_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "disease_id", "step_index"})
})
public class TreatmentProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "disease_id", nullable = false, length = 50)
    private String diseaseId;

    @Column(name = "step_index", nullable = false)
    private Integer stepIndex;

    @Column(nullable = false)
    private Boolean completed = false;

    public TreatmentProgress() {}

    public TreatmentProgress(Long userId, String diseaseId, Integer stepIndex, Boolean completed) {
        this.userId = userId;
        this.diseaseId = diseaseId;
        this.stepIndex = stepIndex;
        this.completed = completed;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getDiseaseId() { return diseaseId; }
    public void setDiseaseId(String diseaseId) { this.diseaseId = diseaseId; }

    public Integer getStepIndex() { return stepIndex; }
    public void setStepIndex(Integer stepIndex) { this.stepIndex = stepIndex; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
}