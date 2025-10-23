package com.unibutler.repo;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.unibutler.model.MoodLog;

public interface MoodRepo extends MongoRepository<MoodLog, String> {
    List<MoodLog> findByUserIdAndDateBetween(String userId, LocalDate start, LocalDate end);
    List<MoodLog> findByUserIdOrderByDateDesc(String userId);
}
