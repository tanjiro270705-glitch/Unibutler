package com.unibutler.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.unibutler.model.Task;
import com.unibutler.repo.TaskRepo;

@Service
public class TaskService {
  private final TaskRepo repo;
  public TaskService(TaskRepo repo) { this.repo = repo; }

  public List<Task> list(String userId) {
    return repo.findByUserIdOrderByDueDateAsc(userId);
  }

  public Task create(String userId, Task t) {
    t.setId(null);
    t.setUserId(userId);
    t.setStatus("TODO");
    t.setCreatedAt(Instant.now());
    t.setUpdatedAt(Instant.now());
    return repo.save(t);
  }

  public Task update(String userId, String id, Task patch) {
    Task existing = repo.findById(id).orElseThrow();
    if (!existing.getUserId().equals(userId)) throw new RuntimeException("Forbidden");
    if (patch.getTitle() != null) existing.setTitle(patch.getTitle());
    if (patch.getDescription() != null) existing.setDescription(patch.getDescription());
    if (patch.getDueDate() != null) existing.setDueDate(patch.getDueDate());
    if (patch.getEstimatedMinutes() != null) existing.setEstimatedMinutes(patch.getEstimatedMinutes());
    if (patch.getDifficulty() != null) existing.setDifficulty(patch.getDifficulty());
    if (patch.getCourse() != null) existing.setCourse(patch.getCourse());
    if (patch.getStatus() != null) existing.setStatus(patch.getStatus());
    existing.setUpdatedAt(Instant.now());
    return repo.save(existing);
  }

  public void delete(String userId, String id) {
    Task existing = repo.findById(id).orElseThrow();
    if (!existing.getUserId().equals(userId)) throw new RuntimeException("Forbidden");
    repo.deleteById(id);
  }
}
