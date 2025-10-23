package com.unibutler.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document
public class User {
  @Id private String id;
  @Indexed(unique = true) private String email;
  private String name;
  private String passwordHash;
  // Field to store user's productivity preference
  private String productivityPreference; // "morning" | "afternoon" | "evening"
  // Onboarding fields
  private boolean onboardingCompleted = true;
  private String workload; // "Low" | "Medium" | "High"
  private String weeklyGoal;
}
