import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export interface UserInfo {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
}

export const userService = {
    // Récupérer les informations depuis le localStorage
    getStoredUserInfo(): UserInfo | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        
        try {
            const userData = JSON.parse(userStr);
            return {
                username: userData.email.split('@')[0], // Fallback username
                email: userData.email,
                firstName: userData.firstname,
                lastName: userData.lastname
            };
        } catch (error) {
            console.error('Error parsing stored user info:', error);
            return null;
        }
    },

    // Récupérer les informations à jour depuis le serveur
    async getCurrentUser(): Promise<UserInfo> {
        try {
            // D'abord, essayer de récupérer depuis le localStorage
            const storedUser = this.getStoredUserInfo();
            
            // Si pas de token, on ne peut pas faire la requête
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            try {
                // Faire la requête API pour avoir les infos à jour
                const response = await axios.get(`${API_URL}/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const userData = response.data;
                
                // Mettre à jour le localStorage avec les nouvelles données
                localStorage.setItem('user', JSON.stringify({
                    firstname: userData.firstName,
                    lastname: userData.lastName,
                    email: userData.email
                }));

                return userData;
            } catch (error) {
                // En cas d'erreur API, utiliser les données du localStorage si disponibles
                if (storedUser) {
                    console.warn('Using stored user info due to API error');
                    return storedUser;
                }
                throw error;
            }
        } catch (error: any) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    },

    // Mettre à jour les informations utilisateur
    async updateUserInfo(updates: Partial<UserInfo>): Promise<UserInfo> {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await axios.put(`${API_URL}/users/me`, updates, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const updatedUser = response.data;
            
            // Mettre à jour le localStorage
            const currentStoredUser = this.getStoredUserInfo();
            if (currentStoredUser) {
                localStorage.setItem('user', JSON.stringify({
                    ...currentStoredUser,
                    ...updates
                }));
            }

            return updatedUser;
        } catch (error) {
            console.error('Error updating user info:', error);
            throw error;
        }
    }
};
