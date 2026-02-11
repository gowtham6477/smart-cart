package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    private String id;

    @Indexed(unique = true)
    private String employeeId; // Auto-generated EMP-XXXXX

    private String name;

    @Indexed(unique = true)
    private String email;

    private String phone;

    @Indexed(unique = true)
    private String username;

    private String password; // Hashed

    private String role; // EMPLOYEE, SUPERVISOR, etc.

    private List<String> skills = new ArrayList<>(); // Skill categories

    private String assignedIoTDevice; // IoT device ID (optional)

    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    private OnlineStatus onlineStatus = OnlineStatus.OFFLINE;

    private LocalTime shiftStartTime;
    private LocalTime shiftEndTime;

    private PerformanceMetrics performanceMetrics = new PerformanceMetrics();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime lastLoginAt;

    public enum EmployeeStatus {
        ACTIVE,
        SUSPENDED,
        INACTIVE
    }

    public enum OnlineStatus {
        ONLINE,
        OFFLINE,
        AWAY
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceMetrics {
        private Integer totalTasksAssigned = 0;
        private Integer tasksCompleted = 0;
        private Integer tasksFailed = 0;
        private Integer incidentCount = 0;
        private Double averageHandlingTime = 0.0; // in minutes
        private Double completionRate = 0.0; // percentage
        private Double reliabilityScore = 100.0; // 0-100
    }
}

