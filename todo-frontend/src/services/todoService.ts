import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Ajouter l'intercepteur pour le token d'authentification
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

export interface Todo {
    id?: number;
    title: string;
    description?: string;
    completed: boolean;
    dueDate?: string;
}

export interface ValidationError {
    field: string;
    message: string;
}

const extractValidationErrors = (error: any): ValidationError[] => {
    if (error.response?.status === 400 && error.response.data) {
        const validationErrors: ValidationError[] = [];
        const errors = error.response.data;
        
        Object.entries(errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
                messages.forEach(message => {
                    validationErrors.push({
                        field,
                        message: message as string
                    });
                });
            }
        });
        
        return validationErrors;
    }

    return [{
        field: 'global',
        message: error.response?.data?.message || 'Une erreur est survenue'
    }];
};

export const todoService = {
    async getTodos(): Promise<Todo[]> {
        try {
            const response = await axios.get(`${API_URL}/todos`);
            return response.data;
        } catch (error) {
            const errors = extractValidationErrors(error);
            throw { validationErrors: errors };
        }
    },

    async addTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
        try {
            const response = await axios.post(`${API_URL}/todos`, todo);
            return response.data;
        } catch (error) {
            const errors = extractValidationErrors(error);
            throw { validationErrors: errors };
        }
    },

    async updateTodo(id: number, updates: Partial<Todo>): Promise<Todo> {
        try {
            // Si on met à jour le statut completed, on doit envoyer toutes les propriétés existantes
            if ('completed' in updates) {
                const todos = await this.getTodos();
                const currentTodo = todos.find(t => t.id === id);
                if (currentTodo) {
                    updates = {
                        ...currentTodo,
                        ...updates
                    };
                }
            }
            
            const response = await axios.put(`${API_URL}/todos/${id}`, updates);
            return response.data;
        } catch (error) {
            const errors = extractValidationErrors(error);
            throw { validationErrors: errors };
        }
    },

    async deleteTodo(id: number): Promise<void> {
        try {
            await axios.delete(`${API_URL}/todos/${id}`);
        } catch (error) {
            const errors = extractValidationErrors(error);
            throw { validationErrors: errors };
        }
    }
};