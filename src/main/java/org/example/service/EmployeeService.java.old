package org.example.service;

import org.example.entity.EmployeeAttendance;
import org.example.entity.User;
import org.example.repository.EmployeeAttendanceRepository;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private EmployeeAttendanceRepository attendanceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllEmployees() {
        return userRepository.findByRole(User.Role.EMPLOYEE);
    }

    public List<User> getActiveEmployees() {
        return userRepository.findByRoleAndActive(User.Role.EMPLOYEE, true);
    }

    public User getEmployeeById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (user.getRole() != User.Role.EMPLOYEE) {
            throw new RuntimeException("User is not an employee");
        }

        return user;
    }

    @Transactional
    public User createEmployee(User employeeData) {
        if (userRepository.existsByEmail(employeeData.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (userRepository.existsByMobile(employeeData.getMobile())) {
            throw new RuntimeException("Mobile number already exists");
        }

        employeeData.setRole(User.Role.EMPLOYEE);
        employeeData.setPassword(passwordEncoder.encode(employeeData.getPassword()));
        employeeData.setActive(true);

        return userRepository.save(employeeData);
    }

    @Transactional
    public User updateEmployee(Long id, User employeeData) {
        User employee = getEmployeeById(id);

        employee.setName(employeeData.getName());
        employee.setMobile(employeeData.getMobile());
        employee.setAddress(employeeData.getAddress());
        employee.setCity(employeeData.getCity());
        employee.setState(employeeData.getState());
        employee.setPincode(employeeData.getPincode());
        employee.setActive(employeeData.getActive());

        return userRepository.save(employee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        User employee = getEmployeeById(id);
        employee.setActive(false);
        userRepository.save(employee);
    }

    @Transactional
    public EmployeeAttendance markAttendance(Long employeeId) {
        User employee = getEmployeeById(employeeId);
        LocalDate today = LocalDate.now();

        // Check if already marked
        EmployeeAttendance existing = attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employeeId, today)
                .orElse(null);

        if (existing != null) {
            return existing;
        }

        EmployeeAttendance attendance = new EmployeeAttendance();
        attendance.setEmployee(employee);
        attendance.setAttendanceDate(today);
        attendance.setCheckInTime(LocalDateTime.now());
        attendance.setPresent(true);

        return attendanceRepository.save(attendance);
    }

    @Transactional
    public EmployeeAttendance markCheckOut(Long employeeId) {
        LocalDate today = LocalDate.now();

        EmployeeAttendance attendance = attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employeeId, today)
                .orElseThrow(() -> new RuntimeException("No check-in found for today"));

        attendance.setCheckOutTime(LocalDateTime.now());
        return attendanceRepository.save(attendance);
    }

    public List<EmployeeAttendance> getEmployeeAttendance(Long employeeId,
                                                          LocalDate startDate,
                                                          LocalDate endDate) {
        return attendanceRepository.findByEmployeeIdAndAttendanceDateBetween(
                employeeId, startDate, endDate);
    }

    public List<EmployeeAttendance> getTodayAttendance() {
        return attendanceRepository.findByAttendanceDate(LocalDate.now());
    }
}

