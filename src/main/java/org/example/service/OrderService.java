package org.example.service;

import org.example.dto.OrderRequest;
import org.example.dto.OrderResponse;
import org.example.entity.Cart;
import org.example.entity.Order;
import org.example.entity.User;
import org.example.entity.Employee;
import org.example.entity.Task;
import org.example.entity.Notification;
import org.example.repository.CartRepository;
import org.example.repository.OrderRepository;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CouponService couponService;

    @Autowired
    private WalletService walletService;

    @Lazy
    @Autowired
    private TaskService taskService;

    @Autowired
    private org.example.repository.EmployeeRepository employeeRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public OrderResponse createOrderFromCart(String customerId, OrderRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Cart cart = cartRepository.findByUserId(customerId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Create order
        Order order = new Order();
        order.setOrderNumber("ORD" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setCustomerId(customer.getId());
        order.setCustomerName(customer.getName());
        order.setCustomerEmail(customer.getEmail());
        order.setCustomerMobile(customer.getMobile());

        // Convert cart items to order items
    List<Order.OrderItem> orderItems = cart.getItems().stream()
        .map(cartItem -> new Order.OrderItem(
            "ITEM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
            cartItem.getServiceId(),
            cartItem.getServiceName(),
            cartItem.getCategory(),
            cartItem.getPrice(),
            cartItem.getQuantity(),
            null,
            false,
            null,
            null
        ))
        .collect(Collectors.toList());

        order.setItems(orderItems);

        // Calculate totals
        double subtotal = orderItems.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        order.setSubtotal(subtotal);
        order.setDiscountAmount(0.0);
        order.setDeliveryFee(0.0);

        // Apply coupon if provided
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            try {
                BigDecimal discount = couponService.applyCoupon(request.getCouponCode(), subtotal);
                order.setCouponCode(request.getCouponCode());
                order.setDiscountAmount(discount.doubleValue());
            } catch (Exception e) {
                System.err.println("Coupon application failed: " + e.getMessage());
            }
        }

        // Calculate amount after coupon discount
        double amountAfterDiscount = subtotal - order.getDiscountAmount() + order.getDeliveryFee();

        // Apply wallet balance if requested
        order.setWalletAmountUsed(0.0);
        if (request.getUseWallet() != null && request.getUseWallet()) {
            Double walletBalance = walletService.getBalance(customerId);
            if (walletBalance > 0) {
                // Determine how much to use from wallet
                Double walletToUse;
                if (request.getWalletAmount() != null && request.getWalletAmount() > 0) {
                    // Use specified amount (capped at balance and order amount)
                    walletToUse = Math.min(request.getWalletAmount(), Math.min(walletBalance, amountAfterDiscount));
                } else {
                    // Use as much as possible
                    walletToUse = Math.min(walletBalance, amountAfterDiscount);
                }

                if (walletToUse > 0) {
                    // Debit from wallet
                    walletService.debitWallet(
                        customerId,
                        walletToUse,
                        "Payment for order #" + order.getOrderNumber(),
                        order.getId()
                    );
                    order.setWalletAmountUsed(walletToUse);
                    amountAfterDiscount -= walletToUse;
                }
            }
        }

        order.setTotalAmount(amountAfterDiscount);

        // Set delivery address
        order.setDeliveryAddress(request.getDeliveryAddress() != null ? request.getDeliveryAddress() : customer.getAddress());
        order.setCity(request.getCity() != null ? request.getCity() : customer.getCity());
        order.setPincode(request.getPincode() != null ? request.getPincode() : customer.getPincode());
        order.setCustomerNote(request.getCustomerNote());

        order.setStatus(Order.OrderStatus.PENDING);
        order.setEstimatedDelivery(LocalDateTime.now().plusDays(3)); // Default 3 days

        // Save order
        order = orderRepository.save(order);

        // Clear cart after successful order
        cart.setItems(new ArrayList<>());
        cartRepository.save(cart);

        return mapToResponse(order);
    }

    public List<OrderResponse> getCustomerOrders(String customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getEmployeeOrders(String employeeId) {
    return orderRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .collect(Collectors.toMap(order -> order.getOrderNumber() != null ? order.getOrderNumber() : order.getId(), order -> order, (a, b) -> a))
        .values()
        .stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToResponse(order);
    }

    public OrderResponse updateOrderStatus(String orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Order.OrderStatus oldStatus = order.getStatus();
        order.setStatus(status);

        if (status == Order.OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        // Credit wallet when order is refunded
        if (status == Order.OrderStatus.REFUNDED && oldStatus != Order.OrderStatus.REFUNDED) {
            Double totalAmount = order.getTotalAmount();
            String customerId = order.getCustomerId();
            
            if (totalAmount != null && totalAmount > 0 && customerId != null) {
                walletService.creditWallet(customerId, totalAmount, 
                    "Refund for order #" + order.getOrderNumber(), order.getId());
                
                // Notify customer about refund
                notificationService.createNotification(
                    customerId,
                    Notification.RecipientType.CUSTOMER,
                    "Refund Processed",
                    "₹" + String.format("%.2f", totalAmount) + " has been credited to your wallet for order #" + order.getOrderNumber(),
                    Notification.NotificationType.ORDER_REFUNDED,
                    order.getId()
                );
            }
        }

        order = orderRepository.save(order);
        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse assignEmployee(String orderId, String employeeId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Find employee record
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Update order with employee info
        order.setEmployeeId(employee.getId());
        order.setEmployeeName(employee.getName());
        order.setEmployeeMobile(employee.getPhone());
        order.setAssignedAt(LocalDateTime.now());

        // Update status to ASSIGNED when employee is assigned
        order.setStatus(Order.OrderStatus.ASSIGNED);

        order = orderRepository.save(order);

        // Create a Task for the employee
        Task task = new Task();
        task.setTaskNumber(generateTaskNumber());
        task.setTitle("Order Delivery: " + order.getOrderNumber());

        StringBuilder description = new StringBuilder();
        description.append("Customer: ").append(order.getCustomerName()).append("\n");
        description.append("Order: ").append(order.getOrderNumber()).append("\n");
        description.append("Items: ").append(order.getItems().size()).append(" item(s)\n");
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            description.append("\nOrder Items:\n");
            for (Order.OrderItem item : order.getItems()) {
                description.append("- ").append(item.getProductName())
                          .append(" x").append(item.getQuantity())
                          .append(" (₹").append(item.getPrice()).append(")\n");
            }
        }
        description.append("\nDelivery Address: ").append(order.getDeliveryAddress());
        if (order.getCity() != null) {
            description.append(", ").append(order.getCity());
        }
        if (order.getPincode() != null) {
            description.append(" - ").append(order.getPincode());
        }

        task.setDescription(description.toString());
        task.setOrderId(order.getId());
        task.setAssignedTo(employee.getId());
        task.setAssignedToName(employee.getName());
        task.setPriority(Task.TaskPriority.HIGH);
        task.setStatus(Task.TaskStatus.ASSIGNED);
        task.setAssignedAt(LocalDateTime.now());
        task.setAssignedBy("Admin");
        task.setDueDate(order.getEstimatedDelivery());
        task.setCreatedAt(LocalDateTime.now());

        taskService.saveTask(task);

        // Send notification to employee
        notificationService.notifyTaskAssigned(
            employee.getId(),
            task.getTitle(),
            task.getId()
        );

        return mapToResponse(order);
    }

    /**
     * Update order status to OUT_FOR_DELIVERY when employee uploads image
     */
    @Transactional
    public void updateOrderStatusOnImageUpload(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Only update if order is in CONFIRMED, PROCESSING, or ASSIGNED status
        if (order.getStatus() == Order.OrderStatus.CONFIRMED ||
            order.getStatus() == Order.OrderStatus.PROCESSING ||
            order.getStatus() == Order.OrderStatus.ASSIGNED) {
            order.setStatus(Order.OrderStatus.OUT_FOR_DELIVERY);
            orderRepository.save(order);

            // Notify admin
            notificationService.notifyAdminOrderStatusChange(
                order.getId(),
                "OUT FOR DELIVERY",
                order.getOrderNumber()
            );
        }
    }

    /**
     * Update order status to DELIVERED when task is completed
     */
    @Transactional
    public void updateOrderStatusOnTaskComplete(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(Order.OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());
        orderRepository.save(order);

        // Notify admin
        notificationService.notifyAdminOrderStatusChange(
            order.getId(),
            "DELIVERED",
            order.getOrderNumber()
        );
    }
    @Transactional
    public void updateOrderStatusOnTaskCompletion(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(Order.OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    /**
     * Get order by task ID
     */
    public Order getOrderByTaskId(String taskId) {
        Task task = taskService.getTaskById(taskId);
        if (task.getOrderId() != null) {
            return orderRepository.findById(task.getOrderId()).orElse(null);
        }
        return null;
    }

    private String generateTaskNumber() {
        return "TASK-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }

    private OrderResponse mapToResponse(Order order) {
        ensureItemIds(order);
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setCustomerId(order.getCustomerId());
        response.setCustomerName(order.getCustomerName());
        response.setCustomerEmail(order.getCustomerEmail());
        response.setCustomerMobile(order.getCustomerMobile());
        response.setItems(order.getItems());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setCity(order.getCity());
        response.setState(order.getState());
        response.setPincode(order.getPincode());
        response.setSubtotal(order.getSubtotal());
        response.setDiscountAmount(order.getDiscountAmount());
        response.setWalletAmountUsed(order.getWalletAmountUsed());
        response.setDeliveryFee(order.getDeliveryFee());
        response.setTotalAmount(order.getTotalAmount());
        response.setCouponCode(order.getCouponCode());
        response.setStatus(order.getStatus().name());
        response.setCustomerNote(order.getCustomerNote());
    response.setReturnToHubReason(order.getReturnToHubReason());
        response.setTrackingNumber(order.getTrackingNumber());
        response.setEstimatedDelivery(order.getEstimatedDelivery());
        response.setDeliveredAt(order.getDeliveredAt());
        response.setEmployeeId(order.getEmployeeId());
        response.setEmployeeName(order.getEmployeeName());
        response.setEmployeeMobile(order.getEmployeeMobile());
        response.setAssignedAt(order.getAssignedAt());
        response.setRating(order.getRating());
        response.setReview(order.getReview());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        return response;
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
}

