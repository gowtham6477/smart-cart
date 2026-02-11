package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "iot_incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IoTIncident {

    @Id
    private String id;

    @Indexed
    private String incidentNumber; // Auto-generated INC-XXXXX

    @Indexed
    private String deviceId; // IoT device that detected fall

    @Indexed
    private String employeeId; // Employee involved

    private String employeeName;

    @Indexed
    private String taskId; // Related task

    private String productId;

    private String productName;

    private IncidentType type = IncidentType.PRODUCT_FALL;

    private IncidentSeverity severity = IncidentSeverity.MEDIUM;

    private IncidentStatus status = IncidentStatus.OPEN;

    private LocalDateTime detectedAt;

    private String location;

    private String description;

    // Admin action
    private String actionTaken; // REPLACE_PRODUCT, REFUND, REASSIGN_TASK

    private String resolvedBy; // Admin who resolved

    private LocalDateTime resolvedAt;

    private String resolution;

    public enum IncidentType {
        PRODUCT_FALL,
        DEVICE_MALFUNCTION,
        UNAUTHORIZED_ACCESS,
        OTHER
    }

    public enum IncidentSeverity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum IncidentStatus {
        OPEN,
        INVESTIGATING,
        RESOLVED,
        CLOSED
    }
}

