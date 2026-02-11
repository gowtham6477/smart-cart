package org.example.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    private String recipientId; // Employee or Admin ID
    private RecipientType recipientType; // EMPLOYEE or ADMIN
    private String title;
    private String message;
    private NotificationType type;
    private String relatedEntityId; // Order ID, Task ID, etc.
    private boolean isRead;
    private LocalDateTime createdAt;

    public enum RecipientType {
        EMPLOYEE, ADMIN, CUSTOMER
    }

    public enum NotificationType {
        TASK_ASSIGNED,
        TASK_STATUS_CHANGED,
        ORDER_STATUS_CHANGED,
        ORDER_OUT_FOR_DELIVERY,
        ORDER_DELIVERED,
        ORDER_DAMAGED,
        ORDER_REPLACEMENT_REQUESTED,
        ORDER_REFUNDED,
        CHECK_IN,
        CHECK_OUT,
        GENERAL
    }

    public Notification() {
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public RecipientType getRecipientType() {
        return recipientType;
    }

    public void setRecipientType(RecipientType recipientType) {
        this.recipientType = recipientType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getRelatedEntityId() {
        return relatedEntityId;
    }

    public void setRelatedEntityId(String relatedEntityId) {
        this.relatedEntityId = relatedEntityId;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

