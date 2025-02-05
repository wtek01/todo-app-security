Je vais vous expliquer la gestion des rôles dans l'application Todo.

1. **Types de Rôles** :
```java
public enum Role {
    USER,    // Utilisateur standard
    ADMIN    // Administrateur
}
```

2. **Différenciation des Actions par Rôle** :

**USER** :
- Créer ses propres todos
- Voir ses propres todos
- Modifier/supprimer ses propres todos
- Gérer son profil

**ADMIN** :
- Voir tous les todos de tous les utilisateurs
- Gérer tous les todos
- Voir la liste des utilisateurs
- Gérer les utilisateurs (activer/désactiver)
- Voir les statistiques globales

3. **Implémentation** :

```java
// TodoController avec séparation des rôles
@RestController
@RequestMapping("/api/todos")
public class TodoController {

    @GetMapping
    public List<TodoDTO> getTodos(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails.getAuthorities().contains(new SimpleGrantedAuthority("ADMIN"))) {
            // Admin voit tous les todos
            return todoRepository.findAll()
                    .stream()
                    .map(TodoDTO::fromTodo)
                    .collect(Collectors.toList());
        } else {
            // User ne voit que ses todos
            return todoRepository.findByUserEmail(userDetails.getUsername())
                    .stream()
                    .map(TodoDTO::fromTodo)
                    .collect(Collectors.toList());
        }
    }

    // Endpoint admin uniquement
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTodos", todoRepository.count());
        stats.put("completedTodos", todoRepository.countByCompleted(true));
        // ... autres statistiques
        return stats;
    }
}

// AdminController pour les fonctionnalités admin
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @GetMapping("/users")
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDTO::fromUser)
                .collect(Collectors.toList());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        // Activer/désactiver un utilisateur
    }

    @GetMapping("/dashboard")
    public DashboardDTO getDashboardStats() {
        // Statistiques globales
    }
}
```

4. **Configuration de Sécurité** :
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            );
        // ... reste de la config
        return http.build();
    }
}
```

5. **Frontend - Interface Admin** :
```typescript
const AdminDashboard = () => {
    const [stats, setStats] = useState<DashboardStats>();
    const [users, setUsers] = useState<User[]>();

    useEffect(() => {
        // Charger les statistiques admin
        adminService.getStats().then(setStats);
        adminService.getUsers().then(setUsers);
    }, []);

    return (
        <div>
            <h1>Dashboard Admin</h1>
            <StatsSection stats={stats} />
            <UserManagement users={users} />
        </div>
    );
};
```

6. **Services Frontend** :
```typescript
export const adminService = {
    async getStats(): Promise<DashboardStats> {
        const response = await axios.get(`${API_URL}/admin/stats`);
        return response.data;
    },

    async getUsers(): Promise<User[]> {
        const response = await axios.get(`${API_URL}/admin/users`);
        return response.data;
    },

    async toggleUserStatus(userId: number): Promise<void> {
        await axios.put(`${API_URL}/admin/users/${userId}/status`);
    }
};
```

7. **Navigation basée sur les rôles** :
```typescript
const Navigation = () => {
    const userRole = useUserRole(); // Hook personnalisé

    return (
        <nav>
            <Link to="/todos">Mes Tâches</Link>
            {userRole === 'ADMIN' && (
                <>
                    <Link to="/admin/dashboard">Dashboard</Link>
                    <Link to="/admin/users">Utilisateurs</Link>
                </>
            )}
        </nav>
    );
};
```

Cette implémentation permet :
- Une séparation claire des responsabilités
- Une sécurité à plusieurs niveaux (backend et frontend)
- Une interface utilisateur adaptée au rôle
- Une gestion centralisée des autorisations

Vous pouvez ajouter ces fonctionnalités progressivement selon vos besoins.