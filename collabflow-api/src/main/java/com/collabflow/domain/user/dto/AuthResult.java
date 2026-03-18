package com.collabflow.domain.user.dto;

import lombok.Getter;

import java.util.UUID;

@Getter
public class AuthResult {
    private final AuthTokens tokens;
    private final com.collabflow.domain.user.model.User user;
    private final UUID userId;
    private final String username;
    private final String email;

    public AuthResult(AuthTokens tokens, com.collabflow.domain.user.model.User user) {
        this.tokens = tokens;
        this.user = user;
        this.userId = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
    }

}