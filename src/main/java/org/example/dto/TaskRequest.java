package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.entity.Task;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {
    private String title;
    private String description;
    private String orderId;
    private Task.TaskPriority priority;
    private LocalDateTime dueDate;
    private String notes;
    private String assignedBy;
}

