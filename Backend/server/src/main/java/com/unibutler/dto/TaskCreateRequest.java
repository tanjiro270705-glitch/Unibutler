package com.unibutler.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TaskCreateRequest {
  @NotBlank private String title;
  private String description;
  private Instant dueDate;
  private Integer estimatedMinutes;
  private Integer difficulty;
  private String course;
}

