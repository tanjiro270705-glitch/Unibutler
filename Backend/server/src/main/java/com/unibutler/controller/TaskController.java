package com.unibutler.controller;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unibutler.dto.TaskCreateRequest;
import com.unibutler.model.Task;
import com.unibutler.model.User;
import com.unibutler.service.AuthService;
import com.unibutler.service.TaskService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {
  private final AuthService auth;
  private final TaskService tasks;

  public TaskController(AuthService auth, TaskService tasks) {
    this.auth = auth; this.tasks = tasks;
  }

  @GetMapping
  public ResponseEntity<?> list(@RequestHeader("X-Auth-Token") String token) {
    try {
      User u = auth.requireUser(token);
      List<Task> list = tasks.list(u.getId());
      return ResponseEntity.ok(list);
    } catch (Exception e) {
      return ResponseEntity.status(401).body(e.getMessage());
    }
  }

  @PostMapping
public ResponseEntity<?> create(@RequestHeader("X-Auth-Token") String token,
                                @Valid @RequestBody TaskCreateRequest req) {
  try {
    User u = auth.requireUser(token);
    Task t = new Task();
    t.setTitle(req.getTitle());
    t.setDescription(req.getDescription());

    // LocalDate conversion
    LocalDate due = null;
    if (req.getDueDate() != null) {
      due = req.getDueDate().atZone(ZoneId.systemDefault()).toLocalDate();
    }
    t.setDueDate(due);

    t.setEstimatedMinutes(req.getEstimatedMinutes());
    t.setDifficulty(req.getDifficulty());
    t.setCourse(req.getCourse());
    return ResponseEntity.ok(tasks.create(u.getId(), t));
  } catch (Exception e) {
    return ResponseEntity.status(401).body(e.getMessage());
  }
}


  @PatchMapping("/{id}")
  public ResponseEntity<?> update(@RequestHeader("X-Auth-Token") String token,
                                  @PathVariable String id,
                                  @RequestBody Task patch) {
    try {
      User u = auth.requireUser(token);
      return ResponseEntity.ok(tasks.update(u.getId(), id, patch));
    } catch (Exception e) {
      return ResponseEntity.status(401).body(e.getMessage());
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@RequestHeader("X-Auth-Token") String token,
                                  @PathVariable String id) {
    try {
      User u = auth.requireUser(token);
      tasks.delete(u.getId(), id);
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      return ResponseEntity.status(401).body(e.getMessage());
    }
  }
}
