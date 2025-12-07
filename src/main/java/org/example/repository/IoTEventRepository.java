package org.example.repository;

import org.example.entity.IoTEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IoTEventRepository extends JpaRepository<IoTEvent, Long> {
    List<IoTEvent> findByDeviceId(String deviceId);
    List<IoTEvent> findByEmployeeId(Long employeeId);
    List<IoTEvent> findByEventType(IoTEvent.EventType eventType);
    List<IoTEvent> findByAcknowledgedFalse();
    List<IoTEvent> findByEmployeeIdAndAcknowledgedFalse(Long employeeId);
}

