package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "employee_attendance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(name = "employee_date_idx", def = "{'employeeId': 1, 'attendanceDate': 1}", unique = true)
public class EmployeeAttendance {

    @Id
    private String id;

    @Indexed
    private String employeeId;

    @Indexed
    private LocalDate attendanceDate;

    private LocalDateTime checkInTime;

    private LocalDateTime checkOutTime;

    private Boolean present = false;

    private AttendanceStatus status;

    private String notes;

    @CreatedDate
    private LocalDateTime createdAt;

    public enum AttendanceStatus {
        PRESENT,
        ABSENT,
        HALF_DAY,
        LEAVE
    }
}

