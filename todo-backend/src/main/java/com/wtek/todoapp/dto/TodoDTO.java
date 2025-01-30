package com.wtek.todoapp.dto;

import com.wtek.todoapp.model.Todo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodoDTO {
    private Long id;
    private String title;
    private String description;
    private boolean completed;
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