package com.team.backend.dto;

import com.team.backend.entity.AdminProfile;
import com.team.backend.entity.User;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class AdminProfileDto {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String position;
    private String department;
    private String bio;
    private String photoUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AdminProfileDto() {
    }

    public static AdminProfileDto fromEntities(AdminProfile profile, User user) {
        AdminProfileDto dto = new AdminProfileDto();
        if (profile != null) {
            dto.setId(profile.getId());
            dto.setUserId(profile.getUserId());
            dto.setPosition(profile.getPosition());
            dto.setDepartment(profile.getDepartment());
            dto.setBio(profile.getBio());
            dto.setPhotoUrl(profile.getPhotoUrl());
            dto.setCreatedAt(profile.getCreatedAt());
            dto.setUpdatedAt(profile.getUpdatedAt());
        }
        if (user != null) {
            dto.setUserId(user.getId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());
        }
        return dto;
    }

    public static class UpdateRequest {

        @Size(max = 150, message = "Le nom ne doit pas dépasser 150 caractères")
        private String name;

        @Size(max = 30, message = "Le téléphone ne doit pas dépasser 30 caractères")
        private String phone;

        @Size(max = 100, message = "Le poste ne doit pas dépasser 100 caractères")
        private String position;

        @Size(max = 100, message = "Le département ne doit pas dépasser 100 caractères")
        private String department;

        private String bio;

        @Size(max = 500, message = "L'URL de la photo ne doit pas dépasser 500 caractères")
        private String photoUrl;

        public UpdateRequest() {
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getPosition() {
            return position;
        }

        public void setPosition(String position) {
            this.position = position;
        }

        public String getDepartment() {
            return department;
        }

        public void setDepartment(String department) {
            this.department = department;
        }

        public String getBio() {
            return bio;
        }

        public void setBio(String bio) {
            this.bio = bio;
        }

        public String getPhotoUrl() {
            return photoUrl;
        }

        public void setPhotoUrl(String photoUrl) {
            this.photoUrl = photoUrl;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
