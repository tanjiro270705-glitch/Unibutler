package com.unibutler.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.unibutler.model.Resource;
import com.unibutler.model.ResourceRegistration;
import com.unibutler.repo.ResourceRegistrationRepo;
import com.unibutler.repo.ResourceRepo;

@Service
public class ResourceService implements CommandLineRunner {

    private final ResourceRepo resourceRepo;
    private final ResourceRegistrationRepo registrationRepo;

    public ResourceService(ResourceRepo resourceRepo, ResourceRegistrationRepo registrationRepo) {
        this.resourceRepo = resourceRepo;
        this.registrationRepo = registrationRepo;
    }
    
    @Override
    public void run(String... args) throws Exception {
        // Only seed if no resources exist
        if (resourceRepo.count() == 0) {
            seedResources();
        }
    }
    
    private void seedResources() {
        List<Resource> resources = Arrays.asList(
            // Study Resources
            createResource(
                "Time Management Workshop",
                "Learn effective time management techniques for academic success",
                "workshop", "event", "Library Study Room 1", "Academic Success Center",
                LocalDateTime.now().plusDays(2).withHour(14).withMinute(0),
                LocalDateTime.now().plusDays(2).withHour(16).withMinute(0),
                "beginner", "undergraduate", true, 0.0, 30, 0,
                Arrays.asList("time-management", "productivity", "study-skills")
            ),
            
            createResource(
                "Pomodoro Technique Training",
                "Master the Pomodoro Technique for better focus and productivity",
                "study", "workshop", "Online", "Study Skills Center",
                LocalDateTime.now().plusDays(5).withHour(10).withMinute(0),
                LocalDateTime.now().plusDays(5).withHour(11).withMinute(30),
                "beginner", "all", true, 0.0, 50, 0,
                Arrays.asList("focus", "productivity", "study-method")
            ),
            
            // Counseling Resources
            createResource(
                "Stress Management Counseling",
                "One-on-one counseling sessions for stress management and mental wellness",
                "counseling", "service", "Student Wellness Center", "Dr. Sarah Johnson",
                LocalDateTime.now().plusDays(1).withHour(9).withMinute(0),
                LocalDateTime.now().plusDays(1).withHour(10).withMinute(0),
                "beginner", "all", true, 0.0, 1, 0,
                Arrays.asList("stress", "mental-health", "counseling")
            ),
            
            createResource(
                "Group Therapy: Anxiety Management",
                "Weekly group therapy sessions for managing anxiety and academic pressure",
                "counseling", "service", "Wellness Center Room 2", "Mental Health Services",
                LocalDateTime.now().plusDays(3).withHour(15).withMinute(0),
                LocalDateTime.now().plusDays(3).withHour(16).withMinute(30),
                "intermediate", "all", true, 0.0, 8, 0,
                Arrays.asList("anxiety", "group-therapy", "mental-health")
            ),
            
            // Career Resources
            createResource(
                "Tech Industry Networking Night",
                "Connect with professionals from top tech companies and startups",
                "career", "event", "Innovation Hub", "Career Services",
                LocalDateTime.now().plusDays(7).withHour(18).withMinute(0),
                LocalDateTime.now().plusDays(7).withHour(21).withMinute(0),
                "intermediate", "all", false, 15.0, 100, 0,
                Arrays.asList("networking", "tech", "career", "professional")
            ),
            
            createResource(
                "Resume Writing Workshop",
                "Learn how to create compelling resumes that stand out to employers",
                "career", "workshop", "Career Center", "Career Services",
                LocalDateTime.now().plusDays(4).withHour(13).withMinute(0),
                LocalDateTime.now().plusDays(4).withHour(15).withMinute(0),
                "beginner", "all", true, 0.0, 25, 0,
                Arrays.asList("resume", "job-search", "career-development")
            ),
            
            // Wellness Resources
            createResource(
                "Mindfulness Meditation Session",
                "Guided meditation sessions for stress relief and mental clarity",
                "wellness", "service", "Wellness Center Meditation Room", "Wellness Center",
                LocalDateTime.now().plusDays(1).withHour(12).withMinute(0),
                LocalDateTime.now().plusDays(1).withHour(12).withMinute(30),
                "beginner", "all", true, 0.0, 20, 0,
                Arrays.asList("meditation", "mindfulness", "stress-relief")
            ),
            
            createResource(
                "Yoga for Students",
                "Gentle yoga sessions designed specifically for students to reduce stress",
                "wellness", "service", "Fitness Center Studio", "Campus Recreation",
                LocalDateTime.now().plusDays(6).withHour(17).withMinute(0),
                LocalDateTime.now().plusDays(6).withHour(18).withMinute(0),
                "beginner", "all", true, 0.0, 15, 0,
                Arrays.asList("yoga", "fitness", "stress-relief", "wellness")
            ),
            
            // Study Tools
            createResource(
                "Study Group Finder",
                "Connect with other students studying the same subjects",
                "study", "tool", "Online Platform", "Student Services",
                null, null, "beginner", "all", true, 0.0, 999, 0,
                Arrays.asList("study-groups", "collaboration", "peer-learning")
            ),
            
            createResource(
                "Academic Writing Support",
                "Get help with essays, research papers, and academic writing",
                "study", "service", "Writing Center", "Academic Support",
                LocalDateTime.now().plusDays(2).withHour(10).withMinute(0),
                LocalDateTime.now().plusDays(2).withHour(12).withMinute(0),
                "intermediate", "all", true, 0.0, 5, 0,
                Arrays.asList("writing", "academic-support", "essays")
            )
        );
        
        resourceRepo.saveAll(resources);
    }
    
