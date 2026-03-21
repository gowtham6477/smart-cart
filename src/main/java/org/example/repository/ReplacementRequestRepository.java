package org.example.repository;

import org.example.entity.ReplacementRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReplacementRequestRepository extends MongoRepository<ReplacementRequest, String> {
    List<ReplacementRequest> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);
    List<ReplacementRequest> findByStatusOrderByCreatedAtDesc(ReplacementRequest.Status status);
    List<ReplacementRequest> findAllByOrderByCreatedAtDesc();
}
