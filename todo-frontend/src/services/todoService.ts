// src/services/todoService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export interface Todo {
    id?: number;
    title: string;
    description?: string;
    completed: boolean;
    dueDate?: string;
}

export const todoService = {
    async getTodos(): Promise<Todo[]> {
        try {
            const response = await axios.get(`${API_URL}/todos`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des todos:', error);
            throw new Error('Impossible de récupérer les todos');
        }
    },

    async addTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
        try {
            const response = await axios.post(`${API_URL}/todos`, todo);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'ajout du todo:', error);
            throw new Error('Impossible d\'ajouter le todo');
        }
    },

    async updateTodo(id: number, todo: Partial<Todo>): Promise<Todo> {
        try {
            const response = await axios.put(`${API_URL}/todos/${id}`, todo);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du todo:', error);
            throw new Error('Impossible de mettre à jour le todo');
        }
    },

    async deleteTodo(id: number): Promise<void> {
        try {
            await axios.delete(`${API_URL}/todos/${id}`);
        } catch (error) {
            console.error('Erreur lors de la suppression du todo:', error);
            throw new Error('Impossible de supprimer le todo');
        }
    }
};