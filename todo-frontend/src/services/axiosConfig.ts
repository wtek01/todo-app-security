import axios from 'axios';

/* Add a request interceptor to include the auth token in requests
S'exécute avant chaque requête HTTP
Récupère le token JWT du localStorage
Ajoute automatiquement le token dans le header Authorization
Évite d'avoir à ajouter manuellement le token dans chaque requête
*/
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // You might want to redirect to login page here
        }
        return Promise.reject(error);
    }
);

export default axios;
