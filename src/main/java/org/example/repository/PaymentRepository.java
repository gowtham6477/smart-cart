package org.example.repository;

import org.example.entity.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    Optional<Payment> findByBookingId(String bookingId);

    List<Payment> findByCustomerId(String customerId);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    List<Payment> findByStatus(Payment.PaymentStatus status);

    List<Payment> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    Long countByStatus(Payment.PaymentStatus status);

    Long countByStatusAndCreatedAtBetween(Payment.PaymentStatus status, LocalDateTime start, LocalDateTime end);
}

