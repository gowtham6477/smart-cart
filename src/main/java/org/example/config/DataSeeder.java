package org.example.config;


import org.example.entity.Service;
import org.example.entity.ServicePackage;
import org.example.repository.ServiceRepository;
import org.example.repository.ServicePackageRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

@Configuration
@Slf4j
public class DataSeeder {

    private record ProductData(String category, String name, String description, double price, String imageUrl) {}

    private static final List<ProductData> PRODUCTS = List.of(
        new ProductData("ANTIQUES", "Victorian Mantel Clock",
            "Exquisite 19th century brass and mahogany mantel clock with Westminster chimes.",
            1250.00, "https://images.unsplash.com/photo-1415604934674-561df9abf539?w=500&h=500&fit=crop"),
        new ProductData("ANTIQUES", "Ming Dynasty Ceramic Vase",
            "Authentic Ming period blue and white porcelain vase with provenance documentation.",
            8500.00, "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&h=500&fit=crop"),
        new ProductData("ANTIQUES", "Art Deco Bronze Lamp",
            "1920s French art deco figural lamp with original glass shade. Signed by artist.",
            2200.00, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop"),

        new ProductData("BATTERIES", "Tesla Powerwall 2",
            "Home battery system with 13.5kWh capacity. Professional installation included.",
            12500.00, "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=500&h=500&fit=crop"),
        new ProductData("BATTERIES", "LG RESU10H Prime",
            "High-voltage lithium battery for solar systems. 9.6kWh usable capacity.",
            8900.00, "https://images.unsplash.com/photo-1619641805634-b867e02b3d69?w=500&h=500&fit=crop"),
        new ProductData("BATTERIES", "Anker PowerCore 26800mAh",
            "Portable power bank with 3 USB ports. Fast charging, airline approved.",
            65.00, "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop"),

        new ProductData("CERAMICS", "Japanese Raku Tea Set",
            "Traditional Japanese tea ceremony set with 5 cups. Handcrafted in Kyoto.",
            450.00, "https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=500&h=500&fit=crop"),
        new ProductData("CERAMICS", "Italian Majolica Vase",
            "Hand-painted Renaissance style majolica from Deruta, Italy.",
            380.00, "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&h=500&fit=crop"),
        new ProductData("CERAMICS", "Wedgwood Jasperware Collection",
            "Classic blue jasperware collection including vase, trinket box, and plate.",
            550.00, "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=500&h=500&fit=crop"),

        new ProductData("DAIRY", "Amul Premium Butter 500g",
            "Fresh pasteurized butter made from pure milk cream.",
            6.50, "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&h=500&fit=crop"),
        new ProductData("DAIRY", "Organic Valley Fresh Paneer",
            "Fresh cottage cheese made from organic whole milk. High protein.",
            8.99, "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&h=500&fit=crop"),
        new ProductData("DAIRY", "Aged Gruyere Swiss Cheese",
            "18-month aged Swiss Gruyere. Nutty, complex flavor.",
            24.99, "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&h=500&fit=crop"),

        new ProductData("ELECTRONICS", "iPhone 15 Pro Max",
            "Apple flagship with A17 Pro chip, titanium design, 48MP camera, 256GB.",
            1199.00, "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop"),
        new ProductData("ELECTRONICS", "MacBook Pro 14 M3 Pro",
            "14-inch Liquid Retina XDR display, M3 Pro chip, 18GB RAM, 512GB SSD.",
            1999.00, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop"),
        new ProductData("ELECTRONICS", "Sony WH-1000XM5",
            "Industry-leading noise canceling headphones. 30-hour battery.",
            349.99, "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&h=500&fit=crop"),

        new ProductData("FIREWORKS", "Grand Finale Assortment Box",
            "Professional-grade celebration pack with 200+ shots, shells, fountains.",
            299.99, "https://images.unsplash.com/photo-1498931299839-881f85e06468?w=500&h=500&fit=crop"),
        new ProductData("FIREWORKS", "Golden Dragon Display Kit",
            "Premium Chinese fireworks set with crackling effects and repeaters.",
            189.00, "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=500&h=500&fit=crop"),
        new ProductData("FIREWORKS", "Sparkler Party Pack 100ct",
            "Premium gold and silver sparklers. 10-inch length, 45-second burn.",
            35.00, "https://images.unsplash.com/photo-1533230408708-8f9f91d1235a?w=500&h=500&fit=crop"),

        new ProductData("FLAMMABLE_LIQUIDS", "Isopropyl Alcohol 99%",
            "Laboratory grade 99% IPA. 5-liter container, UN certified.",
            65.00, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop"),
        new ProductData("FLAMMABLE_LIQUIDS", "Acetone Technical Grade",
            "High-purity acetone for industrial use. 20-liter drum.",
            120.00, "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=500&h=500&fit=crop"),
        new ProductData("FLAMMABLE_LIQUIDS", "Ethanol Denatured 95%",
            "Denatured ethyl alcohol for cleaning. 10-liter container.",
            89.00, "https://images.unsplash.com/photo-1616261167032-b16d2df8333b?w=500&h=500&fit=crop"),

        new ProductData("GLASSWARE", "Waterford Crystal Wine Set",
            "Set of 6 Waterford Lismore wine glasses. Hand-cut Irish crystal.",
            450.00, "https://images.unsplash.com/photo-1584306670957-acf935f5033c?w=500&h=500&fit=crop"),
        new ProductData("GLASSWARE", "Murano Glass Chandelier",
            "Authentic Venetian Murano glass chandelier. Hand-blown, 12 arms.",
            3200.00, "https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=500&h=500&fit=crop"),
        new ProductData("GLASSWARE", "Borosilicate Lab Flask Set",
            "Professional chemistry flask set. 250ml, 500ml, 1000ml Erlenmeyer.",
            125.00, "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500&h=500&fit=crop"),

        new ProductData("JEWELRY", "Tiffany Diamond Solitaire Ring",
            "1.5 carat round brilliant diamond in platinum. VS1, F color, GIA.",
            15000.00, "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop"),
        new ProductData("JEWELRY", "Cartier Love Bracelet",
            "18K yellow gold with 4 diamonds. Iconic screw motif design.",
            7850.00, "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop"),
        new ProductData("JEWELRY", "Rolex Submariner Date",
            "Oystersteel with black Cerachrom bezel. 41mm, automatic, 2024 model.",
            14500.00, "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=500&fit=crop"),

        new ProductData("MUSICAL_INSTRUMENTS", "Gibson Les Paul Standard",
            "Classic Les Paul in Heritage Cherry Sunburst. Burstbucker pickups.",
            2799.00, "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=500&h=500&fit=crop"),
        new ProductData("MUSICAL_INSTRUMENTS", "Yamaha C40 Classical Guitar",
            "Full-size classical guitar. Spruce top, meranti back and sides.",
            149.99, "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&h=500&fit=crop"),
        new ProductData("MUSICAL_INSTRUMENTS", "Roland TD-17KVX Drum Kit",
            "Premium electronic V-Drums with mesh heads and module.",
            2199.00, "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=500&h=500&fit=crop"),

        new ProductData("PAINTINGS", "Original Oil Landscape",
            "Contemporary landscape oil on canvas. 36x48 inches, gallery wrapped.",
            2800.00, "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&h=500&fit=crop"),
        new ProductData("PAINTINGS", "Abstract Expressionist Acrylic",
            "Bold abstract composition in acrylics. 40x60 inches, museum quality.",
            3500.00, "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=500&fit=crop"),
        new ProductData("PAINTINGS", "Vintage Portrait Study",
            "19th century oil portrait of aristocrat. Restored with period frame.",
            5200.00, "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=500&h=500&fit=crop"),

        new ProductData("SCULPTURES", "Bronze Horse Sculpture",
            "Life-size bronze horse by renowned artist. Patinated, indoor/outdoor.",
            18500.00, "https://images.unsplash.com/photo-1544413660-299165566b1d?w=500&h=500&fit=crop"),
        new ProductData("SCULPTURES", "Marble Venus Replica",
            "Hand-carved Italian Carrara marble. Venus de Milo replica, 4 feet.",
            6800.00, "https://images.unsplash.com/photo-1561839561-b13bcfe95249?w=500&h=500&fit=crop"),
        new ProductData("SCULPTURES", "Modern Steel Abstract",
            "Contemporary welded steel sculpture. Geometric forms, 3 feet tall.",
            4200.00, "https://images.unsplash.com/photo-1549887534-1541e9326642?w=500&h=500&fit=crop"),

        new ProductData("TV_MONITOR", "LG C3 65-inch OLED TV",
            "4K OLED evo with Dolby Vision, webOS 23, perfect blacks. 2023.",
            1799.00, "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=500&fit=crop"),
        new ProductData("TV_MONITOR", "Samsung Odyssey G9 Monitor",
            "49-inch curved gaming monitor. QLED, 240Hz, 1ms, G-Sync.",
            1299.00, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=500&fit=crop"),
        new ProductData("TV_MONITOR", "Dell UltraSharp U2723QE",
            "27-inch 4K USB-C Hub Monitor. IPS Black, 100% sRGB, built-in KVM.",
            799.00, "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=500&h=500&fit=crop"),

        new ProductData("VINTAGE_HEIRLOOM", "Antique Pocket Watch",
            "1890s Swiss pocket watch. 18K gold, enamel dial, fully serviced.",
            3200.00, "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=500&h=500&fit=crop"),
        new ProductData("VINTAGE_HEIRLOOM", "Victorian Jewelry Box",
            "Ornate mahogany jewelry box with mother-of-pearl inlay. Working lock.",
            890.00, "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop"),
        new ProductData("VINTAGE_HEIRLOOM", "Estate Silver Tea Service",
            "Georgian sterling silver 5-piece tea service. London 1820 hallmark.",
            12500.00, "https://images.unsplash.com/photo-1563826904577-6b72c5d75e53?w=500&h=500&fit=crop")
    );

    @Bean
    CommandLineRunner seedDevProducts(ServiceRepository serviceRepository, ServicePackageRepository packageRepository) {
        return args -> {
            // Only seed if database is empty (first time setup)
            long existingProducts = serviceRepository.count();
            if (existingProducts > 0) {
                log.info("Found {} existing products in database, skipping seed.", existingProducts);
                return;
            }

            log.info("Database empty, seeding {} initial products...", PRODUCTS.size());

            List<Service> services = new ArrayList<>();
            List<ServicePackage> packages = new ArrayList<>();

            for (ProductData product : PRODUCTS) {
                Service service = createService(product);
                services.add(service);
            }

            services = serviceRepository.saveAll(services);
            log.info("Saved {} products", services.size());

            for (Service service : services) {
                packages.add(createStandardPackage(service));
                packages.add(createInsuredPackage(service));
            }

            packageRepository.saveAll(packages);
            log.info("Saved {} packages (2 per product)", packages.size());
        };
    }

    private Service createService(ProductData product) {
        Service service = new Service();
        service.setName(product.name());
        service.setDescription(product.description());
        service.setCategory(product.category());
        service.setImageUrl(product.imageUrl());
        service.setBasePrice(product.price());
        service.setActive(true);  // Make sure products are active
        service.setFeatures(getFeatures(product.category()));
        return service;
    }

    private ServicePackage createStandardPackage(Service service) {
        ServicePackage pkg = new ServicePackage();
        pkg.setServiceId(service.getId());
        pkg.setName("Standard Handling");
        pkg.setDescription("Professional handling with standard packaging and delivery.");
        pkg.setPrice(roundPrice(service.getBasePrice() * 0.1));
        pkg.setInclusions(new String[]{"Standard packaging", "Tracking included", "5-7 day delivery", "Email support"});
        return pkg;
    }

    private ServicePackage createInsuredPackage(Service service) {
        ServicePackage pkg = new ServicePackage();
        pkg.setServiceId(service.getId());
        pkg.setName("Premium Insured");
        pkg.setDescription("Full insurance coverage with priority handling and white-glove delivery.");
        pkg.setPrice(roundPrice(service.getBasePrice() * 0.25));
        pkg.setInclusions(new String[]{"Full insurance coverage", "Priority handling", "White-glove delivery", "2-3 day delivery", "24/7 phone support"});
        return pkg;
    }

    private List<String> getFeatures(String category) {
        return switch (category) {
            case "ANTIQUES" -> List.of("Authentication certificate", "Climate-controlled storage", "Restoration history");
            case "BATTERIES" -> List.of("Certified safe transport", "Temperature monitoring", "Compliance documentation");
            case "CERAMICS" -> List.of("Foam cushioning", "Vibration protection", "Humidity control");
            case "DAIRY" -> List.of("Cold chain delivery", "Temperature tracking", "Freshness guarantee");
            case "ELECTRONICS" -> List.of("Anti-static packaging", "Insurance included", "Setup assistance");
            case "FIREWORKS" -> List.of("Licensed transport", "Safety certified", "Storage guidelines");
            case "FLAMMABLE_LIQUIDS" -> List.of("Hazmat certified", "UN packaging", "Safety documentation");
            case "GLASSWARE" -> List.of("Custom foam inserts", "Fragile handling", "Inspection on delivery");
            case "JEWELRY" -> List.of("Secure vault storage", "Appraisal included", "Discrete packaging");
            case "MUSICAL_INSTRUMENTS" -> List.of("Custom flight case", "Humidity packs", "Tuning on delivery");
            case "PAINTINGS" -> List.of("Museum crating", "UV protection", "Climate control");
            case "SCULPTURES" -> List.of("Custom rigging", "Weight distribution", "Assembly service");
            case "TV_MONITOR" -> List.of("Original packaging", "Screen protection", "Installation available");
            case "VINTAGE_HEIRLOOM" -> List.of("Provenance documentation", "Conservation report", "Archival storage");
            default -> List.of("Professional handling", "Tracking included", "Customer support");
        };
    }

    private double roundPrice(double price) {
        return Math.round(price * 100.0) / 100.0;
    }
}
