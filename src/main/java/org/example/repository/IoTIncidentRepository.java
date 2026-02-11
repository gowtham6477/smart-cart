package org.example.repository;

import org.example.entity.IoTIncident;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IoTIncidentRepository extends MongoRepository<IoTIncident, String> {
    List<IoTIncident> findByEmployeeId(String employeeId);
    List<IoTIncident> findByStatus(IoTIncident.IncidentStatus status);
    List<IoTIncident> findByEmployeeIdAndStatus(String employeeId, IoTIncident.IncidentStatus status);
    List<IoTIncident> findByDeviceId(String deviceId);
    Long countByEmployeeId(String employeeId);
}

