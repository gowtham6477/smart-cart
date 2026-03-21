package org.example.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dto.IoTEventRequest;
import org.example.entity.IoTDevice;
import org.example.entity.IoTEvent;
import org.example.entity.Notification;
import org.example.entity.Order;
import org.example.repository.IoTDeviceRepository;
import org.example.repository.IoTEventRepository;
import org.example.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class IoTService {

    private final IoTEventRepository iotEventRepository;
    private final IoTDeviceRepository iotDeviceRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    public IoTEvent createEvent(IoTEventRequest request) {
        log.info("IoT event received: deviceId={}, type={}, severity={}, orderId={}",
            request.getDeviceId(), request.getEventType(), request.getSeverity(), request.getOrderId());
        IoTEvent event = new IoTEvent();
        event.setDeviceId(request.getDeviceId());
        event.setEmployeeId(request.getEmployeeId());
        event.setOrderId(request.getOrderId());
        event.setBookingId(request.getBookingId());
        event.setEventType(request.getEventType());
        event.setMessage(request.getMessage());
        event.setSensorData(request.getSensorData());
        event.setLatitude(request.getLatitude());
        event.setLongitude(request.getLongitude());
        event.setSeverity(request.getSeverity());
        event.setAcknowledged(false);
        event.setTimestamp(LocalDateTime.now());

        // Find the order associated with this device
        Optional<Order> orderOpt = findOrderByDevice(request.getDeviceId(), request.getOrderId());
        if (orderOpt.isEmpty()) {
            log.warn("No order resolved for deviceId={}, orderId={} (eventType={})",
                request.getDeviceId(), request.getOrderId(), request.getEventType());
        }
        
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            event.setOrderId(order.getId());
            event.setEmployeeId(order.getEmployeeId());
            
            // Automatically attach device to order if not already attached
            if (order.getIotDeviceId() == null || order.getIotDeviceId().isEmpty()) {
                order.setIotDeviceId(request.getDeviceId());
                order.setIotDeviceActive(true);
                order.setIotLastSeen(LocalDateTime.now());
                orderRepository.save(order);
                log.info("Device {} automatically attached to Order {}", request.getDeviceId(), order.getOrderNumber());
            }
            
            // Handle event based on type
            switch (request.getEventType()) {
                case FALL:
                    handleFallEvent(event, order);
                    break;
                case DEVICE_OFFLINE:
                    handleDeviceOfflineEvent(event, order);
                    break;
                case IMPACT:
                    handleImpactEvent(event, order);
                    break;
                case ABNORMAL_MOVEMENT:
                    handleAbnormalMovementEvent(event, order);
                    break;
                // Legacy event types - kept for backward compatibility
                case SOS:
                case LOW_BATTERY:
                case INACTIVITY:
                    log.info("Legacy event type received: {}", request.getEventType());
                    break;
            }
        }

        IoTEvent savedEvent = iotEventRepository.save(event);
        log.info("IoT Event created: {} - {} - Severity: {} - Order: {}",
            savedEvent.getDeviceId(), savedEvent.getEventType(), 
            savedEvent.getSeverity(), savedEvent.getOrderId());

        return savedEvent;
    }

    private Optional<Order> findOrderByDevice(String deviceId, String orderId) {
        // First try to find by orderId if provided
        if (orderId != null && !orderId.isEmpty()) {
            return orderRepository.findById(orderId);
        }
        // Otherwise find by device ID for active orders (including PROCESSING for early assignment)
        List<Order.OrderStatus> activeStatuses = Arrays.asList(
            Order.OrderStatus.PENDING,
            Order.OrderStatus.CONFIRMED,
            Order.OrderStatus.PROCESSING,
            Order.OrderStatus.ASSIGNED,
            Order.OrderStatus.OUT_FOR_DELIVERY,
            Order.OrderStatus.SHIPPED,
            Order.OrderStatus.RETURNING_TO_HUB,
            Order.OrderStatus.AWAITING_REPLACEMENT,
            Order.OrderStatus.DELAY_IN_DELIVERY
        );
        List<Order> orders = orderRepository.findByIotDeviceIdAndStatusIn(deviceId, activeStatuses);
        return orders.isEmpty() ? Optional.empty() : Optional.of(orders.get(0));
    }

    /**
     * FALL EVENT: Product fell during delivery
     * - Notify employee to return to hub
     * - Notify customer about potential damage and refund/replacement
     * - Change order status to RETURNING_TO_HUB
     * - Mark order as second attempt for future
     */
    private void handleFallEvent(IoTEvent event, Order order) {
        log.warn("🚨 FALL DETECTED for Order: {} by Device: {}", order.getOrderNumber(), event.getDeviceId());
        
        // Update order status
        order.setStatus(Order.OrderStatus.RETURNING_TO_HUB);
        order.setIsSecondAttempt(true);
        order.setAttemptCount(order.getAttemptCount() != null ? order.getAttemptCount() + 1 : 2);
        order.setPreviousIncidentNote("FALL detected on " + LocalDateTime.now() + 
            ". Product may be damaged. Employee instructed to return to hub.");
        orderRepository.save(order);

        // Notify Employee - Return to hub
        if (order.getEmployeeId() != null) {
            notificationService.createNotification(
                order.getEmployeeId(),
                Notification.RecipientType.EMPLOYEE,
                "🚨 FALL DETECTED - Return to Hub",
                "Order " + order.getOrderNumber() + " - Product fall detected! " +
                "Please return to the hub immediately. Do not deliver the product.",
                Notification.NotificationType.IOT_RETURN_TO_HUB,
                order.getId()
            );
        }

        // Notify Customer - Product damaged
        if (order.getCustomerId() != null) {
            notificationService.createNotification(
                order.getCustomerId(),
                Notification.RecipientType.CUSTOMER,
                "⚠️ Delivery Update - Product Issue",
                "We detected an issue with your order " + order.getOrderNumber() + 
                ". The product may have been damaged during transit. " +
                "We will replace or refund your order very soon. We apologize for the inconvenience.",
                Notification.NotificationType.IOT_PRODUCT_DAMAGED,
                order.getId()
            );
        }

        // Notify Admin
        notificationService.createNotification(
            "admin",
            Notification.RecipientType.ADMIN,
            "🚨 FALL EVENT - Order " + order.getOrderNumber(),
            "Fall detected for Order " + order.getOrderNumber() + 
            ". Employee: " + order.getEmployeeName() + 
            ". Device: " + event.getDeviceId() + 
            ". Status changed to RETURNING_TO_HUB. This is attempt #" + order.getAttemptCount(),
            Notification.NotificationType.IOT_FALL_DETECTED,
            order.getId()
        );


        event.setMessage("Fall detected. Employee notified to return to hub. Customer notified about potential damage.");
    }

    /**
     * DEVICE OFFLINE EVENT: IoT device turned off
     * - Track offline start time
     * - Notify employee to turn on device
     * - Track total offline duration for admin
     */
    private void handleDeviceOfflineEvent(IoTEvent event, Order order) {
        log.warn("📴 DEVICE OFFLINE for Order: {} Device: {}", order.getOrderNumber(), event.getDeviceId());
        
        // Set offline start time
        event.setOfflineStartTime(LocalDateTime.now());
        
        // Update order
        order.setIotDeviceActive(false);
        order.setDeviceOfflineSince(LocalDateTime.now());
        orderRepository.save(order);

        // Notify Employee
        if (order.getEmployeeId() != null) {
            notificationService.createNotification(
                order.getEmployeeId(),
                Notification.RecipientType.EMPLOYEE,
                "📴 IoT Device Offline - Turn On Now",
                "The tracking device for Order " + order.getOrderNumber() + 
                " is offline. Please turn on the IoT device immediately to continue tracking.",
                Notification.NotificationType.IOT_DEVICE_OFFLINE,
                order.getId()
            );
        }

        // Notify Admin
        notificationService.createNotification(
            "admin",
            Notification.RecipientType.ADMIN,
            "📴 Device Offline - Order " + order.getOrderNumber(),
            "IoT device " + event.getDeviceId() + " went offline at " + 
            LocalDateTime.now() + ". Employee: " + order.getEmployeeName(),
            Notification.NotificationType.IOT_DEVICE_OFFLINE,
            order.getId()
        );

        event.setMessage("Device went offline. Employee notified to turn on device.");
    }

    /**
     * Handle device coming back online
     */
    public void handleDeviceOnline(String deviceId) {
        log.info("📶 DEVICE ONLINE: {}", deviceId);
        
        // Find any pending offline events for this device
        List<IoTEvent> offlineEvents = iotEventRepository
            .findByEventTypeAndOfflineEndTimeIsNull(IoTEvent.EventType.DEVICE_OFFLINE);
        
        for (IoTEvent event : offlineEvents) {
            if (event.getDeviceId().equals(deviceId)) {
                event.setOfflineEndTime(LocalDateTime.now());
                
                // Calculate offline duration
                if (event.getOfflineStartTime() != null) {
                    long minutes = Duration.between(event.getOfflineStartTime(), LocalDateTime.now()).toMinutes();
                    event.setOfflineDurationMinutes(minutes);
                }
                
                iotEventRepository.save(event);
                
                // Update order
                Optional<Order> orderOpt = orderRepository.findByIotDeviceId(deviceId);
                if (orderOpt.isPresent()) {
                    Order order = orderOpt.get();
                    order.setIotDeviceActive(true);
                    order.setIotLastSeen(LocalDateTime.now());
                    
                    // Add to total offline time
                    if (order.getDeviceOfflineSince() != null) {
                        long offlineMinutes = Duration.between(order.getDeviceOfflineSince(), LocalDateTime.now()).toMinutes();
                        order.setTotalOfflineMinutes(
                            (order.getTotalOfflineMinutes() != null ? order.getTotalOfflineMinutes() : 0) + offlineMinutes
                        );
                        order.setDeviceOfflineSince(null);
                    }
                    
                    orderRepository.save(order);
                }
            }
        }
    }

    /**
     * IMPACT EVENT: Impact detected on package
     * - Notify employee to handle carefully
     */
    private void handleImpactEvent(IoTEvent event, Order order) {
        log.warn("💥 IMPACT DETECTED for Order: {} Device: {}", order.getOrderNumber(), event.getDeviceId());
        
        // Notify Employee
        if (order.getEmployeeId() != null) {
            notificationService.createNotification(
                order.getEmployeeId(),
                Notification.RecipientType.EMPLOYEE,
                "💥 Impact Detected - Handle Carefully!",
                "Impact detected on Order " + order.getOrderNumber() + 
                ". Please handle the package more carefully to avoid damage.",
                Notification.NotificationType.IOT_IMPACT_DETECTED,
                order.getId()
            );
        }

        // Notify Admin
        notificationService.createNotification(
            "admin",
            Notification.RecipientType.ADMIN,
            "💥 Impact Event - Order " + order.getOrderNumber(),
            "Impact detected for Order " + order.getOrderNumber() + 
            ". Employee: " + order.getEmployeeName() + ". Device: " + event.getDeviceId(),
            Notification.NotificationType.IOT_IMPACT_DETECTED,
            order.getId()
        );

        event.setMessage("Impact detected. Employee warned to handle carefully.");
    }

    /**
     * ABNORMAL MOVEMENT EVENT: Unusual movement pattern
     * - Notify employee to be careful
     */
    private void handleAbnormalMovementEvent(IoTEvent event, Order order) {
        log.warn("⚠️ ABNORMAL MOVEMENT for Order: {} Device: {}", order.getOrderNumber(), event.getDeviceId());
        
        // Notify Employee
        if (order.getEmployeeId() != null) {
            notificationService.createNotification(
                order.getEmployeeId(),
                Notification.RecipientType.EMPLOYEE,
                "⚠️ Abnormal Movement Detected",
                "Unusual movement detected for Order " + order.getOrderNumber() + 
                ". Please be careful and ensure the package is secure.",
                Notification.NotificationType.IOT_ABNORMAL_MOVEMENT,
                order.getId()
            );
        }

        // Notify Admin
        notificationService.createNotification(
            "admin",
            Notification.RecipientType.ADMIN,
            "⚠️ Abnormal Movement - Order " + order.getOrderNumber(),
            "Abnormal movement detected for Order " + order.getOrderNumber() + 
            ". Employee: " + order.getEmployeeName() + ". Device: " + event.getDeviceId(),
            Notification.NotificationType.IOT_ABNORMAL_MOVEMENT,
            order.getId()
        );

        event.setMessage("Abnormal movement detected. Employee warned to be careful.");
    }

    /**
     * Attach IoT device to an order
     */
    public Order attachDeviceToOrder(String orderId, String deviceId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setIotDeviceId(deviceId);
        order.setIotDeviceActive(true);
        order.setIotLastSeen(LocalDateTime.now());
        
        return orderRepository.save(order);
    }

    /**
     * Update device heartbeat (called periodically by ESP32)
     */
    public void updateDeviceHeartbeat(String deviceId) {
        Optional<Order> orderOpt = orderRepository.findByIotDeviceId(deviceId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setIotDeviceActive(true);
            order.setIotLastSeen(LocalDateTime.now());
            orderRepository.save(order);
        }
        
        // If device was offline, mark it as online
        handleDeviceOnline(deviceId);
    }

    // Existing methods
    public List<IoTEvent> getUnacknowledgedEvents() {
        return iotEventRepository.findByAcknowledgedFalse();
    }

    public List<IoTEvent> getAllEvents() {
        return iotEventRepository.findAll();
    }

    public List<IoTEvent> getEventsByEmployee(String employeeId) {
        return iotEventRepository.findByEmployeeId(employeeId);
    }

    public List<IoTEvent> getEventsByDevice(String deviceId) {
        return iotEventRepository.findByDeviceId(deviceId);
    }
    
    public List<IoTEvent> getEventsByOrder(String orderId) {
        return iotEventRepository.findByOrderIdOrderByTimestampDesc(orderId);
    }

    public IoTEvent acknowledgeEvent(String eventId, String userId) {
        IoTEvent event = iotEventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setAcknowledged(true);
        event.setAcknowledgedBy(userId);
        event.setAcknowledgedAt(LocalDateTime.now());

        return iotEventRepository.save(event);
    }

    public List<IoTEvent> getCriticalEvents() {
        return iotEventRepository.findBySeverity(IoTEvent.EventSeverity.CRITICAL);
    }

    public Map<String, Object> getEventStatistics() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalEvents", iotEventRepository.count());
        stats.put("unacknowledged", iotEventRepository.countByAcknowledgedFalse());
        stats.put("criticalEvents", iotEventRepository.findBySeverity(IoTEvent.EventSeverity.CRITICAL).size());

        // Events by type
        Map<String, Long> eventsByType = new HashMap<>();
        for (IoTEvent.EventType type : IoTEvent.EventType.values()) {
            eventsByType.put(type.name(),
                (long) iotEventRepository.findByEventType(type).size());
        }
        stats.put("eventsByType", eventsByType);
        
        // Second attempt orders count
        stats.put("secondAttemptOrders", orderRepository.findByIsSecondAttemptTrue().size());
        
        // Active/Inactive devices
        stats.put("activeDevices", orderRepository.findByIotDeviceActiveTrue().size());
        stats.put("inactiveDevices", orderRepository.findByIotDeviceActiveFalse().size());

        return stats;
    }
    
    /**
     * Get orders that need second attempt (had fall incidents)
     */
    public List<Order> getSecondAttemptOrders() {
        return orderRepository.findByIsSecondAttemptTrue();
    }

    /**
     * Mark order as returned to hub after fall incident
     * - Change status to AWAITING_REPLACEMENT
     * - Notify admin to prepare replacement
     * - Order will be reassigned once replacement is ready
     */
    public Order markReturnedToHub(String orderId, String reason) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        log.info("📦 Order {} returned to hub after fall incident", order.getOrderNumber());

        // Update order status
        order.setStatus(Order.OrderStatus.AWAITING_REPLACEMENT);
        if (reason != null && !reason.isBlank()) {
            order.setReturnToHubReason(reason.trim());
        }
        
        // Notify Admin that employee has returned
        notificationService.createNotification(
            "admin",
            Notification.RecipientType.ADMIN,
            "📦 Order Returned to Hub - " + order.getOrderNumber(),
            "Employee " + order.getEmployeeName() + " has returned Order " + order.getOrderNumber() + 
            " to the hub after fall incident. Please prepare replacement product and reassign for delivery. " +
            (reason != null && !reason.isBlank() ? "Return reason: " + reason.trim() + ". " : "") +
            "This is attempt #" + order.getAttemptCount(),
            Notification.NotificationType.IOT_RETURN_TO_HUB,
            order.getId()
        );

        // Notify Customer about replacement
        if (order.getCustomerId() != null) {
            notificationService.createNotification(
                order.getCustomerId(),
                Notification.RecipientType.CUSTOMER,
                "🔄 Replacement Being Prepared",
                "Your order " + order.getOrderNumber() + " is being replaced due to potential damage during transit. " +
                "We will deliver the replacement shortly. Thank you for your patience.",
                Notification.NotificationType.ORDER_REPLACEMENT_REQUESTED,
                order.getId()
            );
        }

        return orderRepository.save(order);
    }

    /**
     * Restart delivery after replacement is ready
     * - Change status back to ASSIGNED
     * - Notify employee about the new delivery
     * - Notify customer that delivery is resuming
     */
    public Order restartDelivery(String orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        log.info("🔄 Restarting delivery for Order {} (Attempt #{})", order.getOrderNumber(), order.getAttemptCount());

        // Update order status back to ASSIGNED
        order.setStatus(Order.OrderStatus.ASSIGNED);
        
        // Notify Employee about new delivery assignment
        if (order.getEmployeeId() != null) {
            notificationService.createNotification(
                order.getEmployeeId(),
                Notification.RecipientType.EMPLOYEE,
                "🔄 New Delivery Assignment - " + order.getOrderNumber(),
                "Replacement product is ready for Order " + order.getOrderNumber() + 
                ". This is delivery attempt #" + order.getAttemptCount() + 
                ". Please handle with extra care due to previous incident.",
                Notification.NotificationType.TASK_ASSIGNED,
                order.getId()
            );
        }

        // Notify Customer that delivery is resuming
        if (order.getCustomerId() != null) {
            notificationService.createNotification(
                order.getCustomerId(),
                Notification.RecipientType.CUSTOMER,
                "🚚 Delivery Resuming",
                "Great news! Your replacement for order " + order.getOrderNumber() + 
                " is on its way. Our delivery partner will handle it with extra care.",
                Notification.NotificationType.ORDER_OUT_FOR_DELIVERY,
                order.getId()
            );
        }

        return orderRepository.save(order);
    }

    // ==================== DEVICE MANAGEMENT ====================

    /**
     * Register a new IoT device (or update existing)
     */
    public IoTDevice registerDevice(String deviceId, String name, String macAddress, String firmwareVersion) {
        Optional<IoTDevice> existingDevice = iotDeviceRepository.findByDeviceId(deviceId);
        
        IoTDevice device;
        if (existingDevice.isPresent()) {
            device = existingDevice.get();
            device.setFirmwareVersion(firmwareVersion);
            device.setIsOnline(true);
            device.setLastHeartbeat(LocalDateTime.now());
            log.info("📱 Device {} came online (existing)", deviceId);
        } else {
            device = new IoTDevice();
            device.setDeviceId(deviceId);
            device.setName(name != null ? name : "Device " + deviceId);
            device.setMacAddress(macAddress);
            device.setFirmwareVersion(firmwareVersion);
            device.setStatus(IoTDevice.DeviceStatus.AVAILABLE);
            device.setIsOnline(true);
            device.setLastHeartbeat(LocalDateTime.now());
            log.info("📱 New device registered: {}", deviceId);
        }
        
        return iotDeviceRepository.save(device);
    }

    /**
     * Get all registered devices
     */
    public List<IoTDevice> getAllDevices() {
        return iotDeviceRepository.findAll();
    }

    /**
     * Get available devices (not assigned to any order)
     */
    public List<IoTDevice> getAvailableDevices() {
        return iotDeviceRepository.findByStatus(IoTDevice.DeviceStatus.AVAILABLE);
    }

    /**
     * Get device by ID
     */
    public IoTDevice getDeviceById(String deviceId) {
        return iotDeviceRepository.findByDeviceId(deviceId)
            .orElseThrow(() -> new RuntimeException("Device not found: " + deviceId));
    }

    /**
     * Assign device to order - Device can only be assigned to ONE order at a time
     */
    public Order assignDeviceToOrder(String deviceId, String orderId) {
        // Get the device
        IoTDevice device = iotDeviceRepository.findByDeviceId(deviceId)
            .orElseThrow(() -> new RuntimeException("Device not found: " + deviceId));
        
        // Check if device is available
        if (!device.canBeAssigned()) {
            throw new RuntimeException("Device " + deviceId + " is not available. Current status: " + 
                device.getStatus() + ", Assigned to order: " + device.getAssignedOrderNumber());
        }
        
        // Get the order
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        
        // Check if order already has a device
        if (order.getIotDeviceId() != null && !order.getIotDeviceId().isEmpty()) {
            throw new RuntimeException("Order " + order.getOrderNumber() + 
                " already has device " + order.getIotDeviceId() + " assigned");
        }
        
        // Assign device to order
        device.assignToOrder(orderId, order.getOrderNumber());
        device.setStatus(IoTDevice.DeviceStatus.ASSIGNED);
        iotDeviceRepository.save(device);
        
        // Update order with device ID
        order.setIotDeviceId(deviceId);
        order.setIotDeviceActive(true);
        order.setIotLastSeen(LocalDateTime.now());
        
        log.info("📱 Device {} assigned to Order {}", deviceId, order.getOrderNumber());
        
        // Notify admin
        notificationService.createNotification(
            "admin",
            Notification.RecipientType.ADMIN,
            "📱 Device Assigned - " + order.getOrderNumber(),
            "IoT Device " + deviceId + " has been assigned to Order " + order.getOrderNumber(),
            Notification.NotificationType.IOT_DEVICE_OFFLINE, // Using existing type
            order.getId()
        );
        
        return orderRepository.save(order);
    }

    /**
     * Release device from order (when delivery is completed or cancelled)
     */
    public IoTDevice releaseDeviceFromOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        
        if (order.getIotDeviceId() == null) {
            throw new RuntimeException("Order " + order.getOrderNumber() + " has no device assigned");
        }
        
        IoTDevice device = iotDeviceRepository.findByDeviceId(order.getIotDeviceId())
            .orElseThrow(() -> new RuntimeException("Device not found: " + order.getIotDeviceId()));
        
        // Release the device
        String deviceId = device.getDeviceId();
        device.release();
        iotDeviceRepository.save(device);
        
        // Clear device from order
        order.setIotDeviceId(null);
        order.setIotDeviceActive(false);
        orderRepository.save(order);
        
        log.info("📱 Device {} released from Order {}", deviceId, order.getOrderNumber());
        
        return device;
    }

    /**
     * Update device heartbeat and track online status
     */
    public void updateDeviceHeartbeatWithDevice(String deviceId, String ipAddress) {
        Optional<IoTDevice> deviceOpt = iotDeviceRepository.findByDeviceId(deviceId);
        
        if (deviceOpt.isPresent()) {
            IoTDevice device = deviceOpt.get();
            device.setIsOnline(true);
            device.setLastHeartbeat(LocalDateTime.now());
            device.setIpAddress(ipAddress);
            
            // If device was offline, update status
            if (device.getStatus() == IoTDevice.DeviceStatus.OFFLINE) {
                device.setStatus(device.getAssignedOrderId() != null ? 
                    IoTDevice.DeviceStatus.IN_USE : IoTDevice.DeviceStatus.AVAILABLE);
            }
            
            iotDeviceRepository.save(device);
        }
        
        // Also update order if device is assigned
        Optional<Order> orderOpt = orderRepository.findByIotDeviceId(deviceId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setIotDeviceActive(true);
            order.setIotLastSeen(LocalDateTime.now());
            orderRepository.save(order);
        }
        
        // Handle device coming online (for offline event tracking)
        handleDeviceOnline(deviceId);
    }

    /**
     * Delete a device (admin only)
     */
    public void deleteDevice(String deviceId) {
        IoTDevice device = iotDeviceRepository.findByDeviceId(deviceId)
            .orElseThrow(() -> new RuntimeException("Device not found: " + deviceId));
        
        if (device.getAssignedOrderId() != null) {
            throw new RuntimeException("Cannot delete device " + deviceId + 
                " - it is currently assigned to order " + device.getAssignedOrderNumber());
        }
        
        iotDeviceRepository.delete(device);
        log.info("🗑️ Device {} deleted", deviceId);
    }

    /**
     * Get device statistics
     */
    public Map<String, Object> getDeviceStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        List<IoTDevice> allDevices = iotDeviceRepository.findAll();
        stats.put("totalDevices", allDevices.size());
        stats.put("availableDevices", allDevices.stream()
            .filter(d -> d.getStatus() == IoTDevice.DeviceStatus.AVAILABLE).count());
        stats.put("assignedDevices", allDevices.stream()
            .filter(d -> d.getStatus() == IoTDevice.DeviceStatus.ASSIGNED || 
                        d.getStatus() == IoTDevice.DeviceStatus.IN_USE).count());
        stats.put("onlineDevices", allDevices.stream()
            .filter(d -> Boolean.TRUE.equals(d.getIsOnline())).count());
        stats.put("offlineDevices", allDevices.stream()
            .filter(d -> !Boolean.TRUE.equals(d.getIsOnline())).count());
        
        return stats;
    }

    /**
     * Clear all IoT events from database
     * @return Number of events deleted
     */
    public long clearAllEvents() {
        long count = iotEventRepository.count();
        iotEventRepository.deleteAll();
        log.info("🗑️ Cleared {} IoT events from database", count);
        return count;
    }

    /**
     * Reset all devices to available state and clear their assignments
     * @return Number of devices reset
     */
    public long resetAllDevices() {
        List<IoTDevice> devices = iotDeviceRepository.findAll();
        for (IoTDevice device : devices) {
            device.release(); // Sets status to AVAILABLE and clears assignment
            device.setIsOnline(false);
            device.setLastHeartbeat(null);
            device.setLastEventTime(null);
            device.setTotalEventsCount(0);
            device.setFallEventsCount(0);
            device.setImpactEventsCount(0);
            iotDeviceRepository.save(device);
        }
        log.info("🔄 Reset {} IoT devices to available state", devices.size());
        return devices.size();
    }

    /**
     * Clear IoT data from all orders (iotDeviceId, iotDeviceActive, etc.)
     * @return Number of orders updated
     */
    public long clearIoTFromOrders() {
        List<Order> ordersWithIoT = orderRepository.findAll().stream()
            .filter(o -> o.getIotDeviceId() != null)
            .toList();
        
        for (Order order : ordersWithIoT) {
            order.setIotDeviceId(null);
            order.setIotDeviceActive(null);
            order.setIotLastSeen(null);
            order.setIsSecondAttempt(false);
            order.setAttemptCount(1);
            order.setPreviousIncidentNote(null);
            order.setDeviceOfflineSince(null);
            order.setTotalOfflineMinutes(null);
            orderRepository.save(order);
        }
        
        log.info("🗑️ Cleared IoT data from {} orders", ordersWithIoT.size());
        return ordersWithIoT.size();
    }

    /**
     * Full reset - clear all IoT related data
     * @return Map with counts of cleared data
     */
    public Map<String, Long> fullReset() {
        Map<String, Long> result = new HashMap<>();
        result.put("eventsCleared", clearAllEvents());
        result.put("devicesReset", resetAllDevices());
        result.put("ordersCleared", clearIoTFromOrders());
        log.info("🔄 Full IoT reset completed: {}", result);
        return result;
    }
}

