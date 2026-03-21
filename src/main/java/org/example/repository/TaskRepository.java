package org.example.repository;

import org.example.entity.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByAssignedTo(String employeeId);
    List<Task> findByAssignedToAndStatus(String employeeId, Task.TaskStatus status);
    List<Task> findByStatus(Task.TaskStatus status);
    List<Task> findByAssignedToAndAssignedAtBetween(String employeeId, LocalDateTime start, LocalDateTime end);
    List<Task> findByIsLocked(Boolean isLocked);
    Long countByAssignedToAndStatus(String employeeId, Task.TaskStatus status);
    List<Task> findByOrderId(String orderId);
}

