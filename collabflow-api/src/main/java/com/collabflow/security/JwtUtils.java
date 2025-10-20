package com.collabflow.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtils {

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs}")
    private long jwtExpirationMs;

    @Value("${app.jwtRefreshExpirationMs}")
    private long jwtRefreshExpirationMs;

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

    // === VALIDATION ===
    public boolean validateJwtToken(String token) {
        return validateToken(token);
    }

    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return "refresh".equals(claims.get("type")) && !isExpired(claims);
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

    private boolean validateToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return !isExpired(claims);
        } catch (JwtException e) {
            return false;
        }
    }

    private boolean isExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }
}