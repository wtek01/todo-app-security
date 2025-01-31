// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import TodoList from './components/TodoList';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                {/* Page d'accueil */}
                <Route path="/" element={<Home />} />
                
                {/* Routes d'authentification */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Route protégée */}
                <Route 
                    path="/todos" 
                    element={
                        <ProtectedRoute>
                            <TodoList />
                        </ProtectedRoute>
                    } 
                />

                {/* Redirection des routes inconnues vers Home */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;