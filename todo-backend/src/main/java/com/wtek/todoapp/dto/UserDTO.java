package com.wtek.todoapp.dto;

import com.wtek.todoapp.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String username;
    private String email;
    private String firstName;
    private String lastName;

    public static UserDTO fromUser(User user) {
        return UserDTO.builder()
            .username(user.getUsername()) // ou un autre champ si vous avez un username spécifique
            .email(user.getEmail())
            .firstName(user.getFirstname())
            .lastName(user.getLastname())
            .build();
    }
}