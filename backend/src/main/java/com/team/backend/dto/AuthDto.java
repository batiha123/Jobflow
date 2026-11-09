package com.team.backend.dto;

import com.team.backend.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {

    private AuthDto() {
    }

    public static class LoginRequest {

        @NotBlank(message = "L'adresse email est obligatoire")
        @Email(message = "Format d'email invalide")
        private String email;

        @NotBlank(message = "Le mot de passe est obligatoire")
        private String password;

        public LoginRequest() {
        }

        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class RegisterRequest {

        @NotBlank(message = "Le nom complet est obligatoire")
        @Size(min = 2, max = 150, message = "Le nom doit contenir entre 2 et 150 caractères")
        private String name;

        @NotBlank(message = "L'adresse email est obligatoire")
        @Email(message = "Format d'email invalide")
        @Size(max = 255)
        private String email;

        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 6, max = 100, message = "Le mot de passe doit contenir au moins 6 caractères")
        private String password;

        @Size(max = 30, message = "Le numéro de téléphone ne doit pas dépasser 30 caractères")
        private String phone;

        private Role role = Role.CANDIDATE;

        @Size(max = 200)
        private String companyName;

        public RegisterRequest() {
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

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public Role getRole() {
            return role;
        }

        public void setRole(Role role) {
            this.role = role;
        }

        public String getCompanyName() {
            return companyName;
        }

        public void setCompanyName(String companyName) {
            this.companyName = companyName;
        }
    }

    public static class AuthResponse {

        private String token;
        private String tokenType = "Bearer";
        private UserDto user;

        public AuthResponse() {
        }

        public AuthResponse(String token, UserDto user) {
            this.token = token;
            this.tokenType = "Bearer";
            this.user = user;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public String getTokenType() {
            return tokenType;
        }

        public void setTokenType(String tokenType) {
            this.tokenType = tokenType;
        }

        public UserDto getUser() {
            return user;
        }

        public void setUser(UserDto user) {
            this.user = user;
        }
    }
}

