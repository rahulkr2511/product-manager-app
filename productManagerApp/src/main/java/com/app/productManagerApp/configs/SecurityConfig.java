package com.app.productManagerApp.configs;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.app.productManagerApp.service.ProductManagerUserDetailsService;

@Configuration
@EnableWebSecurity //  To use this configuration instead of default Spring Security configuration
public class SecurityConfig {

    @Autowired
    private ProductManagerUserDetailsService  productManagerUserDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // customize security filter chain
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(request -> request
                // Public GET endpoints (browsing products, search, images)
                .requestMatchers(HttpMethod.GET, "/product-manager/products/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll() // If using H2 console
                
                // Write / Mutate endpoints require authentication
                .requestMatchers(HttpMethod.POST, "/product-manager/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/product-manager/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/product-manager/**").authenticated()

                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers.frameOptions(frame -> frame.disable())) // for H2 console
            .build();
    }


    // customize authentication provider
    @Bean
    public AuthenticationProvider authenticationProvider() {
        // Use DaoAuthenticationProvider with custom UserDetailsService and PasswordEncoder
        // since AuthenticationProvider is an interface, we use DaoAuthenticationProvider which is a concrete implementation of it.
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(productManagerUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
