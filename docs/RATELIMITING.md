# Rate Limiting - Documentation

Ce document explique la mise en place d’un mécanisme de **Rate Limiting** (limitation de débit) 
dans notre application, ainsi que quelques scénarios de test pour vérifier son bon fonctionnement.

---

## 1. Contexte

Afin d’éviter qu’un utilisateur (ou un bot) envoie un nombre trop élevé de requêtes sur l’application 
dans un court laps de temps, nous mettons en place une stratégie de **Token Bucket** au niveau de l’API.  

- Chaque adresse IP possède son propre « seau » (bucket) de jetons (tokens).  
- Une requête entrante consomme un jeton.  
- Les jetons sont rechargés progressivement (selon un taux de refill).  
- Quand un bucket n’a plus de jetons disponibles, les requêtes reçoivent la réponse **`HTTP 429 (Too Many Requests)`**.  

---

## 2. Implémentation Technique

### 2.1 Le Filtre `RateLimitingFilter`

Le filtre `RateLimitingFilter` (héritant de `OncePerRequestFilter`) intercepte chaque requête :

1. **Détermine l’IP** du client : `request.getRemoteAddr()`.
2. **Récupère ou crée un `TokenBucket`** pour cette IP (dans une Map concurrente).
3. **Tente de consommer** un jeton en appelant `tokenBucket.tryConsume()`.
   - Si vrai : la requête continue son exécution (`chain.doFilter()`).
   - Si faux : la requête est immédiatement rejetée avec un statut `429`.

### 2.2 La Classe `TokenBucket`

- **Attributs** : 
  - `capacity` (nombre max. de jetons), 
  - `refillRate` (nombre de jetons réapprovisionnés par seconde),
  - `tokens` (nombre actuel de jetons, géré par un `AtomicInteger`),
  - `lastRefillTimestamp` (pour calculer le temps écoulé depuis le dernier recharge).

- **Méthode `tryConsume()`** :  
  1. Appelle `refill()` pour recalcule le nombre de jetons disponibles.
  2. Vérifie si `tokens > 0`.  
     - Si oui, décrémente et renvoie `true`.  
     - Sinon, `false`.

### 2.3 Configuration via `application.properties`

```properties
# Rate Limiting Configuration
app.rate-limiting.capacity=10     # Nombre maximum de jetons
app.rate-limiting.refill-rate=1   # Taux de recharge (jetons/second)
```

> **Remarque :** Dans la configuration par défaut, nous excluons `/api/auth/**` du filtrage (via `shouldNotFilter`). Par conséquent, seules les requêtes sur `/api/todos`, `/api/...` (en dehors de `/api/auth`) sont effectivement soumises à cette limite.

### 2.4 Enregistrement du Filtre dans Spring

Le filtre est enregistré via un `FilterRegistrationBean` dans `RateLimitingConfig`.  
Assurez-vous de **ne pas** faire un `new RateLimitingFilter()` en direct, afin que Spring puisse injecter correctement `capacity` et `refillRate`.

Exemple :

```java
@Bean
public RateLimitingFilter rateLimitingFilterBean(
    @Value("${app.rate-limiting.capacity:10}") int capacity,
    @Value("${app.rate-limiting.refill-rate:1}") double refillRate
) {
    return new RateLimitingFilter(capacity, refillRate);
}

@Bean
public FilterRegistrationBean<RateLimitingFilter> rateLimitingFilterRegistration(
    RateLimitingFilter rateLimitingFilter
) {
    FilterRegistrationBean<RateLimitingFilter> registrationBean = new FilterRegistrationBean<>();
    registrationBean.setFilter(rateLimitingFilter);
    registrationBean.addUrlPatterns("/api/*");
    registrationBean.setOrder(1);
    return registrationBean;
}
```

---

## 3. Scénarios de Test

Voici quelques scénarios permettant de valider le comportement du `RateLimitingFilter`.

### 3.1 Test Basique : Capacité Ajustée

