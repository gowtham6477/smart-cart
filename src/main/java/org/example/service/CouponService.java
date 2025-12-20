package org.example.service;

import org.example.dto.CouponRequest;
import org.example.entity.Coupon;
import org.example.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public List<Coupon> getActiveCoupons() {
        return couponRepository.findByActive(true);
    }

    public Coupon getCouponById(String couponId) {
        return couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
    }

    public Coupon getCouponByCode(String code) {
        return couponRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
    }

    @Transactional
    public Coupon createCoupon(CouponRequest request) {
        if (couponRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Coupon code already exists");
        }

        Coupon coupon = new Coupon();
        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDescription(request.getDescription());
        coupon.setDiscountType(Coupon.DiscountType.valueOf(request.getDiscountType().toUpperCase()));
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderValue(request.getMinOrderValue());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setValidFrom(request.getValidFrom());
        coupon.setValidUntil(request.getValidUntil());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setUsedCount(0);
        coupon.setActive(request.getActive());

        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon updateCoupon(String couponId, CouponRequest request) {
        Coupon coupon = getCouponById(couponId);

        coupon.setDescription(request.getDescription());
        coupon.setDiscountType(Coupon.DiscountType.valueOf(request.getDiscountType().toUpperCase()));
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderValue(request.getMinOrderValue());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setValidFrom(request.getValidFrom());
        coupon.setValidUntil(request.getValidUntil());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setActive(request.getActive());
        coupon.setUpdatedAt(LocalDateTime.now());

        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(String couponId) {
        if (!couponRepository.existsById(couponId)) {
            throw new RuntimeException("Coupon not found");
        }
        couponRepository.deleteById(couponId);
    }

    @Transactional
    public BigDecimal applyCoupon(String code, Double orderAmount) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Invalid coupon code"));

        // Validate coupon
        if (!coupon.getActive()) {
            throw new RuntimeException("Coupon is not active");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(coupon.getValidFrom()) || now.isAfter(coupon.getValidUntil())) {
            throw new RuntimeException("Coupon is not valid at this time");
        }

        if (coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new RuntimeException("Coupon usage limit exceeded");
        }

        if (orderAmount < coupon.getMinOrderValue()) {
            throw new RuntimeException("Minimum order value not met. Required: ₹" + coupon.getMinOrderValue());
        }

        // Calculate discount
        BigDecimal discount;
        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            discount = BigDecimal.valueOf(orderAmount * coupon.getDiscountValue() / 100);
            if (coupon.getMaxDiscountAmount() != null && discount.doubleValue() > coupon.getMaxDiscountAmount()) {
                discount = BigDecimal.valueOf(coupon.getMaxDiscountAmount());
            }
        } else {
            discount = BigDecimal.valueOf(coupon.getDiscountValue());
        }

        // Increment usage count
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        return discount;
    }

    public BigDecimal validateCoupon(String code, Double orderAmount) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Invalid coupon code"));

        if (!coupon.getActive()) {
            throw new RuntimeException("Coupon is not active");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(coupon.getValidFrom()) || now.isAfter(coupon.getValidUntil())) {
            throw new RuntimeException("Coupon is not valid at this time");
        }

        if (orderAmount < coupon.getMinOrderValue()) {
            throw new RuntimeException("Minimum order value not met");
        }

        // Calculate potential discount without applying
        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            BigDecimal discount = BigDecimal.valueOf(orderAmount * coupon.getDiscountValue() / 100);
            if (coupon.getMaxDiscountAmount() != null && discount.doubleValue() > coupon.getMaxDiscountAmount()) {
                return BigDecimal.valueOf(coupon.getMaxDiscountAmount());
            }
            return discount;
        } else {
            return BigDecimal.valueOf(coupon.getDiscountValue());
        }
    }
}

