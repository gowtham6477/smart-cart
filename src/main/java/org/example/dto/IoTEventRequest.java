package org.example.dto;

import lombok.Data;
import org.example.entity.IoTEvent;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

@Data
public class IoTEventRequest {

    @NotBlank(message = "Device ID is required")
    private String deviceId;

    private String employeeId;

    private String bookingId;

    @NotNull(message = "Event type is required")
    private IoTEvent.EventType eventType;

    private String message;

    private Map<String, Object> sensorData;

    private Double latitude;

    private Double longitude;

    @NotNull(message = "Severity is required")
    private IoTEvent.EventSeverity severity;
}

