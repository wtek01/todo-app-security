# Gestion Hybride des Informations Utilisateur
## Vue d'ensemble
Cette documentation détaille l'approche hybride pour la gestion des informations utilisateur, 
combinant le stockage local (localStorage) et les appels API pour une expérience utilisateur optimale.

## 1. Utiliser un endpoint dédié est généralement la meilleure pratique pour plusieurs raisons :
- Sécurité : Les informations stockées dans le localStorage peuvent être modifiées par l'utilisateur
- Fraîcheur des données : Les informations de l'utilisateur peuvent changer (ex: mise à jour du profil)
- Validation du token : Chaque appel API permet de vérifier si le token est toujours valide 

## 2. Utiliser le localStorage peut être utile pour :
- Afficher rapidement les informations basiques au chargement initial de l'app
- Réduire le nombre d'appels API
- Avoir un fallback si l'API est temporairement indisponible

## 3. La meilleure approche est souvent un hybride.
### Cette approche hybride offre plusieurs avantages :
1. Performance et UX :
- L'interface affiche immédiatement les informations stockées localement
- Pas de "flash" ou d'état de chargement inutile
- L'utilisateur voit ses informations même en cas de problème réseau temporaire
2. Sécurité et Fraîcheur :
- Les informations sont toujours validées et mises à jour via l'API
- Le token est vérifié à chaque requête
- Les données locales sont automatiquement synchronisées
- Réduction des appels API
3. Résilience :
- Fallback sur les données locales en cas d'erreur API
- Synchronisation automatique des données locales avec le serveur
- Gestion propre des erreurs à chaque niveau
## 4. Pour résumer, la meilleure pratique est d'utiliser :
1. Le localStorage pour un affichage immédiat et comme fallback
2. Un endpoint API pour valider et mettre à jour les données
3. Une synchronisation automatique entre les deux
Cette approche offre la meilleure expérience utilisateur tout en garantissant la sécurité et la fraîcheur des données.

## 5. Implémentation 
### 1. Interface UserInfo
```typescript
export interface UserInfo {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
}

// Version avec cache
interface CachedUserInfo extends UserInfo {
    timestamp: number;
    version: number;
}
```
### 2. Service de Gestion Utilisateur

```typescript
export const userService = {
    getStoredUserInfo(): UserInfo | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        
        try {
            const userData: CachedUserInfo = JSON.parse(userStr);
            
            // Vérification de la fraîcheur des données
            if (Date.now() - userData.timestamp > 3600000) {
                return null;
            }
            
            return {
                username: userData.email.split('@')[0],
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName
            };
        } catch (error) {
            return null;
        }
    },

    async getCurrentUser(): Promise<UserInfo> {
        try {
            // Tentative de récupération locale
            const storedUser = this.getStoredUserInfo();
            
            // Appel API
            const response = await axios.get(`${API_URL}/users/me`);
            const userData = response.data;
            
            // Mise à jour du cache local
            localStorage.setItem('user', JSON.stringify({
                ...userData,
                timestamp: Date.now(),
                version: 1
            }));
            
            return userData;
        } catch (error) {
            // Fallback sur les données locales
            if (storedUser) {
                return storedUser;
            }
            throw error;
        }
    }
}
```

### 2. Utilisation dans les Composants

```typescript
const TodoList = () => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(
        userService.getStoredUserInfo()
    );

    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
        try {
            const updatedUserInfo = await userService.getCurrentUser();
            setUserInfo(updatedUserInfo);
        } catch (error) {
            console.error('Error loading user info:', error);
        }
    };
    
    // ... reste du composant
};
```


## 6. Flux de données

1. **Initialisation**
    - Chargement des données depuis localStorage
    - Affichage immédiat des informations stockées
    - Requête API en arrière-plan

2. **Mise à jour**
    - Appel API pour les données à jour
    - Mise à jour du localStorage
    - Mise à jour de l'état du composant

3. **Gestion d'erreur**
    - Tentative d'appel API
    - Fallback sur les données locales si erreur
    - Affichage des messages d'erreur appropriés

## 7. Bonnes pratiques

### 1. Sécurité
- Ne stocker que les informations non sensibles
- Validation des données du localStorage
- Vérification systématique du token JWT

### 2. Performance
```typescript
// Exemple de mise en cache avec expiration
const CACHE_DURATION = 3600000; // 1 heure

const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
};
```

### 3. Gestion des erreurs
```typescript
try {
    const userData = await userService.getCurrentUser();
    setUserInfo(userData);
} catch (error) {
    if (error.response?.status === 401) {
        handleUnauthorized();
    } else {
        setError('Erreur lors du chargement des données utilisateur');
    }
}
```

### 4. Synchronisation
- Mise à jour du cache à chaque modification
- Validation régulière des données locales
- Gestion des conflits de version

## 8. Configuration

### 1. localStorage
```typescript
// Structure des données stockées
interface StoredUserData {
    email: string;
    firstname: string;
    lastname: string;
    timestamp: number;
    version: number;
}
```

### 2. API Endpoints
```typescript
const API_ENDPOINTS = {
    USER_INFO: `${API_URL}/users/me`,
    USER_UPDATE: `${API_URL}/users/me`
};
```

## 9. Tests

### 1. Tests unitaires
```typescript
describe('userService', () => {
    it('should return null when no stored user', () => {
        localStorage.clear();
        expect(userService.getStoredUserInfo()).toBeNull();
    });

    it('should return stored user info when valid', () => {
        const mockUser = {
            email: 'test@test.com',
            firstname: 'Test',
            lastname: 'User',
            timestamp: Date.now()
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
        expect(userService.getStoredUserInfo()).toBeTruthy();
    });
});
```

### 2. Tests d'intégration
- Vérifier la synchronisation localStorage/API
- Tester les scénarios de perte de connexion
- Valider la gestion des erreurs

## 10. Maintenance

1. **Nettoyage périodique**
    - Suppression des données expirées
    - Validation de l'intégrité du cache
    - Mise à jour des versions

2. **Monitoring**
    - Traçage des erreurs de synchronisation
    - Surveillance des performances
    - Analyse des patterns d'utilisation