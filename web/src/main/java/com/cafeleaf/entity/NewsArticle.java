package com.cafeleaf.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "news_articles")
public class NewsArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String category; // Giá, Thời tiết, Kỹ thuật

    @Column(nullable = false, length = 250)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "art_type", length = 40)
    private String artType = "leaf";

    public NewsArticle() {}

    public NewsArticle(String category, String title, String summary, String content, String artType) {
        this.category = category;
        this.title = title;
        this.summary = summary;
        this.content = content;
        this.artType = artType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getArtType() { return artType; }
    public void setArtType(String artType) { this.artType = artType; }
}