package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    private String deliveryAddress;
    private String city;
    private String state;
    private String pincode;
    private String customerNote;
    private String couponCode;
    private Boolean useWallet = false;  // Whether to use wallet balance
    private Double walletAmount;        // Amount to use from wallet (null = use all available)
}

