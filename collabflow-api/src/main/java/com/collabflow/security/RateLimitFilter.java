package com.collabflow.security;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory rate limiter.
 * <p>
 * Auth endpoints: 20 requests per minute per IP.
 * Other API endpoints: 100 requests per minute per IP.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int AUTH_MAX_REQUESTS_PER_MINUTE = 20;
    private static final int API_MAX_REQUESTS_PER_MINUTE = 100;

    private final LoadingCache<String, AtomicInteger> authRequestCounts = Caffeine.newBuilder()
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .build(key -> new AtomicInteger(0));

    private final LoadingCache<String, AtomicInteger> apiRequestCounts = Caffeine.newBuilder()
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .build(key -> new AtomicInteger(0));

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        if (path.startsWith("/api/")) {
            String clientIp = getClientIp(request);

            if (path.startsWith("/api/auth/")) {
                // Stricter limit for auth endpoints
                AtomicInteger counter = authRequestCounts.get(clientIp);
                if (counter != null && counter.incrementAndGet() > AUTH_MAX_REQUESTS_PER_MINUTE) {
                    sendTooManyRequests(response);
                    return;
                }
            } else {
                // General limit for other API endpoints
                AtomicInteger counter = apiRequestCounts.get(clientIp);
                if (counter != null && counter.incrementAndGet() > API_MAX_REQUESTS_PER_MINUTE) {
                    sendTooManyRequests(response);
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private void sendTooManyRequests(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
    }

    private String getClientIp(HttpServletRequest request) {
        // Only trust X-Forwarded-For if present (typically set by reverse proxy).
        // Take only the first (leftmost) IP, which is the original client.
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
