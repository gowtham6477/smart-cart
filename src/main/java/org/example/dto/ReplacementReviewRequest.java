package org.example.dto;

import lombok.Data;

@Data
public class ReplacementReviewRequest {
    private String status; // APPROVED or REJECTED
    private String note;
}
