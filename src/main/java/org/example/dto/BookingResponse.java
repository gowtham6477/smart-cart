package org.example.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class BookingResponse {
    private Long id;
    private String bookingNumber;
    private Long customerId;
    private String customerName;
    private String customerMobile;
    private Long serviceId;
    private String serviceName;
    private Long packageId;
    private String packageName;
    private Long employeeId;
    private String employeeName;
    private String employeeMobile;
    private LocalDate serviceDate;
    private LocalTime serviceTime;
    private String serviceAddress;
    private String city;
    private String pincode;
    private String customerNote;
    private BigDecimal originalPrice;
    private BigDecimal discount;
    private BigDecimal finalPrice;
    private String couponCode;
    private String status;
    private Integer rating;
    private String feedback;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

