package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    private String id;

    @Indexed
    private String bookingId;

    @Indexed
    private String customerId;

    private Double amount;

    private String currency = "INR";

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;

    @Indexed
    private PaymentStatus status = PaymentStatus.PENDING;

    private PaymentMethod paymentMethod;

    private String failureReason;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime paidAt;

    public enum PaymentStatus {
        PENDING,
        PROCESSING,
        SUCCESS,
        COMPLETED,
        FAILED,
        REFUNDED
    }

    public enum PaymentMethod {
        RAZORPAY,
        CASH,
        UPI,
        CARD,
        NET_BANKING
    }
}

