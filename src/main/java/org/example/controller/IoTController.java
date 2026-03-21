package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.ApiResponse;
import org.example.dto.IoTEventRequest;
import org.example.entity.IoTDevice;
import org.example.entity.IoTEvent;
import org.example.entity.Order;
import org.example.service.IoTService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IoTController {

    private final IoTService iotService;

    // ==================== DEVICE ENDPOINTS (for ESP32) ====================

    /**
     * ESP32 registers itself when it connects
     * Public endpoint - no auth required for IoT devices
     */
    @PostMapping("/device/register")
    public ResponseEntity<ApiResponse> registerDevice(@RequestBody Map<String, String> request) {
        String deviceId = request.get("deviceId");
        String name = request.get("name");
        String macAddress = request.get("macAddress");
        String firmwareVersion = request.get("firmwareVersion");
        
        IoTDevice device = iotService.registerDevice(deviceId, name, macAddress, firmwareVersion);
        return ResponseEntity.ok(new ApiResponse(true, "Device registered successfully", device));
    }

    /**
     * ESP32 sends events (FALL, IMPACT, etc.)
     * Public endpoint for IoT devices
     */
    @PostMapping("/events")
    public ResponseEntity<ApiResponse> createEvent(@Valid @RequestBody IoTEventRequest request) {
        IoTEvent event = iotService.createEvent(request);
        return ResponseEntity.ok(new ApiResponse(true, "Event recorded successfully", event));
    }

    /**
     * ESP32 heartbeat - sent periodically to indicate device is alive
     * Public endpoint for IoT devices
     */
    @PostMapping("/heartbeat/{deviceId}")
    public ResponseEntity<ApiResponse> deviceHeartbeat(
            @PathVariable String deviceId,
            @RequestBody(required = false) Map<String, String> request) {
        String ipAddress = request != null ? request.get("ipAddress") : null;
        iotService.updateDeviceHeartbeatWithDevice(deviceId, ipAddress);
        return ResponseEntity.ok(new ApiResponse(true, "Heartbeat received", null));
    }

    // ==================== DEVICE MANAGEMENT (Admin) ====================

    /**
     * Get all registered devices
     */
    @GetMapping("/devices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<IoTDevice>>> getAllDevices() {
        List<IoTDevice> devices = iotService.getAllDevices();
        return ResponseEntity.ok(new ApiResponse(true, "Devices retrieved", devices));
    }

    /**
     * Get available devices (not assigned to any order)
     */
    @GetMapping("/devices/available")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<IoTDevice>>> getAvailableDevices() {
        List<IoTDevice> devices = iotService.getAvailableDevices();
        return ResponseEntity.ok(new ApiResponse(true, "Available devices retrieved", devices));
    }

    /**
     * Get device by ID
     */
    @GetMapping("/devices/{deviceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<IoTDevice>> getDevice(@PathVariable String deviceId) {
        IoTDevice device = iotService.getDeviceById(deviceId);
        return ResponseEntity.ok(new ApiResponse(true, "Device retrieved", device));
    }

    /**
     * Assign device to an order
     */
    @PostMapping("/devices/{deviceId}/assign/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> assignDeviceToOrder(
            @PathVariable String deviceId,
            @PathVariable String orderId) {
        try {
            Order order = iotService.assignDeviceToOrder(deviceId, orderId);
            return ResponseEntity.ok(new ApiResponse(true, 
                "Device " + deviceId + " assigned to order " + order.getOrderNumber(), order));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    /**
     * Release device from order
     */
    @PostMapping("/devices/release/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> releaseDevice(@PathVariable String orderId) {
        try {
            IoTDevice device = iotService.releaseDeviceFromOrder(orderId);
            return ResponseEntity.ok(new ApiResponse(true, 
                "Device " + device.getDeviceId() + " released and available for assignment", device));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    /**
     * Delete a device
     */
    @DeleteMapping("/devices/{deviceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteDevice(@PathVariable String deviceId) {
        try {
            iotService.deleteDevice(deviceId);
            return ResponseEntity.ok(new ApiResponse(true, "Device deleted", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    /**
     * Get device statistics
     */
    @GetMapping("/devices/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getDeviceStats() {
        return ResponseEntity.ok(new ApiResponse(true, "Stats retrieved", iotService.getDeviceStatistics()));
    }

    // ==================== EVENT MANAGEMENT ====================

    /**
     * Get all unacknowledged events
     */
    @GetMapping("/events/unacknowledged")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<IoTEvent>> getUnacknowledgedEvents() {
        List<IoTEvent> events = iotService.getUnacknowledgedEvents();
        return ResponseEntity.ok(events);
    }

    /**
     * Get all events
     */
    @GetMapping("/events")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<IoTEvent>> getAllEvents() {
        List<IoTEvent> events = iotService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    /**
     * Get events by employee
     */
    @GetMapping("/events/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<IoTEvent>> getEventsByEmployee(@PathVariable String employeeId) {
        List<IoTEvent> events = iotService.getEventsByEmployee(employeeId);
        return ResponseEntity.ok(events);
    }

    /**
     * Get events by device
     */
    @GetMapping("/events/device/{deviceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<IoTEvent>> getEventsByDevice(@PathVariable String deviceId) {
        List<IoTEvent> events = iotService.getEventsByDevice(deviceId);
        return ResponseEntity.ok(events);
    }

    /**
     * Get events by order
     */
    @GetMapping("/events/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<IoTEvent>> getEventsByOrder(@PathVariable String orderId) {
        List<IoTEvent> events = iotService.getEventsByOrder(orderId);
        return ResponseEntity.ok(events);
    }

    /**
     * Acknowledge event
     */
    @PutMapping("/events/{eventId}/acknowledge")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse> acknowledgeEvent(
            @PathVariable String eventId,
            @RequestHeader(value = "userId", required = false, defaultValue = "admin") String userId) {
        IoTEvent event = iotService.acknowledgeEvent(eventId, userId);
        return ResponseEntity.ok(new ApiResponse(true, "Event acknowledged", event));
    }

    /**
     * Get critical events
     */
    @GetMapping("/events/critical")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<IoTEvent>> getCriticalEvents() {
        List<IoTEvent> events = iotService.getCriticalEvents();
        return ResponseEntity.ok(events);
    }

    /**
     * Get event statistics
     */
    @GetMapping("/events/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getEventStatistics() {
        return ResponseEntity.ok(iotService.getEventStatistics());
    }

    // ==================== ORDER MANAGEMENT (Fall Recovery) ====================

    /**
     * Get orders that need second attempt (had fall incidents)
     */
    @GetMapping("/orders/second-attempt")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<Order>> getSecondAttemptOrders() {
        List<Order> orders = iotService.getSecondAttemptOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Mark order as returned to hub after fall incident
     */
    @PostMapping("/orders/{orderId}/returned-to-hub")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse> markReturnedToHub(
            @PathVariable String orderId,
            @RequestBody(required = false) Map<String, String> request) {
        String reason = request != null ? request.get("reason") : null;
        Order order = iotService.markReturnedToHub(orderId, reason);
        return ResponseEntity.ok(new ApiResponse(true, 
            "Order marked as returned to hub. Awaiting replacement/reassignment.", order));
    }

    /**
     * Restart delivery after replacement is ready
     */
    @PostMapping("/orders/{orderId}/restart-delivery")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> restartDelivery(@PathVariable String orderId) {
        Order order = iotService.restartDelivery(orderId);
        return ResponseEntity.ok(new ApiResponse(true, 
            "Delivery restarted. Employee and customer have been notified.", order));
    }

    // Legacy endpoint - kept for backward compatibility
    @PostMapping("/orders/{orderId}/attach-device")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> attachDeviceToOrder(
            @PathVariable String orderId,
            @RequestBody Map<String, String> request) {
        String deviceId = request.get("deviceId");
        try {
            Order order = iotService.assignDeviceToOrder(deviceId, orderId);
            return ResponseEntity.ok(new ApiResponse(true, "Device attached to order", order));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // ============= CLEANUP ENDPOINTS =============

    /**
     * Clear all IoT events from database
     */
    @DeleteMapping("/events/clear-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> clearAllEvents() {
        long count = iotService.clearAllEvents();
        return ResponseEntity.ok(new ApiResponse(true, 
            "Cleared " + count + " IoT events from database", count));
    }

    /**
     * Reset all devices to available state
     */
    @PostMapping("/devices/reset-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> resetAllDevices() {
        long count = iotService.resetAllDevices();
        return ResponseEntity.ok(new ApiResponse(true, 
            "Reset " + count + " devices to available state", count));
    }

    /**
     * Clear IoT data from all orders
     */
    @PostMapping("/orders/clear-iot")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> clearIoTFromOrders() {
        long count = iotService.clearIoTFromOrders();
        return ResponseEntity.ok(new ApiResponse(true, 
            "Cleared IoT data from " + count + " orders", count));
    }

    /**
     * Full reset - clear all IoT related data (events, devices, orders)
     */
    @PostMapping("/full-reset")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> fullReset() {
        Map<String, Long> result = iotService.fullReset();
        return ResponseEntity.ok(new ApiResponse(true, 
            "Full IoT reset completed", result));
    }
}

