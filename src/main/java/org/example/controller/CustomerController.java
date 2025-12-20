package org.example.controller;

import jakarta.validation.Valid;
import org.example.dto.ApiResponse;
import org.example.dto.BookingRequest;
import org.example.dto.BookingResponse;
import org.example.dto.PaymentRequest;
import org.example.entity.Payment;
import org.example.security.JwtUtil;
import org.example.service.BookingService;
import org.example.service.CouponService;
import org.example.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private CouponService couponService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String customerId = extractUserIdFromToken(token);
            BookingResponse booking = bookingService.createBooking(request, customerId);
            return ResponseEntity.ok(ApiResponse.success("Booking created successfully", booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @RequestHeader("Authorization") String token) {
        String customerId = extractUserIdFromToken(token);
        List<BookingResponse> bookings = bookingService.getCustomerBookings(customerId);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", bookings));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable String id) {
        try {
            BookingResponse booking = bookingService.getBookingById(id);
            return ResponseEntity.ok(ApiResponse.success("Booking retrieved successfully", booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/bookings/{id}/feedback")
    public ResponseEntity<ApiResponse<BookingResponse>> addFeedback(
            @PathVariable String id,
            @RequestBody Map<String, Object> feedback) {
        try {
            Integer rating = (Integer) feedback.get("rating");
            String feedbackText = (String) feedback.get("feedback");
            BookingResponse booking = bookingService.addFeedback(id, rating, feedbackText);
            return ResponseEntity.ok(ApiResponse.success("Feedback added successfully", booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/payments/create-order")
    public ResponseEntity<ApiResponse<Payment>> createPaymentOrder(@RequestBody Map<String, String> request) {
        try {
            String bookingId = request.get("bookingId");
            Payment payment = paymentService.createPaymentOrder(bookingId);
            return ResponseEntity.ok(ApiResponse.success("Payment order created", payment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/payments/verify")
    public ResponseEntity<ApiResponse<Payment>> verifyPayment(@RequestBody PaymentRequest request) {
        try {
            Payment payment = paymentService.verifyPayment(request);
            return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", payment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/coupons/validate")
    public ResponseEntity<ApiResponse<BigDecimal>> validateCoupon(@RequestBody Map<String, Object> request) {
        try {
            String code = (String) request.get("code");
            Double amount = Double.parseDouble(request.get("amount").toString());
            BigDecimal discount = couponService.validateCoupon(code, amount);
            return ResponseEntity.ok(ApiResponse.success("Coupon is valid", discount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    private String extractUserIdFromToken(String token) {
        // This is a simplified version. In real implementation, extract userId from JWT
        // For now, return a test ID
        return "test-customer-id";
    }
}

