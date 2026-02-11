package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequest {
    private String name;
    private String email;
    private String phone;
    private String username;
    private String password;
    private String role;
    private List<String> skills;
    private String assignedIoTDevice;
    private LocalTime shiftStartTime;
    private LocalTime shiftEndTime;
}

