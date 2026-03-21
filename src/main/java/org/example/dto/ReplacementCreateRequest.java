package org.example.dto;

import lombok.Data;

@Data
public class ReplacementCreateRequest {
    private String orderId;
    private String originalItemId;
    private String replacementProductId;
    private String replacementProductName;
    private String replacementCategory;
    private Double replacementPrice;
    private Integer replacementQuantity;
    private String replacementImageUrl;
    private String reason;
}
