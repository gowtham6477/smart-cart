package org.example.repository;

import org.example.entity.ReplacementPolicy;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReplacementPolicyRepository extends MongoRepository<ReplacementPolicy, String> {
}
