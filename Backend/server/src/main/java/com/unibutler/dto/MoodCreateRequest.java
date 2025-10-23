package com.unibutler.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MoodCreateRequest {
    @NotNull @Min(1) @Max(5)
    private Integer mood;
    @NotNull @Min(1) @Max(10)
    private Integer stress;
    private String note;
    private LocalDate date;
}
