package com.collabflow.domain.user.service;


import com.collabflow.domain.user.dto.RegisterRequest;
import com.collabflow.domain.user.exception.EmailAlreadyExistsException;
import com.collabflow.domain.user.exception.UsernameException;
import com.collabflow.domain.user.model.Role;
import com.collabflow.domain.user.model.User;
import com.collabflow.domain.user.repository.UserRepository;
import jdk.jshell.spi.ExecutionControl;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class UserService {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;


    private User addUser(RegisterRequest req){
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
        user.setRoles(Set.of(Role.ROLE_MEMBER));
        return userRepository.save(user);

    }

    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        Optional<User> byUsername = userRepository.findByUsername(usernameOrEmail);
        return byUsername.isPresent() ? byUsername : userRepository.findByEmail(usernameOrEmail);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
