package com.unibutler.dto;

public class AuthResponse {
    private String token;
    private String userId;
    private String email;
    private String name;

    public String getToken() { return token; }
    public String getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getName() { return name; }

    public void setToken(String token) { this.token = token; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setEmail(String email) { this.email = email; }
    public void setName(String name) { this.name = name; }
}