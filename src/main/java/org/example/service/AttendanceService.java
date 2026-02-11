package org.example.service;

import org.example.dto.AttendanceResponse;
import org.example.entity.Attendance;
import org.example.entity.Employee;
import org.example.repository.AttendanceRepository;
import org.example.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Transactional
    public AttendanceResponse checkIn(String employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        // Get or create attendance record for today
        Optional<Attendance> existingAttendance =
                attendanceRepository.findByEmployeeIdAndDate(employeeId, today);

        Attendance attendance;

        if (existingAttendance.isPresent()) {
            attendance = existingAttendance.get();

            // Check if already checked in (not checked out from last session)
            if (attendance.getIsCurrentlyCheckedIn()) {
                throw new RuntimeException("Already checked in. Please check out first before checking in again.");
            }

            // Create new session
            Attendance.CheckInOutSession session = new Attendance.CheckInOutSession();
            session.setCheckInTime(now);
            attendance.getSessions().add(session);
            attendance.setIsCurrentlyCheckedIn(true);

        } else {
            // Create new attendance record for today
            attendance = new Attendance();
            attendance.setEmployeeId(employeeId);
            attendance.setEmployeeName(employee.getName());
            attendance.setDate(today);
            attendance.setCheckInTime(now); // First check-in time
            attendance.setIsCurrentlyCheckedIn(true);
            attendance.setStatus(Attendance.AttendanceStatus.PRESENT);

            // Initialize sessions list
            List<Attendance.CheckInOutSession> sessions = new ArrayList<>();
            Attendance.CheckInOutSession session = new Attendance.CheckInOutSession();
            session.setCheckInTime(now);
            sessions.add(session);
            attendance.setSessions(sessions);
        }

        // Update employee online status
        employee.setOnlineStatus(Employee.OnlineStatus.ONLINE);
        employeeRepository.save(employee);

        Attendance saved = attendanceRepository.save(attendance);
        return convertToResponse(saved, employee);
    }

    @Transactional
    public AttendanceResponse checkOut(String employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        Attendance attendance = attendanceRepository
                .findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new RuntimeException("No check-in record found for today"));

        if (!attendance.getIsCurrentlyCheckedIn()) {
            throw new RuntimeException("Not currently checked in. Please check in first.");
        }

        // Find the last session and set checkout time
        List<Attendance.CheckInOutSession> sessions = attendance.getSessions();
        if (sessions != null && !sessions.isEmpty()) {
            Attendance.CheckInOutSession lastSession = sessions.get(sessions.size() - 1);
            if (lastSession.getCheckOutTime() == null) {
                lastSession.setCheckOutTime(now);

                // Calculate duration in minutes
                Duration duration = Duration.between(lastSession.getCheckInTime(), now);
                lastSession.setDurationMinutes(duration.toMinutes());
            }
        }

        attendance.setCheckOutTime(now); // Latest checkout time
        attendance.setIsCurrentlyCheckedIn(false);

        // Update employee online status
        employee.setOnlineStatus(Employee.OnlineStatus.OFFLINE);
        employeeRepository.save(employee);

        Attendance saved = attendanceRepository.save(attendance);
        return convertToResponse(saved, employee);
    }

    public AttendanceResponse getTodayAttendance(String employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        LocalDate today = LocalDate.now();
        Optional<Attendance> attendance =
                attendanceRepository.findByEmployeeIdAndDate(employeeId, today);

        return attendance.map(a -> convertToResponse(a, employee))
                .orElse(null);
    }

    /**
     * Check if employee is currently checked in
     */
    public boolean isEmployeeCheckedIn(String employeeId) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);
        return attendance.map(Attendance::getIsCurrentlyCheckedIn).orElse(false);
    }

    public List<AttendanceResponse> getEmployeeAttendance(String employeeId, LocalDate startDate, LocalDate endDate) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        List<Attendance> attendances =
                attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate);

        return attendances.stream()
                .map(a -> convertToResponse(a, employee))
                .collect(Collectors.toList());
    }

    public List<AttendanceResponse> getAllAttendance(LocalDate date) {
        List<Attendance> attendances = attendanceRepository.findByDate(date);

        return attendances.stream()
                .map(a -> {
                    Employee emp = employeeRepository.findById(a.getEmployeeId()).orElse(null);
                    return convertToResponse(a, emp);
                })
                .collect(Collectors.toList());
    }

    private AttendanceResponse convertToResponse(Attendance attendance, Employee employee) {
        AttendanceResponse response = new AttendanceResponse();
        response.setId(attendance.getId());
        response.setEmployeeId(attendance.getEmployeeId());
        response.setAttendanceDate(attendance.getDate());
        response.setCheckInTime(attendance.getCheckInTime());
        response.setCheckOutTime(attendance.getCheckOutTime());
        response.setPresent(attendance.getStatus() == Attendance.AttendanceStatus.PRESENT);
        response.setStatus(attendance.getStatus());
        response.setNotes(attendance.getNotes());
        response.setIsCurrentlyCheckedIn(attendance.getIsCurrentlyCheckedIn());

        if (employee != null) {
            response.setEmployeeName(employee.getName());
        }

        // Calculate total hours worked from all sessions
        if (attendance.getSessions() != null && !attendance.getSessions().isEmpty()) {
            long totalMinutes = attendance.getSessions().stream()
                    .filter(s -> s.getDurationMinutes() != null)
                    .mapToLong(Attendance.CheckInOutSession::getDurationMinutes)
                    .sum();
            response.setHoursWorked(totalMinutes / 60.0);
        }

        return response;
    }
}

