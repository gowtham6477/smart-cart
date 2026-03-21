package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "replacement_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReplacementRequest {

    @Id
    private String id;

    @Indexed
    private String orderId;

    private String orderNumber;

    @Indexed
    private String employeeId;

    private String employeeName;

    private ReplacementItem originalItem;

    private ReplacementItem replacementItem;

    private String reason;

    private Double priceDifference;

    private Double priceDifferencePercent;

    private Boolean approvalRequired = false;

    private Status status = Status.PENDING_APPROVAL;

    private String reviewedBy;

    private LocalDateTime reviewedAt;

    private String reviewNote;

    private String approvedBy;

    private LocalDateTime approvedAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Status {
        PENDING_APPROVAL,
        APPROVED,
        REJECTED,
        APPLIED,
        CANCELLED
    }


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReplacementItem {
        private String itemId;
        private String productId;
        private String productName;
        private String category;
        private Double price;
        private Integer quantity;
        private String imageUrl;
    }
}
