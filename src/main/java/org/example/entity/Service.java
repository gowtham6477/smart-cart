package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "services")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Service {

    @Id
    private String id;

    @Indexed
    private String name;

    private String description;

    private String category; // CAR_WASH, BIKE_WASH, LAUNDRY, HOME_CLEANING, etc.

    private String imageUrl;

    private Boolean active = true;

    private Double basePrice;

    private Integer estimatedDuration; // in minutes

    private List<String> features;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

