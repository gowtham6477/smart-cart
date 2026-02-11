package org.example.service;

import org.example.dto.TaskRequest;
import org.example.dto.TaskResponse;
import org.example.entity.Task;
import org.example.entity.Employee;
import org.example.entity.Attendance;
import org.example.entity.Order;
import org.example.repository.TaskRepository;
import org.example.repository.EmployeeRepository;
import org.example.repository.AttendanceRepository;
import org.example.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private WalletService walletService;

    @Lazy
    @Autowired
    private OrderService orderService;

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTaskById(String id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    public List<Task> getTasksByEmployee(String employeeId) {
        return taskRepository.findByAssignedTo(employeeId);
    }

    public List<Task> getTasksByEmployeeAndStatus(String employeeId, Task.TaskStatus status) {
        return taskRepository.findByAssignedToAndStatus(employeeId, status);
    }

    @Transactional
    public Task createTask(TaskRequest request) {
        Task task = new Task();
        task.setTaskNumber(generateTaskNumber());
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setOrderId(request.getOrderId());
        task.setPriority(request.getPriority() != null ? request.getPriority() : Task.TaskPriority.MEDIUM);
        task.setStatus(Task.TaskStatus.PENDING);
        task.setDueDate(request.getDueDate());
        task.setNotes(request.getNotes());
        task.setAssignedBy(request.getAssignedBy());

        return taskRepository.save(task);
    }

    @Transactional
    public Task saveTask(Task task) {
        return taskRepository.save(task);
    }

    @Transactional
    public Task assignTaskToEmployee(String taskId, String employeeId, String assignedBy) {
        Task task = getTaskById(taskId);
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        task.setAssignedTo(employeeId);
        task.setAssignedToName(employee.getName());
        task.setAssignedBy(assignedBy);
        task.setAssignedAt(LocalDateTime.now());
        task.setStatus(Task.TaskStatus.ASSIGNED);

        // Update employee performance metrics
        Employee.PerformanceMetrics metrics = employee.getPerformanceMetrics();
        if (metrics == null) {
            metrics = new Employee.PerformanceMetrics();
        }
        metrics.setTotalTasksAssigned(metrics.getTotalTasksAssigned() + 1);
        employee.setPerformanceMetrics(metrics);
        employeeRepository.save(employee);

        return taskRepository.save(task);
    }

    @Transactional
    public List<Task> bulkAssignTasks(List<String> taskIds, String employeeId, String assignedBy) {
        List<Task> assignedTasks = new ArrayList<>();

        for (String taskId : taskIds) {
            try {
                Task task = assignTaskToEmployee(taskId, employeeId, assignedBy);
                assignedTasks.add(task);
            } catch (Exception e) {
                // Log error but continue with other tasks
                System.err.println("Failed to assign task " + taskId + ": " + e.getMessage());
            }
        }

        return assignedTasks;
    }

    @Transactional
    public Task updateTaskStatus(String taskId, Task.TaskStatus status) {
        Task task = getTaskById(taskId);
        Task.TaskStatus oldStatus = task.getStatus();

        task.setStatus(status);

        if (status == Task.TaskStatus.IN_PROGRESS && task.getStartedAt() == null) {
            task.setStartedAt(LocalDateTime.now());

            // Update order status when task starts (employee checks in and starts task)
            if (task.getOrderId() != null) {
                orderRepository.findById(task.getOrderId()).ifPresent(order -> {
                    if (order.getStatus() == Order.OrderStatus.ASSIGNED) {
                        order.setStatus(Order.OrderStatus.PROCESSING);
                        orderRepository.save(order);
                    }
                });
            }
        } else if (status == Task.TaskStatus.COMPLETED && task.getCompletedAt() == null) {
            task.setCompletedAt(LocalDateTime.now());
            updateEmployeeMetricsOnCompletion(task, true);

            // Update order status to DELIVERED when task is completed
            if (task.getOrderId() != null) {
                orderService.updateOrderStatusOnTaskComplete(task.getOrderId());
            }
        } else if (status == Task.TaskStatus.FAILED && task.getCompletedAt() == null) {
            task.setCompletedAt(LocalDateTime.now());
            updateEmployeeMetricsOnCompletion(task, false);
        }

        return taskRepository.save(task);
    }

    @Transactional
    public Task updateTask(String taskId, TaskRequest request) {
        Task task = getTaskById(taskId);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setNotes(request.getNotes());

        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(String taskId) {
        taskRepository.deleteById(taskId);
    }

    // Smart Recommendations
    public List<EmployeeRecommendation> getRecommendedEmployees(String taskId) {
        Task task = getTaskById(taskId);
        List<Employee> allEmployees = employeeRepository.findByStatus(Employee.EmployeeStatus.ACTIVE);

        List<EmployeeRecommendation> recommendations = new ArrayList<>();

        for (Employee employee : allEmployees) {
            double score = calculateEmployeeScore(employee, task);
            recommendations.add(new EmployeeRecommendation(
                employee.getId(),
                employee.getName(),
                employee.getEmployeeId(),
                score,
                getAvailabilityReason(employee),
                getWorkloadReason(employee),
                getPerformanceReason(employee)
            ));
        }

        // Sort by score (highest first)
        recommendations.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        return recommendations.stream().limit(5).collect(Collectors.toList());
    }

    private double calculateEmployeeScore(Employee employee, Task task) {
        double score = 0.0;

        // 1. Availability Score (40% weight)
        double availabilityScore = calculateAvailabilityScore(employee);
        score += availabilityScore * 0.4;

        // 2. Workload Score (30% weight)
        double workloadScore = calculateWorkloadScore(employee);
        score += workloadScore * 0.3;

        // 3. Performance Score (30% weight)
        double performanceScore = calculatePerformanceScore(employee);
        score += performanceScore * 0.3;

        return score;
    }

    private double calculateAvailabilityScore(Employee employee) {
        // Check if employee is online
        if (employee.getOnlineStatus() == Employee.OnlineStatus.OFFLINE) {
            return 0.0;
        }

        // Check attendance today
        LocalDate today = LocalDate.now();
        Optional<Attendance> todayAttendance = attendanceRepository
                .findByEmployeeIdAndDate(employee.getId(), today);

        if (todayAttendance.isEmpty() ||
            todayAttendance.get().getStatus() == Attendance.AttendanceStatus.ABSENT) {
            return 0.0;
        }

        // Full score if online and present
        return 100.0;
    }

    private double calculateWorkloadScore(Employee employee) {
        // Get active tasks
        List<Task> activeTasks = taskRepository.findByAssignedToAndStatus(
            employee.getId(), Task.TaskStatus.IN_PROGRESS);
        List<Task> assignedTasks = taskRepository.findByAssignedToAndStatus(
            employee.getId(), Task.TaskStatus.ASSIGNED);

        int totalActive = activeTasks.size() + assignedTasks.size();

        // Score based on workload (fewer tasks = higher score)
        if (totalActive == 0) return 100.0;
        if (totalActive == 1) return 80.0;
        if (totalActive == 2) return 60.0;
        if (totalActive == 3) return 40.0;
        if (totalActive == 4) return 20.0;
        return 10.0;
    }

    private double calculatePerformanceScore(Employee employee) {
        Employee.PerformanceMetrics metrics = employee.getPerformanceMetrics();
        if (metrics == null) {
            return 50.0; // Neutral score for new employees
        }

        // Use reliability score directly
        return metrics.getReliabilityScore() != null ?
               metrics.getReliabilityScore() : 50.0;
    }

    private String getAvailabilityReason(Employee employee) {
        if (employee.getOnlineStatus() == Employee.OnlineStatus.ONLINE) {
            return "Online and available";
        } else if (employee.getOnlineStatus() == Employee.OnlineStatus.AWAY) {
            return "Currently away";
        } else {
            return "Offline";
        }
    }

    private String getWorkloadReason(Employee employee) {
        List<Task> activeTasks = taskRepository.findByAssignedToAndStatus(
            employee.getId(), Task.TaskStatus.IN_PROGRESS);
        List<Task> assignedTasks = taskRepository.findByAssignedToAndStatus(
            employee.getId(), Task.TaskStatus.ASSIGNED);

        int total = activeTasks.size() + assignedTasks.size();

        if (total == 0) return "No active tasks";
        if (total == 1) return "1 active task - Light workload";
        if (total == 2) return "2 active tasks - Moderate workload";
        return total + " active tasks - Heavy workload";
    }

    private String getPerformanceReason(Employee employee) {
        Employee.PerformanceMetrics metrics = employee.getPerformanceMetrics();
        if (metrics == null || metrics.getTotalTasksAssigned() == 0) {
            return "New employee - No history";
        }

        double completionRate = metrics.getCompletionRate();
        if (completionRate >= 90) return "Excellent completion rate: " + String.format("%.1f%%", completionRate);
        if (completionRate >= 75) return "Good completion rate: " + String.format("%.1f%%", completionRate);
        if (completionRate >= 60) return "Average completion rate: " + String.format("%.1f%%", completionRate);
        return "Below average completion rate: " + String.format("%.1f%%", completionRate);
    }

    private void updateEmployeeMetricsOnCompletion(Task task, boolean isSuccess) {
        if (task.getAssignedTo() == null) return;

        Employee employee = employeeRepository.findById(task.getAssignedTo()).orElse(null);
        if (employee == null) return;

        Employee.PerformanceMetrics metrics = employee.getPerformanceMetrics();
        if (metrics == null) {
            metrics = new Employee.PerformanceMetrics();
        }

        if (isSuccess) {
            metrics.setTasksCompleted(metrics.getTasksCompleted() + 1);
        } else {
            metrics.setTasksFailed(metrics.getTasksFailed() + 1);
        }

        // Recalculate completion rate
        int total = metrics.getTasksCompleted() + metrics.getTasksFailed();
        if (total > 0) {
            double completionRate = (metrics.getTasksCompleted() * 100.0) / total;
            metrics.setCompletionRate(completionRate);
        }

        // Update average handling time
        if (task.getStartedAt() != null && task.getCompletedAt() != null) {
            long minutes = java.time.Duration.between(task.getStartedAt(), task.getCompletedAt()).toMinutes();
            double currentAvg = metrics.getAverageHandlingTime();
            double newAvg = (currentAvg * (total - 1) + minutes) / total;
            metrics.setAverageHandlingTime(newAvg);
        }

        employee.setPerformanceMetrics(metrics);
        employeeRepository.save(employee);
    }

    private String generateTaskNumber() {
        Random random = new Random();
        String taskNumber;
        do {
            int number = 10000 + random.nextInt(90000);
            taskNumber = "TASK-" + String.format("%05d", number);
            final String finalTaskNumber = taskNumber;
            if (taskRepository.findAll().stream()
                    .noneMatch(t -> finalTaskNumber.equals(t.getTaskNumber()))) {
                break;
            }
        } while (true);
        return taskNumber;
    }

    // DTO for Employee Recommendation
    public static class EmployeeRecommendation {
        private String id;
        private String name;
        private String employeeId;
        private double score;
        private String availabilityReason;
        private String workloadReason;
        private String performanceReason;

        public EmployeeRecommendation(String id, String name, String employeeId, double score,
                                     String availabilityReason, String workloadReason,
                                     String performanceReason) {
            this.id = id;
            this.name = name;
            this.employeeId = employeeId;
            this.score = score;
            this.availabilityReason = availabilityReason;
            this.workloadReason = workloadReason;
            this.performanceReason = performanceReason;
        }

        // Getters
        public String getId() { return id; }
        public String getName() { return name; }
        public String getEmployeeId() { return employeeId; }
        public double getScore() { return score; }
        public String getAvailabilityReason() { return availabilityReason; }
        public String getWorkloadReason() { return workloadReason; }
        public String getPerformanceReason() { return performanceReason; }
    }

    @Transactional
    public TaskResponse reportDamaged(String taskId) {
        Task task = getTaskById(taskId);

        // Update order status to REFUNDED and credit customer wallet
        if (task.getOrderId() != null) {
            orderRepository.findById(task.getOrderId()).ifPresent(order -> {
                order.setStatus(Order.OrderStatus.REFUNDED);
                orderRepository.save(order);

                // Credit the refund amount to customer's wallet
                if (order.getCustomerId() != null && order.getTotalAmount() != null) {
                    walletService.creditRefund(
                        order.getCustomerId(),
                        order.getTotalAmount(),
                        order.getOrderNumber(),
                        order.getId()
                    );
                }
            });
        }

        // Update task
        task.setStatus(Task.TaskStatus.FAILED);
        task.setNotes("Product damaged - Refund credited to customer wallet");
        taskRepository.save(task);

        return convertToTaskResponse(task);
    }

    @Transactional
    public TaskResponse requestReplacement(String taskId) {
        Task task = getTaskById(taskId);

        // Update order status to DELAY_IN_DELIVERY
        if (task.getOrderId() != null) {
            orderRepository.findById(task.getOrderId()).ifPresent(order -> {
                order.setStatus(Order.OrderStatus.DELAY_IN_DELIVERY);
                orderRepository.save(order);
            });
        }

        // Update task
        task.setNotes("Replacement requested - Delivery delayed");
        taskRepository.save(task);

        return convertToTaskResponse(task);
    }

    private TaskResponse convertToTaskResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTaskNumber(task.getTaskNumber());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setAssignedTo(task.getAssignedTo());
        response.setAssignedToName(task.getAssignedToName());
        response.setOrderId(task.getOrderId());
        response.setBookingId(task.getBookingId());
        response.setPriority(task.getPriority());
        response.setStatus(task.getStatus());
        response.setAssignedAt(task.getAssignedAt());
        response.setStartedAt(task.getStartedAt());
        response.setCompletedAt(task.getCompletedAt());
        response.setDueDate(task.getDueDate());
        response.setAssignedBy(task.getAssignedBy());
        response.setNotes(task.getNotes());
        response.setIsLocked(task.getIsLocked());
        response.setLockReason(task.getLockReason());
        response.setCreatedAt(task.getCreatedAt());
        return response;
    }
}

