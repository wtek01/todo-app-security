Je vais vous expliquer le processus complet d'authentification et de sécurité étape par étape :

# Frontend -> Backend : Processus d'Authentification

## 1. FRONTEND - Page de Login
Quand l'utilisateur remplit le formulaire de connexion :

```typescript
// components/Login.tsx
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        // Appel au service d'authentification
        await authService.login(email, password);
        navigate('/todos');
    } catch (err) {
        setError('Email ou mot de passe incorrect');
    }
};
```

## 2. FRONTEND - Service d'Authentification
Le service envoie la requête au backend :

```typescript
// services/authService.ts
async login(email: string, password: string) {
    try {
        const response = await axios.post(`${API_URL}/auth/authenticate`, {
            email,
            password
        });
        // Stockage du token reçu
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error;
    }
}
```

## 3. BACKEND - Controller d'Authentification
Reçoit la requête du frontend :

```java
// controller/AuthController.java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        // Délègue au service d'authentification
        return ResponseEntity.ok(authService.authenticate(request));
    }
}
```

## 4. BACKEND - Service d'Authentification
Vérifie les credentials :

```java
// service/AuthenticationService.java
@Service
public class AuthenticationService {
    
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // 1. Vérifie les credentials avec Spring Security
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );
        
        // 2. Si authentification réussie, récupère l'utilisateur
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        // 3. Génère un token JWT
        var jwtToken = jwtService.generateToken(user);
        
        // 4. Retourne la réponse
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }
}
```

## 5. BACKEND - Service JWT
Génère le token :

```java
// service/JwtService.java
@Service
public class JwtService {
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256)
            .compact();
    }
}
```

# Processus de Sécurisation des Requêtes

## 1. FRONTEND - Intercepteur Axios
Ajoute automatiquement le token à chaque requête :

```typescript
// services/axiosConfig.ts
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

## 2. BACKEND - Filtre JWT
Intercepte et vérifie chaque requête :

```java
// security/JwtAuthenticationFilter.java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        // 1. Extrait le token du header
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // 2. Extrait et vérifie le token
        String token = authHeader.substring(7);
        String userEmail = jwtService.extractUsername(token);
        
        // 3. Vérifie l'authentification
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            
            // 4. Vérifie la validité du token
            if (jwtService.isTokenValid(token, userDetails)) {
                // 5. Configure l'authentification Spring Security
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
                );
                
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

## 3. BACKEND - Configuration de Sécurité
Définit les règles de sécurité :

```java
// config/SecurityConfig.java
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
}
```

Ce processus assure :
1. Une authentification sécurisée
2. La génération et validation de tokens JWT
3. La protection des routes
4. Une gestion stateless des sessions
5. Une vérification systématique des droits d'accès