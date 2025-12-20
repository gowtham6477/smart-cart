package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.ApiResponse;
import org.example.dto.IoTEventRequest;
import org.example.entity.IoTEvent;
import org.example.service.IoTService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IoTController {

    private final IoTService iotService;

    // Public endpoint for IoT devices to send events
    @PostMapping("/events")
    public ResponseEntity<ApiResponse> createEvent(@Valid @RequestBody IoTEventRequest request) {
        IoTEvent event = iotService.createEvent(request);
        return ResponseEntity.ok(new ApiResponse(true, "Event recorded successfully", event));
    }

    // Admin/Employee: Get all unacknowledged events
    @GetMapping("/events/unacknowledged")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<IoTEvent>> getUnacknowledgedEvents() {
        List<IoTEvent> events = iotService.getUnacknowledgedEvents();
        return ResponseEntity.ok(events);
    }

    // Admin: Get all events
    @GetMapping("/events")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<IoTEvent>> getAllEvents() {
        List<IoTEvent> events = iotService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    // Admin/Employee: Get events by employee
    @GetMapping("/events/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<IoTEvent>> getEventsByEmployee(@PathVariable String employeeId) {
        List<IoTEvent> events = iotService.getEventsByEmployee(employeeId);
        return ResponseEntity.ok(events);
    }

    // Admin/Employee: Get events by device
    @GetMapping("/events/device/{deviceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<IoTEvent>> getEventsByDevice(@PathVariable String deviceId) {
        List<IoTEvent> events = iotService.getEventsByDevice(deviceId);
        return ResponseEntity.ok(events);
    }

    // Admin/Employee: Acknowledge event
    @PutMapping("/events/{eventId}/acknowledge")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse> acknowledgeEvent(
            @PathVariable String eventId,
            @RequestHeader("userId") String userId) {
        IoTEvent event = iotService.acknowledgeEvent(eventId, userId);
        return ResponseEntity.ok(new ApiResponse(true, "Event acknowledged", event));
    }

    // Admin: Get critical events
    @GetMapping("/events/critical")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<IoTEvent>> getCriticalEvents() {
        List<IoTEvent> events = iotService.getCriticalEvents();
        return ResponseEntity.ok(events);
    }

    // Admin: Get event statistics
    @GetMapping("/events/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getEventStatistics() {
        return ResponseEntity.ok(iotService.getEventStatistics());
    }
}

