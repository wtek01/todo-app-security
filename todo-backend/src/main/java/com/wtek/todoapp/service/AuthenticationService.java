package com.wtek.todoapp.service;

import com.wtek.todoapp.dto.AuthenticationRequest;
import com.wtek.todoapp.dto.AuthenticationResponse;
import com.wtek.todoapp.dto.RegisterRequest;
import com.wtek.todoapp.model.Role;
import com.wtek.todoapp.model.User;
import com.wtek.todoapp.repository.UserRepository;
import com.wtek.todoapp.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        // Vérifier si l'email existe déjà
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }

        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();
        
        var savedUser = userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);
        
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .firstname(savedUser.getFirstname())
                .lastname(savedUser.getLastname())
                .email(savedUser.getEmail())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
                
        var jwtToken = jwtService.generateToken(user);
        
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .build();
    }
}