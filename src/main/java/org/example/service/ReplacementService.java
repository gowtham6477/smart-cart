package org.example.service;

import org.example.dto.ReplacementCreateRequest;
import org.example.dto.ReplacementPolicyRequest;
import org.example.dto.ReplacementReviewRequest;
import org.example.dto.ReplacementValidationResponse;
import org.example.entity.Employee;
import org.example.entity.Notification;
import org.example.entity.Order;
import org.example.entity.ReplacementPolicy;
import org.example.entity.ReplacementRequest;
import org.example.entity.Task;
import org.example.repository.EmployeeRepository;
import org.example.repository.OrderRepository;
import org.example.repository.ReplacementPolicyRepository;
import org.example.repository.ReplacementRequestRepository;
import org.example.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReplacementService {

    @Autowired
    private ReplacementPolicyRepository policyRepository;

    @Autowired
    private ReplacementRequestRepository requestRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private InventoryService inventoryService;

    public ReplacementPolicy getPolicy() {
        return policyRepository.findAll().stream().findFirst().orElseGet(() -> {
            ReplacementPolicy policy = new ReplacementPolicy();
            policy.setActive(true);
            return policyRepository.save(policy);
        });
    }

    public ReplacementPolicy updatePolicy(ReplacementPolicyRequest request) {
        ReplacementPolicy policy = getPolicy();
        if (request.getActive() != null) {
            policy.setActive(request.getActive());
        }
        if (request.getAllowedCategories() != null) {
            policy.setAllowedCategories(request.getAllowedCategories());
        }
        if (request.getMaxPriceDiffPercent() != null) {
            policy.setMaxPriceDiffPercent(request.getMaxPriceDiffPercent());
        }
        if (request.getMaxPriceDiffAmount() != null) {
            policy.setMaxPriceDiffAmount(request.getMaxPriceDiffAmount());
        }
        if (request.getTimeWindowHours() != null) {
            policy.setTimeWindowHours(request.getTimeWindowHours());
        }
        if (request.getRequireApproval() != null) {
            policy.setRequireApproval(request.getRequireApproval());
        }
        if (request.getBufferEnabled() != null) {
            policy.setBufferEnabled(request.getBufferEnabled());
        }
        if (request.getBufferQuantity() != null) {
            policy.setBufferQuantity(request.getBufferQuantity());
        }
        return policyRepository.save(policy);
    }

    public List<ReplacementRequest> getAllRequests() {
        return requestRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<ReplacementRequest> getRequestsByStatus(ReplacementRequest.Status status) {
        return requestRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public List<ReplacementRequest> getEmployeeRequests(String employeeId) {
        return requestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    public ReplacementRequest createReplacementFromTask(String employeeId, String orderId, String reason) {
        if (employeeId == null || employeeId.isBlank()) {
            throw new RuntimeException("Employee not found for replacement request");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        ensureItemIds(order);

    if (order.getItems() != null && order.getItems().size() > 1) {
        throw new RuntimeException("Multiple items in order. Use the replacement page to select item.");
    }

        Order.OrderItem originalItem = null;
        if (order.getItems() != null) {
            originalItem = order.getItems().stream()
                    .filter(item -> !Boolean.TRUE.equals(item.getReplaced()))
                    .findFirst()
                    .orElse(null);
        }

        if (originalItem == null) {
            throw new RuntimeException("No available order item for replacement");
        }

        ReplacementCreateRequest createRequest = new ReplacementCreateRequest();
        createRequest.setOrderId(order.getId());
        createRequest.setOriginalItemId(originalItem.getItemId());
        createRequest.setReplacementProductId(originalItem.getProductId());
        createRequest.setReplacementProductName(originalItem.getProductName());
        createRequest.setReplacementCategory(originalItem.getCategory());
        createRequest.setReplacementPrice(originalItem.getPrice());
        createRequest.setReplacementQuantity(originalItem.getQuantity());
        createRequest.setReplacementImageUrl(originalItem.getImageUrl());
        createRequest.setReason(reason != null ? reason : "Replacement requested from task");

        ReplacementRequest replacementRequest = createReplacementRequest(employeeId, createRequest);
        if (replacementRequest.getStatus() == ReplacementRequest.Status.APPROVED) {
            replacementRequest.setStatus(ReplacementRequest.Status.PENDING_APPROVAL);
            replacementRequest.setApprovalRequired(true);
            replacementRequest = requestRepository.save(replacementRequest);
        }
        return replacementRequest;
    }


    public ReplacementValidationResponse validateReplacement(ReplacementCreateRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        ensureItemIds(order);

        Order.OrderItem originalItem = findItemById(order, request.getOriginalItemId());
        if (originalItem == null) {
            return new ReplacementValidationResponse(false, false, "Original item not found", 0.0, 0.0);
        }

        ReplacementPolicy policy = getPolicy();
        if (Boolean.FALSE.equals(policy.getActive())) {
            return new ReplacementValidationResponse(false, false, "Replacement policy is disabled", 0.0, 0.0);
        }

        if (policy.getAllowedCategories() != null && !policy.getAllowedCategories().isEmpty()) {
            if (request.getReplacementCategory() == null ||
                    !policy.getAllowedCategories().contains(request.getReplacementCategory())) {
                return new ReplacementValidationResponse(false, false, "Replacement category not allowed", 0.0, 0.0);
            }
        }

        if (policy.getTimeWindowHours() != null && policy.getTimeWindowHours() > 0 && order.getCreatedAt() != null) {
            long hours = Duration.between(order.getCreatedAt(), LocalDateTime.now()).toHours();
            if (hours > policy.getTimeWindowHours()) {
                return new ReplacementValidationResponse(false, false, "Replacement window expired", 0.0, 0.0);
            }
        }

        double originalPrice = originalItem.getPrice() != null ? originalItem.getPrice() : 0.0;
        int quantity = request.getReplacementQuantity() != null ? request.getReplacementQuantity() : originalItem.getQuantity();
        double replacementPrice = request.getReplacementPrice() != null ? request.getReplacementPrice() : 0.0;


        double priceDiff = (replacementPrice - originalPrice) * quantity;
        double percentDiff = originalPrice > 0 ? ((replacementPrice - originalPrice) / originalPrice) * 100.0 : 0.0;

        boolean requiresApproval = Boolean.TRUE.equals(policy.getRequireApproval());
        if (policy.getMaxPriceDiffPercent() != null && policy.getMaxPriceDiffPercent() > 0 && percentDiff > policy.getMaxPriceDiffPercent()) {
            requiresApproval = true;
        }
        if (policy.getMaxPriceDiffAmount() != null && policy.getMaxPriceDiffAmount() > 0 && priceDiff > policy.getMaxPriceDiffAmount()) {
            requiresApproval = true;
        }

        return new ReplacementValidationResponse(true, requiresApproval, "Replacement validated", priceDiff, percentDiff);
    }

    @Transactional
    public ReplacementRequest createReplacementRequest(String employeeId, ReplacementCreateRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        ReplacementValidationResponse validation = validateReplacement(request);
        if (!validation.isAllowed()) {
            throw new RuntimeException(validation.getMessage());
        }

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        ensureItemIds(order);

        Order.OrderItem originalItem = findItemById(order, request.getOriginalItemId());
        if (originalItem == null) {
            throw new RuntimeException("Original item not found");
        }

        ReplacementRequest replacementRequest = new ReplacementRequest();
        replacementRequest.setOrderId(order.getId());
        replacementRequest.setOrderNumber(order.getOrderNumber());
        replacementRequest.setEmployeeId(employee.getId());
        replacementRequest.setEmployeeName(employee.getName());
    replacementRequest.setReason(request.getReason());
        replacementRequest.setPriceDifference(validation.getPriceDifference());
        replacementRequest.setPriceDifferencePercent(validation.getPriceDifferencePercent());
        replacementRequest.setApprovalRequired(validation.isRequiresApproval());
        replacementRequest.setStatus(validation.isRequiresApproval() ? ReplacementRequest.Status.PENDING_APPROVAL : ReplacementRequest.Status.APPROVED);

        ReplacementRequest.ReplacementItem originalItemSnapshot = new ReplacementRequest.ReplacementItem(
                originalItem.getItemId(),
                originalItem.getProductId(),
                originalItem.getProductName(),
                originalItem.getCategory(),
                originalItem.getPrice(),
                originalItem.getQuantity(),
                originalItem.getImageUrl()
        );
        replacementRequest.setOriginalItem(originalItemSnapshot);

        ReplacementRequest.ReplacementItem replacementItem = new ReplacementRequest.ReplacementItem(
                "REPL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                request.getReplacementProductId(),
                request.getReplacementProductName(),
                request.getReplacementCategory(),
                request.getReplacementPrice(),
                request.getReplacementQuantity() != null ? request.getReplacementQuantity() : originalItem.getQuantity(),
                request.getReplacementImageUrl()
        );
        replacementRequest.setReplacementItem(replacementItem);

        replacementRequest = requestRepository.save(replacementRequest);

        if (!replacementRequest.getApprovalRequired()) {
            replacementRequest = confirmReplacement(employeeId, replacementRequest.getId());
        }

        order.setStatus(Order.OrderStatus.AWAITING_REPLACEMENT);
        orderRepository.save(order);

        notificationService.createNotification(
                order.getCustomerId(),
                Notification.RecipientType.CUSTOMER,
                "Replacement Requested",
                "Replacement requested for order #" + order.getOrderNumber() + ". We'll update you soon.",
        Notification.NotificationType.ORDER_REPLACEMENT_REQUESTED,
                order.getId()
        );

        return replacementRequest;
    }

    @Transactional
    public ReplacementRequest reviewRequest(String requestId, String adminId, ReplacementReviewRequest reviewRequest) {
        ReplacementRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Replacement request not found"));

        if (adminId == null || adminId.isBlank()) {
            adminId = "ADMIN";
        }

        ReplacementRequest.Status status = ReplacementRequest.Status.valueOf(reviewRequest.getStatus());
        if (status != ReplacementRequest.Status.APPROVED && status != ReplacementRequest.Status.REJECTED) {
            throw new RuntimeException("Invalid review status");
        }

        request.setStatus(status);
        request.setReviewedBy(adminId);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewNote(reviewRequest.getNote());

        if (status == ReplacementRequest.Status.APPROVED) {
            request.setApprovedBy(adminId);
            request.setApprovedAt(LocalDateTime.now());
        }

        request = requestRepository.save(request);

        notificationService.createNotification(
                request.getEmployeeId(),
                Notification.RecipientType.EMPLOYEE,
                "Replacement Review Update",
                status == ReplacementRequest.Status.APPROVED ? "Replacement request approved." : "Replacement request rejected.",
        Notification.NotificationType.ORDER_STATUS_CHANGED,
                request.getOrderId()
        );

        return request;
    }

    @Transactional
    public ReplacementRequest confirmReplacement(String employeeId, String requestId) {
        ReplacementRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Replacement request not found"));

        if (employeeId != null && request.getEmployeeId() != null && !employeeId.equals(request.getEmployeeId())) {
            throw new RuntimeException("You are not assigned to this replacement request");
        }

        if (request.getStatus() != ReplacementRequest.Status.APPROVED) {
            throw new RuntimeException("Replacement request is not approved");
        }

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        ensureItemIds(order);

        Order.OrderItem originalItem = findItemById(order, request.getOriginalItem().getItemId());
        if (originalItem == null) {
            throw new RuntimeException("Original item not found on order");
        }

        originalItem.setProductId(request.getReplacementItem().getProductId());
        originalItem.setProductName(request.getReplacementItem().getProductName());
        originalItem.setCategory(request.getReplacementItem().getCategory());
        originalItem.setPrice(request.getReplacementItem().getPrice());
        originalItem.setQuantity(request.getReplacementItem().getQuantity());
        originalItem.setImageUrl(request.getReplacementItem().getImageUrl());
        originalItem.setReplaced(true);
        originalItem.setReplacementRequestId(request.getId());
        originalItem.setReplacedAt(LocalDateTime.now());

        if (request.getReplacementItem() != null && request.getReplacementItem().getProductId() != null) {
            int qty = request.getReplacementItem().getQuantity() != null ? request.getReplacementItem().getQuantity() : 1;
            inventoryService.deductStock(request.getReplacementItem().getProductId(), qty);
        }

        recalculateTotals(order);
        order.setStatus(Order.OrderStatus.PROCESSING);
        order.setIsSecondAttempt(true);
        order.setAttemptCount(order.getAttemptCount() != null ? order.getAttemptCount() + 1 : 2);

        orderRepository.save(order);

        request.setStatus(ReplacementRequest.Status.APPLIED);
        requestRepository.save(request);

        List<Task> orderTasks = taskRepository.findByOrderId(order.getId());
        if (orderTasks != null) {
            for (Task task : orderTasks) {
                task.setStatus(Task.TaskStatus.FAILED);
                task.setIsLocked(true);
                task.setLockReason("Replacement applied");
                task.setNotes("Replacement applied - task closed");
                if (task.getCompletedAt() == null) {
                    task.setCompletedAt(LocalDateTime.now());
                }
                taskRepository.save(task);
            }
        }

        notificationService.createNotification(
                order.getCustomerId(),
                Notification.RecipientType.CUSTOMER,
                "Replacement Applied",
                "Replacement applied for order #" + order.getOrderNumber() + ". Delivery will continue.",
        Notification.NotificationType.ORDER_STATUS_CHANGED,
                order.getId()
        );

        return request;
    }

    private void recalculateTotals(Order order) {
    double subtotal = 0.0;
    if (order.getItems() != null) {
        subtotal = order.getItems().stream()
            .mapToDouble(item -> (item.getPrice() != null ? item.getPrice() : 0.0) * (item.getQuantity() != null ? item.getQuantity() : 0))
            .sum();
    }
        order.setSubtotal(subtotal);

        double discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : 0.0;
        double delivery = order.getDeliveryFee() != null ? order.getDeliveryFee() : 0.0;
        double walletUsed = order.getWalletAmountUsed() != null ? order.getWalletAmountUsed() : 0.0;

        double total = subtotal - discount + delivery - walletUsed;
        order.setTotalAmount(Math.max(total, 0.0));
    }

    private void ensureItemIds(Order order) {
        boolean updated = false;
        if (order.getItems() != null) {
            for (Order.OrderItem item : order.getItems()) {
                if (item.getItemId() == null || item.getItemId().isBlank()) {
                    item.setItemId("ITEM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                    updated = true;
                }
                if (item.getReplaced() == null) {
                    item.setReplaced(false);
                    updated = true;
                }
            }
        }
        if (updated) {
            orderRepository.save(order);
        }
    }

    private Order.OrderItem findItemById(Order order, String itemId) {
        if (order.getItems() == null || itemId == null) {
            return null;
        }
        return order.getItems().stream()
                .filter(item -> itemId.equals(item.getItemId()))
                .findFirst()
                .orElse(null);
    }
}
