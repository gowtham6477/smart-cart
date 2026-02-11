package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.entity.Order;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private String id;
    private String orderNumber;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String customerMobile;
    private List<Order.OrderItem> items;
    private String deliveryAddress;
    private String city;
    private String state;
    private String pincode;
    private Double subtotal;
    private Double discountAmount;
    private Double walletAmountUsed;
    private Double deliveryFee;
    private Double totalAmount;
    private String couponCode;
    private String status;
    private String customerNote;
    private String trackingNumber;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime deliveredAt;
    private String employeeId;
    private String employeeName;
    private String employeeMobile;
    private LocalDateTime assignedAt;
    private Integer rating;
    private String review;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

