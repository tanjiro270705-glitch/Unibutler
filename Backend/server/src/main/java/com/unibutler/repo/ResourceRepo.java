package com.unibutler.repo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.unibutler.model.Resource;

public interface ResourceRepo extends MongoRepository<Resource, String> {
    
    // Find active resources
    List<Resource> findByIsActiveTrueOrderByStartTimeAsc();
    
    // Find by category
    List<Resource> findByCategoryAndIsActiveTrueOrderByStartTimeAsc(String category);
    
    // Find by type
    List<Resource> findByTypeAndIsActiveTrueOrderByStartTimeAsc(String type);
    
    // Find upcoming events (start time in future)
    @Query("{'isActive': true, 'startTime': {$gte: ?0}}")
    List<Resource> findUpcomingEvents(LocalDateTime now);
    
    // Find by multiple categories
    @Query("{'category': {$in: ?0}, 'isActive': true}")
    List<Resource> findByCategoriesAndIsActiveTrue(List<String> categories);
    
    // Search by title or description
    @Query("{'$or': [{'title': {$regex: ?0, $options: 'i'}}, {'description': {$regex: ?0, $options: 'i'}}], 'isActive': true}")
    List<Resource> searchByTitleOrDescription(String searchTerm);
    
    // Find free resources
    List<Resource> findByIsFreeTrueAndIsActiveTrueOrderByStartTimeAsc();
    
    // Find by difficulty level
    List<Resource> findByDifficultyAndIsActiveTrueOrderByStartTimeAsc(String difficulty);
    
    // Find by target audience
    List<Resource> findByTargetAudienceAndIsActiveTrueOrderByStartTimeAsc(String targetAudience);
    
    // Find resources with available spots
    @Query("{'isActive': true, 'maxParticipants': {$gt: 'currentParticipants'}}")
    List<Resource> findAvailableResources();

    // Find resources where user is registered (requires join with ResourceRegistration)
    // This would need to be implemented differently in MongoDB
}
