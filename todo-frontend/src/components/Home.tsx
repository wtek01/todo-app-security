// src/components/Home.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Si l'utilisateur est authentifié, redirige vers /todos
        if (authService.isAuthenticated()) {
            navigate('/todos');
        }
    }, [navigate]);

    return (
        <div className="home-container">
            <h1>Bienvenue sur Todo App</h1>
            <p>Organisez vos tâches efficacement</p>
            <div className="buttons">
                <button onClick={() => navigate('/login')}>
                    SE CONNECTER
                </button>
                <button onClick={() => navigate('/register')}>
                    S'INSCRIRE
                </button>
            </div>
        </div>
    );
};

export default Home;