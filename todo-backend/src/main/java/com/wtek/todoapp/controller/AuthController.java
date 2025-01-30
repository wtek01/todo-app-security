package com.wtek.todoapp.controller;

import com.wtek.todoapp.dto.AuthenticationRequest;
import com.wtek.todoapp.dto.AuthenticationResponse;
import com.wtek.todoapp.dto.RegisterRequest;
import com.wtek.todoapp.service.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthenticationService authService;

    public AuthController(AuthenticationService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthenticationResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                .badRequest()
                .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(@RequestBody AuthenticationRequest request) {
        try {
            AuthenticationResponse response = authService.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                .badRequest()
                .body(new ErrorResponse(e.getMessage()));
        }
    }
}