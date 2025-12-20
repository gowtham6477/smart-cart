package org.example.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.example.entity.Service;
import org.example.entity.ServicePackage;
import org.example.repository.ServicePackageRepository;
import org.example.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Configuration
@Profile("!prod")
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ServicePackageRepository packageRepository;

    private static final List<CategorySeed> CATEGORIES = Arrays.asList(
            new CategorySeed("Antiques", "ANTIQUES", "🏺", 480.0, "Rare, preserved pieces", List.of("Museum-grade", "Certificate available")),
            new CategorySeed("Batteries", "BATTERIES", "🔋", 140.0, "Industrial-grade battery", List.of("High capacity", "Long cycle life")),
            new CategorySeed("Ceramics", "CERAMICS", "🏺", 120.0, "Handmade ceramic ware", List.of("Kiln fired", "Lead-free glaze")),
            new CategorySeed("Dairy", "DAIRY", "🥛", 20.0, "Premium dairy selection", List.of("Fresh sourced", "Cold chain")),
            new CategorySeed("Electronics", "ELECTRONICS", "📱", 320.0, "Latest electronic gadget", List.of("Warranty included", "Tested")),
            new CategorySeed("Flammable Liquids", "FLAMMABLE_LIQUIDS", "🔥", 90.0, "Controlled-grade liquids", List.of("UN compliant", "Safety sealed")),
            new CategorySeed("Glassware", "GLASSWARE", "🍷", 75.0, "Crystal glassware", List.of("Lead-free", "Dishwasher safe")),
            new CategorySeed("High-End Jewelry", "JEWELRY", "💍", 1100.0, "Luxury jewelry piece", List.of("Hallmarked", "Premium cut")),
            new CategorySeed("Industrial Equipment", "INDUSTRIAL_EQUIPMENT", "⚙️", 2200.0, "Heavy-duty industrial tool", List.of("Warranty", "Serviceable")),
            new CategorySeed("Musical Instruments", "MUSICAL_INSTRUMENTS", "🎸", 650.0, "Performance-grade instrument", List.of("Tonewood", "Setup done")),
            new CategorySeed("Pharmaceuticals", "PHARMACEUTICALS", "💊", 45.0, "Pharma-grade supply", List.of("Batch tracked", "Cold chain")),
            new CategorySeed("Sculptures", "SCULPTURES", "🗿", 700.0, "Artisanal sculpture", List.of("Hand-finished", "Gallery ready")),
            new CategorySeed("TVs & Monitors", "TV_MONITOR", "📺", 950.0, "High-definition display", List.of("HDR", "Wide color")),
            new CategorySeed("Vintage Heirloom", "VINTAGE_HEIRLOOM", "👑", 1500.0, "Curated heirloom piece", List.of("Restored", "Display case"))
    );

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
            seed();
        } catch (Exception ex) {
            log.error("Data seeding failed", ex);
        }
    }

    public void seed() {
        if (serviceRepository.count() > 0) {
            log.info("Clearing existing services/packages for fresh dev seed");
            packageRepository.deleteAll();
            serviceRepository.deleteAll();
        }

        log.info("Seeding initial products and packages");

        List<Service> services = new ArrayList<>();
        for (CategorySeed cat : CATEGORIES) {
            for (int i = 1; i <= 10; i++) {
                double price = roundPrice(cat.basePrice + (i * 5));
                services.add(createService(
                        cat.displayName + " Item " + i,
                        cat.description + " (" + cat.icon + ")",
                        cat.code,
                        null,
                        price,
                        0,
                        cat.features
                ));
            }
        }

        serviceRepository.saveAll(services);
        log.info("Services saved, now creating packages...");

        List<ServicePackage> allPackages = new ArrayList<>();
        for (Service svc : services) {
            ServicePackage standard = new ServicePackage(
                    null,
                    svc.getId(),
                    "Standard",
                    "Base offering",
                    roundPrice(svc.getBasePrice()),
                    null,
                    new String[]{"Secure packaging"},
                    true,
                    null,
                    null
            );

            ServicePackage insured = new ServicePackage(
                    null,
                    svc.getId(),
                    "Insured Shipping",
                    "Includes transit insurance and priority handling",
                    roundPrice(svc.getBasePrice() * 1.05),
                    null,
                    new String[]{"Priority dispatch", "Transit insurance"},
                    true,
                    null,
                    null
            );

            allPackages.add(standard);
            allPackages.add(insured);
        }

        packageRepository.saveAll(allPackages);
        log.info("Packages saved: {} packages for {} services", allPackages.size(), services.size());

        log.info("Seed completed: {} products", services.size());
    }

    private Service createService(String name, String description, String category, String imageUrl, Double price, Integer duration, List<String> features) {
        Service svc = new Service();
        svc.setId(UUID.randomUUID().toString());
        svc.setName(name);
        svc.setDescription(description);
        svc.setCategory(category);
        svc.setImageUrl(null); // no images, icons used on frontend
        svc.setActive(true);
        svc.setBasePrice(price);
        svc.setEstimatedDuration(duration);
        svc.setFeatures(features);
        return svc;
    }

    private Double roundPrice(Double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private record CategorySeed(String displayName, String code, String icon, double basePrice, String description, List<String> features) {}
}
