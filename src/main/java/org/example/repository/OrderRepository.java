package org.example.repository;

import org.example.entity.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByCustomerId(String customerId);
    List<Order> findByStatus(Order.OrderStatus status);
    List<Order> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    List<Order> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);
    List<Order> findAllByOrderByCreatedAtDesc();
    
    // IoT related queries
    Optional<Order> findByIotDeviceId(String iotDeviceId);
    List<Order> findByIotDeviceIdAndStatusIn(String iotDeviceId, List<Order.OrderStatus> statuses);
    List<Order> findByIsSecondAttemptTrue();
    List<Order> findByIotDeviceActiveTrue();
    List<Order> findByIotDeviceActiveFalse();
}

