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
    private BookingService bookingService;

    @Autowired
    private CouponService couponService;

    @Autowired
    private PaymentService paymentService;

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

    // Employee Management
    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<List<User>>> getAllEmployees() {
        List<User> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(ApiResponse.success("Employees retrieved successfully", employees));
    }

    @PostMapping("/employees")
    public ResponseEntity<ApiResponse<User>> createEmployee(@RequestBody User employee) {
        try {
            User created = employeeService.createEmployee(employee);
            return ResponseEntity.ok(ApiResponse.success("Employee created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<User>> updateEmployee(
            @PathVariable String id,
            @RequestBody User employee) {
        try {
            User updated = employeeService.updateEmployee(id, employee);
            return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", updated));
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

    // Payment & Reports
    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<Payment>>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved successfully", payments));
    }
}

