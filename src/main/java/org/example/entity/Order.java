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
        DELAY_IN_DELIVERY
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String productId;
        private String productName;
        private String category;
        private Double price;
        private Integer quantity;
        private String imageUrl;
    }
}

