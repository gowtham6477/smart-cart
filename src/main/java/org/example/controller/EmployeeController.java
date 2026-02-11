package org.example.controller;

import org.example.dto.*;
import org.example.entity.*;
import org.example.repository.BookingImageRepository;
import org.example.repository.BookingRepository;
import org.example.repository.OrderRepository;
import org.example.repository.TaskImageRepository;
import org.example.security.JwtUtil;
import org.example.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('EMPLOYEE')")
public class EmployeeController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private BookingImageRepository bookingImageRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TaskImageRepository taskImageRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TaskService taskService;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @RequestHeader("Authorization") String token) {
        String employeeId = extractEmployeeIdFromToken(token);
        List<BookingResponse> bookings = bookingService.getEmployeeBookings(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", bookings));
    }

    @GetMapping("/bookings/today")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getTodayBookings(
            @RequestHeader("Authorization") String token) {
        String employeeId = extractEmployeeIdFromToken(token);
        List<BookingResponse> bookings = bookingService.getEmployeeBookings(employeeId);
        // Filter today's bookings
        List<BookingResponse> todayBookings = bookings.stream()
                .filter(b -> b.getServiceDate().equals(LocalDate.now()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Today's bookings retrieved", todayBookings));
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            BookingResponse booking = bookingService.updateBookingStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Status updated successfully", booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/bookings/{id}/images")
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type,
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);

            // Verify booking exists
            bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            String imageUrl = cloudinaryService.uploadImage(file);

            BookingImage bookingImage = new BookingImage();
            bookingImage.setBookingId(id);
            bookingImage.setImageUrl(imageUrl);
            bookingImage.setImageType(BookingImage.ImageType.valueOf(type.toUpperCase()));
            bookingImage.setUploadedBy(employeeId);

            bookingImageRepository.save(bookingImage);

            return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/bookings/{id}/images")
    public ResponseEntity<ApiResponse<List<BookingImage>>> getBookingImages(@PathVariable String id) {
        try {
            List<BookingImage> images = bookingImageRepository.findByBookingId(id);
            return ResponseEntity.ok(ApiResponse.success("Images retrieved successfully", images));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Attendance Management
    @PostMapping("/attendance/checkin")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);
            AttendanceResponse attendance = attendanceService.checkIn(employeeId);
            return ResponseEntity.ok(ApiResponse.success("Check-in successful", attendance));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/attendance/checkout")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkOut(
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);
            AttendanceResponse attendance = attendanceService.checkOut(employeeId);
            return ResponseEntity.ok(ApiResponse.success("Check-out successful", attendance));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/attendance/today")
    public ResponseEntity<ApiResponse<AttendanceResponse>> getTodayAttendance(
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);
            AttendanceResponse attendance = attendanceService.getTodayAttendance(employeeId);
            return ResponseEntity.ok(ApiResponse.success("Attendance retrieved", attendance));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/attendance/history")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAttendanceHistory(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);
            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(30);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

            List<AttendanceResponse> attendance = attendanceService.getEmployeeAttendance(employeeId, start, end);
            return ResponseEntity.ok(ApiResponse.success("Attendance history retrieved", attendance));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Task Management
    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getMyTasks(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String status) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);
            List<Task> tasks;

            if (status != null && !status.isEmpty()) {
                tasks = taskService.getTasksByEmployeeAndStatus(employeeId, Task.TaskStatus.valueOf(status));
            } else {
                tasks = taskService.getTasksByEmployee(employeeId);
            }

            List<TaskResponse> responses = tasks.stream()
                    .map(this::convertTaskToResponse)
                    .toList();

