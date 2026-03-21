package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    private String id;

    @Indexed
    private String orderNumber;

    // Customer information
    @Indexed
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String customerMobile;

    // Order items
    private List<OrderItem> items;

    // Delivery address
    private String deliveryAddress;
    private String city;
    private String state;
    private String pincode;

    // Pricing
    private Double subtotal;
    private Double discountAmount = 0.0;
    private Double walletAmountUsed = 0.0;  // Amount paid from wallet
    private Double deliveryFee = 0.0;
    private Double totalAmount;

    // Coupon
    private String couponCode;

    // Status
    @Indexed
    private OrderStatus status = OrderStatus.PENDING;

    // Additional fields
    private String customerNote;
    private String cancellationReason;
    private String returnToHubReason;

    // Delivery tracking
    private String trackingNumber;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime deliveredAt;

    // Employee assignment
    private String employeeId;
    private String employeeName;
    private String employeeMobile;
    private LocalDateTime assignedAt;

    // Rating & Review
    private Integer rating; // 1-5
    private String review;

    // IoT Device Tracking
    @Indexed
    private String iotDeviceId;           // ESP32 device ID attached to this order
    private Boolean iotDeviceActive = false; // Current device status
    private LocalDateTime iotLastSeen;    // Last time device was active
    
    // Second attempt tracking (after FALL event)
    private Boolean isSecondAttempt = false;  // Flag for orders that had a fall incident
    private String previousIncidentNote;      // Note about previous incident
    private Integer attemptCount = 1;         // Number of delivery attempts
    
    // Device offline tracking
    private LocalDateTime deviceOfflineSince;
    private Long totalOfflineMinutes = 0L;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum OrderStatus {
        PENDING,
        CONFIRMED,
        PROCESSING,
        ASSIGNED,
        SHIPPED,
        OUT_FOR_DELIVERY,
        DELIVERED,
        CANCELLED,
        REFUNDED,
        DAMAGED,
        RETURNING_TO_HUB,    // After fall - employee returning
        AWAITING_REPLACEMENT, // Waiting for replacement
        DELAY_IN_DELIVERY
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String itemId;
        private String productId;
        private String productName;
        private String category;
        private Double price;
        private Integer quantity;
        private String imageUrl;
        private Boolean replaced = false;
        private String replacementRequestId;
        private LocalDateTime replacedAt;
    }
}

