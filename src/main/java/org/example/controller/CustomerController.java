package org.example.controller;

import jakarta.validation.Valid;
import org.example.dto.*;
import org.example.entity.Coupon;
import org.example.entity.Payment;
import org.example.entity.User;
import org.example.entity.Wallet;
import org.example.repository.UserRepository;
import org.example.security.JwtUtil;
import org.example.service.BookingService;
import org.example.service.CouponService;
import org.example.service.OrderService;
import org.example.service.PaymentService;
import org.example.service.WalletService;
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
    private OrderService orderService;

    @Autowired
    private WalletService walletService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Profile Management
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile(@RequestHeader("Authorization") String token) {
        try {
            String userId = extractUserIdFromToken(token);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setPassword(null); // Don't send password
            return ResponseEntity.ok(ApiResponse.success("Profile retrieved", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String userId = extractUserIdFromToken(token);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (request.getName() != null) user.setName(request.getName());
            if (request.getMobile() != null) user.setMobile(request.getMobile());
            if (request.getAddress() != null) user.setAddress(request.getAddress());
            if (request.getCity() != null) user.setCity(request.getCity());
            if (request.getState() != null) user.setState(request.getState());
            if (request.getPincode() != null) user.setPincode(request.getPincode());

            User saved = userRepository.save(user);
            saved.setPassword(null);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String customerId = extractUserIdFromToken(token);
            BookingResponse booking = bookingService.createBooking(request, customerId);
            return ResponseEntity.ok(ApiResponse.success("Booking created successfully", booking));
        } catch (Exception e) {
            e.printStackTrace(); // Log the full stack trace
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

    // Order endpoints
    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @RequestBody OrderRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String customerId = extractUserIdFromToken(token);
            OrderResponse order = orderService.createOrderFromCart(customerId, request);
            return ResponseEntity.ok(ApiResponse.success("Order created successfully", order));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @RequestHeader("Authorization") String token) {
        try {
            String customerId = extractUserIdFromToken(token);
            List<OrderResponse> orders = orderService.getCustomerOrders(customerId);
            return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable String id) {
        try {
            OrderResponse order = orderService.getOrderById(id);
            return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
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

    @GetMapping("/coupons/available")
    public ResponseEntity<ApiResponse<List<Coupon>>> getAvailableCoupons() {
        try {
            List<Coupon> coupons = couponService.getActiveCoupons();
            if (coupons == null) {
                coupons = new java.util.ArrayList<>();
            }
            return ResponseEntity.ok(ApiResponse.success("Active coupons retrieved", coupons));
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error fetching coupons: " + e.getMessage());
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch coupons: " + e.getMessage()));
        }
    }

    // Wallet endpoints
    @GetMapping("/wallet")
    public ResponseEntity<ApiResponse<Wallet>> getWallet(@RequestHeader("Authorization") String token) {
        try {
            String customerId = extractUserIdFromToken(token);
            Wallet wallet = walletService.getWallet(customerId);
            return ResponseEntity.ok(ApiResponse.success("Wallet retrieved successfully", wallet));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/wallet/balance")
    public ResponseEntity<ApiResponse<Double>> getWalletBalance(@RequestHeader("Authorization") String token) {
        try {
            String customerId = extractUserIdFromToken(token);
            Double balance = walletService.getBalance(customerId);
            return ResponseEntity.ok(ApiResponse.success("Wallet balance retrieved", balance));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/wallet/transactions")
    public ResponseEntity<ApiResponse<List<Wallet.Transaction>>> getWalletTransactions(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "20") int limit) {
        try {
            String customerId = extractUserIdFromToken(token);
            List<Wallet.Transaction> transactions = walletService.getTransactions(customerId, limit);
            return ResponseEntity.ok(ApiResponse.success("Transactions retrieved", transactions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    private String extractUserIdFromToken(String token) {
        // Remove "Bearer " prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String userId = jwtUtil.extractUserId(token);
        System.out.println("Extracted userId from token: " + userId);

        if (userId == null || userId.isEmpty()) {
            throw new RuntimeException("User ID not found in token. Please log out and log in again to refresh your session.");
        }

        return userId;
    }
}

