package com.unibutler.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document
public class StudySession {
  @Id private String id;
  private String userId;
  private String taskId;
  private Instant start;
  private Instant end;
  private Integer focusMinutes;
}
