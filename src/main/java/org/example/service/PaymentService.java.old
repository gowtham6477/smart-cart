package org.example.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.example.entity.Booking;
import org.example.entity.Payment;
import org.example.repository.BookingRepository;
import org.example.repository.PaymentRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Transactional
    public Payment createPaymentOrder(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Check if payment already exists
        Payment existingPayment = paymentRepository.findByBookingId(bookingId).orElse(null);
        if (existingPayment != null && existingPayment.getStatus() == Payment.PaymentStatus.SUCCESS) {
            throw new RuntimeException("Payment already completed for this booking");
        }

        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", booking.getFinalPrice().multiply(java.math.BigDecimal.valueOf(100)).intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", booking.getBookingNumber());

            Order order = razorpayClient.orders.create(orderRequest);

            Payment payment = existingPayment != null ? existingPayment : new Payment();
            payment.setBooking(booking);
            payment.setAmount(booking.getFinalPrice());
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setRazorpayOrderId(order.get("id"));

            return paymentRepository.save(payment);

        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    @Transactional
    public Payment verifyAndUpdatePayment(String razorpayOrderId, String razorpayPaymentId,
                                          String razorpaySignature) {
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // Verify signature
        boolean isValid = verifySignature(razorpayOrderId, razorpayPaymentId,
                                          razorpaySignature, razorpayKeySecret);

        if (isValid) {
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(razorpaySignature);
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setPaymentMethod(Payment.PaymentMethod.RAZORPAY);
            payment.setPaidAt(LocalDateTime.now());

            // Update booking status
            Booking booking = payment.getBooking();
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setFailureReason("Signature verification failed");
        }

        return paymentRepository.save(payment);
    }

    private boolean verifySignature(String orderId, String paymentId,
                                    String signature, String secret) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(payload.getBytes());

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            return hexString.toString().equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    public Payment getPaymentByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found for booking"));
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getSuccessfulPayments() {
        return paymentRepository.findByStatus(Payment.PaymentStatus.SUCCESS);
    }
}