    private Resource createResource(String title, String description, String category, String type,
                                  String location, String organizer, LocalDateTime startTime, LocalDateTime endTime,
                                  String difficulty, String targetAudience, boolean isFree, double price,
                                  int maxParticipants, int currentParticipants, List<String> tags) {
        Resource resource = new Resource();
        resource.setTitle(title);
        resource.setDescription(description);
        resource.setCategory(category);
        resource.setType(type);
        resource.setLocation(location);
        resource.setOrganizer(organizer);
        resource.setStartTime(startTime);
        resource.setEndTime(endTime);
        resource.setDifficulty(difficulty);
        resource.setTargetAudience(targetAudience);
        resource.setFree(isFree);
        resource.setPrice(price);
        resource.setMaxParticipants(maxParticipants);
        resource.setCurrentParticipants(currentParticipants);
        resource.setTags(tags);
        resource.setActive(true);
        resource.setCreatedAt(LocalDateTime.now());
        resource.setUpdatedAt(LocalDateTime.now());
        resource.setAverageRating(4.5);
        resource.setTotalReviews(0);
        
        if (startTime != null) {
            resource.setRegistrationDeadline(startTime.minusDays(1));
        }
        
        return resource;
    }

    @Transactional
    public ResourceRegistration registerForResource(String userId, String resourceId) {
        // Check if user is already registered
        Optional<ResourceRegistration> existingRegistration = registrationRepo
            .findByUserIdAndResourceIdAndStatus(userId, resourceId, "registered");

        if (existingRegistration.isPresent()) {
            throw new RuntimeException("User is already registered for this resource");
        }

        // Get the resource
        Optional<Resource> resourceOpt = resourceRepo.findById(resourceId);
        if (!resourceOpt.isPresent() || !resourceOpt.get().isActive()) {
            throw new RuntimeException("Resource not found or inactive");
        }

        Resource resource = resourceOpt.get();

        // Check registration deadline
        if (resource.getRegistrationDeadline() != null &&
            LocalDateTime.now().isAfter(resource.getRegistrationDeadline())) {
            throw new RuntimeException("Registration deadline has passed");
        }

        // Check capacity
        if (resource.getCurrentParticipants() >= resource.getMaxParticipants()) {
            throw new RuntimeException("Resource is at full capacity");
        }

        // Create registration
        ResourceRegistration registration = new ResourceRegistration();
        registration.setUserId(userId);
        registration.setResourceId(resourceId);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setStatus("registered");
        registration.setAttended(false);

        ResourceRegistration savedRegistration = registrationRepo.save(registration);

        // Update resource participant count
        resource.setCurrentParticipants(resource.getCurrentParticipants() + 1);
        resourceRepo.save(resource);

        return savedRegistration;
    }

    @Transactional
    public void cancelRegistration(String userId, String resourceId) {
        Optional<ResourceRegistration> registrationOpt = registrationRepo
            .findByUserIdAndResourceIdAndStatus(userId, resourceId, "registered");

        if (!registrationOpt.isPresent()) {
            throw new RuntimeException("Registration not found");
        }

        ResourceRegistration registration = registrationOpt.get();

        // Update status to cancelled
        registration.setStatus("cancelled");
        registrationRepo.save(registration);

        // Decrease participant count
        Optional<Resource> resourceOpt = resourceRepo.findById(resourceId);
        if (resourceOpt.isPresent()) {
            Resource resource = resourceOpt.get();
            resource.setCurrentParticipants(Math.max(0, resource.getCurrentParticipants() - 1));
            resourceRepo.save(resource);
        }
    }

    public List<ResourceRegistration> getUserRegistrations(String userId) {
        return registrationRepo.findByUserId(userId);
    }

    public boolean isUserRegistered(String userId, String resourceId) {
        return registrationRepo.findByUserIdAndResourceIdAndStatus(userId, resourceId, "registered").isPresent();
    }
}
