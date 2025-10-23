package com.unibutler.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.unibutler.model.Resource;
import com.unibutler.model.ResourceRegistration;
import com.unibutler.model.User;
import com.unibutler.repo.ResourceRepo;
import com.unibutler.service.AuthService;
import com.unibutler.service.ResourceService;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceRepo resourceRepo;
    private final AuthService authService;
    private final ResourceService resourceService;

    public ResourceController(ResourceRepo resourceRepo, AuthService authService, ResourceService resourceService) {
        this.resourceRepo = resourceRepo;
        this.authService = authService;
        this.resourceService = resourceService;
    }
    
    @GetMapping
    public ResponseEntity<?> getAllResources(
            @RequestHeader("X-Auth-Token") String token,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String targetAudience,
            @RequestParam(required = false) Boolean isFree) {
        try {
            authService.requireUser(token);
            
            List<Resource> resources;
            
            if (search != null && !search.trim().isEmpty()) {
                resources = resourceRepo.searchByTitleOrDescription(search.trim());
            } else if (category != null && !category.trim().isEmpty()) {
                resources = resourceRepo.findByCategoryAndIsActiveTrueOrderByStartTimeAsc(category);
            } else if (type != null && !type.trim().isEmpty()) {
                resources = resourceRepo.findByTypeAndIsActiveTrueOrderByStartTimeAsc(type);
            } else if (difficulty != null && !difficulty.trim().isEmpty()) {
                resources = resourceRepo.findByDifficultyAndIsActiveTrueOrderByStartTimeAsc(difficulty);
            } else if (targetAudience != null && !targetAudience.trim().isEmpty()) {
                resources = resourceRepo.findByTargetAudienceAndIsActiveTrueOrderByStartTimeAsc(targetAudience);
            } else if (isFree != null && isFree) {
                resources = resourceRepo.findByIsFreeTrueAndIsActiveTrueOrderByStartTimeAsc();
            } else {
                resources = resourceRepo.findByIsActiveTrueOrderByStartTimeAsc();
            }
            
            // Apply additional filters
            if (difficulty != null && !difficulty.trim().isEmpty() && (category == null || category.trim().isEmpty())) {
                resources = resources.stream()
                    .filter(r -> difficulty.equals(r.getDifficulty()))
                    .toList();
            }
            
            if (targetAudience != null && !targetAudience.trim().isEmpty() && (category == null || category.trim().isEmpty())) {
                resources = resources.stream()
                    .filter(r -> targetAudience.equals(r.getTargetAudience()) || "all".equals(r.getTargetAudience()))
                    .toList();
            }
            
            if (isFree != null && isFree && (category == null || category.trim().isEmpty())) {
                resources = resources.stream()
                    .filter(Resource::isFree)
                    .toList();
            }
            
            Map<String, Object> filtersMap = new java.util.HashMap<>();
            if (category != null) filtersMap.put("category", category);
            if (type != null) filtersMap.put("type", type);
            if (search != null) filtersMap.put("search", search);
            if (difficulty != null) filtersMap.put("difficulty", difficulty);
            if (targetAudience != null) filtersMap.put("targetAudience", targetAudience);
            if (isFree != null) filtersMap.put("isFree", isFree);

            Map<String, Object> response = new java.util.HashMap<>();
            response.put("resources", resources);
            response.put("total", resources.size());
            response.put("filters", filtersMap);

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories(@RequestHeader("X-Auth-Token") String token) {
        try {
            authService.requireUser(token);
            
            List<String> categories = List.of(
                "workshop", "counseling", "career", "study", "wellness"
            );
            
            return ResponseEntity.ok(Map.of("categories", categories));
            
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/types")
    public ResponseEntity<?> getTypes(@RequestHeader("X-Auth-Token") String token) {
        try {
            authService.requireUser(token);
            
            List<String> types = List.of(
                "event", "service", "tool", "article"
            );
            
            return ResponseEntity.ok(Map.of("types", types));
            
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingEvents(@RequestHeader("X-Auth-Token") String token) {
        try {
            authService.requireUser(token);
            
            List<Resource> upcomingEvents = resourceRepo.findUpcomingEvents(LocalDateTime.now());
            
            return ResponseEntity.ok(Map.of(
                "events", upcomingEvents,
                "total", upcomingEvents.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getResourceById(
            @RequestHeader("X-Auth-Token") String token,
            @PathVariable String id) {
        try {
            authService.requireUser(token);
            
            Optional<Resource> resource = resourceRepo.findById(id);
            
            if (resource.isPresent() && resource.get().isActive()) {
                return ResponseEntity.ok(resource.get());
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForResource(
            @RequestHeader("X-Auth-Token") String token,
            @PathVariable String id) {
        try {
            User user = authService.requireUser(token);
            String userId = user.getId();

            ResourceRegistration registration = resourceService.registerForResource(userId, id);

            return ResponseEntity.ok(Map.of(
                "message", "Successfully registered for resource",
                "registration", registration
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }

    @DeleteMapping("/{id}/register")
    public ResponseEntity<?> cancelRegistration(
            @RequestHeader("X-Auth-Token") String token,
            @PathVariable String id) {
        try {
            User user = authService.requireUser(token);
            String userId = user.getId();

            resourceService.cancelRegistration(userId, id);

            return ResponseEntity.ok(Map.of("message", "Registration cancelled successfully"));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }

    @GetMapping("/registrations")
    public ResponseEntity<?> getUserRegistrations(@RequestHeader("X-Auth-Token") String token) {
        try {
            User user = authService.requireUser(token);
            String userId = user.getId();

            List<ResourceRegistration> registrations = resourceService.getUserRegistrations(userId);

            return ResponseEntity.ok(Map.of("registrations", registrations));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/registration-status")
    public ResponseEntity<?> getRegistrationStatus(
            @RequestHeader("X-Auth-Token") String token,
            @PathVariable String id) {
        try {
            User user = authService.requireUser(token);
            String userId = user.getId();

            boolean isRegistered = resourceService.isUserRegistered(userId, id);

            return ResponseEntity.ok(Map.of("isRegistered", isRegistered));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }
}
