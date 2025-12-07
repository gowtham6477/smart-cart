package org.example.repository;

import org.example.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);
    List<Coupon> findByActiveTrue();
    List<Coupon> findByValidFromLessThanEqualAndValidUntilGreaterThanEqualAndActiveTrue(
        LocalDate startDate, LocalDate endDate);
}

