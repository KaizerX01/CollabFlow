package com.collabflow.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Component
public class JwtUtils {

    private static final String WEAK_DEFAULT_SECRET = "CHANGE_ME_IN_PRODUCTION_USE_64_CHAR_RANDOM_SECRET_KEY_HERE";

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs}")
    private long jwtExpirationMs;

    @Value("${app.jwtRefreshExpirationMs}")
    private long jwtRefreshExpirationMs;

    @PostConstruct
    void validateSecret() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException("JWT secret must not be blank. Set the JWT_SECRET environment variable.");
        }
        if (jwtSecret.length() < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 characters for HMAC-SHA256.");
        }
        if (WEAK_DEFAULT_SECRET.equals(jwtSecret)) {
            log.warn("⚠️  Using the default JWT secret – this is INSECURE. Set JWT_SECRET in production!");
        }
    }

    // Generate secret key from string
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // === ACCESS TOKEN ===
    public String generateJwtToken(String username) {
        return Jwts.builder()
                .subject(username)  // Changed from setSubject
                .claim("type", "access")
                .issuedAt(new Date())  // Changed from setIssuedAt
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))  // Changed from setExpiration
                .signWith(getSigningKey())  // Changed from signWith(SignatureAlgorithm, key)
                .compact();
    }

    // === REFRESH TOKEN ===
    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .subject(username)  // Changed from setSubject
                .claim("type", "refresh")
                .id(UUID.randomUUID().toString())  // Changed from setId
                .issuedAt(new Date())  // Changed from setIssuedAt
                .expiration(new Date(System.currentTimeMillis() + jwtRefreshExpirationMs))  // Changed from setExpiration
                .signWith(getSigningKey())  // Changed from signWith(SignatureAlgorithm, key)
                .compact();
    }

    // === EXTRACTORS ===
    public String getUsernameFromJwt(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isRefreshToken(String token) {
        Object type = parseClaims(token).get("type");
        return "refresh".equals(type);
    }

    public boolean isAccessToken(String token) {
        Object type = parseClaims(token).get("type");
        return "access".equals(type);
    }

    // === VALIDATION ===
    public boolean validateJwtToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return !isExpired(claims);
        } catch (JwtException e) {
            return false;
        }
    }

    // === HELPERS ===
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())  // Changed from setSigningKey
                .build()  // Must call build()
                .parseSignedClaims(token)  // Changed from parseClaimsJws
                .getPayload();  // Changed from getBody
    }

    private boolean isExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }
}