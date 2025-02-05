package com.wtek.todoapp.config;

import com.wtek.todoapp.security.filters.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuration principale de la sécurité Spring (Spring Security).
 *
 * Cette classe détermine :
 * - Quelles URL sont protégées et lesquelles sont autorisées,
 * - Comment fonctionnent les sessions (ici, sans état),
 * - Comment gérer la configuration CORS (accès cross-origin),
 * - Où insérer les filtres de sécurité personnalisés (par ex. JwtAuthenticationFilter),
 * - Quel provider d'authentification utiliser.
 *
 * L'annotation @EnableWebSecurity active la configuration de la sécurité Web.
 * L'annotation @Configuration indique qu'il s'agit d'un composant de config Spring.
 * L'annotation @RequiredArgsConstructor génère un constructeur qui injecte
 * automatiquement les champs 'final' (jwtAuthFilter, authenticationProvider).
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    /**
     * Filtre JWT personnalisé, chargé d'intercepter les requêtes entrantes
     * et de valider/extraire le token JWT. Il se place avant UsernamePasswordAuthenticationFilter.
     */
    private final JwtAuthenticationFilter jwtAuthFilter;

    /**
     * Définit le mécanisme d'authentification (ex. DaoAuthenticationProvider)
     * et la manière dont les identifiants sont vérifiés (UserDetailsService, mot de passe haché, etc.).
     */
    private final AuthenticationProvider authenticationProvider;

    /**
     * Méthode principale pour configurer la chaîne de filtres de sécurité.
     * - Détermine quelles URL sont interceptées par Spring Security,
     * - Désactive la protection CSRF (non nécessaire pour une API stateless),
     * - Met en place CORS,
     * - Spécifie quelles routes sont publiques et lesquelles nécessitent une authentification,
     * - Définit la stratégie de session en mode "STATELESS" pour JWT,
     * - Ajoute le filtre JWT avant le filtre standard d'authentification par formulaire.
     *
     * @param http l'objet HttpSecurity fourni par Spring pour configurer la sécurité HTTP
     * @return un SecurityFilterChain construit avec la config définie
     * @throws Exception en cas de problème lors de la configuration
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Limite l'application de la config de sécurité aux endpoints qui commencent par /api/
                .securityMatcher("/api/**")

                // Désactive la protection CSRF (Cross-Site Request Forgery),
                // souvent inutile pour des APIs stateless (JWT).
                .csrf(csrf -> csrf.disable())

                // Active la configuration CORS en indiquant la source de config CORS à utiliser.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Gestion des autorisations par URL.
                .authorizeHttpRequests(auth -> auth
                        // Autorise l'accès sans authentification à certaines routes (ex: /api/auth, /api/register, swagger)
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/register",
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()
                        // Toute autre requête (dans /api/**) requiert une authentification.
                        .anyRequest().authenticated()
                )

                // Configure la session pour qu'elle soit "sans état"
                // (aucune session Http persistée coté serveur).
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Utilise l'AuthenticationProvider précédemment injecté
                // (ce qui définit la manière dont on charge l'utilisateur + encodeur de mot de passe).
                .authenticationProvider(authenticationProvider)

                // Insère le filtre JWT avant le filtre standard UsernamePasswordAuthenticationFilter
                // pour intercepter et valider les tokens avant l'authentification.
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // Construit la chaîne de filtres et la retourne.
        return http.build();
    }

    /**
     * Configuration CORS (Cross-Origin Resource Sharing).
     * Détermine les origines autorisées, les méthodes autorisées,
     * les en-têtes autorisés, etc., pour les requêtes cross-site.
     *
     * @return Un CorsConfigurationSource indiquant à Spring Security comment gérer CORS.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Autorise les requêtes depuis "http://localhost:5173".
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        // Méthodes autorisées : GET, POST, PUT, DELETE, OPTIONS.
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Autorise tous les en-têtes (par exemple, "Authorization", "Content-Type", etc.).
        configuration.setAllowedHeaders(Arrays.asList("*"));
        // Permet d'inclure les identifiants de session ou cookies dans les requêtes CORS.
        configuration.setAllowCredentials(true);

        // Associe la config aux chemins "/**" (toutes les URLs).
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        // Retourne la source configurée, qui sera utilisée par Spring Security
        // (cf. .cors(cors -> cors.configurationSource(corsConfigurationSource()))).
        return source;
    }
}
