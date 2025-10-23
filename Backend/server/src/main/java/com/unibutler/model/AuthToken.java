package com.unibutler.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document
public class AuthToken {
  @Id private String id;
  private String userId;
  private String token;
  private Instant createdAt;
  private Instant expiresAt;
}
