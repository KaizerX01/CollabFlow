package com.collabflow.domain.user.service;


import com.collabflow.domain.user.dto.RegisterRequest;
import com.collabflow.domain.user.exception.EmailAlreadyExistsException;
import com.collabflow.domain.user.exception.UsernameException;
import com.collabflow.domain.user.model.User;
import com.collabflow.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public User addUser(RegisterRequest req){
        if(userRepository.findByUsername(req.getUsername()).isPresent()){
            throw new UsernameException("Username already exists");
        }
        if(userRepository.findByEmail(req.getEmail()).isPresent()){
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        return userRepository.save(user);

    }

    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        Optional<User> byUsername = userRepository.findByUsername(usernameOrEmail);
        return byUsername.isPresent() ? byUsername : userRepository.findByEmail(usernameOrEmail);
    }

    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }
}
