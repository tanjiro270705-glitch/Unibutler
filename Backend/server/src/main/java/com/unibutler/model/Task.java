package com.unibutler.model;

import java.time.Instant;
import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document
public class Task {
  @Id private String id;
  private String userId;
  private String title;
  private String description;
  private LocalDate dueDate;
  private boolean completed;
  private String status;
  private Integer estimatedMinutes;
  private Integer difficulty;
  private String course;
  private Instant createdAt;
  private Instant updatedAt;
}
