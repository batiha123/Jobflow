package com.team.backend.dto;

import com.team.backend.entity.CandidateProfile;
import com.team.backend.entity.User;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class CandidateProfileDto {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String photoUrl;
    private String headline;
    private String aboutMe;
    private String skills;
    private String education;
    private String experience;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CandidateProfileDto() {
    }

    public static CandidateProfileDto fromEntities(CandidateProfile profile, User user) {
        CandidateProfileDto dto = new CandidateProfileDto();
        if (profile != null) {
            dto.setId(profile.getId());
            dto.setUserId(profile.getUserId());
            dto.setPhotoUrl(profile.getPhotoUrl());
            dto.setHeadline(profile.getHeadline());
            dto.setAboutMe(profile.getAboutMe());
            dto.setSkills(profile.getSkills());
            dto.setEducation(profile.getEducation());
            dto.setExperience(profile.getExperience());
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

        private String photoUrl;

        @Size(max = 255, message = "Le titre ne doit pas dépasser 255 caractères")
        private String headline;

        private String aboutMe;
        private String skills;
        private String education;
        private String experience;

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

        public String getPhotoUrl() {
            return photoUrl;
        }

        public void setPhotoUrl(String photoUrl) {
            this.photoUrl = photoUrl;
        }

        public String getHeadline() {
            return headline;
        }

        public void setHeadline(String headline) {
            this.headline = headline;
        }

        public String getAboutMe() {
            return aboutMe;
        }

        public void setAboutMe(String aboutMe) {
            this.aboutMe = aboutMe;
        }

        public String getSkills() {
            return skills;
        }

        public void setSkills(String skills) {
            this.skills = skills;
        }

        public String getEducation() {
            return education;
        }

        public void setEducation(String education) {
            this.education = education;
        }

        public String getExperience() {
            return experience;
        }

        public void setExperience(String experience) {
            this.experience = experience;
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

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getAboutMe() {
        return aboutMe;
    }

    public void setAboutMe(String aboutMe) {
        this.aboutMe = aboutMe;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
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

