# Todo App with Security

Une application Todo sécurisée avec Spring Boot et React.

## Structure du Projet

- `todo-backend/` : API REST Spring Boot
- `todo-frontend/` : Application React

## Prérequis

- Java 17+
- Node.js 16+
- Maven
- MySQL/PostgreSQL

## Installation

### Backend

```bash
cd todo-backend
mvn clean install
mvn spring-boot:run
```

### Frontend 
```bash
npm run dev
```

# Init BD
## Les utilisateurs créés sont :
- test@gmail.com / test123
- admin@gmail.com / test123

## Note :
- Le mot de passe hashé correspond à 'test123'
- Chaque utilisateur a des todos différents
- Les dates sont relatives à la date courante

Vous pouvez maintenant vous connecter avec :
- Email: test@gmail.com
- Password: test123

ou
- Email: admin@gmail.com
- Password: test123