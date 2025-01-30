package com.wtek.todoapp.repository;

import com.wtek.todoapp.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    // Ajouter cette méthode pour récupérer uniquement les todos de l'utilisateur connecté
    List<Todo> findByUserEmail(String email);

    // Optionnel : pour vérifier si un todo appartient à un utilisateur
    boolean existsByIdAndUserEmail(Long id, String email);
}