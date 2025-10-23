package com.unibutler.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.unibutler.model.ResourceRegistration;

public interface ResourceRegistrationRepo extends MongoRepository<ResourceRegistration, String> {

    // Find registrations by user
    List<ResourceRegistration> findByUserId(String userId);

    // Find registrations by resource
    List<ResourceRegistration> findByResourceId(String resourceId);

    // Find active registration for user and resource
    Optional<ResourceRegistration> findByUserIdAndResourceIdAndStatus(String userId, String resourceId, String status);

    // Find all registrations for a resource with specific status
    List<ResourceRegistration> findByResourceIdAndStatus(String resourceId, String status);

    // Count registrations for a resource
    long countByResourceIdAndStatus(String resourceId, String status);
}
