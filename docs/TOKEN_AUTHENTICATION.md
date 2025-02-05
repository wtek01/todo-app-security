Voici une version réorganisée et légèrement enrichie pour rendre le contenu plus clair et plus lisible :

---

# Gestion de l'Authentification par Tokens (JWT) dans Todo App

Cette application illustre comment mettre en place une authentification à base de [JSON Web Tokens (JWT)](https://jwt.io) entre un **frontend React** et un **backend Spring Boot**.  
Elle montre les bonnes pratiques pour sécuriser les échanges, gérer la session de l’utilisateur, et manipuler les tokens côté frontend (stockage, intercepteurs d’appels réseau, etc.).

## Table des Matières

1. [Aperçu du Processus d’Authentification](#aperçu-du-processus-dauthentification)
2. [Structure d’un JWT](#structure-dun-jwt)
3. [Flux d’Authentification](#flux-dauthentification)
4. [Implémentation Technique](#implémentation-technique)
   - [Backend (Spring Boot)](#backend-spring-boot)
   - [Frontend (React)](#frontend-react)
5. [Cycle de Vie d’un Token](#cycle-de-vie-dun-token)
6. [Bonnes Pratiques](#bonnes-pratiques)
7. [Avantages de cette Approche](#avantages-de-cette-approche)
8. [Processus de Génération et d’Utilisation des Tokens](#processus-de-génération-et-dutilisation-des-tokens)
   - [Clé Secrète (Backend uniquement)](#1-clé-secrète-backend-uniquement)
   - [Génération du Token (Backend)](#2-génération-du-token-backend)
   - [Réception et Stockage (Frontend)](#3-réception-et-stockage-frontend)
   - [Utilisation dans les Requêtes (Frontend)](#4-utilisation-dans-les-requêtes-frontend)
   - [Vérification des Requêtes (Backend)](#5-vérification-des-requêtes-backend)
9. [Changement de la Clé Secrète](#changement-de-la-clé-secrète)
10. [Bonnes Pratiques pour la Clé Secrète](#bonnes-pratiques-pour-la-clé-secrète)
11. [Points Clés à Retenir](#points-clés-à-retenir)

---

## Aperçu du Processus d’Authentification

Le flux d’authentification se déroule en plusieurs étapes :

```
Client                                Serveur
  |                                     |
  |------ Login (email/password) ------>|
  |                                     |-- Vérifie les credentials
  |                                     |-- Génère un token JWT
  |<-------- Retourne le token ---------|
  |                                     |
  |--- Stocke le token (localStorage) --|
```

1. L’utilisateur saisit ses identifiants (email et mot de passe).
2. Le serveur vérifie les identifiants et génère un **token JWT**.
3. Le client reçoit ce token et le stocke (généralement dans le `localStorage` ou un cookie httpOnly).
4. À chaque requête ultérieure, le client envoie ce token dans le header `Authorization` pour s’authentifier.

---

## Structure d’un JWT

Un **JWT** (JSON Web Token) se compose de trois parties séparées par des points :

1. **Header**
   - Contient le type de token (ex. `JWT`) et l’algorithme de cryptage.

2. **Payload**
   - Contient les données utilisateur (id, rôles, permissions, etc.).
   - Peut inclure des métadonnées comme la date d’expiration (`exp`).

3. **Signature**
   - Permet de vérifier l’intégrité et l’authenticité du token.
   - Générée à partir du header, du payload et d’une clé secrète.

Visuellement, un JWT ressemble à ceci :
```
xxxxx.yyyyy.zzzzz
```

---

## Flux d’Authentification

1. **Login**
   - L’utilisateur envoie ses identifiants (email, mot de passe).
   - Le backend vérifie ces identifiants et génère un token JWT.
   - Le frontend stocke ce token (par exemple dans le `localStorage`).

2. **Requêtes Authentifiées**
   - À chaque requête, le frontend ajoute le token dans l’en-tête HTTP `Authorization: Bearer <token>`.
   - Le backend valide le token et identifie l’utilisateur.

3. **Expiration / Erreur**
   - Si le token est invalide ou expiré, le backend renvoie `401 Unauthorized`.
   - Le frontend supprime le token et redirige l’utilisateur vers la page de connexion.

---

## Implémentation Technique

### Backend (Spring Boot)

#### 1. Génération du Token (extrait `JwtService`)

```java
@Service
public class JwtService {
    
    @Value("${application.security.jwt.secret-key}")
    private String secretKey;
   
    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;
   
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256)
            .compact();
    }
    
    private Key getSignInKey() {
        // Convertit la secretKey en type Key
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }
    
    // ...
}
```

#### 2. Vérification du Token (extrait `JwtAuthenticationFilter`)

```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) 
                                    throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        String userEmail = jwtService.extractUsername(jwt);
        
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            if (jwtService.isTokenValid(jwt, userDetails)) {
                // Configure l’objet Authentication pour Spring Security
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
```

### Frontend (React)

#### 1. Stockage du Token

```typescript
// authService.ts
export async function login(email: string, password: string) {
  const response = await axios.post(`${API_URL}/auth/authenticate`, {
    email,
    password
  });
  
  // Stockage du token dans localStorage
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify({
    firstname: response.data.firstname,
    lastname: response.data.lastname,
    email: response.data.email
  }));
}
```

#### 2. Utilisation dans les Requêtes : Intercepteurs Axios

```typescript
// axiosConfig.ts
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Token invalide ou expiré
            localStorage.removeItem('token');
            window.location.href = '/login'; // Redirection
        }
        return Promise.reject(error);
    }
);
```

---

## Cycle de Vie d’un Token

1. **Génération**
   - Se produit lors de la connexion (authentification réussie).
   - Garantit que seules les personnes ayant fourni des identifiants valides reçoivent un token.

2. **Utilisation**
   - Le token est envoyé avec chaque requête (dans le header `Authorization`).

3. **Expiration**
   - Les tokens ont une durée de validité limitée.
   - À expiration, l’utilisateur doit se reconnecter pour en obtenir un nouveau.

4. **Invalidation**
   - Lors de la déconnexion (supprimer du `localStorage`).
   - Lorsqu’un appel protégé échoue avec un code `401 Unauthorized`.

---

## Bonnes Pratiques

1. **Sécurité**
   - Toujours utiliser **HTTPS** pour éviter la divulgation du token.
   - Ne pas stocker de données sensibles dans le payload du token.
   - Définir une **expiration** raisonnable pour les tokens.

2. **Stockage**
   - Privilégier `localStorage` ou des cookies sécurisés (httpOnly) pour stocker le token.
   - Nettoyer le token à la déconnexion.
   - Gérer correctement les erreurs d’authentification (redirection).

3. **Gestion des Requêtes**
   - Mettre en place un **intercepteur** pour ajouter automatiquement le token.
   - Centraliser la gestion des erreurs `401 Unauthorized`.
   - Rediriger rapidement vers la page de login si nécessaire.

---

## Avantages de cette Approche

1. **Stateless**
   - Le serveur ne stocke pas l’état de session (scalabilité accrue).
   - Pas de table de session ni de persistance supplémentaire côté serveur.

2. **Sécurité**
   - Les tokens sont signés cryptographiquement et expirent automatiquement.
   - Possibilité de les révoquer en les supprimant du frontend.

3. **Expérience Utilisateur**
   - Authentification “transparente” (le token est inséré automatiquement).
   - Possibilité de gérer facilement plusieurs sessions (multi-appareils).

---

## Processus de Génération et d’Utilisation des Tokens

### 1. Clé Secrète (Backend uniquement)

```properties
# application.properties
application.security.jwt.secret-key=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
```

- **Doit rester privée** et **confinée au serveur**.
- **Ne jamais** l’exposer au frontend.
- Sert à signer et vérifier les tokens.

### 2. Génération du Token (Backend)

```java
@Service
public class AuthenticationService {

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // 1. Vérifie les credentials
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(), request.getPassword()
            )
        );
        
        // 2. Récupère l'utilisateur
        var user = userRepository.findByEmail(request.getEmail())
                     .orElseThrow();

        // 3. Génère le token
        var jwtToken = jwtService.generateToken(user);
        
        // 4. Retourne le token au frontend
        return AuthenticationResponse.builder()
            .token(jwtToken)
            .build();
    }
}
```

### 3. Réception et Stockage (Frontend)

```typescript
// authService.ts
export const authService = {
    async login(email: string, password: string) {
        const response = await axios.post('/api/auth/authenticate', {
            email,
            password
        });
        
        // Stocker le token
        localStorage.setItem('token', response.data.token);
    }
};
```

### 4. Utilisation dans les Requêtes (Frontend)

```typescript
// axiosConfig.ts
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### 5. Vérification des Requêtes (Backend)

```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
                                    throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        
        if (jwtService.isTokenValid(jwt, userDetails)) {
            // Configure l’authentification
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}
```

---

## Changement de la Clé Secrète

Pour générer une nouvelle clé, vous pouvez utiliser un code similaire à :

```java
public class SecretKeyGenerator {
    public static void main(String[] args) {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String key = Base64.getEncoder().encodeToString(bytes);
        System.out.println("Generated key: " + key);
    }
}
```

Vous mettrez ensuite cette clé dans le fichier `application.properties` ou en variable d’environnement :

```properties
application.security.jwt.secret-key=NOUVELLE_CLÉ_GÉNÉRÉE
```

---

## Bonnes Pratiques pour la Clé Secrète

1. **Longueur et Entropie**
   - Au moins 256 bits (32 octets).
   - Génération aléatoire (éviter toute prédictibilité).

2. **Séparation par Environnement**
   - Définir différentes clés pour le *développement*, *test* et *production*.
   - Éviter de **versionner** la clé secrète dans Git.

3. **Stockage Sécurisé**
   - Dans un coffre-fort applicatif ou dans des variables d’environnement :
     ```properties
     # application-prod.properties
     application.security.jwt.secret-key=${JWT_SECRET}
     ```
   - En production :
     ```bash
     export JWT_SECRET=votre_clé_sécurisée
     ```

---

## Points Clés à Retenir

1. **La clé secrète** (définie côté serveur) est utilisée pour **signer** et **vérifier** les tokens.
2. **Le token JWT** est transmis au client et stocké localement, puis renvoyé au serveur pour chaque requête.
3. **L’authentification** s’effectue côté serveur en validant la signature du token et en vérifiant sa validité (expiration, etc.).
4. **Sécurité et bonne configuration** sont essentielles pour éviter toute compromission de la clé ou fuite de données.

---

**En résumé**, cette approche offre une solution d’authentification **stateless**, **sécurisée** et **scalable**, adaptée aux architectures modernes **Frontend / Backend**. Elle repose sur des standards éprouvés comme [JWT](https://jwt.io) et s’intègre facilement avec des frameworks tels que **React** et **Spring Boot**.