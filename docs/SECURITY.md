# Points de Sécurité et leur Implémentation dans Todo App

1. **Authentification : JWT Token, Spring Security**
    - `JwtService` : Gestion des tokens
    - `SecurityConfig` : Configuration Spring Security
    - `JwtAuthenticationFilter` : Filtre d'authentification
    - `AuthenticationService` : Service d'authentification

2. **Contrôle d'accès aux endpoints**
    - `SecurityConfig` : Configuration des routes protégées
    - `@PreAuthorize` sur les méthodes des controllers
    - `TodoController` : Vérification de l'appartenance des todos

3. **Limitation des requêtes (Rate Limiting)**
    - `RateLimitingFilter` : Filtre de limitation
    - `TokenBucket` : Implémentation du bucket
    - `RateLimitingConfig` : Configuration du rate limiting

4. **Validation des entrées**
    - `TodoDTO` : Validation des données avec annotations (@NotBlank, @Size, etc.)
    - `GlobalExceptionHandler` : Gestion des erreurs de validation
    - `@Valid` sur les méthodes des controllers

5. **Gestion centralisée des erreurs**
    - `GlobalExceptionHandler` : Handler global des exceptions
    - `ErrorResponse` : DTO pour les réponses d'erreur

6. **Traçage de sécurité**
    - `SecurityAuditAspect` : Aspect pour le logging
    - Logs dans JwtAuthenticationFilter et autres filtres

7. **Protection CORS**
    - `WebConfig` : Configuration CORS
    - Configuration dans `SecurityConfig`

8. **Protection contre les attaques courantes**
    - Configuration dans `SecurityConfig`
    - Headers de sécurité
    - Protection XSS via nettoyage des entrées

9. **Accès aux endpoints**
    - `SecurityConfig` : Configuration des routes
    - `@Secured`, `@PreAuthorize` sur les controllers

10. **Nettoyage des données**
    - Validation dans les DTOs
    - Nettoyage dans les services avant persistance

11. **Audit des accès**
    - `SecurityAuditAspect` : Logging des accès
    - Logs dans les filtres de sécurité
    - Traçage dans `JwtAuthenticationFilter`

12. **TODO**
- Gestion des roles 