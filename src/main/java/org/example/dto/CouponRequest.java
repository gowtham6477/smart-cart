package org.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CouponRequest {
    @NotBlank(message = "Coupon code is required")
    private String code;

    private String description;

    @NotNull(message = "Discount type is required")
    private String discountType; // PERCENTAGE or FIXED_AMOUNT

    @NotNull(message = "Discount value is required")
    private Double discountValue;

    private Double minOrderValue;
    private Double maxDiscountAmount;

    @NotNull(message = "Valid from date is required")
    private LocalDateTime validFrom;

    @NotNull(message = "Valid until date is required")
    private LocalDateTime validUntil;

    @NotNull(message = "Usage limit is required")
    private Integer usageLimit;

    private Boolean active = true;
}

