package com.wtek.todoapp.controller;

import com.wtek.todoapp.dto.UserDTO;
import com.wtek.todoapp.model.User;
import com.wtek.todoapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
        
        return ResponseEntity.ok(UserDTO.fromUser(user));
    }

    @PutMapping("/me")
    public UserDTO updateUser(@AuthenticationPrincipal UserDetails userDetails, @RequestBody UserDTO updates) {
        // Fetch the currently authenticated user based on their email/username
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));

        // Update user's properties based on the incoming updates
        if (updates.getFirstName() != null) {
            user.setFirstname(updates.getFirstName());
        }
        if (updates.getLastName() != null) {
            user.setLastname(updates.getLastName());
        }
        if (updates.getEmail() != null) {
            user.setEmail(updates.getEmail());
        }

        // Save the updated user entity back to the database
        userRepository.save(user);

        // Return the updated user as a DTO
        return UserDTO.fromUser(user);
    }
}