package com.collabflow.presentation.controller;


import com.collabflow.domain.user.dto.ChangePasswordRequest;
import com.collabflow.domain.user.dto.UpdateProfileRequest;
import com.collabflow.domain.user.mapper.UserMapper;
import com.collabflow.domain.user.model.User;
import com.collabflow.domain.user.service.UserService;
import com.collabflow.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {
    private final UserMapper userMapper;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @PatchMapping("/me/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        User updated = userService.updateProfile(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(userMapper.toDto(updated));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(userDetails.getUser().getId(), request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
