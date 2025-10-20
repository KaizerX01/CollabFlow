package com.collabflow.domain.user.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "you must specify the username")
    private String username;
    @NotBlank(message = "you must specify the email")
    @Email
    private String email;
    @NotBlank(message = "you must specify the password")
    private String password;
}
