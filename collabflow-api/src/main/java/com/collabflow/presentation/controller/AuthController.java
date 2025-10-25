package com.collabflow.presentation.controller;

import com.collabflow.application.auth.AuthService;
import com.collabflow.domain.user.dto.*;
import com.collabflow.domain.user.exception.EmailAlreadyExistsException;
import com.collabflow.domain.user.exception.UsernameException;
import com.collabflow.domain.user.model.RefreshToken;
import com.collabflow.domain.user.model.User;
import com.collabflow.domain.user.repository.RefreshTokenRepository;
import com.collabflow.domain.user.service.UserService;
import com.collabflow.security.JwtUtils;
import jakarta.security.auth.message.AuthException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) throws AuthException {

        var user = userService.addUser(request);
        return ResponseEntity.ok(user);
    }



    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) throws AuthException {
        AuthTokens tokens = authService.authenticate(request.getUsernameOrEmail(), request.getPassword());

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", tokens.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(Duration.ofDays(30))
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(new AuthResponse(tokens.getAccessToken()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(value = "refreshToken", required = false) String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing refresh token");
        }

        try {
            AuthTokens newTokens = authService.refreshAccessToken(token);

            ResponseCookie newCookie = ResponseCookie.from("refreshToken", newTokens.getRefreshToken())
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(Duration.ofDays(30))
                    .sameSite("Strict")
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, newCookie.toString())
                    .body(new AuthResponse(newTokens.getAccessToken()));

        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie clearCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body("Logged out");
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


