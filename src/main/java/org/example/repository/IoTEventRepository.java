package org.example.repository;

import org.example.entity.IoTEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IoTEventRepository extends MongoRepository<IoTEvent, String> {

    List<IoTEvent> findByDeviceId(String deviceId);

    List<IoTEvent> findByEmployeeId(String employeeId);

    List<IoTEvent> findByEventType(IoTEvent.EventType eventType);

    List<IoTEvent> findBySeverity(IoTEvent.EventSeverity severity);

    List<IoTEvent> findByAcknowledgedFalse();

    List<IoTEvent> findByTimestampBetween(LocalDateTime start, LocalDateTime end);

    List<IoTEvent> findByEventTypeAndAcknowledgedFalse(IoTEvent.EventType eventType, Boolean acknowledged);

    Long countByAcknowledgedFalse();
}

