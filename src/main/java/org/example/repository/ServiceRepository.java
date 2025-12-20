package org.example.repository;

import org.example.entity.Service;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends MongoRepository<Service, String> {

    List<Service> findByActiveTrue();

    List<Service> findByCategory(String category);

    List<Service> findByCategoryAndActiveTrue(String category, Boolean active);

    List<Service> findByNameContainingIgnoreCase(String name);
}

