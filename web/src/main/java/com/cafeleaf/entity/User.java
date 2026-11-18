package com.cafeleaf.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email"),
    @UniqueConstraint(columnNames = "username")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String username;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 128)
    private String passwordHash;

    @Column(nullable = false, length = 64)
    private String salt;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(length = 30)
    private String phone = "";

    @Column(length = 80)
    private String province = "Đắk Lắk";

    @Column(length = 50)
    private String role = "Nông dân";

    @Lob
    @Column(name = "avatar_data", columnDefinition = "LONGTEXT")
    private String avatarData;

    @Column(name = "cooperative_name", length = 200)
    private String cooperativeName = "";

    @Column(name = "current_disease_id", length = 50)
    private String currentDiseaseId = "leaf_rust";

    @Column(name = "active_lot_index")
    private Integer activeLotIndex = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getSalt() { return salt; }
    public void setSalt(String salt) { this.salt = salt; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatarData() { return avatarData; }
    public void setAvatarData(String avatarData) { this.avatarData = avatarData; }

    public String getCooperativeName() { return cooperativeName; }
    public void setCooperativeName(String cooperativeName) { this.cooperativeName = cooperativeName; }

    public String getCurrentDiseaseId() { return currentDiseaseId; }
    public void setCurrentDiseaseId(String currentDiseaseId) { this.currentDiseaseId = currentDiseaseId; }

    public Integer getActiveLotIndex() { return activeLotIndex; }
    public void setActiveLotIndex(Integer activeLotIndex) { this.activeLotIndex = activeLotIndex; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}