package com.collabflow.domain.user.service;


import com.collabflow.domain.user.dto.ChangePasswordRequest;
import com.collabflow.domain.user.dto.RegisterRequest;
import com.collabflow.domain.user.dto.UpdateProfileRequest;
import com.collabflow.domain.user.exception.EmailAlreadyExistsException;
import com.collabflow.domain.user.exception.UsernameException;
import com.collabflow.domain.user.model.User;
import com.collabflow.domain.user.repository.UserRepository;
import com.collabflow.events.model.DomainEvent;
import com.collabflow.events.model.DomainEventType;
import com.collabflow.events.publisher.DomainEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DomainEventPublisher domainEventPublisher;


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
        User saved = userRepository.save(user);

        domainEventPublisher.publish(DomainEvent.builder()
            .eventType(DomainEventType.USER_REGISTERED)
            .aggregateType("User")
            .aggregateId(saved.getId())
            .actorId(saved.getId())
            .actorUsername(saved.getUsername())
            .payload(java.util.Map.of(
                "email", saved.getEmail(),
                "username", saved.getUsername()
            ))
            .build());

        return saved;

    }

    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        Optional<User> byUsername = userRepository.findByUsername(usernameOrEmail);
        return byUsername.isPresent() ? byUsername : userRepository.findByEmail(usernameOrEmail);
    }

    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User updateProfile(UUID userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getDisplayName() != null) {
            user.setDisplayName(req.getDisplayName());
        }
        if (req.getBio() != null) {
            user.setBio(req.getBio());
        }
        if (req.getAvatarUrl() != null) {
            user.setAvatarUrl(req.getAvatarUrl());
        }

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }
}
