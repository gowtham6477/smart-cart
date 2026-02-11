package org.example.repository;

import org.example.entity.Service;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends MongoRepository<Service, String> {

    List<Service> findByActiveTrue();
    
    // Include products where active is true OR active field is null (legacy data)
    @Query("{ $or: [ { 'active': true }, { 'active': { $exists: false } }, { 'active': null } ] }")
    List<Service> findAllActiveOrNull();

    List<Service> findByCategory(String category);

    List<Service> findByCategoryAndActiveTrue(String category, Boolean active);
    
    // Include category products where active is true OR null
    @Query("{ 'category': ?0, $or: [ { 'active': true }, { 'active': { $exists: false } }, { 'active': null } ] }")
    List<Service> findByCategoryActiveOrNull(String category);

    List<Service> findByNameContainingIgnoreCase(String name);
}

