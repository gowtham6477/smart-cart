package org.example.repository;

import org.example.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingNumber(String bookingNumber);
    List<Booking> findByCustomerId(Long customerId);
    List<Booking> findByEmployeeId(Long employeeId);
    List<Booking> findByStatus(Booking.BookingStatus status);
    List<Booking> findByServiceDate(LocalDate serviceDate);

    @Query("SELECT b FROM Booking b WHERE b.employee.id = :employeeId AND b.serviceDate = :date")
    List<Booking> findTodayBookingsForEmployee(@Param("employeeId") Long employeeId,
                                                 @Param("date") LocalDate date);

    @Query("SELECT b FROM Booking b WHERE b.createdAt BETWEEN :startDate AND :endDate")
    List<Booking> findBookingsBetweenDates(@Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    Long countByStatus(@Param("status") Booking.BookingStatus status);
}

