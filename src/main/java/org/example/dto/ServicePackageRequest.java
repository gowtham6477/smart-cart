package org.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ServicePackageRequest {
    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotBlank(message = "Package name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    private BigDecimal price;

    private Integer durationMinutes;
    private Boolean active = true;
}

