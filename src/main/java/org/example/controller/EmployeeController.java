package org.example.controller;

import org.example.dto.ApiResponse;
import org.example.dto.BookingResponse;
import org.example.entity.BookingImage;
import org.example.entity.EmployeeAttendance;
import org.example.repository.BookingImageRepository;
import org.example.repository.BookingRepository;
import org.example.service.BookingService;
import org.example.service.CloudinaryService;
import org.example.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('EMPLOYEE')")
public class EmployeeController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private BookingImageRepository bookingImageRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @RequestHeader("Authorization") String token) {
        String employeeId = extractEmployeeIdFromToken(token);
        List<BookingResponse> bookings = bookingService.getEmployeeBookings(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", bookings));
    }

    @GetMapping("/bookings/today")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getTodayBookings(
            @RequestHeader("Authorization") String token) {
        String employeeId = extractEmployeeIdFromToken(token);
        List<BookingResponse> bookings = bookingService.getEmployeeBookings(employeeId);
        // Filter today's bookings
        List<BookingResponse> todayBookings = bookings.stream()
                .filter(b -> b.getServiceDate().equals(LocalDate.now()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Today's bookings retrieved", todayBookings));
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            BookingResponse booking = bookingService.updateBookingStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Status updated successfully", booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/bookings/{id}/images")
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {
        try {
            // Verify booking exists
            bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            String imageUrl = cloudinaryService.uploadImage(file);

            BookingImage bookingImage = new BookingImage();
            bookingImage.setBookingId(id);
            bookingImage.setImageUrl(imageUrl);
            bookingImage.setImageType(BookingImage.ImageType.valueOf(type.toUpperCase()));

            bookingImageRepository.save(bookingImage);

            return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/attendance/checkin")
    public ResponseEntity<ApiResponse<EmployeeAttendance>> checkIn(
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);
            EmployeeAttendance attendance = employeeService.markAttendance(employeeId);
            return ResponseEntity.ok(ApiResponse.success("Check-in successful", attendance));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/attendance/checkout")
    public ResponseEntity<ApiResponse<EmployeeAttendance>> checkOut(
            @RequestHeader("Authorization") String token) {
        try {
            String employeeId = extractEmployeeIdFromToken(token);
            EmployeeAttendance attendance = employeeService.markCheckOut(employeeId);
            return ResponseEntity.ok(ApiResponse.success("Check-out successful", attendance));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    private String extractEmployeeIdFromToken(String token) {
        // Simplified - in real implementation extract from JWT
        return "test-employee-id";
    }
}

