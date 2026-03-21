package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "replacement_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReplacementPolicy {

    @Id
    private String id;

    private Boolean active = true;

    private List<String> allowedCategories = new ArrayList<>();

    private Double maxPriceDiffPercent = 0.0;

    private Double maxPriceDiffAmount = 0.0;

    private Integer timeWindowHours = 0;

    private Boolean requireApproval = false;

    private Boolean bufferEnabled = false;

    private Integer bufferQuantity = 0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
