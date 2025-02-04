import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import '../styles/profile.css';

const EditProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                setIsLoading(true);
                const userData = await userService.getCurrentUser();
                setFormData({
                    email: userData.email || '',
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || ''
                });
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
                setError('Impossible de charger les données utilisateur');
            } finally {
                setIsLoading(false);
            }
        };
        loadUserData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const updateData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim()
            };

            await userService.updateUser(updateData);
            await userService.getCurrentUser();
            // Naviguer vers la page de profil avec un message de succès
            navigate('/profile', { 
                state: { success: true }
            });
        } catch (error: any) {
            console.error('Erreur lors de la mise à jour:', error);
            setError(error.message || 'Erreur lors de la mise à jour du profil');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/profile');
    };

    if (isLoading && !formData.email) {
        return <div className="profile-container">Chargement...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <button onClick={handleBack} className="back-button">
                    ← Retour
                </button>
                <h1>Modifier mon profil</h1>
            </div>

            <form onSubmit={handleSubmit} className="profile-content">
                <div className="avatar-circle">
                    <span className="avatar-letter">
                        {formData.firstName ? formData.firstName[0].toUpperCase() : 
                         formData.email ? formData.email[0].toUpperCase() : 'A'}
                    </span>
                </div>

                <div className="profile-info">
                    {error && <div className="error-message">{error}</div>}

                    <div className="info-group">
                        <label>Email</label>
                        <div className="info-value read-only">{formData.email}</div>
                        <small className="field-note">L'email ne peut pas être modifié car il sert d'identifiant</small>
                    </div>

                    <div className="info-group">
                        <label>Prénom</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="edit-input"
                            placeholder="Entrez votre prénom"
                        />
                    </div>

                    <div className="info-group">
                        <label>Nom</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="edit-input"
                            placeholder="Entrez votre nom"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="modify-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;
