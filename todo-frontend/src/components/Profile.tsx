import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userService } from '../services/userService';
import '../styles/profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userData = await userService.getCurrentUser();
                setUser({
                    email: userData.email || '',
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || ''
                });
            } catch (error) {
                console.error('Erreur lors de la récupération des données utilisateur:', error);
            }
        };
        loadUserData();

        // Afficher le message de succès si on vient de la page d'édition
        if (location.state?.success) {
            setSuccessMessage('Vos informations ont été mises à jour avec succès !');
            // Effacer le message après 5 secondes
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    const handleModify = () => {
        navigate('/profile/edit');
    };

    const handleBack = () => {
        navigate('/todos');
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <button onClick={handleBack} className="back-button">
                    ← Retour
                </button>
                <h1>Mon Profil</h1>
            </div>

            <div className="profile-content">
                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}

                <div className="avatar-circle">
                    <span className="avatar-letter">
                        {user.firstName ? user.firstName[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : 'A'}
                    </span>
                </div>

                <div className="profile-info">
                    <div className="info-group">
                        <label>Email</label>
                        <div className="info-value">{user.email}</div>
                    </div>

                    <div className="info-group">
                        <label>Prénom</label>
                        <div className="info-value">{user.firstName}</div>
                    </div>

                    <div className="info-group">
                        <label>Nom</label>
                        <div className="info-value">{user.lastName}</div>
                    </div>

                    <button onClick={handleModify} className="modify-button">
                        Modifier mes informations
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
