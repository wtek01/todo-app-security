package com.wtek.todoapp.security.ratelimit;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
public class TokenBucket {
    private final int capacity;
    private final double refillRate;  // tokens par seconde
    @Getter
    private final AtomicInteger tokens;
    private long lastRefillTimestamp;

    public TokenBucket(int capacity, double refillRate) {
        this.capacity = capacity;
        this.refillRate = refillRate;
        this.tokens = new AtomicInteger(capacity);
        this.lastRefillTimestamp = Instant.now().getEpochSecond();
    }

    public synchronized boolean tryConsume() {
        refill();
        log.info("Current tokens: {}", tokens.get());
        if (tokens.get() > 0) {
            tokens.decrementAndGet();
            return true;
        }

        return false;
    }

    private void refill() {
        long now = Instant.now().getEpochSecond();
        long timeElapsed = now - lastRefillTimestamp;

        if (timeElapsed > 0) {
            double tokensToAdd = timeElapsed * refillRate;
            int newTokens = Math.min(capacity, tokens.get() + (int)tokensToAdd);
            tokens.set(newTokens);
            lastRefillTimestamp = now;
            log.debug("Refilled tokens to: {}", newTokens);
        }
    }
}