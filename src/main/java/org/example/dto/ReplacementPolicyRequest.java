package org.example.dto;

import lombok.Data;

import java.util.List;

@Data
public class ReplacementPolicyRequest {
    private Boolean active;
    private List<String> allowedCategories;
    private Double maxPriceDiffPercent;
    private Double maxPriceDiffAmount;
    private Integer timeWindowHours;
    private Boolean requireApproval;
    private Boolean bufferEnabled;
    private Integer bufferQuantity;
}
