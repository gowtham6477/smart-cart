package org.example.repository;

import org.example.entity.Employee;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends MongoRepository<Employee, String> {
    Optional<Employee> findByUsername(String username);
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByEmployeeId(String employeeId);
    List<Employee> findByStatus(Employee.EmployeeStatus status);
    List<Employee> findByOnlineStatus(Employee.OnlineStatus onlineStatus);
    List<Employee> findBySkillsContaining(String skill);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}

