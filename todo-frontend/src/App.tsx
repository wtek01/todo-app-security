// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import TodoList from './components/TodoList';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
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
                
                {/* Routes protégées */}
                <Route 
                    path="/todos" 
                    element={
                        <ProtectedRoute>
                            <TodoList />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/profile" 
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/profile/edit" 
                    element={
                        <ProtectedRoute>
                            <EditProfile />
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