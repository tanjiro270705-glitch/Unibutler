package com.unibutler.repo;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.unibutler.model.AuthToken;

public interface AuthTokenRepo extends MongoRepository<AuthToken, String> {
  Optional<AuthToken> findByToken(String token);
  void deleteByUserId(String userId);
}
