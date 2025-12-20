package org.example.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class BookingResponse {
    private String id;
    private String bookingNumber;
    private String customerId;
    private String customerName;
    private String customerMobile;
    private String serviceId;
    private String serviceName;
    private String packageId;
    private String packageName;
    private String employeeId;
    private String employeeName;
    private String employeeMobile;
    private LocalDate serviceDate;
    private LocalTime serviceTime;
    private String serviceAddress;
    private String city;
    private String pincode;
    private String customerNote;
    private Double originalPrice;
    private BigDecimal discount;
    private Double finalPrice;
    private String couponCode;
    private String status;
    private Integer rating;
    private String feedback;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