            return ResponseEntity.ok(ApiResponse.success("Tasks retrieved successfully", responses));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(@PathVariable String id) {
        try {
            Task task = taskService.getTaskById(id);
            TaskResponse response = convertTaskToResponse(task);
            return ResponseEntity.ok(ApiResponse.success("Task retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/tasks/{id}/accept")
    public ResponseEntity<ApiResponse<TaskResponse>> acceptTask(@PathVariable String id) {
        try {
            Task task = taskService.getTaskById(id);

            // VALIDATE: Employee must be checked in to accept/start tasks
            if (!attendanceService.isEmployeeCheckedIn(task.getAssignedTo())) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("You must check in first before accepting tasks")
                );
            }

            Task updatedTask = taskService.updateTaskStatus(id, Task.TaskStatus.IN_PROGRESS);
            TaskResponse response = convertTaskToResponse(updatedTask);
            return ResponseEntity.ok(ApiResponse.success("Task accepted and started", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            Task.TaskStatus status = Task.TaskStatus.valueOf(statusStr);
            Task task = taskService.updateTaskStatus(id, status);

            // AUTOMATICALLY UPDATE ORDER STATUS to DELIVERED when task is completed
            if (status == Task.TaskStatus.COMPLETED && task.getOrderId() != null) {
                try {
                    orderService.updateOrderStatusOnTaskCompletion(task.getOrderId());
                } catch (Exception e) {
                    // Log but don't fail the task update
                    System.err.println("Failed to update order status: " + e.getMessage());
                }
            }

            TaskResponse response = convertTaskToResponse(task);
            return ResponseEntity.ok(ApiResponse.success("Task status updated", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/tasks/{id}/images")
    public ResponseEntity<ApiResponse<String>> uploadTaskImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type,
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);

            // Verify task exists and is assigned to this employee
            Task task = taskService.getTaskById(id);
            if (!task.getAssignedTo().equals(employeeId)) {
                throw new RuntimeException("Task not assigned to you");
            }

            // Upload to Cloudinary
            String imageUrl = cloudinaryService.uploadImage(file);

            // Save to TaskImage collection (always, regardless of bookingId)
            TaskImage taskImage = new TaskImage();
            taskImage.setTaskId(id);
            taskImage.setImageUrl(imageUrl);
            taskImage.setImageType(TaskImage.ImageType.valueOf(type.toUpperCase()));
            taskImage.setUploadedBy(employeeId);
            taskImageRepository.save(taskImage);

            // Also save to booking images if task has a bookingId (for backward compatibility)
            if (task.getBookingId() != null) {
                BookingImage bookingImage = new BookingImage();
                bookingImage.setBookingId(task.getBookingId());
                bookingImage.setImageUrl(imageUrl);
                bookingImage.setImageType(BookingImage.ImageType.valueOf(type.toUpperCase()));
                bookingImage.setUploadedBy(employeeId);
                bookingImageRepository.save(bookingImage);
            }

            // AUTOMATICALLY UPDATE ORDER STATUS to OUT_FOR_DELIVERY when image is uploaded
            if (task.getOrderId() != null) {
                try {
                    orderService.updateOrderStatusOnImageUpload(task.getOrderId());
                } catch (Exception e) {
                    // Log but don't fail the image upload
                    System.err.println("Failed to update order status: " + e.getMessage());
                }
            }

            return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", imageUrl));
        } catch (Exception e) {
            e.printStackTrace(); // Log the error
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats(
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);

            // Get task counts
            List<Task> allTasks = taskService.getTasksByEmployee(employeeId);
            long pendingTasks = allTasks.stream().filter(t -> t.getStatus() == Task.TaskStatus.ASSIGNED).count();
            long inProgressTasks = allTasks.stream().filter(t -> t.getStatus() == Task.TaskStatus.IN_PROGRESS).count();
            long completedTasks = allTasks.stream().filter(t -> t.getStatus() == Task.TaskStatus.COMPLETED).count();

            // Get today's attendance (may be null)
            AttendanceResponse todayAttendance = attendanceService.getTodayAttendance(employeeId);

            // Get employee performance
            Employee employee = employeeService.getEmployeeEntity(employeeId);

            // Use HashMap to allow null values
            Map<String, Object> stats = new java.util.HashMap<>();
            stats.put("pendingTasks", pendingTasks);
            stats.put("inProgressTasks", inProgressTasks);
            stats.put("completedTasks", completedTasks);
            stats.put("totalTasks", allTasks.size());
            stats.put("todayAttendance", todayAttendance); // Can be null
            stats.put("performanceMetrics", employee.getPerformanceMetrics() != null ? employee.getPerformanceMetrics() : new Employee.PerformanceMetrics());
            stats.put("onlineStatus", employee.getOnlineStatus() != null ? employee.getOnlineStatus() : Employee.OnlineStatus.OFFLINE);

            return ResponseEntity.ok(ApiResponse.success("Stats retrieved successfully", stats));
        } catch (Exception e) {
            e.printStackTrace(); // Log the actual error
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Notification Management
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<Notification>>> getEmployeeNotifications(
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);
            List<Notification> notifications = notificationService.getNotifications(employeeId, Notification.RecipientType.EMPLOYEE);
            return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", notifications));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/notifications/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnreadNotifications(
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);
            List<Notification> notifications = notificationService.getUnreadNotifications(employeeId, Notification.RecipientType.EMPLOYEE);
            return ResponseEntity.ok(ApiResponse.success("Unread notifications retrieved successfully", notifications));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);
            long count = notificationService.getUnreadCount(employeeId, Notification.RecipientType.EMPLOYEE);
            return ResponseEntity.ok(ApiResponse.success("Unread count retrieved successfully", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<String>> markNotificationAsRead(@PathVariable String id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Employee Orders
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<org.example.dto.OrderResponse>>> getMyOrders(
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);
            List<org.example.dto.OrderResponse> orders = orderService.getEmployeeOrders(employeeId);
            return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<org.example.dto.OrderResponse>> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);
            String statusStr = request.get("status");

            // Verify the order is assigned to this employee
            org.example.dto.OrderResponse order = orderService.getOrderById(orderId);
            if (!employeeId.equals(order.getEmployeeId())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("You are not assigned to this order"));
            }

            org.example.entity.Order.OrderStatus status = org.example.entity.Order.OrderStatus.valueOf(statusStr);
            org.example.dto.OrderResponse updatedOrder = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(ApiResponse.success("Order status updated", updatedOrder));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/notifications/mark-all-read")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);
            notificationService.markAllAsRead(employeeId, Notification.RecipientType.EMPLOYEE);
            return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Task status updates for damaged/replacement
    @PostMapping("/tasks/{taskId}/report-damaged")
    public ResponseEntity<ApiResponse<TaskResponse>> reportDamaged(
            @PathVariable String taskId,
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);
            Task task = taskService.getTaskById(taskId);

            if (!task.getAssignedTo().equals(employeeId)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("You are not assigned to this task"));
            }

            // Update task and order status
            TaskResponse response = taskService.reportDamaged(taskId);

            // Send notification to admin
            notificationService.notifyAdminOrderDamaged(
                task.getOrderId(),
                task.getTaskNumber()
            );

            return ResponseEntity.ok(ApiResponse.success("Reported as damaged", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/tasks/{taskId}/request-replacement")
    public ResponseEntity<ApiResponse<TaskResponse>> requestReplacement(
            @PathVariable String taskId,
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);
            Task task = taskService.getTaskById(taskId);

            if (!task.getAssignedTo().equals(employeeId)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("You are not assigned to this task"));
            }

            // Update task and order status
            TaskResponse response = taskService.requestReplacement(taskId);

            // Send notification to admin
            notificationService.notifyAdminReplacement(
                task.getOrderId(),
                task.getTaskNumber()
            );

            return ResponseEntity.ok(ApiResponse.success("Replacement requested", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    private TaskResponse convertTaskToResponse(Task task) {
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

        // Load images from TaskImage collection (primary source)
        List<TaskImage> taskImages = taskImageRepository.findByTaskId(task.getId());
        response.setBeforeImages(taskImages.stream()
                .filter(img -> img.getImageType() == TaskImage.ImageType.BEFORE)
                .map(TaskImage::getImageUrl)
                .toList());
        response.setAfterImages(taskImages.stream()
                .filter(img -> img.getImageType() == TaskImage.ImageType.AFTER)
                .map(TaskImage::getImageUrl)
                .toList());

        // Load order details if available (for product delivery tasks)
        if (task.getOrderId() != null) {
            orderRepository.findById(task.getOrderId()).ifPresent(order -> {
                response.setCustomerName(order.getCustomerName());
                response.setCustomerMobile(order.getCustomerMobile());
                response.setCustomerEmail(order.getCustomerEmail());
                response.setAddress(order.getDeliveryAddress());
                response.setCity(order.getCity());
                response.setState(order.getState());
                response.setPincode(order.getPincode());
            });
        }

        // Load booking details if available (for service bookings)
        if (task.getBookingId() != null) {
            bookingRepository.findById(task.getBookingId()).ifPresent(booking -> {
                response.setCustomerName(booking.getCustomerName());
                response.setCustomerMobile(booking.getCustomerMobile());
                response.setServiceName(booking.getServiceName());
                response.setAddress(booking.getAddress());
                response.setCity(booking.getCity());
                response.setState(booking.getState());
                response.setPincode(booking.getPincode());

                // Also load images from BookingImage collection (secondary source for backward compatibility)
                if (taskImages.isEmpty()) {
                    List<BookingImage> bookingImages = bookingImageRepository.findByBookingId(task.getBookingId());
                    response.setBeforeImages(bookingImages.stream()
                            .filter(img -> img.getImageType() == BookingImage.ImageType.BEFORE)
                            .map(BookingImage::getImageUrl)
                            .toList());
                    response.setAfterImages(bookingImages.stream()
                            .filter(img -> img.getImageType() == BookingImage.ImageType.AFTER)
                            .map(BookingImage::getImageUrl)
                            .toList());
                }
            });
        }

        return response;
    }

    private String extractEmployeeIdFromToken(String token) {
        // Remove "Bearer " prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        // Extract user email from token
        String email = jwtUtil.extractUsername(token);

        if (email == null || email.isEmpty()) {
            throw new RuntimeException("Email not found in token. Please log out and log in again.");
        }

        // Find employee by email
        Employee employee = employeeService.findByEmail(email);
        if (employee == null) {
            throw new RuntimeException("Employee record not found for email: " + email);
        }

        return employee.getId();
    }
}

