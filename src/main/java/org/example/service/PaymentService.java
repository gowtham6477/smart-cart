package org.example.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.example.dto.PaymentRequest;
import org.example.entity.Booking;
import org.example.entity.Payment;
import org.example.repository.BookingRepository;
import org.example.repository.PaymentRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    @Transactional
    public Payment createPaymentOrder(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Check if payment already exists
        Payment existingPayment = paymentRepository.findByBookingId(bookingId).orElse(null);
        if (existingPayment != null && existingPayment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new RuntimeException("Payment already completed for this booking");
        }

        Payment payment = new Payment();
        payment.setBookingId(booking.getId());
        payment.setCustomerId(booking.getCustomerId());
        payment.setAmount(booking.getFinalAmount());
        payment.setStatus(Payment.PaymentStatus.PENDING);

        try {
            // Create Razorpay order
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int) (booking.getFinalAmount() * 100)); // Amount in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", booking.getBookingNumber());

            Order order = razorpayClient.orders.create(orderRequest);
            payment.setRazorpayOrderId(order.get("id"));
        } catch (Exception e) {
            System.err.println("Razorpay order creation failed: " + e.getMessage());
            // Continue with local payment record
        }

        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment verifyPayment(PaymentRequest request) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // In production, verify signature here
        // For now, mark as success
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setPaymentMethod(Payment.PaymentMethod.RAZORPAY);
        payment.setPaidAt(LocalDateTime.now());

        payment = paymentRepository.save(payment);

        // Update booking status
        Booking booking = bookingRepository.findById(payment.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(Booking.BookingStatus.ASSIGNED);
        bookingRepository.save(booking);

        return payment;
    }

    public Payment getPaymentByBookingId(String bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getPaymentsByCustomer(String customerId) {
        return paymentRepository.findByCustomerId(customerId);
    }

    public List<Payment> getPaymentsByStatus(Payment.PaymentStatus status) {
        return paymentRepository.findByStatus(status);
    }

    public Double getTotalRevenue() {
        List<Payment> successfulPayments = paymentRepository.findByStatus(Payment.PaymentStatus.COMPLETED);
        return successfulPayments.stream()
                .mapToDouble(Payment::getAmount)
                .sum();
    }
}

