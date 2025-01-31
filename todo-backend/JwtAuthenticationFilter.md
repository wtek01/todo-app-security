Le `JwtAuthenticationFilter` joue un rôle crucial dans la sécurité de l'application. 
C'est un filtre qui intercepte toutes les requêtes HTTP entrantes. Voici son fonctionnement détaillé :

Les rôles principaux de ce filtre sont :

1. **Interception des requêtes** :
    - Intercepte chaque requête HTTP entrante
    - Vérifie la présence du header "Authorization"
    - Extrait le token JWT si présent

2. **Validation du Token** :
    - Vérifie la validité du token JWT
    - Extrait l'identifiant de l'utilisateur (email)
    - Vérifie la signature et l'expiration du token

3. **Authentification** :
    - Charge les détails de l'utilisateur depuis la base de données
    - Crée un objet d'authentification Spring Security
    - Configure le contexte de sécurité

4. **Maintenance du contexte de sécurité** :
    - Si le token est valide, configure l'utilisateur comme authentifié
    - Permet aux autres composants d'accéder à l'utilisateur authentifié

5. **Gestion de la chaîne de filtres** :
    - S'intègre dans la chaîne de filtres de Spring Security
    - Passe la main aux filtres suivants une fois son travail terminé

En résumé, c'est la pièce maîtresse qui :
- Transforme le token JWT en une authentification Spring Security
- Assure la sécurité de chaque requête
- Maintient la session utilisateur de manière stateless
- Permet l'accès aux ressources protégées