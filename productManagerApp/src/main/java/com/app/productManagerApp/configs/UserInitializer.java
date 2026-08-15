package com.app.productManagerApp.configs;

import com.app.productManagerApp.model.User;
import com.app.productManagerApp.repository.UserRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class UserInitializer {

    @Bean
    public CommandLineRunner initUsers(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepo.count() == 0) {
                User admin = new User(null, "admin", passwordEncoder.encode("admin123"));
                User user = new User(null, "user", passwordEncoder.encode("user123"));

                userRepo.saveAll(List.of(admin, user));
                System.out.println("✅ Seeded default users: admin/admin123 and user/user123");
            }
        };
    }
}