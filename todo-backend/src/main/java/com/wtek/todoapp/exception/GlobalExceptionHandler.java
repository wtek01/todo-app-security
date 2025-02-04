package com.wtek.todoapp.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.*;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Gère les exceptions de type AccessDeniedException.
     *
     * - Se produit généralement lorsqu’un utilisateur non autorisé tente
     *   d’accéder à une ressource protégée.
     * - Retourne un statut HTTP 403 (FORBIDDEN) et un corps indiquant
     *   que l’accès est refusé.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        log.error("Accès refusé: {}", ex.getMessage());
        ApiErrorResponse errorResponse = new ApiErrorResponse("Accès refusé", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(errorResponse);
    }

    /**
     * Gère les erreurs de validation de type MethodArgumentNotValidException.
     *
     * - Se produit lorsque les validations sur les champs d’un objet reçu
     *   en paramètre (ex. @Valid) ne sont pas satisfaites.
     * - Parcourt toutes les erreurs de champ pour constituer une Map dont
     *   la clé est le nom du champ et la valeur est une liste de messages
     *   d’erreur.
     * - Retourne un statut HTTP 400 (BAD_REQUEST) et la liste des erreurs.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, List<String>>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, List<String>> errors = new HashMap<>();
        
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String fieldName = error.getField();
            String errorMessage = error.getDefaultMessage();
            errors.computeIfAbsent(fieldName, k -> new ArrayList<>()).add(errorMessage);
        });
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errors);
    }

    /**
     * Gère toutes les autres exceptions non spécifiquement prises en charge
     * par un autre @ExceptionHandler.
     *
     * - Permet de capturer les exceptions imprévues ou génériques.
     * - Retourne un statut HTTP 500 (INTERNAL_SERVER_ERROR) et un message
     *   indiquant la cause de l’erreur.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGlobalErrors(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error);
    }
}