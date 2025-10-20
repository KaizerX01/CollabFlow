package com.collabflow.application.auth;

import com.collabflow.domain.user.dto.AuthTokens;
import com.collabflow.domain.user.model.RefreshToken;
import com.collabflow.domain.user.model.User;
import com.collabflow.domain.user.repository.RefreshTokenRepository;
import com.collabflow.domain.user.repository.UserRepository;
import com.collabflow.security.JwtUtils;
import jakarta.security.auth.message.AuthException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    public AuthTokens authenticate(String email, String password) throws AuthException {
        System.out.println("=== LOGIN DEBUG ===");
        System.out.println("Attempting to find user with email: " + email);

        Optional<User> userOpt = userRepository.findByEmail(email);
        System.out.println("User found by email: " + userOpt.isPresent());

        if (!userOpt.isPresent()) {
            userOpt = userRepository.findByUsername(email);
            System.out.println("User found by username: " + userOpt.isPresent());
        }

        User user = userOpt.orElseThrow(() -> new AuthException("Invalid credentials"));

        System.out.println("User retrieved: " + user.getUsername());
        System.out.println("User ID: " + user.getId());  // ← ADD THIS
        System.out.println("User ID is null? " + (user.getId() == null));  // ← ADD THIS
        System.out.println("Stored password hash: " + user.getPassword());
        System.out.println("Input password: " + password);
        System.out.println("Password matches: " + passwordEncoder.matches(password, user.getPassword()));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthException("Invalid credentials");
        }

        String accessToken = jwtUtils.generateJwtToken(user.getUsername());
        String refreshToken = jwtUtils.generateRefreshToken(user.getUsername());

        // Create RefreshToken entity
        RefreshToken refreshTokenEntity = new RefreshToken();
        refreshTokenEntity.setToken(refreshToken);
        refreshTokenEntity.setUser(user);
        refreshTokenEntity.setExpiryDate(Instant.now().plus(Duration.ofDays(30)));

        System.out.println("=== BEFORE SAVING REFRESH TOKEN ===");
        System.out.println("RefreshToken.token: " + refreshTokenEntity.getToken());
        System.out.println("RefreshToken.user: " + refreshTokenEntity.getUser());
        System.out.println("RefreshToken.user.id: " + (refreshTokenEntity.getUser() != null ? refreshTokenEntity.getUser().getId() : "null"));
        System.out.println("RefreshToken.expiryDate: " + refreshTokenEntity.getExpiryDate());

        refreshTokenRepository.save(refreshTokenEntity);

        return new AuthTokens(accessToken, refreshToken);
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
}
