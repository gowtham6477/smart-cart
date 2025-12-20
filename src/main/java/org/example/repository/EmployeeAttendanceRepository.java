package org.example.repository;

import org.example.entity.EmployeeAttendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeAttendanceRepository extends MongoRepository<EmployeeAttendance, String> {

    Optional<EmployeeAttendance> findByEmployeeIdAndAttendanceDate(String employeeId, LocalDate date);

    List<EmployeeAttendance> findByEmployeeId(String employeeId);

    List<EmployeeAttendance> findByAttendanceDate(LocalDate date);

    List<EmployeeAttendance> findByEmployeeIdAndAttendanceDateBetween(String employeeId, LocalDate start, LocalDate end);

    Long countByEmployeeIdAndStatus(String employeeId, EmployeeAttendance.AttendanceStatus status);
}

