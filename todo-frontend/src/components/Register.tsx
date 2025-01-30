// src/components/Register.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            await authService.register({
                firstname: formData.firstname,
                lastname: formData.lastname,
                email: formData.email,
                password: formData.password
            });
            navigate('/todos');
        } catch (err) {
            setError('Erreur lors de l\'inscription');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Inscription</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <input
                            type="text"
                            value={formData.firstname}
                            onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                            placeholder="Prénom"
                            className="auth-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            value={formData.lastname}
                            onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                            placeholder="Nom"
                            className="auth-input"
                            required
                        />
                    </div>
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
                    <div className="form-group">
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            placeholder="Confirmer le mot de passe"
                            className="auth-input"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button">
                        S'inscrire
                    </button>
                </form>
                <div className="auth-links">
                    <p>Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;