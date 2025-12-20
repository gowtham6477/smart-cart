package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "service_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServicePackage {

    @Id
    private String id;

    @Indexed
    private String serviceId;

    private String name;

    private String description;

    private Double price;

    private Integer duration; // in minutes

    private String[] inclusions;

    private Boolean active = true;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

