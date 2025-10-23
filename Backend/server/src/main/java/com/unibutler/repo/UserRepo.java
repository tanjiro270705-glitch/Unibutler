package com.unibutler.repo;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.unibutler.model.User;

public interface UserRepo extends MongoRepository<User, String> {
  Optional<User> findByEmail(String email);
}
