package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    private String id;

    @Indexed
    private String taskNumber; // Auto-generated TASK-XXXXX

    private String title;

    private String description;

    @Indexed
    private String assignedTo; // Employee ID

    private String assignedToName;

    private String orderId; // Related order

    @Indexed
    private String bookingId; // Related booking

    private TaskPriority priority = TaskPriority.MEDIUM;

    private TaskStatus status = TaskStatus.PENDING;

    private LocalDateTime assignedAt;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private LocalDateTime dueDate;

    private String assignedBy; // Admin who assigned

    private String notes;

    private Boolean isLocked = false; // Locked due to incident

    private String lockReason;

    @CreatedDate
    private LocalDateTime createdAt;

    public enum TaskPriority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT
    }

    public enum TaskStatus {
        PENDING,
        ASSIGNED,
        IN_PROGRESS,
        COMPLETED,
        FAILED,
        REASSIGNED,
        CANCELLED
    }
}

