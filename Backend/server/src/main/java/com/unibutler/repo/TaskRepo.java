package com.unibutler.repo;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.unibutler.model.Task;

public interface TaskRepo extends MongoRepository<Task, String> {
    List<Task> findByUserIdOrderByDueDateAsc(String userId);
    List<Task> findByUserIdAndDueDateBetweenOrderByDueDateAsc(String userId, LocalDate start, LocalDate end);
}
