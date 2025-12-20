package org.example.service;

import org.example.entity.Booking;
import org.example.entity.EmployeeAttendance;
import org.example.entity.User;
import org.example.repository.BookingRepository;
import org.example.repository.EmployeeAttendanceRepository;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmployeeService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EmployeeAttendanceRepository attendanceRepository;

    public List<User> getAllEmployees() {
        return userRepository.findByRole(User.Role.EMPLOYEE);
    }

    public List<User> getActiveEmployees() {
        return userRepository.findByRoleAndActive(User.Role.EMPLOYEE, true);
    }

    public User getEmployeeById(String employeeId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getRole().equals(User.Role.EMPLOYEE)) {
            throw new RuntimeException("User is not an employee");
        }

        return employee;
    }

    public List<Booking> getEmployeeBookings(String employeeId) {
        return bookingRepository.findByEmployeeId(employeeId);
    }

    public List<Booking> getEmployeeBookingsByStatus(String employeeId, Booking.BookingStatus status) {
        return bookingRepository.findByEmployeeIdAndStatus(employeeId, status);
    }

    @Transactional
    public User createEmployee(User employee) {
        if (userRepository.existsByEmail(employee.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        if (userRepository.existsByMobile(employee.getMobile())) {
            throw new RuntimeException("Mobile number already registered");
        }

        employee.setRole(User.Role.EMPLOYEE);
        employee.setActive(true);
        return userRepository.save(employee);
    }

    @Transactional
    public User updateEmployee(String employeeId, User employeeDetails) {
        User employee = getEmployeeById(employeeId);

        if (employeeDetails.getName() != null) {
            employee.setName(employeeDetails.getName());
        }
        if (employeeDetails.getMobile() != null) {
            employee.setMobile(employeeDetails.getMobile());
        }
        if (employeeDetails.getAddress() != null) {
            employee.setAddress(employeeDetails.getAddress());
        }
        if (employeeDetails.getCity() != null) {
            employee.setCity(employeeDetails.getCity());
        }
        if (employeeDetails.getState() != null) {
            employee.setState(employeeDetails.getState());
        }
        if (employeeDetails.getPincode() != null) {
            employee.setPincode(employeeDetails.getPincode());
        }

        return userRepository.save(employee);
    }

    @Transactional
    public void deactivateEmployee(String employeeId) {
        User employee = getEmployeeById(employeeId);
        employee.setActive(false);
        userRepository.save(employee);
    }

    @Transactional
    public EmployeeAttendance markAttendance(String employeeId) {
        User employee = getEmployeeById(employeeId);
        LocalDate today = LocalDate.now();

        // Check if attendance already marked
        var existing = attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, today);
        if (existing.isPresent()) {
            return existing.get();
        }

        EmployeeAttendance attendance = new EmployeeAttendance();
        attendance.setEmployeeId(employee.getId());
        attendance.setAttendanceDate(today);
        attendance.setCheckInTime(LocalDateTime.now());
        attendance.setPresent(true);
        attendance.setStatus(EmployeeAttendance.AttendanceStatus.PRESENT);

        return attendanceRepository.save(attendance);
    }

    @Transactional
    public EmployeeAttendance markCheckOut(String employeeId) {
        LocalDate today = LocalDate.now();

        EmployeeAttendance attendance = attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, today)
                .orElseThrow(() -> new RuntimeException("No check-in found for today"));

        attendance.setCheckOutTime(LocalDateTime.now());
        return attendanceRepository.save(attendance);
    }

    public List<EmployeeAttendance> getEmployeeAttendance(String employeeId,
                                                          LocalDate startDate,
                                                          LocalDate endDate) {
        return attendanceRepository.findByEmployeeIdAndAttendanceDateBetween(employeeId, startDate, endDate);
    }

    public List<EmployeeAttendance> getTodayAttendance() {
        return attendanceRepository.findByAttendanceDate(LocalDate.now());
    }
}

