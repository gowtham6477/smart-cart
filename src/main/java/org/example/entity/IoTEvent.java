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

    @CreatedDate
    @Indexed
    private LocalDateTime timestamp;

    public enum EventType {
        SOS,
        FALL,
        INACTIVITY,
        IMPACT,
        LOW_BATTERY,
        DEVICE_OFFLINE,
        ABNORMAL_MOVEMENT
    }

    public enum EventSeverity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
}

