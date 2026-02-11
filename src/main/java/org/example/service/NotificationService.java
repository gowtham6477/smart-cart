package org.example.service;

import org.example.entity.Notification;
import org.example.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(
        String recipientId,
        Notification.RecipientType recipientType,
        String title,
        String message,
        Notification.NotificationType type,
        String relatedEntityId
    ) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setRecipientType(recipientType);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedEntityId(relatedEntityId);

        return notificationRepository.save(notification);
    }

    public List<Notification> getNotifications(String recipientId, Notification.RecipientType recipientType) {
        return notificationRepository.findByRecipientIdAndRecipientTypeOrderByCreatedAtDesc(
            recipientId, recipientType
        );
    }

    public List<Notification> getUnreadNotifications(String recipientId, Notification.RecipientType recipientType) {
        return notificationRepository.findByRecipientIdAndRecipientTypeAndIsReadOrderByCreatedAtDesc(
            recipientId, recipientType, false
        );
    }

    public long getUnreadCount(String recipientId, Notification.RecipientType recipientType) {
        return notificationRepository.countByRecipientIdAndRecipientTypeAndIsRead(
            recipientId, recipientType, false
        );
    }

    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    public void markAllAsRead(String recipientId, Notification.RecipientType recipientType) {
        List<Notification> notifications = notificationRepository
            .findByRecipientIdAndRecipientTypeAndIsReadOrderByCreatedAtDesc(
                recipientId, recipientType, false
            );

        notifications.forEach(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    // Helper methods for common notifications
    public void notifyTaskAssigned(String employeeId, String taskTitle, String taskId) {
        createNotification(
            employeeId,
            Notification.RecipientType.EMPLOYEE,
            "📋 New Task Assigned",
            "You have been assigned: " + taskTitle,
            Notification.NotificationType.TASK_ASSIGNED,
            taskId
        );
    }

    public void notifyAdminOrderStatusChange(String orderId, String status, String orderNumber) {
        String title;
        String message;
        Notification.NotificationType type = Notification.NotificationType.ORDER_STATUS_CHANGED;

        switch (status) {
            case "OUT FOR DELIVERY":
            case "OUT_FOR_DELIVERY":
                title = "🚚 Order Out for Delivery";
                message = "Order " + orderNumber + " is now out for delivery";
                type = Notification.NotificationType.ORDER_OUT_FOR_DELIVERY;
                break;
            case "DELIVERED":
                title = "✅ Order Delivered";
                message = "Order " + orderNumber + " has been delivered successfully";
                type = Notification.NotificationType.ORDER_DELIVERED;
                break;
            default:
                title = "📦 Order Status Updated";
                message = "Order " + orderNumber + " is now " + status;
        }

        createNotification(
            "admin",
            Notification.RecipientType.ADMIN,
            title,
            message,
            type,
            orderId
        );
    }

    public void notifyAdminOrderDamaged(String orderId, String orderNumber) {
        createNotification(
            "admin",
            Notification.RecipientType.ADMIN,
            "⚠️ Product Damaged - Refund Required",
            "Order " + orderNumber + " reported as damaged by delivery employee. Order status changed to REFUNDED.",
            Notification.NotificationType.ORDER_DAMAGED,
            orderId
        );
    }

    public void notifyAdminReplacement(String orderId, String orderNumber) {
        createNotification(
            "admin",
            Notification.RecipientType.ADMIN,
            "🔄 Replacement Requested - Delivery Delayed",
            "Replacement requested for Order " + orderNumber + ". Delivery will be delayed.",
            Notification.NotificationType.ORDER_REPLACEMENT_REQUESTED,
            orderId
        );
    }
}

