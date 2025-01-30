import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { todoService, Todo } from '../services/todoService';
import { authService } from '../services/authService';
import AddTodo from './AddTodo';
import TodoItem from './TodoItem';
import { AxiosError } from 'axios';
import '../styles/todo.css';

const TodoList = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        loadTodos();
    }, []);

    const loadTodos = async () => {
        try {
            const fetchedTodos = await todoService.getTodos();
            setTodos(fetchedTodos);
            setError('');
        } catch (err: unknown) {
            if (err instanceof AxiosError && err.response?.status === 401) {
                authService.logout();
                navigate('/login');
            } else {
                setError('Erreur lors du chargement des todos');
            }
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleAddTodo = async (newTodo: Omit<Todo, 'id'>) => {
        try {
            const addedTodo = await todoService.addTodo(newTodo);
            setTodos(prevTodos => [...prevTodos, addedTodo]);
            setError('');
        } catch (err: unknown) {
            if (err instanceof AxiosError && err.response?.status === 401) {
                authService.logout();
                navigate('/login');
            } else {
                setError('Erreur lors de l\'ajout du todo');
            }
        }
    };

    const handleUpdateTodo = async (id: number, updatedTodo: Partial<Todo>) => {
        try {
            const updated = await todoService.updateTodo(id, updatedTodo);
            setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo.id === id ? { ...todo, ...updatedTodo } : todo
                )
            );
            setError('');
        } catch (err: unknown) {
            if (err instanceof AxiosError && err.response?.status === 401) {
                authService.logout();
                navigate('/login');
            } else {
                setError('Erreur lors de la mise à jour du todo');
            }
        }
    };

    const handleDeleteTodo = async (id: number) => {
        try {
            await todoService.deleteTodo(id);
            setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
            setError('');
        } catch (err: unknown) {
            if (err instanceof AxiosError && err.response?.status === 401) {
                authService.logout();
                navigate('/login');
            } else {
                setError('Erreur lors de la suppression du todo');
            }
        }
    };

    return (
        <div className="todo-container">
            <div className="todo-header">
                <h1>Ma Liste de Tâches</h1>
                <button onClick={handleLogout} className="logout-button">
                    Déconnexion
                </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <AddTodo onAdd={handleAddTodo} />
            
            <div className="todo-list">
                {todos.length === 0 ? (
                    <div className="no-todos">
                        Aucune tâche pour le moment. Ajoutez-en une !
                    </div>
                ) : (
                    todos
                        .filter((todo): todo is Todo & { id: number } => todo.id !== undefined)
                        .map(todo => (
                            <TodoItem
                                key={todo.id}
                                todo={todo}
                                onUpdate={handleUpdateTodo}
                                onDelete={handleDeleteTodo}
                            />
                        ))
                )}
            </div>
        </div>
    );
};

export default TodoList;