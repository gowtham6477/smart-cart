package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.entity.Task;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private String id;
    private String taskNumber;
    private String title;
    private String description;
    private String assignedTo;
    private String assignedToName;
    private String orderId;
    private String bookingId;
    private Task.TaskPriority priority;
    private Task.TaskStatus status;
    private LocalDateTime assignedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime dueDate;
    private String assignedBy;
    private String notes;
    private Boolean isLocked;
    private String lockReason;
    private LocalDateTime createdAt;

    // Related booking/order details
    private String customerName;
    private String customerMobile;
    private String customerEmail;
    private String serviceName;
    private String address;
    private String city;
    private String state;
    private String pincode;

    // Images
    private List<String> beforeImages;
    private List<String> afterImages;
}

