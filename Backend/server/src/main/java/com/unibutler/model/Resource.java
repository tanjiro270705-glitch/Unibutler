package com.unibutler.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document
public class Resource {
    @Id
    private String id;
    
    private String title;
    private String description;
    private String category; // "workshop", "counseling", "career", "study", "wellness"
    private String type; // "event", "service", "tool", "article"
    private String location;
    private String organizer;
    private String contactInfo;
    private String website;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime registrationDeadline;
    
    private boolean isRecurring;
    private String recurringPattern;
    
    private int maxParticipants;
    private int currentParticipants;
    private boolean isFree;
    private double price;
    
    private List<String> tags;
    private String difficulty; 
    private String targetAudience; 
    
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Rating and reviews
    private double averageRating;
    private int totalReviews;
    
    // Additional details
    private String requirements;
    private String benefits;
    private String prerequisites;
}
