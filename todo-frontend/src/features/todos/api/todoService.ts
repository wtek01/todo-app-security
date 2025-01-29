import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  description?: string;
}

export const todoService = {
  async getTodos(): Promise<Todo[]> {
    const response = await axios.get(`${API_URL}/todos`);
    return response.data;
  },

  async addTodo(title: string, description?: string): Promise<Todo> {
    const response = await axios.post(`${API_URL}/todos`, { title, description, completed: false });
    return response.data;
  },

  async updateTodo(todo: Todo): Promise<Todo> {
    const response = await axios.put(`${API_URL}/todos/${todo.id}`, todo);
    return response.data;
  },

  async deleteTodo(id: number): Promise<void> {
    await axios.delete(`${API_URL}/todos/${id}`);
  }
};