package com.collabflow.domain.user.dto;

import com.collabflow.domain.user.model.User;
import lombok.Getter;

@Getter
public class AuthResult {
    private final AuthTokens tokens;
    private final User user;

    public AuthResult(AuthTokens tokens, User user) {
        this.tokens = tokens;
        this.user = user;
    }

}