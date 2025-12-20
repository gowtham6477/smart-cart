package org.example.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.example.entity.User;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Configuration
@Profile("!prod")
public class AdminUserSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        runSeed();
    }

    @PostConstruct
    public void init() {
        runSeed();
    }

    private void runSeed() {
        try {
            seedAdminUser();
        } catch (Exception ex) {
            log.error("Admin user seeding failed", ex);
        }
    }

    public void seedAdminUser() {
        // Check if admin user exists
        if (userRepository.findByEmail("admin@gmail.com").isPresent()) {
            log.info("Admin user already exists");
        } else {
            log.info("Creating default admin user");

            User admin = new User();
            admin.setId(UUID.randomUUID().toString());
            admin.setName("Admin User");
            admin.setEmail("admin@gmail.com");
            admin.setMobile("9999999999");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            admin.setAddress("Admin Office");
            admin.setCity("Admin City");
            admin.setState("Admin State");
            admin.setPincode("000000");
            admin.setActive(true);
            admin.setCreatedAt(LocalDateTime.now());

            userRepository.save(admin);

            log.info("Admin user created successfully: {}", admin.getEmail());
        }

        // Check if test customer exists
        if (userRepository.findByEmail("customer@test.com").isPresent()) {
            log.info("Test customer already exists");
        } else {
            log.info("Creating test customer user");

            User customer = new User();
            customer.setId(UUID.randomUUID().toString());
            customer.setName("Test Customer");
            customer.setEmail("customer@test.com");
            customer.setMobile("1234567890");
            customer.setPassword(passwordEncoder.encode("customer123"));
            customer.setRole(User.Role.CUSTOMER);
            customer.setAddress("123 Main Street");
            customer.setCity("Test City");
            customer.setState("Test State");
            customer.setPincode("123456");
            customer.setActive(true);
            customer.setCreatedAt(LocalDateTime.now());

            userRepository.save(customer);

            log.info("Test customer created successfully: {}", customer.getEmail());
        }
    }
}
