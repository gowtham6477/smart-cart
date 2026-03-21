package org.example.repository;

import org.example.entity.IoTDevice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IoTDeviceRepository extends MongoRepository<IoTDevice, String> {

    Optional<IoTDevice> findByDeviceId(String deviceId);

    Optional<IoTDevice> findByMacAddress(String macAddress);

    List<IoTDevice> findByStatus(IoTDevice.DeviceStatus status);

    Optional<IoTDevice> findByAssignedOrderId(String orderId);

    List<IoTDevice> findByIsOnline(Boolean isOnline);

    boolean existsByDeviceId(String deviceId);

    // Find available devices that can be assigned
    default List<IoTDevice> findAvailableDevices() {
        return findByStatus(IoTDevice.DeviceStatus.AVAILABLE);
    }
}
