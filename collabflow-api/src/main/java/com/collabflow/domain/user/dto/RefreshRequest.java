package com.collabflow.domain.user.dto;


import lombok.Data;

@Data
public class RefreshRequest {
    private String refreshToken;
}
