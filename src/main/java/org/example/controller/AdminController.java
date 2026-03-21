package org.example.controller;

import jakarta.validation.Valid;
import org.example.dto.*;
import org.example.entity.*;
import org.example.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private ServiceManagementService serviceManagementService;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private CouponService couponService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ReplacementService replacementService;

    @Autowired
    private InventoryService inventoryService;

    // Service Management
    @PostMapping("/services")
    public ResponseEntity<ApiResponse<Service>> createService(@Valid @RequestBody ServiceRequest request) {
        try {
            Service service = serviceManagementService.createService(request);
            return ResponseEntity.ok(ApiResponse.success("Service created successfully", service));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<ApiResponse<Service>> updateService(
            @PathVariable String id,
            @Valid @RequestBody ServiceRequest request) {
        try {
            Service service = serviceManagementService.updateService(id, request);
            return ResponseEntity.ok(ApiResponse.success("Service updated successfully", service));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable String id) {
        try {
            serviceManagementService.deleteService(id);
            return ResponseEntity.ok(ApiResponse.success("Service deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<Service>>> getAllServices() {
        List<Service> services = serviceManagementService.getAllServices();
        return ResponseEntity.ok(ApiResponse.success("Services retrieved successfully", services));
    }

    // Fix all services that have null active field
    @PostMapping("/services/fix-active")
    public ResponseEntity<ApiResponse<String>> fixActiveField() {
        try {
            int count = serviceManagementService.fixNullActiveFields();
            return ResponseEntity.ok(ApiResponse.success("Fixed " + count + " services", "Success"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Package Management
    @PostMapping("/packages")
    public ResponseEntity<ApiResponse<ServicePackage>> createPackage(
            @Valid @RequestBody ServicePackageRequest request) {
        try {
            ServicePackage pkg = serviceManagementService.createPackage(request);
            return ResponseEntity.ok(ApiResponse.success("Package created successfully", pkg));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/packages/{id}")
    public ResponseEntity<ApiResponse<ServicePackage>> updatePackage(
            @PathVariable String id,
            @Valid @RequestBody ServicePackageRequest request) {
        try {
            ServicePackage pkg = serviceManagementService.updatePackage(id, request);
            return ResponseEntity.ok(ApiResponse.success("Package updated successfully", pkg));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/packages/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePackage(@PathVariable String id) {
        try {
            serviceManagementService.deletePackage(id);
            return ResponseEntity.ok(ApiResponse.success("Package deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Booking Management
    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        List<BookingResponse> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", bookings));
    }

    @PostMapping("/bookings/{bookingId}/assign/{employeeId}")
    public ResponseEntity<ApiResponse<BookingResponse>> assignEmployee(
            @PathVariable String bookingId,
            @PathVariable String employeeId) {
        try {
            BookingResponse booking = bookingService.assignEmployee(bookingId, employeeId);
            return ResponseEntity.ok(ApiResponse.success("Employee assigned successfully", booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Coupon Management
    @GetMapping("/coupons")
    public ResponseEntity<ApiResponse<List<Coupon>>> getAllCoupons() {
        List<Coupon> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(ApiResponse.success("Coupons retrieved successfully", coupons));
    }

    @PostMapping("/coupons")
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(@Valid @RequestBody CouponRequest request) {
        try {
            Coupon coupon = couponService.createCoupon(request);
            return ResponseEntity.ok(ApiResponse.success("Coupon created successfully", coupon));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<Coupon>> updateCoupon(
            @PathVariable String id,
            @Valid @RequestBody CouponRequest request) {
        try {
            Coupon coupon = couponService.updateCoupon(id, request);
            return ResponseEntity.ok(ApiResponse.success("Coupon updated successfully", coupon));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable String id) {
        try {
            couponService.deleteCoupon(id);
            return ResponseEntity.ok(ApiResponse.success("Coupon deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Order Management
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    // Replacement Policy
    @GetMapping("/replacement-policy")
    public ResponseEntity<ApiResponse<ReplacementPolicy>> getReplacementPolicy() {
        ReplacementPolicy policy = replacementService.getPolicy();
        return ResponseEntity.ok(ApiResponse.success("Replacement policy retrieved", policy));
    }

    @PutMapping("/replacement-policy")
    public ResponseEntity<ApiResponse<ReplacementPolicy>> updateReplacementPolicy(
            @RequestBody ReplacementPolicyRequest request) {
        ReplacementPolicy policy = replacementService.updatePolicy(request);
        return ResponseEntity.ok(ApiResponse.success("Replacement policy updated", policy));
    }

    // Replacement Requests
    @GetMapping("/replacements")
    public ResponseEntity<ApiResponse<List<ReplacementRequest>>> getReplacementRequests(
            @RequestParam(required = false) String status) {
        List<ReplacementRequest> requests;
        if (status != null && !status.isBlank()) {
            requests = replacementService.getRequestsByStatus(ReplacementRequest.Status.valueOf(status));
        } else {
            requests = replacementService.getAllRequests();
        }
        return ResponseEntity.ok(ApiResponse.success("Replacement requests retrieved", requests));
    }

    @PostMapping("/replacements/{requestId}/review")
    public ResponseEntity<ApiResponse<ReplacementRequest>> reviewReplacement(
            @PathVariable String requestId,
            @RequestBody ReplacementReviewRequest request,
            @RequestHeader(value = "userId", required = false) String adminId) {
        ReplacementRequest reviewed = replacementService.reviewRequest(requestId, adminId, request);
        return ResponseEntity.ok(ApiResponse.success("Replacement request reviewed", reviewed));
    }

    // Inventory Management
    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<List<InventoryItem>>> getInventory() {
        return ResponseEntity.ok(ApiResponse.success("Inventory retrieved", inventoryService.getAll()));
    }

    @PutMapping("/inventory/{serviceId}")
    public ResponseEntity<ApiResponse<InventoryItem>> upsertInventory(
            @PathVariable String serviceId,
            @RequestBody InventoryUpdateRequest request) {
        InventoryItem item = inventoryService.upsert(serviceId, request);
        return ResponseEntity.ok(ApiResponse.success("Inventory updated", item));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody java.util.Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            org.example.entity.Order.OrderStatus status = org.example.entity.Order.OrderStatus.valueOf(statusStr);
            OrderResponse order = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/orders/{orderId}/assign/{employeeId}")
    public ResponseEntity<ApiResponse<OrderResponse>> assignEmployeeToOrder(
            @PathVariable String orderId,
            @PathVariable String employeeId) {
        try {
            OrderResponse order = orderService.assignEmployee(orderId, employeeId);
            return ResponseEntity.ok(ApiResponse.success("Employee assigned successfully", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Payment & Reports
    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<Payment>>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved successfully", payments));
    }

    // Employee Management
    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAllEmployees() {
        List<EmployeeResponse> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(ApiResponse.success("Employees retrieved successfully", employees));
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(@PathVariable String id) {
        try {
            EmployeeResponse employee = employeeService.getEmployeeById(id);
            return ResponseEntity.ok(ApiResponse.success("Employee retrieved successfully", employee));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/employees")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(@Valid @RequestBody EmployeeRequest request) {
        try {
            EmployeeResponse employee = employeeService.createEmployee(request);
            return ResponseEntity.ok(ApiResponse.success("Employee created successfully", employee));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable String id,
            @Valid @RequestBody EmployeeRequest request) {
        try {
            EmployeeResponse employee = employeeService.updateEmployee(id, request);
            return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", employee));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/employees/{id}/toggle-status")
    public ResponseEntity<ApiResponse<String>> toggleEmployeeStatus(@PathVariable String id) {
        try {
            employeeService.toggleEmployeeStatus(id);
            return ResponseEntity.ok(ApiResponse.success("Employee status updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/employees/{id}/online-status")
    public ResponseEntity<ApiResponse<String>> updateOnlineStatus(
            @PathVariable String id,
            @RequestBody java.util.Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            org.example.entity.Employee.OnlineStatus status =
                org.example.entity.Employee.OnlineStatus.valueOf(statusStr);
            employeeService.updateOnlineStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Online status updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<String>> deleteEmployee(@PathVariable String id) {
        try {
            employeeService.deleteEmployee(id);
            return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/employees/generate-username")
    public ResponseEntity<ApiResponse<String>> generateUsername(@RequestParam String name) {
        String username = employeeService.generateUsername(name);
        return ResponseEntity.ok(ApiResponse.success("Username generated", username));
    }

    @PutMapping("/employees/{id}/reset-password")
    public ResponseEntity<ApiResponse<String>> resetEmployeePassword(
            @PathVariable String id,
            @RequestBody java.util.Map<String, String> request) {
        try {
            String newPassword = request.get("newPassword");
            if (newPassword == null || newPassword.length() < 8) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Password must be at least 8 characters"));
            }
            employeeService.resetPassword(id, newPassword);
            return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Task Management
    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<Task>>> getAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(ApiResponse.success("Tasks retrieved successfully", tasks));
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<Task>> getTaskById(@PathVariable String id) {
        try {
            Task task = taskService.getTaskById(id);
            return ResponseEntity.ok(ApiResponse.success("Task retrieved successfully", task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/tasks/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<Task>>> getTasksByEmployee(@PathVariable String employeeId) {
        List<Task> tasks = taskService.getTasksByEmployee(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Employee tasks retrieved successfully", tasks));
    }

    @PostMapping("/tasks")
    public ResponseEntity<ApiResponse<Task>> createTask(@Valid @RequestBody TaskRequest request) {
        try {
            Task task = taskService.createTask(request);
            return ResponseEntity.ok(ApiResponse.success("Task created successfully", task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<Task>> updateTask(
            @PathVariable String id,
            @Valid @RequestBody TaskRequest request) {
        try {
            Task task = taskService.updateTask(id, request);
            return ResponseEntity.ok(ApiResponse.success("Task updated successfully", task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/tasks/{id}/assign/{employeeId}")
    public ResponseEntity<ApiResponse<Task>> assignTask(
            @PathVariable String id,
            @PathVariable String employeeId,
            @RequestParam String assignedBy) {
        try {
            Task task = taskService.assignTaskToEmployee(id, employeeId, assignedBy);
            return ResponseEntity.ok(ApiResponse.success("Task assigned successfully", task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/tasks/bulk-assign")
    public ResponseEntity<ApiResponse<List<Task>>> bulkAssignTasks(
            @RequestBody java.util.Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> taskIds = (List<String>) request.get("taskIds");
            String employeeId = (String) request.get("employeeId");
            String assignedBy = (String) request.get("assignedBy");

            List<Task> tasks = taskService.bulkAssignTasks(taskIds, employeeId, assignedBy);
            return ResponseEntity.ok(ApiResponse.success("Tasks assigned successfully", tasks));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<ApiResponse<Task>> updateTaskStatus(
            @PathVariable String id,
            @RequestBody java.util.Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            Task.TaskStatus status = Task.TaskStatus.valueOf(statusStr);
            Task task = taskService.updateTaskStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Task status updated successfully", task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/tasks/{id}/recommendations")
    public ResponseEntity<ApiResponse<List<TaskService.EmployeeRecommendation>>> getRecommendedEmployees(
            @PathVariable String id) {
        try {
            List<TaskService.EmployeeRecommendation> recommendations =
                taskService.getRecommendedEmployees(id);
            return ResponseEntity.ok(ApiResponse.success("Recommendations retrieved successfully", recommendations));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<String>> deleteTask(@PathVariable String id) {
        try {
            taskService.deleteTask(id);
            return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Notification Management
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<Notification>>> getAdminNotifications() {
        List<Notification> notifications = notificationService.getNotifications("admin", Notification.RecipientType.ADMIN);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", notifications));
    }

    @GetMapping("/notifications/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnreadNotifications() {
        List<Notification> notifications = notificationService.getUnreadNotifications("admin", Notification.RecipientType.ADMIN);
        return ResponseEntity.ok(ApiResponse.success("Unread notifications retrieved successfully", notifications));
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        long count = notificationService.getUnreadCount("admin", Notification.RecipientType.ADMIN);
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved successfully", count));
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

    @PutMapping("/notifications/mark-all-read")
    public ResponseEntity<ApiResponse<String>> markAllAsRead() {
        try {
            notificationService.markAllAsRead("admin", Notification.RecipientType.ADMIN);
            return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}




