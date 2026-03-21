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

@Document(collection = "iot_devices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IoTDevice {

    @Id
    private String id;

    @Indexed(unique = true)
    private String deviceId;  // ESP32 MAC address or custom ID like "ESP32-001"

    private String name;      // Friendly name like "Device 1"

    private String macAddress;

    @Indexed
    private DeviceStatus status = DeviceStatus.AVAILABLE;

    // Current assignment
    @Indexed
    private String assignedOrderId;
    private String assignedOrderNumber;
    private LocalDateTime assignedAt;

    // Device health
    private Boolean isOnline = false;
    private LocalDateTime lastHeartbeat;
    private LocalDateTime lastEventTime;

    // Statistics
    private Integer totalEventsCount = 0;
    private Integer fallEventsCount = 0;
    private Integer impactEventsCount = 0;

    // Device info
    private String firmwareVersion;
    private String ipAddress;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum DeviceStatus {
        AVAILABLE,      // Ready to be assigned
        ASSIGNED,       // Currently assigned to an order
        IN_USE,         // Actively being used for delivery
        MAINTENANCE,    // Under maintenance
        OFFLINE         // Not responding
    }

    // Helper method to check if device can be assigned
    public boolean canBeAssigned() {
        return status == DeviceStatus.AVAILABLE;
    }

    // Helper method to release device
    public void release() {
        this.status = DeviceStatus.AVAILABLE;
        this.assignedOrderId = null;
        this.assignedOrderNumber = null;
        this.assignedAt = null;
    }

    // Helper method to assign to order
    public void assignToOrder(String orderId, String orderNumber) {
        this.status = DeviceStatus.ASSIGNED;
        this.assignedOrderId = orderId;
        this.assignedOrderNumber = orderNumber;
        this.assignedAt = LocalDateTime.now();
    }
}
