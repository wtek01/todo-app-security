# Todo App - Documentation de Sécurité

## Table des matières
1. [Introduction](#introduction)
2. [Configuration du Backend](#configuration-du-backend)
3. [Configuration de la Sécurité](#configuration-de-la-sécurité)
4. [Implémentation Frontend](#implémentation-frontend)
5. [Tests et Déploiement](#tests-et-déploiement)

## Introduction

Cette documentation détaille l'implémentation de la sécurité dans une application Todo utilisant Spring Boot pour le backend et React pour le frontend. Le système utilise JWT (JSON Web Tokens) pour l'authentification.

## Configuration du Backend

### 1. Configuration Maven (pom.xml)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <!-- Autres dépendances JWT -->
</dependencies>
```

**Explications**:
- `spring-boot-starter-security`: Active la sécurité Spring Boot
- `jjwt-api`: Bibliothèque pour gérer les tokens JWT

### 2. Configuration des Propriétés

```properties
# JWT Configuration
application.security.jwt.secret-key=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
application.security.jwt.expiration=86400000
```

**Explications**:
- `secret-key`: Clé secrète pour signer les tokens JWT
- `expiration`: Durée de validité des tokens (24 heures en millisecondes)

### 3. Modèle Utilisateur

```java
@Entity
@Table(name = "_user")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstname;
    private String lastname;
    private String email;
    private String password;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    @OneToMany(mappedBy = "user")
    private List<Todo> todos;
}
```

**Explications**:
- Implémente `UserDetails` pour Spring Security
- `@Table(name = "_user")`: Évite le conflit avec le mot-clé SQL "user"
- Stockage des informations utilisateur avec relation vers les todos

### 4. Service JWT

```java
@Service
public class JwtService {
    @Value("${application.security.jwt.secret-key}")
    private String secretKey;
    
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256)
            .compact();
    }
    
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }
}
```

**Explications**:
- `generateToken`: Crée un nouveau token JWT pour un utilisateur
- `isTokenValid`: Vérifie si le token est valide et non expiré
- Utilise la clé secrète pour signer et vérifier les tokens

### 5. Filtre d'Authentification JWT

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Extraction et validation du token
        String token = authHeader.substring(7);
        String userEmail = jwtService.extractUsername(token);
        
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            if (jwtService.isTokenValid(token, userDetails)) {
                // Configuration de l'authentification
                SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    )
                );
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

**Explications**:
- Intercepte toutes les requêtes HTTP
- Vérifie la présence et la validité du token JWT
- Configure l'authentification si le token est valide

## Configuration de la Sécurité

### 1. Configuration Spring Security

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

**Explications**:
- Configure les règles de sécurité
- Désactive CSRF (car nous utilisons JWT)
- Configure CORS pour le frontend
- Définit les URLs publiques et protégées
- Configure la gestion de session stateless
- Ajoute le filtre JWT

## Implémentation Frontend

### 1. Service d'Authentification

```typescript
// src/services/authService.ts
export const authService = {
    async login(email: string, password: string) {
        const response = await axios.post(`${API_URL}/auth/authenticate`, {
            email,
            password
        });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    async register(userData) {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
    }
};
```

**Explications**:
- Gère les appels API pour l'authentification
- Stocke le token JWT dans localStorage
- Fournit les méthodes de login, register et logout

### 2. Intercepteur Axios

```typescript
// src/services/axiosConfig.ts
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
);
```

**Explications**:
- Ajoute automatiquement le token aux requêtes
- Gère les erreurs d'authentification

### 3. Protection des Routes

```typescript
// src/components/ProtectedRoute.tsx
const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem('token');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    return isAuthenticated ? children : null;
};
```

**Explications**:
- Protège les routes nécessitant une authentification
- Redirige vers la page de login si non authentifié

## Tests et Déploiement

### 1. Tests de Sécurité
- Tester l'authentification
- Vérifier la protection des routes
- Tester la gestion des tokens expirés
- Vérifier la validation des entrées

### 2. Bonnes Pratiques
- Utiliser HTTPS en production
- Stocker les secrets de manière sécurisée
- Implémenter la validation des entrées
- Gérer correctement les erreurs

### 3. Déploiement
- Configurer les variables d'environnement
- Mettre en place le monitoring
- Implémenter les logs de sécurité

## Utilisation

1. Démarrer le backend :
```bash
cd todo-backend
mvn spring-boot:run
```

2. Démarrer le frontend :
```bash
cd todo-frontend
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5173`