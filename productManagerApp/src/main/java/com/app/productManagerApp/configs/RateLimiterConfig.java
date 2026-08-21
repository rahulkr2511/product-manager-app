package com.app.productManagerApp.configs;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import io.lettuce.core.codec.RedisCodec;

@Configuration
public class RateLimiterConfig {
    @Bean
    public LettuceBasedProxyManager<byte[]> proxyManager(LettuceConnectionFactory connectionFactory) {

        final Logger log = LoggerFactory.getLogger(RateLimiterConfig.class);
        try {
        // Extract native Lettuce RedisClient from Spring connection factory
        RedisClient redisClient = (RedisClient) connectionFactory.getNativeClient();
        // Open a dedicated thread-safe stateful byte connection for Bucket4j
        StatefulRedisConnection<byte[], byte[]> connection = redisClient.connect(
                RedisCodec.of(ByteArrayCodec.INSTANCE, ByteArrayCodec.INSTANCE)
        );

        return LettuceBasedProxyManager.builderFor(connection)
                .build();
        }catch (Exception e) {
            log.warn("Redis is not available at startup. Rate limiting will be bypassed: {}", e.getMessage());
            return null; // Return null bean when Redis is down
        }
       }
}
