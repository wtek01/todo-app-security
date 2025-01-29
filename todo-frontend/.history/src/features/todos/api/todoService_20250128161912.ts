import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface Todo {
  id: number
  title: string
  description: string
  completed: boolean
  dueDate: string
}

export const todoService = {
  async getAllTodos() {
    const response = await axios.get<Todo[]>(`${API_BASE_URL}/todos`)
    return response.data
  },

  async createTodo(todo: Omit<Todo, 'id'>) {
    const response = await axios.post<Todo>(`${API_BASE_URL}/todos`, todo)
    return response.data
  },

  async updateTodo(id: number, todo: Partial<Todo>) {
    const response = await axios.put<Todo>(`${API_BASE_URL}/todos/${id}`, todo)
    return response.data
  },

  async deleteTodo(id: number) {
    await axios.delete(`${API_BASE_URL}/todos/${id}`)
  }
}