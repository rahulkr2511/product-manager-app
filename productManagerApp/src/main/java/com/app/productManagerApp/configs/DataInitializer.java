package com.app.productManagerApp.configs; // Adjust to your actual package

import com.app.productManagerApp.model.Product;
import com.app.productManagerApp.repository.ProductRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Configuration
public class DataInitializer {

    // Helper method to read image bytes from src/main/resources/
    private byte[] loadImageBytes(String resourcePath) {
        try {
            return new ClassPathResource(resourcePath).getInputStream().readAllBytes();
        } catch (Exception e) {
            System.err.println("⚠️ Could not load image from " + resourcePath + ": " + e.getMessage());
            return null;
        }
    }

    @Bean
    public CommandLineRunner initDatabase(ProductRepo productRepo) {
        return args -> {
            // Check to avoid inserting duplicate records every time the app restarts
            if (productRepo.count() == 0) {
                System.out.println("⏳ Seeding initial product data with images...");

                Product p1 = new Product(
                        null,
                        "iPhone 15",
                        "Apple smartphone with A16 Bionic chip",
                        new BigDecimal("79999.00"),
                        "Apple",
                        25,
                        List.of("Black", "Blue", "Pink"),
                        LocalDate.of(2024, 1, 15),
                        true,
                        "iphone15.jpg",
                        "image/jpeg",
                        loadImageBytes("images/iphone-15.png")
                );

                Product p2 = new Product(
                        null,
                        "Galaxy S24",
                        "Samsung flagship smartphone",
                        new BigDecimal("74999.00"),
                        "Samsung",
                        30,
                        List.of("Black", "Grey", "Yellow"),
                        LocalDate.of(2024, 2, 10),
                        true,
                        "galaxys24.jpg",
                        "image/jpeg",
                        loadImageBytes("images/galaxy-s25.png")
                );

                Product p3 = new Product(
                        null,
                        "Pixel 8",
                        "Google smartphone with Tensor G3",
                        new BigDecimal("69999.00"),
                        "Google",
                        20,
                        List.of("Grey", "Pink"),
                        LocalDate.of(2024, 3, 5),
                        true,
                        "pixel8.jpg",
                        "image/jpeg",
                        loadImageBytes("images/pixel-8.png")
                );

                Product p4 = new Product(
                        null,
                        "OnePlus 12",
                        "High performance Android smartphone",
                        new BigDecimal("59999.00"),
                        "OnePlus",
                        15,
                        List.of("Black", "Green"),
                        LocalDate.of(2024, 4, 20),
                        true,
                        "oneplus12.jpg",
                        "image/jpeg",
                        loadImageBytes("images/one-plus-12.png")
                );

                Product p5 = new Product(
                        null,
                        "Nothing Phone 2",
                        "Android smartphone with unique Glyph interface",
                        new BigDecimal("44999.00"),
                        "Nothing",
                        10,
                        List.of("White", "Grey"),
                        LocalDate.of(2024, 5, 12),
                        false,
                        "nothing2.jpg",
                        "image/jpeg",
                        loadImageBytes("images/nothing-phone-2.png")
                );

                productRepo.saveAll(List.of(p1, p2, p3, p4, p5));
                System.out.println("✅ Sample product inventory initialized successfully!");
            }
        };
    }
}