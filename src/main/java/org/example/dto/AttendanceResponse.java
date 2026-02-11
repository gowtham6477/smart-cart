package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.entity.Attendance;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {
    private String id;
    private String employeeId;
    private LocalDate attendanceDate;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private Boolean present;
    private Attendance.AttendanceStatus status;
    private String notes;

    // Additional fields
    private String employeeName;
    private Double hoursWorked;
    private Boolean isCurrentlyCheckedIn;
}

