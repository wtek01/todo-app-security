package com.wtek.todoapp.dto;

import com.wtek.todoapp.model.Todo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.FutureOrPresent;
import java.time.LocalDate;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodoDTO {
    private Long id;
    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 3, max = 100, message = "Le titre doit contenir entre 3 et 100 caractères")
    private String title;
    @Size(max = 500, message = "La description ne doit pas dépasser 500 caractères")
    private String description;
    private boolean completed;
    @FutureOrPresent(message = "La date d'échéance doit être dans le présent ou le futur")
    private LocalDate dueDate;
    
    // Méthode utilitaire pour convertir de Todo à TodoDTO
    public static TodoDTO fromTodo(Todo todo) {
        return TodoDTO.builder()
                .id(todo.getId())
                .title(todo.getTitle())
                .description(todo.getDescription())
                .completed(todo.isCompleted())
                .dueDate(todo.getDueDate())
                .build();
    }
}