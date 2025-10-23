package com.unibutler.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document
public class ResourceRegistration {

    @Id
    private String id;

    private String userId;
    private String resourceId;

    private LocalDateTime registeredAt;
    private String status; // "registered", "cancelled", "attended"

    private String notes;
    private boolean attended;
    private LocalDateTime attendedAt;

    // Additional fields for waitlist
    private boolean isWaitlisted;
    private LocalDateTime waitlistedAt;
    private int waitlistPosition;
}
