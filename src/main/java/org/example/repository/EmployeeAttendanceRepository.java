package org.example.repository;

import org.example.entity.EmployeeAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeAttendanceRepository extends JpaRepository<EmployeeAttendance, Long> {
    Optional<EmployeeAttendance> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate date);
    List<EmployeeAttendance> findByEmployeeId(Long employeeId);
    List<EmployeeAttendance> findByAttendanceDate(LocalDate date);
    List<EmployeeAttendance> findByEmployeeIdAndAttendanceDateBetween(
        Long employeeId, LocalDate startDate, LocalDate endDate);
}

