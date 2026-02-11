package org.example.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String name;
    private String mobile;
    private String address;
    private String city;
    private String state;
    private String pincode;
}
