package org.example.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ServiceRequest {
    @NotBlank(message = "Service name is required")
    private String name;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private String imageUrl;
    private Boolean active = true;
}

