# Gestion de l'Authentification par Tokens dans Todo App

Ce document explique en détail comment fonctionne l'authentification par tokens JWT (JSON Web Tokens) dans l'application Todo.

## Table des matières
- [Aperçu du processus d'authentification](#aperçu-du-processus-dauthentification)
- [Structure d'un JWT](#structure-dun-jwt)
- [Implémentation dans l'application](#implémentation-dans-lapplication)
- [Cycle de vie d'un token](#cycle-de-vie-dun-token)
- [Bonnes pratiques](#bonnes-pratiques)

## Aperçu du processus d'authentification

Le processus d'authentification se déroule comme suit :

```
Client                                Serveur
  |                                     |
  |------ Login (email/password) ------>|
  |                                     |-- Vérifie les credentials
  |                                     |-- Génère un token JWT
  |<-------- Renvoie le token ----------|
  |                                     |
  |-- Stocke le token (localStorage) -->|
```

## Structure d'un JWT

Un JWT est composé de trois parties :

1. **Header** : 
   - Contient le type de token
   - Spécifie l'algorithme de cryptage

2. **Payload** : 
   - Contient les données utilisateur (id, rôle, etc.)
   - Peut inclure des métadonnées (date d'expiration, etc.)

3. **Signature** :
   - Garantit l'intégrité du token
   - Permet de vérifier que le token n'a pas été modifié

## Implémentation dans l'application

### Service d'authentification (authService.ts)

```typescript
// Gestion de la connexion
async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/auth/authenticate`, {
        email,
        password
    });
    // Stockage du token
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
        firstname: response.data.firstname,
        lastname: response.data.lastname,
        email: response.data.email
    }));
}
```

### Configuration Axios (axiosConfig.ts)

```typescript
// Intercepteur pour ajouter automatiquement le token aux requêtes
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Gestion des erreurs d'authentification
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Redirection vers la page de connexion
        }
        return Promise.reject(error);
    }
);
```

## Cycle de vie d'un token

1. **Génération** :
   - Un nouveau token est généré à chaque connexion
   - Garantit la sécurité et la fraîcheur des données

2. **Utilisation** :
   - Le token est inclus dans chaque requête API
   - Format : `Authorization: Bearer <token>`

3. **Expiration** :
   - Le token a une durée de vie limitée
   - L'expiration force une nouvelle authentification

4. **Invalidation** :
   - À la déconnexion
   - En cas d'erreur 401 (non autorisé)
   - Suppression du localStorage

## Bonnes pratiques

1. **Sécurité** :
   - Utiliser HTTPS pour toutes les communications
   - Ne jamais stocker de données sensibles dans le token
   - Définir une expiration appropriée pour les tokens

2. **Stockage** :
   - Utiliser le localStorage ou les httpOnly cookies
   - Nettoyer le token à la déconnexion
   - Gérer proprement les erreurs d'authentification

3. **Gestion des requêtes** :
   - Utiliser des intercepteurs pour automatiser l'ajout du token
   - Gérer les erreurs 401 de manière centralisée
   - Rediriger vers la connexion si nécessaire

## Avantages de cette approche

1. **Sans état (Stateless)** :
   - Le serveur n'a pas besoin de stocker les sessions
   - Meilleure scalabilité

2. **Sécurité** :
   - Tokens signés cryptographiquement
   - Expiration automatique
   - Révocation possible

3. **Expérience utilisateur** :
   - Authentification transparente
   - Gestion automatique des tokens
   - Sessions multiples possibles
