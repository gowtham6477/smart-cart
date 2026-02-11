package org.example.service;

import org.example.dto.EmployeeRequest;
import org.example.dto.EmployeeResponse;
import org.example.entity.Employee;
import org.example.entity.User;
import org.example.entity.Attendance;
import org.example.entity.Task;
import org.example.repository.EmployeeRepository;
import org.example.repository.UserRepository;
import org.example.repository.AttendanceRepository;
import org.example.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EmployeeResponse getEmployeeById(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return mapToResponse(employee);
    }

    public Employee getEmployeeEntity(String id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    public Employee findByEmail(String email) {
        return employeeRepository.findByEmail(email)
                .orElse(null);
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        log.info("Creating employee with email: {}", request.getEmail());

        // Validate unique fields
        if (employeeRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        // Check for duplicate phone number
        if (userRepository.existsByMobile(request.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        // Create Employee record
        Employee employee = new Employee();
        employee.setEmployeeId(generateEmployeeId());
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setUsername(request.getUsername());
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setRole("Delivery Associate"); // Fixed role
        employee.setSkills(List.of("Product Handling", "Delivery")); // Fixed skills
        employee.setAssignedIoTDevice(request.getAssignedIoTDevice());
        employee.setShiftStartTime(request.getShiftStartTime());
        employee.setShiftEndTime(request.getShiftEndTime());
        employee.setStatus(Employee.EmployeeStatus.ACTIVE);
        employee.setOnlineStatus(Employee.OnlineStatus.OFFLINE);

        employee = employeeRepository.save(employee);
        log.info("Employee saved with ID: {}", employee.getId());

        // Also create User account for login
        User user = new User();
        user.setId(UUID.randomUUID().toString()); // Generate ID explicitly
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setMobile(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.EMPLOYEE);
        user.setActive(true);
        user.setAddress("N/A");
        user.setCity("N/A");
        user.setState("N/A");
        user.setPincode("000000");
        user.setCreatedAt(LocalDateTime.now());

        user = userRepository.save(user);
        log.info("User account created with ID: {} for email: {}", user.getId(), user.getEmail());

        return mapToResponse(employee);
    }

    @Transactional
    public EmployeeResponse updateEmployee(String id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Store values before using in lambdas (must be final or effectively final)
        final String employeeId = id;
        final String currentEmployeeEmail = employee.getEmail();
        final String currentEmployeeUsername = employee.getUsername();
        final String currentEmployeePhone = employee.getPhone();

        // Check if email is being changed and if new email already exists
        if (request.getEmail() != null && !request.getEmail().equals(currentEmployeeEmail)) {
            // Check if another employee has this email
            employeeRepository.findByEmail(request.getEmail()).ifPresent(existingEmployee -> {
                if (!existingEmployee.getId().equals(employeeId)) {
                    throw new RuntimeException("Email already exists");
                }
            });
            // Check if a user has this email
            userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
                // Allow if it's the same employee's user account
                if (!existingUser.getEmail().equals(currentEmployeeEmail)) {
                    throw new RuntimeException("Email already registered");
                }
            });
        }

        // Check if username is being changed and if new username already exists
        if (request.getUsername() != null && !request.getUsername().equals(currentEmployeeUsername)) {
            // Check if another employee has this username
            employeeRepository.findByUsername(request.getUsername()).ifPresent(existingEmployee -> {
                if (!existingEmployee.getId().equals(employeeId)) {
                    throw new RuntimeException("Username already exists");
                }
            });
        }

        // Check if phone is being changed and if new phone already exists
        if (request.getPhone() != null && !request.getPhone().equals(currentEmployeePhone)) {
            // Check if another user has this phone
            userRepository.findByMobile(request.getPhone()).ifPresent(existingUser -> {
                // Allow if it's the same employee's user account
                if (!existingUser.getEmail().equals(currentEmployeeEmail)) {
                    throw new RuntimeException("Phone number already registered");
                }
            });
        }

        // Store old email for user account update
        String oldEmail = currentEmployeeEmail;

        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setRole(request.getRole());
        employee.setSkills(request.getSkills());
        employee.setAssignedIoTDevice(request.getAssignedIoTDevice());
        employee.setShiftStartTime(request.getShiftStartTime());
        employee.setShiftEndTime(request.getShiftEndTime());

        // Update password only if provided
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            employee.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        employee = employeeRepository.save(employee);

        // Update associated user account if email or phone changed
        if (!oldEmail.equals(request.getEmail()) || !employee.getPhone().equals(request.getPhone())) {
            userRepository.findByEmail(oldEmail).ifPresent(user -> {
                user.setEmail(request.getEmail());
                user.setMobile(request.getPhone());
                user.setName(request.getName());
                if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                    user.setPassword(passwordEncoder.encode(request.getPassword()));
                }
                userRepository.save(user);
                log.info("Updated user account for employee: {} -> {}", oldEmail, request.getEmail());
            });
        }

        return mapToResponse(employee);
    }

    @Transactional
    public void toggleEmployeeStatus(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (employee.getStatus() == Employee.EmployeeStatus.ACTIVE) {
            employee.setStatus(Employee.EmployeeStatus.SUSPENDED);
        } else {
            employee.setStatus(Employee.EmployeeStatus.ACTIVE);
        }

        employeeRepository.save(employee);
    }

    @Transactional
    public void updateOnlineStatus(String id, Employee.OnlineStatus status) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setOnlineStatus(status);
        if (status == Employee.OnlineStatus.ONLINE) {
            employee.setLastLoginAt(LocalDateTime.now());
        }

        employeeRepository.save(employee);
    }

    @Transactional
    public void deleteEmployee(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Delete associated user account
        userRepository.findByEmail(employee.getEmail()).ifPresent(userRepository::delete);

        // Delete employee record
        employeeRepository.deleteById(id);

        log.info("Deleted employee {} and associated user account", employee.getEmail());
    }

    @Transactional
    public void resetPassword(String id, String newPassword) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        String encodedPassword = passwordEncoder.encode(newPassword);

        // Update password in employee record
        employee.setPassword(encodedPassword);
        employeeRepository.save(employee);

        // Update password in user account
        userRepository.findByEmail(employee.getEmail()).ifPresent(user -> {
            user.setPassword(encodedPassword);
            userRepository.save(user);
        });

        log.info("Password reset for employee: {}", employee.getEmail());
    }

    private EmployeeResponse mapToResponse(Employee employee) {
        EmployeeResponse response = new EmployeeResponse();
        response.setId(employee.getId());
        response.setEmployeeId(employee.getEmployeeId());
        response.setName(employee.getName());
        response.setEmail(employee.getEmail());
        response.setPhone(employee.getPhone());
        response.setUsername(employee.getUsername());
        response.setRole(employee.getRole());
        response.setSkills(employee.getSkills());
        response.setAssignedIoTDevice(employee.getAssignedIoTDevice());
        response.setStatus(employee.getStatus());
        response.setOnlineStatus(employee.getOnlineStatus());
        response.setShiftStartTime(employee.getShiftStartTime());
        response.setShiftEndTime(employee.getShiftEndTime());
        response.setPerformanceMetrics(employee.getPerformanceMetrics());
        response.setCreatedAt(employee.getCreatedAt());
        response.setLastLoginAt(employee.getLastLoginAt());

        // Add runtime data
        LocalDate today = LocalDate.now();
        response.setTasksToday(getTasksTodayCount(employee.getId()));
        response.setAttendanceStatus(getTodayAttendanceStatus(employee.getId(), today));

        return response;
    }

    private Integer getTasksTodayCount(String employeeId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        List<Task> tasks = taskRepository.findByAssignedToAndAssignedAtBetween(
                employeeId, startOfDay, endOfDay);
        return tasks.size();
    }

    private String getTodayAttendanceStatus(String employeeId, LocalDate date) {
        return attendanceRepository.findByEmployeeIdAndDate(employeeId, date)
                .map(att -> att.getStatus().toString())
                .orElse("ABSENT");
    }

    private String generateEmployeeId() {
        Random random = new Random();
        String id;
        do {
            int number = 10000 + random.nextInt(90000); // 5-digit number
            id = "EMP-" + String.format("%05d", number);
        } while (employeeRepository.findByEmployeeId(id).isPresent());
        return id;
    }

    public String generateUsername(String name) {
        String baseUsername = name.toLowerCase().replaceAll("\\s+", ".");
        String username = baseUsername;
        int counter = 1;

        while (employeeRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }
}

