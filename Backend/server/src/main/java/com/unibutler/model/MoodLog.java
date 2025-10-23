package com.unibutler.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document
public class MoodLog {
  @Id private String id;
  private String userId;
  private LocalDate date;
  private Integer mood;   // 1-5
  private Integer stress; // 1-10
  private String note;
}
