package org.example.repository;

import org.example.entity.BookingImage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingImageRepository extends MongoRepository<BookingImage, String> {

    List<BookingImage> findByBookingId(String bookingId);

    List<BookingImage> findByBookingIdAndImageType(String bookingId, BookingImage.ImageType imageType);

    List<BookingImage> findByUploadedBy(String uploadedBy);
}

