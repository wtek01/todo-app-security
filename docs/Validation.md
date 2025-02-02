# Documentation de la Validation - Todo App

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Validation Backend](#validation-backend)
3. [Validation Frontend](#validation-frontend)
4. [Flux de Validation](#flux-de-validation)
5. [Exemples d'Utilisation](#exemples-dutilisation)

## Vue d'ensemble

La validation dans l'application Todo est implémentée à deux niveaux :
- Backend : Validation avec Jakarta Validation (anciennement Bean Validation)
- Frontend : Gestion et affichage des erreurs de validation

## Validation Backend

### 1. DTO de Validation (TodoDTO.java)
```java
@Data
public class TodoDTO {
    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 3, max = 100, message = "Le titre doit contenir entre 3 et 100 caractères")
    private String title;

    @Size(max = 500, message = "La description ne doit pas dépasser 500 caractères")
    private String description;

    @FutureOrPresent(message = "La date d'échéance doit être dans le présent ou le futur")
    private LocalDate dueDate;
}
```

**Explications des annotations :**
- `@NotBlank` : Vérifie que le champ n'est pas null et contient au moins un caractère non-espace
- `@Size` : Valide la longueur du texte
- `@FutureOrPresent` : Vérifie que la date est dans le présent ou le futur

### 2. Gestionnaire Global d'Erreurs
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, List<String>>> handleValidationErrors(
            MethodArgumentNotValidException ex
    ) {
        Map<String, List<String>> errors = new HashMap<>();
        
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String fieldName = error.getField();
            String errorMessage = error.getDefaultMessage();
            errors.computeIfAbsent(fieldName, k -> new ArrayList<>())
                 .add(errorMessage);
        });
        
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(errors);
    }
}
```

**Rôle :**
- Intercepte les erreurs de validation
- Formate les erreurs en un format JSON structuré
- Retourne une réponse 400 Bad Request avec les détails des erreurs

## Validation Frontend

### 1. Service de Gestion des Erreurs
```typescript
// todoService.ts
const extractValidationErrors = (error: any): ValidationError[] => {
    if (error.response?.status === 400 && error.response.data) {
        const validationErrors: ValidationError[] = [];
        const errors = error.response.data;
        
        Object.entries(errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
                messages.forEach(message => {
                    validationErrors.push({
                        field,
                        message: message as string
                    });
                });
            }
        });
        
        return validationErrors;
    }

    return [{
        field: 'global',
        message: 'Une erreur est survenue'
    }];
};
```

### 2. Composant de Formulaire
```typescript
const [errors, setErrors] = useState<{[key: string]: string}>({});

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});  // Réinitialisation des erreurs

    try {
        // Tentative de soumission
        await onSubmit(formData);
    } catch (err: any) {
        if (err.validationErrors) {
            // Traitement des erreurs de validation
            const newErrors = {};
            err.validationErrors.forEach((error: ValidationError) => {
                newErrors[error.field] = error.message;
            });
            setErrors(newErrors);
        }
    }
};
```

## Flux de Validation

1. **Soumission du Formulaire**
    - L'utilisateur remplit le formulaire et le soumet
    - Les données sont envoyées au backend

2. **Validation Backend**
    - Les annotations de validation sont vérifiées
    - Si erreurs, le `GlobalExceptionHandler` les capture
    - Un objet JSON avec les erreurs est renvoyé

3. **Traitement Frontend**
    - Le service intercepte la réponse
    - Si statut 400, extrait les erreurs
    - Les erreurs sont transmises au composant

4. **Affichage des Erreurs**
    - Le composant affiche les erreurs sous les champs concernés
    - Les champs en erreur sont stylisés (bordure rouge)

## Exemples d'Utilisation

### Création d'un Todo
```typescript
// Tentative de création avec titre trop court
try {
    await todoService.addTodo({
        title: "a",  // Déclenche une erreur de validation
        description: "Description"
    });
} catch (err) {
    // Erreur retournée :
    // {
    //   "title": ["Le titre doit contenir entre 3 et 100 caractères"]
    // }
}
```

### Mise à jour d'un Todo
```typescript
// Tentative de mise à jour avec date invalide
try {
    await todoService.updateTodo(id, {
        dueDate: "2023-01-01"  // Date dans le passé
    });
} catch (err) {
    // Erreur retournée :
    // {
    //   "dueDate": ["La date d'échéance doit être dans le présent ou le futur"]
    // }
}
```

## CSS pour la Validation

```css
.form-input.error {
    border-color: #dc3545;
    background-color: #fff8f8;
}

.error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}
```

## Bonnes Pratiques

1. **Validation Backend**
    - Toujours valider les données côté serveur
    - Messages d'erreur clairs et en français
    - Une seule responsabilité par validation

2. **Validation Frontend**
    - Validation immédiate quand possible
    - Messages d'erreur visibles et explicites
    - Réinitialisation des erreurs à chaque tentative

3. **UX**
    - Indiquer clairement les champs requis
    - Donner des indications sur le format attendu
    - Permettre de corriger facilement les erreurs