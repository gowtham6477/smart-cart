package org.example.repository;

import org.example.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByRecipientIdAndRecipientTypeOrderByCreatedAtDesc(
        String recipientId,
        Notification.RecipientType recipientType
    );

    List<Notification> findByRecipientIdAndRecipientTypeAndIsReadOrderByCreatedAtDesc(
        String recipientId,
        Notification.RecipientType recipientType,
        boolean isRead
    );

    long countByRecipientIdAndRecipientTypeAndIsRead(
        String recipientId,
        Notification.RecipientType recipientType,
        boolean isRead
    );
}

