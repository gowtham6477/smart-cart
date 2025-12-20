package org.example.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dto.IoTEventRequest;
import org.example.entity.IoTEvent;
import org.example.repository.IoTEventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class IoTService {

    private final IoTEventRepository iotEventRepository;

    public IoTEvent createEvent(IoTEventRequest request) {
        IoTEvent event = new IoTEvent();
        event.setDeviceId(request.getDeviceId());
        event.setEmployeeId(request.getEmployeeId());
        event.setBookingId(request.getBookingId());
        event.setEventType(request.getEventType());
        event.setMessage(request.getMessage());
        event.setSensorData(request.getSensorData());
        event.setLatitude(request.getLatitude());
        event.setLongitude(request.getLongitude());
        event.setSeverity(request.getSeverity());
        event.setAcknowledged(false);
        event.setTimestamp(LocalDateTime.now());

        IoTEvent savedEvent = iotEventRepository.save(event);
        log.info("IoT Event created: {} - {} - Severity: {}",
            savedEvent.getDeviceId(), savedEvent.getEventType(), savedEvent.getSeverity());

        // TODO: Send real-time notification via WebSocket
        // TODO: Send SMS/Email for CRITICAL events

        return savedEvent;
    }

    public List<IoTEvent> getUnacknowledgedEvents() {
        return iotEventRepository.findByAcknowledgedFalse();
    }

    public List<IoTEvent> getAllEvents() {
        return iotEventRepository.findAll();
    }

    public List<IoTEvent> getEventsByEmployee(String employeeId) {
        return iotEventRepository.findByEmployeeId(employeeId);
    }

    public List<IoTEvent> getEventsByDevice(String deviceId) {
        return iotEventRepository.findByDeviceId(deviceId);
    }

    public IoTEvent acknowledgeEvent(String eventId, String userId) {
        IoTEvent event = iotEventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setAcknowledged(true);
        event.setAcknowledgedBy(userId);
        event.setAcknowledgedAt(LocalDateTime.now());

        return iotEventRepository.save(event);
    }

    public List<IoTEvent> getCriticalEvents() {
        return iotEventRepository.findBySeverity(IoTEvent.EventSeverity.CRITICAL);
    }

    public Map<String, Object> getEventStatistics() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalEvents", iotEventRepository.count());
        stats.put("unacknowledged", iotEventRepository.countByAcknowledgedFalse());
        stats.put("criticalEvents", iotEventRepository.findBySeverity(IoTEvent.EventSeverity.CRITICAL).size());

        // Events by type
        Map<String, Long> eventsByType = new HashMap<>();
        for (IoTEvent.EventType type : IoTEvent.EventType.values()) {
            eventsByType.put(type.name(),
                (long) iotEventRepository.findByEventType(type).size());
        }
        stats.put("eventsByType", eventsByType);

        return stats;
    }
}

