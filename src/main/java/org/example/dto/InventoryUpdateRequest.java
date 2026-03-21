package org.example.dto;

import lombok.Data;

@Data
public class InventoryUpdateRequest {
    private Integer stock;
    private Integer bufferStock;
    private String serviceName;
}
