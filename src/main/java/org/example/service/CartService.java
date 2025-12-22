package org.example.service;

import org.example.entity.Cart;
import org.example.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    public Cart getCartByUserId(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    newCart.setItems(new ArrayList<>());
                    return cartRepository.save(newCart);
                });
    }

    @Transactional
    public Cart addItemToCart(String userId, Cart.CartItem item) {
        Cart cart = getCartByUserId(userId);

        // Check if item already exists
        boolean itemExists = false;
        for (Cart.CartItem existingItem : cart.getItems()) {
            if (existingItem.getServiceId().equals(item.getServiceId())) {
                existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
                itemExists = true;
                break;
            }
        }

        if (!itemExists) {
            cart.getItems().add(item);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItemFromCart(String userId, String serviceId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().removeIf(item -> item.getServiceId().equals(serviceId));
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateItemQuantity(String userId, String serviceId, Integer quantity) {
        Cart cart = getCartByUserId(userId);

        if (quantity <= 0) {
            cart.getItems().removeIf(item -> item.getServiceId().equals(serviceId));
        } else {
            for (Cart.CartItem item : cart.getItems()) {
                if (item.getServiceId().equals(serviceId)) {
                    item.setQuantity(quantity);
                    break;
                }
            }
        }

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(String userId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().clear();
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }
}

