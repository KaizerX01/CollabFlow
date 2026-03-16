package com.collabflow.application.auth;

import com.collabflow.domain.user.dto.AuthResult;
import com.collabflow.domain.user.dto.AuthTokens;
import com.collabflow.domain.user.model.RefreshToken;
import com.collabflow.domain.user.model.User;
import com.collabflow.domain.user.repository.RefreshTokenRepository;
import com.collabflow.domain.user.repository.UserRepository;
import com.collabflow.security.JwtUtils;
import jakarta.security.auth.message.AuthException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.jwtExpirationMs}")
    private long jwtExpirationMs;

    public AuthResult authenticate(String identifier, String password) throws AuthException {
        log.debug("Authentication attempt for identifier: {}", identifier);

        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> new AuthException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            log.warn("Failed login attempt for user: {}", user.getUsername());
            throw new AuthException("Invalid credentials");
        }

        log.info("Successful authentication for user: {}", user.getUsername());

        String accessToken = jwtUtils.generateJwtToken(user.getUsername());
        String refreshToken = jwtUtils.generateRefreshToken(user.getUsername());

        // Create RefreshToken entity
        RefreshToken refreshTokenEntity = new RefreshToken();
        refreshTokenEntity.setToken(refreshToken);
        refreshTokenEntity.setUser(user);
        refreshTokenEntity.setExpiryDate(Instant.now().plus(Duration.ofDays(30)));

        refreshTokenRepository.save(refreshTokenEntity);

        // ✅ Return both tokens AND user
        return new AuthResult(new AuthTokens(accessToken, refreshToken), user);
    }




    public AuthTokens refreshAccessToken(String refreshToken) throws AuthException {
        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new AuthException("Invalid refresh token"));

        if (stored.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(stored);
            throw new AuthException("Refresh token expired");
        }

        String newAccess = jwtUtils.generateJwtToken(stored.getUser().getUsername());
        String newRefresh = jwtUtils.generateRefreshToken(stored.getUser().getUsername());

        stored.setToken(newRefresh);
        stored.setExpiryDate(Instant.now().plus(Duration.ofDays(30)));
        refreshTokenRepository.save(stored);

        return new AuthTokens(newAccess, newRefresh);
    }

    public long getAccessTokenTtlMs() {
        return jwtExpirationMs;
    }
}
