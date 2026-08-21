package com.app.productManagerApp.service;

import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.distributed.BucketProxy;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.function.Supplier;

@Service
public class RateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(RateLimiterService.class);

    private final LettuceBasedProxyManager<byte[]> proxyManager;

    @Autowired
    public RateLimiterService(@Autowired(required = false) LettuceBasedProxyManager<byte[]> proxyManager) {
        this.proxyManager = proxyManager;
    }

    public boolean tryConsume(String key, int capacity, int refillTokens, Duration duration) {
        // Bypass if Redis was offline at startup
        if (proxyManager == null) {
            return true;
        }

        try {
            byte[] keyBytes = ("rate:" + key).getBytes(StandardCharsets.UTF_8);

            Supplier<BucketConfiguration> configSupplier = () -> BucketConfiguration.builder()
                    .addLimit(limit -> limit.capacity(capacity).refillGreedy(refillTokens, duration))
                    .build();

            BucketProxy bucket = proxyManager.builder().build(keyBytes, configSupplier);
            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

            return probe.isConsumed();
        } catch (Exception ex) {
            // Bypass if Redis goes down during runtime
            log.warn("Redis rate limiting unreachable for key {}. Failing open (bypassing): {}", key, ex.getMessage());
            return true;
        }
    }
}