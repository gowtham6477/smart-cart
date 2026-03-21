package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "iot_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IoTEvent {

    @Id
    private String id;

    @Indexed
    private String deviceId;

    @Indexed
    private String employeeId;

    @Indexed
    private String orderId;

    private String bookingId;

    @Indexed
    private EventType eventType;

    private String message;

    private Map<String, Object> sensorData;

    private Double latitude;

    private Double longitude;

    @Indexed
    private EventSeverity severity;

    private Boolean acknowledged = false;

    private String acknowledgedBy;

    private LocalDateTime acknowledgedAt;

    // For DEVICE_OFFLINE tracking
    private LocalDateTime offlineStartTime;
    private LocalDateTime offlineEndTime;
    private Long offlineDurationMinutes;

    @CreatedDate
    @Indexed
    private LocalDateTime timestamp;

    public enum EventType {
        FALL,           // Product fell - notify employee to return, customer about damage
        DEVICE_OFFLINE, // Device turned off - track inactive time
        IMPACT,         // Impact detected - warn employee to be careful
        ABNORMAL_MOVEMENT, // Unusual movement - warn employee
        // Legacy types (kept for backward compatibility with existing data)
        @Deprecated SOS,
        @Deprecated LOW_BATTERY,
        @Deprecated INACTIVITY
    }

    public enum EventSeverity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
}

