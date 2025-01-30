package com.wtek.todoapp.repository;

import com.wtek.todoapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email); // Utile pour vérifier si un email existe déjà
}