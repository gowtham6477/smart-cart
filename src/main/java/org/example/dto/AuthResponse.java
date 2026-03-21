package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String name;
    private String role;
    private String userId;
    private String mobile;
    private String address;
    private String city;
    private String state;
    private String pincode;
}

