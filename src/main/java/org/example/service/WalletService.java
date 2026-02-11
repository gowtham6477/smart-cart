package org.example.service;

import org.example.entity.Wallet;
import org.example.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    /**
     * Get or create a wallet for a user
     */
    public Wallet getOrCreateWallet(String userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wallet wallet = new Wallet();
                    wallet.setUserId(userId);
                    wallet.setBalance(0.0);
                    return walletRepository.save(wallet);
                });
    }

    /**
     * Get wallet balance for a user
     */
    public Double getBalance(String userId) {
        Wallet wallet = getOrCreateWallet(userId);
        return wallet.getBalance();
    }

    /**
     * Get wallet with transactions
     */
    public Wallet getWallet(String userId) {
        return getOrCreateWallet(userId);
    }

    /**
     * Credit amount to user's wallet (refund, cashback, etc.)
     */
    @Transactional
    public Wallet creditWallet(String userId, Double amount, String description, String referenceId) {
        if (amount <= 0) {
            throw new RuntimeException("Credit amount must be positive");
        }
        
        Wallet wallet = getOrCreateWallet(userId);
        wallet.credit(amount, description, referenceId);
        return walletRepository.save(wallet);
    }

    /**
     * Debit amount from user's wallet (purchase)
     */
    @Transactional
    public Wallet debitWallet(String userId, Double amount, String description, String referenceId) {
        if (amount <= 0) {
            throw new RuntimeException("Debit amount must be positive");
        }
        
        Wallet wallet = getOrCreateWallet(userId);
        
        if (wallet.getBalance() < amount) {
            throw new RuntimeException("Insufficient wallet balance. Available: ₹" + wallet.getBalance());
        }
        
        boolean success = wallet.debit(amount, description, referenceId);
        if (!success) {
            throw new RuntimeException("Failed to debit wallet");
        }
        
        return walletRepository.save(wallet);
    }

    /**
     * Get recent transactions for a user
     */
    public List<Wallet.Transaction> getTransactions(String userId, int limit) {
        Wallet wallet = getOrCreateWallet(userId);
        List<Wallet.Transaction> transactions = wallet.getTransactions();
        
        if (transactions == null || transactions.isEmpty()) {
            return List.of();
        }
        
        if (limit > 0 && transactions.size() > limit) {
            return transactions.subList(0, limit);
        }
        
        return transactions;
    }

    /**
     * Credit refund to wallet
     */
    @Transactional
    public Wallet creditRefund(String userId, Double amount, String orderNumber, String orderId) {
        String description = "Refund for damaged order #" + orderNumber;
        return creditWallet(userId, amount, description, orderId);
    }
}
