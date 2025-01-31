# Todo App - Application Sécurisée

## Description
Todo App est une application de gestion de tâches sécurisée permettant à plusieurs utilisateurs de gérer leurs todos de manière isolée. Chaque utilisateur ne peut voir et gérer que ses propres tâches.

## Technologies Utilisées

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security
- JWT (JSON Web Tokens)
- JPA/Hibernate
- H2 Database (base de données en mémoire)
- Maven

### Frontend
- React.js avec Vite
- TypeScript
- Axios pour les appels API
- React Router pour la navigation
- LocalStorage pour le stockage du token

## Architecture de Sécurité

### 1. Authentification
- Basée sur JWT (JSON Web Tokens)
- Session stateless
- Token valide pendant 24 heures
- Stockage sécurisé du token côté client

### 2. Autorisation
- Protection des routes côté backend et frontend
- Filtrage des todos par utilisateur
- Validation des droits d'accès à chaque requête

### 3. Sécurité des Données
- Mots de passe hashés avec BCrypt
- Isolation des données entre utilisateurs
- Validation des entrées
- Protection CORS configurée

## Configuration et Installation

### Backend

1. Prérequis
```bash
Java 17 ou supérieur
Maven 3.x
```

2. Configuration
   Le fichier `application.properties` contient la configuration principale :
```properties
# Base de données H2
spring.h2.console.enabled=true
spring.datasource.url=jdbc:h2:mem:tododb

# JWT Configuration
application.security.jwt.secret-key=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
application.security.jwt.expiration=86400000
```

3. Lancement
```bash
# Cloner le projet
git clone [URL_DU_REPO]

# Se placer dans le dossier backend
cd todo-app-security/todo-backend

# Installer les dépendances
mvn clean install

# Lancer l'application
mvn spring-boot:run
```

Le backend sera accessible sur `http://localhost:8080`

### Frontend

1. Prérequis
```bash
Node.js 16.x ou supérieur
npm ou yarn
```

2. Installation
```bash
# Se placer dans le dossier frontend
cd todo-app-security/todo-frontend

# Installer les dépendances
npm install
# ou
yarn install
```

3. Configuration
   Créez un fichier `.env` si nécessaire :
```env
VITE_API_URL=http://localhost:8080/api
```

4. Lancement
```bash
# Mode développement
npm run dev
# ou
yarn dev
```

Le frontend sera accessible sur `http://localhost:5173`

## Utilisation

### Comptes par défaut
L'application est préchargée avec deux utilisateurs :

1. Utilisateur standard
```
Email: test@gmail.com
Password: test123
```

2. Administrateur
```
Email: admin@gmail.com
Password: test123
```

### Endpoints API

#### Authentification
- POST `/api/auth/register` : Inscription
- POST `/api/auth/authenticate` : Connexion

#### Todos (nécessite authentification)
- GET `/api/todos` : Liste des todos
- POST `/api/todos` : Création d'un todo
- PUT `/api/todos/{id}` : Modification d'un todo
- DELETE `/api/todos/{id}` : Suppression d'un todo

## Structure du Projet

### Backend
```
src/main/java/com/wtek/todoapp/
├── config/
│   ├── ApplicationConfig.java
│   ├── SecurityConfig.java
│   └── WebConfig.java
├── controller/
│   ├── AuthController.java
│   └── TodoController.java
├── model/
│   ├── Todo.java
│   └── User.java
├── repository/
│   ├── TodoRepository.java
│   └── UserRepository.java
├── security/
│   ├── JwtAuthenticationFilter.java
│   └── JwtService.java
└── service/
    └── AuthenticationService.java
```

### Frontend
```
src/
├── components/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── TodoList.tsx
│   └── TodoItem.tsx
├── services/
│   ├── authService.ts
│   └── todoService.ts
└── App.tsx
```

## Tests

### Backend
```bash
# Exécuter les tests
mvn test
```

### Frontend
```bash
# Exécuter les tests
npm run test
# ou
yarn test
```

## Déploiement

### Backend
1. Créer un jar
```bash
mvn package
```

2. Exécuter le jar
```bash
java -jar target/todo-app.jar
```

### Frontend
1. Créer le build
```bash
npm run build
# ou
yarn build
```

2. Le dossier `dist` contient l'application prête pour la production

## Bonnes Pratiques de Sécurité
- Utilisez HTTPS en production
- Changez régulièrement la clé secrète JWT
- Surveillez les logs d'authentification
- Effectuez des audits de sécurité réguliers
- Maintenez les dépendances à jour