package com.collabflow.domain.user.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    @NotBlank(message = "you must specify the username or the email to login")
    private String usernameOrEmail;
    @NotBlank(message = "you must specify the password")
    private String password;


}
