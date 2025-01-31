La classe `ApplicationConfig` est une classe de configuration essentielle dans Spring Security qui configure les beans nécessaires pour l'authentification. Voici son rôle détaillé :

```java
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository repository;

    // 1. Configuration du UserDetailsService
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> repository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    // 2. Configuration du Provider d'Authentification
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // 3. Configuration du Manager d'Authentification
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // 4. Configuration de l'encodeur de mot de passe
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

Les rôles principaux sont :

1. **UserDetailsService** :
    - Charge les utilisateurs depuis la base de données
    - Utilisé lors de l'authentification
    - Convertit les données utilisateur en UserDetails

2. **AuthenticationProvider** :
    - Gère le processus d'authentification
    - Vérifie les credentials
    - Utilise UserDetailsService et PasswordEncoder

3. **AuthenticationManager** :
    - Gère les différents providers d'authentification
    - Coordonne le processus d'authentification
    - Utilisé dans le AuthenticationService

4. **PasswordEncoder** :
    - Gère le hashage des mots de passe
    - Utilisé pour vérifier les mots de passe
    - Implémente BCrypt par défaut

En résumé, `ApplicationConfig` :
- Configure les composants essentiels de sécurité
- Établit le lien entre la base de données et Spring Security
- Configure le cryptage des mots de passe
- Fournit les beans nécessaires à l'authentification

Ces beans sont ensuite utilisés par :
- JwtAuthenticationFilter
- AuthenticationService
- SecurityConfig
- Et autres composants de sécurité