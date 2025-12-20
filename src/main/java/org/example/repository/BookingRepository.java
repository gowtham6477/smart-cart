package org.example.repository;

import org.example.entity.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByCustomerId(String customerId);

    List<Booking> findByEmployeeId(String employeeId);

    List<Booking> findByStatus(Booking.BookingStatus status);

    List<Booking> findByCustomerIdAndStatus(String customerId, Booking.BookingStatus status);

    List<Booking> findByEmployeeIdAndStatus(String employeeId, Booking.BookingStatus status);

    List<Booking> findByScheduledDateBetween(LocalDateTime start, LocalDateTime end);

    List<Booking> findByServiceId(String serviceId);

    Long countByStatus(Booking.BookingStatus status);

    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}

