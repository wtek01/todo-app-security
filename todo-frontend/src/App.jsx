import React, { useState, useEffect } from 'react';
import TodoList from './components/TodoList';
import AddTodo from './components/AddTodo';
import { todoService } from './features/todos/api/todoService';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const data = await todoService.getTodos();
      setTodos(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setError("Impossible de charger les todos. Veuillez réessayer plus tard.");
    }
  };

  const handleAddTodo = async (newTodo) => {
    try {
      const addedTodo = await todoService.addTodo(newTodo.title, newTodo.description);
      setTodos([...todos, addedTodo]);
      setError(null);
    } catch (error) {
      console.error("Error adding todo:", error);
      setError("Impossible d'ajouter le todo. Veuillez réessayer.");
    }
  };

  const handleUpdateTodo = async (id, updatedTodo) => {
    try {
      const updated = await todoService.updateTodo({ ...updatedTodo, id });
      setTodos(todos.map(todo => todo.id === id ? updated : todo));
      setError(null);
    } catch (error) {
      console.error("Error updating todo:", error);
      setError("Impossible de mettre à jour le todo. Veuillez réessayer.");
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await todoService.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
      setError(null);
    } catch (error) {
      console.error("Error deleting todo:", error);
      setError("Impossible de supprimer le todo. Veuillez réessayer.");
    }
  };

  return (
    <div className="app">
      <h1>Ma Liste de Tâches</h1>
      {error && <div className="error-message">{error}</div>}
      <AddTodo onAdd={handleAddTodo} />
      <TodoList
        todos={todos}
        onUpdate={handleUpdateTodo}
        onDelete={handleDeleteTodo}
      />
    </div>
  );
}

export default App;