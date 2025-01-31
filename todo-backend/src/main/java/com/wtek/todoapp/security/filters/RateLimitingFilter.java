package com.wtek.todoapp.security.filters;

import com.wtek.todoapp.security.ratelimit.TokenBucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {
    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    private final int capacity;
    private final double refillRate;

    // Instead of a no-arg constructor, use the constructor that sets the properties
    public RateLimitingFilter(int capacity, double refillRate) {
        this.capacity = capacity;
        this.refillRate = refillRate;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {
        // Récupérer l'IP du client
        String clientIP = request.getRemoteAddr();

        // Obtenir ou créer un bucket pour cette IP
        TokenBucket tokenBucket = buckets.computeIfAbsent(clientIP,
                k -> new TokenBucket(capacity, refillRate));

        log.info("Tokens remaining for IP {}: {}", clientIP, tokenBucket.getTokens().get());

        // Vérifier si une requête peut être effectuée
        if (tokenBucket.tryConsume()) {
            chain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded for IP: {}", clientIP);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"message\": \"Trop de requêtes. Veuillez réessayer plus tard.\", \"status\": 429}");
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        // Exclusion des routes d'auth ET des todos
        return path.startsWith("/api/auth/");
    }
}