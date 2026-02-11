package org.example.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class ServiceRequest {
    @NotBlank(message = "Service name is required")
    private String name;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private String imageUrl;
    private Boolean active = true;
    private Double basePrice;
    private Integer estimatedDuration;
    private List<String> features;
}

