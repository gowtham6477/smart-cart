package org.example.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingRequest {
    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "Package ID is required")
    private Long packageId;

    @NotNull(message = "Service date is required")
    private LocalDate serviceDate;

    @NotNull(message = "Service time is required")
    private LocalTime serviceTime;

    @NotNull(message = "Service address is required")
    private String serviceAddress;

    private String city;
    private String pincode;
    private String customerNote;
    private String couponCode;
}

