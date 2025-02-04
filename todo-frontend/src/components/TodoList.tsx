import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { todoService, Todo } from '../services/todoService';
import { authService } from '../services/authService';
import { userService, UserInfo } from '../services/userService';
import AddTodo from './AddTodo';
import TodoItem from './TodoItem';
import UserMenu from './UserMenu'; // Import UserMenu component
import { AxiosError } from 'axios';
import '../styles/todo.css';

const TodoList = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [error, setError] = useState<string>('');
    const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [fetchedTodos, updatedUserInfo] = await Promise.all([
                todoService.getTodos(),
                userService.getCurrentUser()
            ]);
            
            setTodos(fetchedTodos);
            setUserInfo(updatedUserInfo);
            setError('');
        } catch (err: unknown) {
            if (err instanceof AxiosError && err.response?.status === 401) {
                handleUnauthorized();
            } else {
                setError('Erreur lors du chargement des données');
                console.error('Error loading data:', err);
            }
        }
    };

    const handleUnauthorized = () => {
        authService.logout();
        navigate('/');
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const handleAddTodo = async (newTodo: Omit<Todo, 'id'>) => {
        try {
            const addedTodo = await todoService.addTodo(newTodo);
            setTodos(prevTodos => [...prevTodos, addedTodo]);
            setError('');
        } catch (err: any) {
            if (err.validationErrors) {
                throw err;
            } else if (err instanceof AxiosError && err.response?.status === 401) {
                handleUnauthorized();
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
                    todo.id === id ? updated : todo
                )
            );
            setError('');
        } catch (err: any) {
            if (err.validationErrors) {
                throw err;
            } else if (err instanceof AxiosError && err.response?.status === 401) {
                handleUnauthorized();
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
                handleUnauthorized();
            } else {
                setError('Erreur lors de la suppression du todo');
            }
        }
    };

    const getUserDisplayName = () => {
        if (!userInfo) return '';
        if (userInfo.firstname && userInfo.lastname) {
            return `${userInfo.firstname} ${userInfo.lastname}`;
        }
        return userInfo.email.split('@')[0];
    };

    // Séparer les todos en deux catégories
    const incompleteTodos = todos
        .filter(todo => !todo.completed && todo.id !== undefined)
        .sort((a, b) => {
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            return 0;
        });

    const completedTodos = todos
        .filter(todo => todo.completed && todo.id !== undefined)
        .sort((a, b) => {
            if (a.dueDate && b.dueDate) {
                return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
            }
            if (a.dueDate) return 1;
            if (b.dueDate) return -1;
            return 0;
        });

    return (
        <div className="app-container">
            <nav className="navbar">
                <h1>Ma Liste de Tâches</h1>
                {userInfo && <UserMenu userInfo={userInfo} onLogout={handleLogout} />}
            </nav>

            <div className="todo-container">
                <div className="todo-list-container">
                    <h2>Tâches à faire ({incompleteTodos.length})</h2>
                    {error && <div className="error-message">{error}</div>}
                    <div className="todo-list">
                        {incompleteTodos.length === 0 ? (
                            <div className="no-todos">
                                Aucune tâche en cours. Bravo !
                            </div>
                        ) : (
                            incompleteTodos.map(todo => (
                                <TodoItem
                                    key={todo.id}
                                    todo={todo}
                                    onUpdate={handleUpdateTodo}
                                    onDelete={handleDeleteTodo}
                                />
                            ))
                        )}
                    </div>

                    {completedTodos.length > 0 && (
                        <>
                            <h2 className="completed-section">Tâches terminées ({completedTodos.length})</h2>
                            <div className="todo-list completed-list">
                                {completedTodos.map(todo => (
                                    <TodoItem
                                        key={todo.id}
                                        todo={todo}
                                        onUpdate={handleUpdateTodo}
                                        onDelete={handleDeleteTodo}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
                
                <div className="add-todo-container">
                    <h2>Ajouter une tâche</h2>
                    <AddTodo onAdd={handleAddTodo} />
                </div>
            </div>
        </div>
    );
};

export default TodoList;