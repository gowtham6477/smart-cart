package org.example.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotNull(message = "Booking ID is required")
    private String bookingId;

    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}

