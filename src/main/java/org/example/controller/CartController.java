package org.example.controller;

import org.example.dto.ApiResponse;
import org.example.entity.Cart;
import org.example.security.JwtUtil;
import org.example.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/customer/cart")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('CUSTOMER')")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<Cart>> getCart(@RequestHeader("Authorization") String token) {
        try {
            String userId = extractUserIdFromToken(token);
            Cart cart = cartService.getCartByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Cart>> addItem(
            @RequestHeader("Authorization") String token,
            @RequestBody Cart.CartItem item) {
        try {
            String userId = extractUserIdFromToken(token);
            Cart cart = cartService.addItemToCart(userId, item);
            return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/remove/{serviceId}")
    public ResponseEntity<ApiResponse<Cart>> removeItem(
            @RequestHeader("Authorization") String token,
            @PathVariable String serviceId) {
        try {
            String userId = extractUserIdFromToken(token);
            Cart cart = cartService.removeItemFromCart(userId, serviceId);
            return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<Cart>> updateQuantity(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> request) {
        try {
            String userId = extractUserIdFromToken(token);
            String serviceId = (String) request.get("serviceId");
            Integer quantity = Integer.parseInt(request.get("quantity").toString());
            Cart cart = cartService.updateItemQuantity(userId, serviceId, quantity);
            return ResponseEntity.ok(ApiResponse.success("Quantity updated", cart));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart(@RequestHeader("Authorization") String token) {
        try {
            String userId = extractUserIdFromToken(token);
            cartService.clearCart(userId);
            return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    private String extractUserIdFromToken(String token) {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String userId = jwtUtil.extractUserId(token);

        if (userId == null || userId.isEmpty()) {
            throw new RuntimeException("User ID not found in token. Please log out and log in again to refresh your session.");
        }

        return userId;
    }
}

