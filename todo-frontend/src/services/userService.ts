import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export interface UserInfo {
    firstName: string;
    lastName: string;
    email: string;
}

export const userService = {
    async login(email: string, password: string) {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });
            const { token, user } = response.data;
            
            // Stocker le token et les infos utilisateur
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Configurer axios pour inclure le token dans les futures requêtes
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            return user;
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            throw error;
        }
    },

    async getCurrentUser(): Promise<UserInfo> {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Non authentifié');
            }

            // S'assurer que le token est dans les headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Faire la requête API pour avoir les infos à jour
            const response = await axios.get(`${API_URL}/users/me`);
            const userData = response.data;
            
            // Mettre à jour le localStorage avec les nouvelles données
            localStorage.setItem('user', JSON.stringify(userData));
            
            return userData;
        } catch (error) {
            console.error('Erreur lors de la récupération des données utilisateur:', error);
            throw error;
        }
    },

    async updateUser(updates: Partial<UserInfo>): Promise<UserInfo> {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Non authentifié');
            }

            // S'assurer que le token est dans les headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Faire la requête de mise à jour
            const response = await axios.put(`${API_URL}/users/me`, updates);
            const updatedUser = response.data;
            
            // Mettre à jour le localStorage avec les nouvelles données
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            return updatedUser;
        } catch (error: any) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Erreur lors de la mise à jour du profil');
            }
            throw new Error('Erreur de connexion au serveur');
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    }
};
