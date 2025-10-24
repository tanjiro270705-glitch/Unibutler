package com.unibutler.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @Email @NotBlank
    private String email;
    @NotBlank
    private String password;

    public String getEmail() { return email; }
    public String getPassword() { return password; }

    // 👇 thêm 2 setter để Jackson map JSON -> object
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
}
    