package com.cafeleaf.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "journal_entries")
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "quarantine_days", nullable = false)
    private Integer quarantineDays = 0;

    @Column(name = "auto_logged", nullable = false)
    private Boolean autoLogged = false;

    @Column(name = "recorded_at", nullable = false)
    private Long recordedAt;

    public JournalEntry() {}

    public JournalEntry(Long userId, String content, Integer quarantineDays, Boolean autoLogged, Long recordedAt) {
        this.userId = userId;
        this.content = content;
        this.quarantineDays = quarantineDays;
        this.autoLogged = autoLogged;
        this.recordedAt = recordedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Integer getQuarantineDays() { return quarantineDays; }
    public void setQuarantineDays(Integer quarantineDays) { this.quarantineDays = quarantineDays; }

    public Boolean getAutoLogged() { return autoLogged; }
    public void setAutoLogged(Boolean autoLogged) { this.autoLogged = autoLogged; }

    public Long getRecordedAt() { return recordedAt; }
    public void setRecordedAt(Long recordedAt) { this.recordedAt = recordedAt; }
}