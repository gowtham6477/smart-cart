package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "attendance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    private String id;

    @Indexed
    private String employeeId;

    private String employeeName;

    @Indexed
    private LocalDate date;

    private LocalDateTime checkInTime;

    private LocalDateTime checkOutTime;

    // Support multiple check-in/check-out sessions in a day
    private List<CheckInOutSession> sessions = new ArrayList<>();

    // Current session status
    private Boolean isCurrentlyCheckedIn = false;

    private AttendanceStatus status = AttendanceStatus.PRESENT;

    private Boolean isLate = false;

    private String notes; // Admin can add notes

    private String adjustedBy; // Admin who made manual adjustments

    private LocalDateTime adjustedAt;

    public enum AttendanceStatus {
        PRESENT,
        ABSENT,
        LATE,
        HALF_DAY,
        LEAVE
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckInOutSession {
        private LocalDateTime checkInTime;
        private LocalDateTime checkOutTime;
        private Long durationMinutes; // Calculated on checkout
    }
}

