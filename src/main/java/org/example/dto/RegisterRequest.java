package org.example.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "Name should contain only letters and spaces")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "Mobile is required")
    @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Mobile number must be 10 digits starting with 6-9 (without 0 or +91)")
    private String mobile;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 50, message = "Password must be between 6 and 50 characters")
    private String password;

    @Size(max = 200, message = "Address should not exceed 200 characters")
    private String address;

    @Size(max = 50, message = "City should not exceed 50 characters")
    private String city;

    @Size(max = 50, message = "State should not exceed 50 characters")
    private String state;

    @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be exactly 6 digits")
    private String pincode;

    @Pattern(regexp = "^(CUSTOMER|EMPLOYEE|ADMIN)$", message = "Role must be CUSTOMER, EMPLOYEE, or ADMIN")
    private String role = "CUSTOMER";
}

