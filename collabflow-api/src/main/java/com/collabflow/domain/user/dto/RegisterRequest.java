package com.collabflow.domain.user.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "you must specify the username")
    @Size(min = 3, max = 50, message = "username must be between 3 and 50 characters")
    private String username;
    @NotBlank(message = "you must specify the email")
    @Email
    private String email;
    @NotBlank(message = "you must specify the password")
    @Size(min = 8, max = 128, message = "password must be at least 8 characters")
    @Pattern(regexp = ".*\\d.*", message = "password must contain at least one number")
    @Pattern(regexp = ".*[a-zA-Z].*", message = "password must contain at least one letter")
    private String password;
}
