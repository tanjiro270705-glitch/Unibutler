package com.unibutler.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unibutler.dto.AuthResponse;
import com.unibutler.dto.LoginRequest;
import com.unibutler.dto.RegisterRequest;
import com.unibutler.model.AuthToken;
import com.unibutler.model.User;
import com.unibutler.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {
            User u = auth.register(req);
            return ResponseEntity.ok(u);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            AuthToken t = auth.login(req.getEmail(), req.getPassword());
            User u = auth.requireUser(t.getToken());

            AuthResponse resp = new AuthResponse();
            resp.setToken(t.getToken());
            resp.setUserId(u.getId());
            resp.setEmail(u.getEmail());
            resp.setName(u.getName());

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("X-Auth-Token") String token) {
        try {
            User u = auth.requireUser(token);
            return ResponseEntity.ok(u);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}
