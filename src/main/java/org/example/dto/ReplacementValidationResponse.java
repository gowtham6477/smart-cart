package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReplacementValidationResponse {
    private boolean allowed;
    private boolean requiresApproval;
    private String message;
    private Double priceDifference;
    private Double priceDifferencePercent;
}
