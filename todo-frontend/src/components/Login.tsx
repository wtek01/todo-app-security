// src/components/Login.tsx
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css'; // Assurez-vous de créer ce fichier

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authService.login(formData.email, formData.password);
            navigate('/todos');
        } catch (err) {
            setError('Email ou mot de passe incorrect');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Connexion</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="Email"
                            className="auth-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder="Mot de passe"
                            className="auth-input"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button">
                        Se connecter
                    </button>
                </form>
                <div className="auth-links">
                    <p>Pas encore de compte ? <Link to="/register">S'inscrire</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;