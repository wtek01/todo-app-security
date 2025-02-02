import axios from './axiosConfig';

const API_URL = 'http://localhost:8080/api';

interface LoginResponse {
    token: string;
    firstname: string;
    lastname: string;
    email: string;
}

interface RegisterData {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await axios.post(`${API_URL}/auth/authenticate`, {
                email,
                password
            });
            const data = response.data;
            // Stocker le token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                firstname: data.firstname,
                lastname: data.lastname,
                email: data.email
            }));
            return data;
        } catch (error) {
            throw new Error('Échec de la connexion');
        }
    },

    async register(data: RegisterData): Promise<LoginResponse> {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, data);
            const responseData = response.data;
            // Stocker le token après inscription
            localStorage.setItem('token', responseData.token);
            localStorage.setItem('user', JSON.stringify({
                firstname: responseData.firstname,
                lastname: responseData.lastname,
                email: responseData.email
            }));
            return responseData;
        } catch (error) {
            throw new Error('Échec de l\'inscription');
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }
};