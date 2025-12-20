package org.example.repository;

import org.example.entity.Coupon;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends MongoRepository<Coupon, String> {

    Optional<Coupon> findByCode(String code);

    List<Coupon> findByActive(Boolean active);

    List<Coupon> findByActiveTrue();

    List<Coupon> findByValidFromBeforeAndValidUntilAfterAndActiveTrue(
        LocalDateTime now1, LocalDateTime now2, Boolean active
    );

    boolean existsByCode(String code);
}

