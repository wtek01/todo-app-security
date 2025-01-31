L'ordre d'appels et le rôle de chaque classe dans le processus d'authentification et de gestion des requêtes.

**Ordre d'initialisation au démarrage de l'application :**
1. `ApplicationConfig`
2. `SecurityConfig`
3. `WebConfig`
4. `JwtService`
5. `AuthenticationService`
6. `AuthController`
7. `TodoController`

**Ordre d'appels lors d'une requête d'authentification (/api/auth/authenticate) :**
1. `SecurityConfig` (vérifie si l'URL est publique)
2. `WebConfig` (gère CORS)
3. `AuthController` (reçoit la requête)
4. `AuthenticationService` (traite l'authentification)
5. `ApplicationConfig` (via AuthenticationManager et UserDetailsService)
6. `JwtService` (génère le token)

**Ordre d'appels pour une requête protégée (ex: /api/todos) :**
1. `SecurityConfig`
2. `WebConfig`
3. `JwtAuthenticationFilter`
4. `JwtService`
5. `ApplicationConfig` (via UserDetailsService)
6. `TodoController`

**Rôle de chaque classe :**

1. `ApplicationConfig`
```java
@Configuration
public class ApplicationConfig {
    // Configure les beans essentiels de sécurité
    // - UserDetailsService (chargement des utilisateurs)
    // - PasswordEncoder (cryptage des mots de passe)
    // - AuthenticationManager (gestion de l'authentification)
}
```

2. `SecurityConfig`
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // Configure les règles de sécurité globales
    // - URLs publiques/protégées
    // - Filtres de sécurité
    // - Gestion des sessions
}
```

3. `WebConfig`
```java
@Configuration
public class WebConfig {
    // Configure CORS
    // - Origines autorisées
    // - Méthodes HTTP autorisées
    // - Headers autorisés
}
```

4. `JwtService`
```java
@Service
public class JwtService {
    // Gère les opérations JWT
    // - Génération des tokens
    // - Validation des tokens
    // - Extraction des informations
}
```

5. `AuthenticationService`
```java
@Service
public class AuthenticationService {
    // Gère la logique d'authentification
    // - Vérification des credentials
    // - Création des tokens
    // - Inscription des utilisateurs
}
```

6. `AuthController`
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    // Point d'entrée pour l'authentification
    // - Login
    // - Register
}
```

7. `TodoController`
```java
@RestController
@RequestMapping("/api/todos")
public class TodoController {
    // Gère les opérations CRUD pour les todos
    // - Nécessite une authentification
    // - Utilise l'utilisateur authentifié
}
```

8. `JwtAuthenticationFilter`
```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // Intercépte chaque requête protégée
    // - Vérifie le token JWT
    // - Configure l'authentification Spring Security
}
```

Le flux typique d'une requête suit ce chemin :
1. La requête arrive
2. Passe par SecurityConfig (vérification des règles)
3. Passe par WebConfig (CORS)
4. Si protégée, passe par JwtAuthenticationFilter
5. Si authentification nécessaire, utilise AuthenticationService
6. Atteint finalement le Controller approprié

Cette architecture en couches assure :
- Une séparation claire des responsabilités
- Une sécurité robuste
- Une maintenance facilitée
- Une scalabilité du code

Voici les schémas des flux de requêtes dans l'application :

9. **Flux d'une requête d'authentification (/login) :**
```
Requête HTTP POST /api/auth/authenticate
  → SecurityConfig (vérifie URL publique)
    → WebConfig (CORS)
      → AuthController
        → AuthenticationService
          → ApplicationConfig (AuthenticationManager)
            → JwtService (génération token)
              → Réponse avec JWT
```

10. **Flux d'une requête protégée (ex: /api/todos) :**
```
Requête HTTP GET /api/todos
  → SecurityConfig (vérifie URL protégée)
    → WebConfig (CORS)
      → JwtAuthenticationFilter
        → JwtService (validation token)
          → ApplicationConfig (UserDetailsService)
            → TodoController
              → Réponse avec Todos
```

11. **Flux d'une requête de création de todo :**
```
Requête HTTP POST /api/todos
  → SecurityConfig
    → WebConfig (CORS)
      → JwtAuthenticationFilter
        → JwtService (validation token)
          → ApplicationConfig (UserDetailsService)
            → TodoController (createTodo)
              → TodoRepository (save)
                → Réponse avec nouveau Todo
```

12. **Flux complet d'authentification et utilisation :**
```
1. Login :
Requête POST /api/auth/authenticate
  → SecurityConfig (public)
    → AuthController
      → AuthenticationService
        → JwtService
          → Token JWT

2. Utilisation du token :
Requête avec Bearer Token
  → SecurityConfig
    → JwtAuthenticationFilter
      → JwtService (vérifie token)
        → UserDetailsService (charge utilisateur)
          → Controller protégé
            → Réponse
```

13. **Structure générale de sécurité :**
```
Configuration
  → ApplicationConfig (beans de sécurité)
    → SecurityConfig (règles de sécurité)
      → WebConfig (CORS)
        
Services
  → JwtService
    → AuthenticationService
      → Controllers protégés

Filtres
  → SecurityFilterChain
    → JwtAuthenticationFilter
      → Autres filtres Spring Security
```

Ces schémas montrent :
- L'ordre de traitement des requêtes
- Les dépendances entre composants
- Les différents niveaux de sécurité
- Le flux de données dans l'application