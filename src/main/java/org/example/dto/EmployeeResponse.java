package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.entity.Employee;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    private String id;
    private String employeeId;
    private String name;
    private String email;
    private String phone;
    private String username;
    private String role;
    private List<String> skills;
    private String assignedIoTDevice;
    private Employee.EmployeeStatus status;
    private Employee.OnlineStatus onlineStatus;
    private LocalTime shiftStartTime;
    private LocalTime shiftEndTime;
    private Employee.PerformanceMetrics performanceMetrics;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    // Additional runtime data
    private Integer tasksToday;
    private String attendanceStatus;
}

