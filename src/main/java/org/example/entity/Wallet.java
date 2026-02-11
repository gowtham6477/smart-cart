package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "wallets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Wallet {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private Double balance = 0.0;

    private List<Transaction> transactions = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Transaction {
        private String id;
        private TransactionType type;
        private Double amount;
        private String description;
        private String referenceId; // Order ID, etc.
        private LocalDateTime createdAt;

        public Transaction(TransactionType type, Double amount, String description, String referenceId) {
            this.id = java.util.UUID.randomUUID().toString();
            this.type = type;
            this.amount = amount;
            this.description = description;
            this.referenceId = referenceId;
            this.createdAt = LocalDateTime.now();
        }
    }

    public enum TransactionType {
        CREDIT,  // Money added (refund, cashback, etc.)
        DEBIT    // Money used (purchase)
    }

    // Helper method to add credit
    public void credit(Double amount, String description, String referenceId) {
        Transaction transaction = new Transaction(TransactionType.CREDIT, amount, description, referenceId);
        if (this.transactions == null) {
            this.transactions = new ArrayList<>();
        }
        this.transactions.add(0, transaction); // Add to beginning for recent first
        this.balance += amount;
    }

    // Helper method to debit
    public boolean debit(Double amount, String description, String referenceId) {
        if (this.balance < amount) {
            return false;
        }
        Transaction transaction = new Transaction(TransactionType.DEBIT, amount, description, referenceId);
        if (this.transactions == null) {
            this.transactions = new ArrayList<>();
        }
        this.transactions.add(0, transaction);
        this.balance -= amount;
        return true;
    }
}
