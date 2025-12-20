package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "booking_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingImage {

    @Id
    private String id;

    @Indexed
    private String bookingId;

    private String imageUrl;

    private String publicId; // Cloudinary public ID

    private ImageType imageType;

    private String uploadedBy; // Employee ID

    @CreatedDate
    private LocalDateTime uploadedAt;

    public enum ImageType {
        BEFORE,
        AFTER,
        ISSUE,
        PROOF
    }
}