- **Objectif :** Vérifier qu’une vague de requêtes successives entraîne un `429`.
- **Préparation :**
   1. Dans `application.properties`, fixer :
      ```properties
      app.rate-limiting.capacity=2
      app.rate-limiting.refill-rate=0
      ```
   2. Lancer l’application.
- **Étapes :**
   1. Envoyer 3 requêtes GET rapides (sans laisser de délai) sur un endpoint protégé (`/api/todos`, par ex.).
   2. Constater :
      - Les 2 premières requêtes reçoivent `200 OK` (ou autre code selon l’endpoint).
      - La 3ème doit renvoyer `429 Too Many Requests`.
- **Validation :**
   - Observer dans les logs l’indication `Rate limit exceeded for IP: <votre IP>`.
   - Observer la réponse en retour d’API (body indiquant un dépassement du taux).

### 3.2 Test Échelonné : Refill

- **Objectif :** Vérifier que les jetons se réapprovisionnent bien au fil du temps.
- **Préparation :**
   1. Dans `application.properties`, fixer (par ex.) :
      ```properties
      app.rate-limiting.capacity=2
      app.rate-limiting.refill-rate=1
      ```
   2. Lancer l’application.
- **Étapes :**
   1. Envoyer 2 requêtes GET consécutives → doivent passer.
   2. Envoyer immédiatement une 3ème requête → doit échouer (`429`).
   3. Attendre ~1 seconde (le refill doit ajouter 1 jeton).
   4. Ré-envoyer une requête → doit passer.
- **Validation :**
   - Vérifier dans les logs que les tokens sont remontés à 1 au bout d’une seconde.
   - Constat du passage ou échec des requêtes.

### 3.3 Test d’Exclusion d’Endpoint

- **Objectif :** Vérifier que `/api/auth/**` (ou d’autres endpoints exclus) ne sont **pas** soumis au Rate Limiting.
- **Étapes :**
   1. Appeler `/api/auth/authenticate` plusieurs fois rapidement.
   2. Constater que même avec une capacité faible, **aucun** `429` n’est renvoyé.
   3. Vérifier dans les logs que `RateLimitingFilter` ne s’applique pas sur ce chemin.
- **Validation :**
   - Pas de statut `429`.
   - Logs indiquant `shouldNotFilter()` = `true`.

### 3.4 Test Postman - Collection Automatisée

- **Objectif :** Vérifier sur une série de 10+ requêtes si on peut reproduire ou non un `429`.
- **Étapes :**
   1. Configurer Postman pour envoyer, par exemple, 15 requêtes `GET /api/todos` avec un délai minimal (ou aucune pause).
   2. Observer les résultats de chaque itération dans la collection Postman.
   3. Éventuellement comparer la latence, le code de réponse, etc.

---

## 4. Bonnes Pratiques

- **Toujours commenter** clairement vos valeurs dans `application.properties` :
  ```properties
  app.rate-limiting.capacity=10
  # Nombre max de jetons

  app.rate-limiting.refill-rate=1
  # Taux de recharge (jetons/seconde)
  ```
- **Ne pas** insérer de `#` directement après le chiffre (sans espace) pour éviter une mauvaise interprétation de la valeur.
- **Séparer clairement** la configuration de production et la configuration de test si vous avez des besoins de performance différents.
- **Vérifier** que l’ensemble des IPs qui doivent être limitées passent par le même proxy ou load balancer 
- (sinon l’adresse source peut différer).

---

## 5. Conclusion

Le `RateLimitingFilter` offre une solution simple et efficace pour éviter qu’une IP n’inonde le serveur de requêtes. 
Les tests présentés ci-dessus permettent de valider à la fois le fonctionnement nominal et les scénarios d’erreur (HTTP 429). Pour toute modification de la capacité ou du taux de recharge, adaptez vos tests pour vérifier à nouveau le comportement du seau de jetons (Token Bucket).
