package com.collabflow.presentation.controller;

import com.collabflow.application.auth.AuthService;
import com.collabflow.domain.user.dto.*;
import com.collabflow.domain.user.exception.EmailAlreadyExistsException;
import com.collabflow.domain.user.exception.UsernameException;
import com.collabflow.domain.user.mapper.UserMapper;
import com.collabflow.domain.user.model.RefreshToken;
import com.collabflow.domain.user.model.User;
import com.collabflow.domain.user.repository.RefreshTokenRepository;
import com.collabflow.domain.user.service.UserService;
import com.collabflow.security.CustomUserDetails;
import com.collabflow.security.JwtUtils;
import jakarta.security.auth.message.AuthException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final UserMapper userMapper;
    private final RefreshTokenRepository refreshTokenRepository;

        @org.springframework.beans.factory.annotation.Value("${app.cookie.secure:false}")
        private boolean secureCookies;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) throws AuthException {
        var user = userService.addUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toDto(user));
    }



    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) throws AuthException {
        // ✅ Get both tokens and user from service
        AuthResult result = authService.authenticate(
                request.getUsernameOrEmail(),
                request.getPassword()
        );

        // Convert AuthResult to UserResponse DTO (no password hash exposed)
        UserResponse userResponse = userMapper.toDto(result.getUser());

        ResponseCookie refreshCookie = buildSecureCookie(
                "refreshToken",
                result.getTokens().getRefreshToken(),
                Duration.ofDays(30)
        );
        ResponseCookie accessCookie = buildSecureCookie(
                "accessToken",
                result.getTokens().getAccessToken(),
                Duration.ofMillis(authService.getAccessTokenTtlMs())
        );

        // ✅ Build response with user data
        AuthResponse response = new AuthResponse();
        response.setUser(userResponse);
        response.setAccessToken(null);
        response.setTokenType("Bearer");

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(value = "refreshToken", required = false) String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing refresh token");
        }

        try {
            AuthTokens newTokens = authService.refreshAccessToken(token);

            ResponseCookie newRefreshCookie = buildSecureCookie(
                    "refreshToken",
                    newTokens.getRefreshToken(),
                    Duration.ofDays(30)
            );
            ResponseCookie newAccessCookie = buildSecureCookie(
                    "accessToken",
                    newTokens.getAccessToken(),
                    Duration.ofMillis(authService.getAccessTokenTtlMs())
            );

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, newRefreshCookie.toString())
                    .header(HttpHeaders.SET_COOKIE, newAccessCookie.toString())
                    .body(Map.of("message", "Token refreshed"));

        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        // Invalidate the refresh token in the database
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.findByToken(refreshToken)
                    .ifPresent(refreshTokenRepository::delete);
        }

        ResponseCookie clearRefreshCookie = buildSecureCookie("refreshToken", "", Duration.ZERO);
        ResponseCookie clearAccessCookie = buildSecureCookie("accessToken", "", Duration.ZERO);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearRefreshCookie.toString())
                .header(HttpHeaders.SET_COOKIE, clearAccessCookie.toString())
                .body("Logged out");
    }

    private ResponseCookie buildSecureCookie(String name, String value, Duration maxAge) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                                .secure(secureCookies)
                .path("/")
                .sameSite("Strict")
                .maxAge(maxAge)
                .build();
    }



    @ExceptionHandler(UsernameException.class)
    public ResponseEntity<Map<String, String>> handleUsernameException(UsernameException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleEmailException(EmailAlreadyExistsException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<Map<String, String>> handleAuthException(AuthException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", ex.getMessage()));
    }


}


