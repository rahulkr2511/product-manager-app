package com.app.productManagerApp.interceptor;

import com.app.productManagerApp.service.RateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimiterService rateLimiterService;

    public RateLimitInterceptor(RateLimiterService rateLimiterService) {
        this.rateLimiterService = rateLimiterService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Identify client by IP address or token
        String clientIp = request.getRemoteAddr();

        // Rule: Max 5 requests, refilling 10 tokens every 1 minute
        boolean allowed = rateLimiterService.tryConsume(clientIp, 5, 5, Duration.ofSeconds(30));

        if (allowed) {
            return true; // Let request proceed to controller
        }

        // Block request and return HTTP 429
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.getWriter().write("Rate limit exceeded. Please try again later.");
        return false;
    }
}