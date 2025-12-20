package org.example.service;

import org.example.dto.BookingRequest;
import org.example.dto.BookingResponse;
import org.example.entity.*;
import org.example.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ServicePackageRepository packageRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponService couponService;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        org.example.entity.Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        ServicePackage servicePackage = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new RuntimeException("Package not found"));

        Booking booking = new Booking();
        booking.setBookingNumber("BKG" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setCustomerId(customer.getId());
        booking.setCustomerName(customer.getName());
        booking.setCustomerMobile(customer.getMobile());
        booking.setServiceId(service.getId());
        booking.setServiceName(service.getName());
        booking.setPackageId(servicePackage.getId());
        booking.setPackageName(servicePackage.getName());
        booking.setScheduledDate(LocalDateTime.of(request.getServiceDate(), request.getServiceTime()));
        booking.setAddress(request.getServiceAddress());
        booking.setCity(request.getCity());
        booking.setPincode(request.getPincode());
        booking.setSpecialInstructions(request.getCustomerNote());
        booking.setTotalAmount(servicePackage.getPrice());
        booking.setDiscountAmount(0.0);
        booking.setFinalAmount(servicePackage.getPrice());
        booking.setStatus(Booking.BookingStatus.CREATED);
        booking.setBookingDate(LocalDateTime.now());

        // Apply coupon if provided
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            try {
                BigDecimal discount = couponService.applyCoupon(request.getCouponCode(), servicePackage.getPrice());
                booking.setCouponCode(request.getCouponCode());
                booking.setDiscountAmount(discount.doubleValue());
                booking.setFinalAmount(servicePackage.getPrice() - discount.doubleValue());
            } catch (Exception e) {
                // If coupon fails, continue without it
                System.err.println("Coupon application failed: " + e.getMessage());
            }
        }

        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    public List<BookingResponse> getCustomerBookings(String customerId) {
        return bookingRepository.findByCustomerId(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getEmployeeBookings(String employeeId) {
        return bookingRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse updateBookingStatus(String bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        try {
            booking.setStatus(Booking.BookingStatus.valueOf(status.toUpperCase()));

            if (status.equalsIgnoreCase("COMPLETED")) {
                booking.setUpdatedAt(LocalDateTime.now());
            }

            booking = bookingRepository.save(booking);
            return mapToResponse(booking);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
    }

    @Transactional
    public BookingResponse assignEmployee(String bookingId, String employeeId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getRole().equals(User.Role.EMPLOYEE)) {
            throw new RuntimeException("User is not an employee");
        }

        booking.setEmployeeId(employee.getId());
        booking.setEmployeeName(employee.getName());
        booking.setEmployeeMobile(employee.getMobile());
        booking.setStatus(Booking.BookingStatus.ASSIGNED);

        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse addFeedback(String bookingId, Integer rating, String feedback) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getStatus().equals(Booking.BookingStatus.COMPLETED)) {
            throw new RuntimeException("Can only review completed bookings");
        }

        booking.setRating(rating);
        booking.setReview(feedback);

        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setBookingNumber(booking.getBookingNumber());
        response.setCustomerId(booking.getCustomerId());
        response.setCustomerName(booking.getCustomerName());
        response.setCustomerMobile(booking.getCustomerMobile());
        response.setServiceId(booking.getServiceId());
        response.setServiceName(booking.getServiceName());
        response.setPackageId(booking.getPackageId());
        response.setPackageName(booking.getPackageName());

        if (booking.getEmployeeId() != null) {
            response.setEmployeeId(booking.getEmployeeId());
            response.setEmployeeName(booking.getEmployeeName());
            response.setEmployeeMobile(booking.getEmployeeMobile());
        }

        if (booking.getScheduledDate() != null) {
            response.setServiceDate(booking.getScheduledDate().toLocalDate());
            response.setServiceTime(booking.getScheduledDate().toLocalTime());
        }

        response.setServiceAddress(booking.getAddress());
        response.setCity(booking.getCity());
        response.setPincode(booking.getPincode());
        response.setCustomerNote(booking.getSpecialInstructions());
        response.setOriginalPrice(booking.getTotalAmount());
        response.setDiscount(BigDecimal.valueOf(booking.getDiscountAmount()));
        response.setFinalPrice(booking.getFinalAmount());
        response.setCouponCode(booking.getCouponCode());
        response.setStatus(booking.getStatus().name());
        response.setRating(booking.getRating());
        response.setFeedback(booking.getReview());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());

        return response;
    }
}

