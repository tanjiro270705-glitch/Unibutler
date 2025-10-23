package com.unibutler.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import com.unibutler.dto.RegisterRequest;
import com.unibutler.model.AuthToken;
import com.unibutler.model.User;
import com.unibutler.repo.AuthTokenRepo;
import com.unibutler.repo.UserRepo;

@Service
public class AuthService {
  private final UserRepo userRepo;
  private final AuthTokenRepo tokenRepo;

  public AuthService(UserRepo userRepo, AuthTokenRepo tokenRepo) {
    this.userRepo = userRepo;
    this.tokenRepo = tokenRepo;
  }

  public User register(RegisterRequest req) {
    userRepo.findByEmail(req.getEmail()).ifPresent(u -> { throw new RuntimeException("Email already registered"); });
    User u = new User();
    u.setEmail(req.getEmail().toLowerCase());
    u.setName(req.getName());
    u.setPasswordHash(BCrypt.hashpw(req.getPassword(), BCrypt.gensalt()));
    u.setProductivityPreference("morning");
    u.setOnboardingCompleted(true);
    return userRepo.save(u);
  }

  public AuthToken login(String email, String password) {
    User u = userRepo.findByEmail(email.toLowerCase()).orElseThrow(() -> new RuntimeException("Invalid credentials"));
    if (!BCrypt.checkpw(password, u.getPasswordHash())) throw new RuntimeException("Invalid credentials");
    tokenRepo.deleteByUserId(u.getId()); // single session
    AuthToken t = new AuthToken();
    t.setUserId(u.getId());
    t.setToken(UUID.randomUUID().toString());
    t.setCreatedAt(Instant.now());
    t.setExpiresAt(Instant.now().plus(30, ChronoUnit.DAYS));
    return tokenRepo.save(t);
  }

  public User requireUser(String token) {
    if (token == null || token.isBlank()) throw new RuntimeException("Missing token");
    Optional<AuthToken> t = tokenRepo.findByToken(token);
    AuthToken tok = t.orElseThrow(() -> new RuntimeException("Invalid token"));
    if (tok.getExpiresAt().isBefore(Instant.now())) throw new RuntimeException("Token expired");
    return userRepo.findById(tok.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
  }

}
