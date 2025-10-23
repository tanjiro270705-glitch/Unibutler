package com.unibutler.dto;

import java.time.Instant;

import lombok.Data;

@Data
public class TaskUpdateRequest {
    private String title;
    private String description;
    private Instant dueDate;
    private Integer estimatedMinutes;
    private Integer difficulty;
    private String course;
    private String status;
}
