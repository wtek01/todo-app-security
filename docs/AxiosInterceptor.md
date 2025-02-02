# Documentation des Intercepteurs Axios

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Intercepteur de Requête](#intercepteur-de-requête)
3. [Intercepteur de Réponse](#intercepteur-de-réponse)
4. [Utilisation](#utilisation)
5. [Bonnes Pratiques](#bonnes-pratiques)

## Vue d'ensemble

Les intercepteurs Axios permettent d'interagir avec les requêtes et les réponses HTTP de manière centralisée. Cette documentation détaille leur implémentation et leur utilisation dans notre application.

## Intercepteur de Requête

```typescript
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### Rôle
- S'exécute avant chaque requête HTTP
- Récupère le token JWT du localStorage
- Ajoute automatiquement le token dans le header `Authorization`
- Évite d'avoir à ajouter manuellement le token dans chaque requête

## Intercepteur de Réponse

```typescript
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Possibilité de rediriger vers la page de login
        }
        return Promise.reject(error);
    }
);
```

### Rôle
- S'exécute après chaque réponse HTTP
- En cas d'erreur 401 (non autorisé) :
    - Supprime le token invalide du localStorage
    - Permet de gérer la déconnexion automatique
- Propage l'erreur pour qu'elle soit gérée ailleurs

## Utilisation

### Dans les Services
```typescript
// Le token est ajouté automatiquement
const response = await axios.get('/api/todos');

// Gestion des erreurs
try {
    await axios.get('/api/secure-endpoint');
} catch (error) {
    // Le token a déjà été supprimé par l'intercepteur
    // Redirection possible vers login
}
```

### Configuration Initiale
```typescript
// Dans main.tsx ou App.tsx
import './axiosConfig';  // Une seule fois au démarrage

// Dans les services
import axios from 'axios';  // Utilise la configuration globale
```

## Bonnes Pratiques

### 1. Sécurité
- Gestion centralisée des tokens
- Nettoyage automatique des tokens invalides
- Gestion cohérente des erreurs d'authentification

### 2. Maintenance
- Configuration unique pour toute l'application
- Séparation des responsabilités
- Code plus facile à maintenir

### 3. Réutilisabilité
- Pattern réutilisable dans d'autres projets
- Facilement extensible pour d'autres besoins
- Configuration modulaire

### 4. Authentification
- Gestion centralisée de l'authentification
- Traitement uniforme des erreurs d'authentification
- Redirection automatique si nécessaire

## Avantages

1. **Centralisation**
    - Gestion des tokens en un seul endroit
    - Configuration unique
    - Comportement cohérent

2. **Automatisation**
    - Ajout automatique des tokens
    - Gestion automatique des erreurs
    - Nettoyage automatique des tokens invalides

3. **Maintenance**
    - Code plus propre
    - Moins de duplication
    - Plus facile à déboguer

4. **Sécurité**
    - Gestion cohérente des tokens
    - Nettoyage automatique des tokens invalides
    - Meilleure protection contre les fuites de tokens