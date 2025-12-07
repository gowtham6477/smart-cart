package org.example.repository;

import org.example.entity.BookingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingImageRepository extends JpaRepository<BookingImage, Long> {
    List<BookingImage> findByBookingId(Long bookingId);
    List<BookingImage> findByBookingIdAndImageType(Long bookingId, BookingImage.ImageType imageType);
}

