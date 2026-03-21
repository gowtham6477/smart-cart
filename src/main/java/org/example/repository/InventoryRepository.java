package org.example.repository;

import org.example.entity.InventoryItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends MongoRepository<InventoryItem, String> {
    Optional<InventoryItem> findByServiceId(String serviceId);
}
