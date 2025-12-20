package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    private String id;

    @Indexed(unique = true)
    private String code;

    private String description;

    private DiscountType discountType;

    private Double discountValue;

    private Double minOrderValue;

    private Double maxDiscountAmount;

    private Integer usageLimit;

    private Integer usedCount = 0;

    private LocalDateTime validFrom;

    private LocalDateTime validUntil;

    private Boolean active = true;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum DiscountType {
        PERCENTAGE,
        FIXED_AMOUNT
    }
}

