package com.wtek.todoapp.controller;

import com.wtek.todoapp.dto.TodoDTO;
import com.wtek.todoapp.model.Todo;
import com.wtek.todoapp.model.User;
import com.wtek.todoapp.repository.TodoRepository;
import com.wtek.todoapp.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<TodoDTO> getAllTodos(@AuthenticationPrincipal UserDetails userDetails) {
        // userDetails est automatiquement injecté depuis le SecurityContext
        return todoRepository.findByUserEmail(userDetails.getUsername())
                .stream()
                .map(TodoDTO::fromTodo)
                .collect(Collectors.toList());
    }

    @PostMapping
    public TodoDTO createTodo(
            @Valid @RequestBody TodoDTO todoDTO,  // Ajout de @Valid
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Conversion du DTO en entité
        Todo todo = new Todo();
        todo.setTitle(todoDTO.getTitle());
        todo.setDescription(todoDTO.getDescription());
        todo.setDueDate(todoDTO.getDueDate());
        todo.setCompleted(todoDTO.isCompleted());
        todo.setUser(user);

        Todo savedTodo = todoRepository.save(todo);
        return TodoDTO.fromTodo(savedTodo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TodoDTO> updateTodo(
            @PathVariable Long id,
            @Valid @RequestBody TodoDTO todoDTO,  // Ajout de @Valid
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Todo todo = todoRepository.findById(id)
                .filter(t -> t.getUser().getEmail().equals(userDetails.getUsername()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo non trouvé ou accès non autorisé"));

        todo.setTitle(todoDTO.getTitle());
        todo.setDescription(todoDTO.getDescription());
        todo.setDueDate(todoDTO.getDueDate());
        todo.setCompleted(todoDTO.isCompleted());

        Todo updatedTodo = todoRepository.save(todo);
        return ResponseEntity.ok(TodoDTO.fromTodo(updatedTodo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTodo(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (!todoRepository.existsByIdAndUserEmail(id, userDetails.getUsername())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo non trouvé ou accès non autorisé");
        }

        todoRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}