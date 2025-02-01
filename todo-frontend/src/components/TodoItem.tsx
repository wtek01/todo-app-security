import React, { useState } from 'react';
import { Todo } from '../services/todoService';

interface TodoItemProps {
    todo: Todo;
    onUpdate: (id: number, updatedTodo: Partial<Todo>) => Promise<void>;
    onDelete: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
    const [editedTodo, setEditedTodo] = useState<Todo>({ ...todo });
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const handleUpdate = async () => {
        if (todo.id === undefined) {
            console.error('Cannot update todo without an id');
            return;
        }
        
        setErrors({}); // Réinitialiser les erreurs
        try {
            await onUpdate(todo.id, {
                ...editedTodo,
                title: editedTodo.title.trim(),
                description: editedTodo.description?.trim()
            });
            setIsEditing(false);
        } catch (err: any) {
            if (err.validationErrors) {
                const newErrors = {};
                err.validationErrors.forEach((error: {field: string, message: string}) => {
                    newErrors[error.field] = error.message;
                });
                setErrors(newErrors);
            }
        }
    };

    const toggleComplete = async () => {
        if (todo.id === undefined) return;
        try {
            await onUpdate(todo.id, { ...todo, completed: !todo.completed });
        } catch (err) {
            console.error('Erreur lors de la mise à jour du statut:', err);
        }
    };

    const handleCancel = () => {
        setEditedTodo({ ...todo });
        setErrors({});
        setIsEditing(false);
    };

    const hasDescription = todo.description && todo.description.trim().length > 0;

    if (isEditing) {
        return (
            <div className="todo-item">
                <div className="todo-edit-form">
                    <div className="form-group">
                        <input
                            type="text"
                            value={editedTodo.title}
                            onChange={(e) => setEditedTodo({ ...editedTodo, title: e.target.value })}
                            placeholder="Titre de la tâche"
                            className={`form-input ${errors.title ? 'error' : ''}`}
                            autoFocus
                        />
                        {errors.title && <div className="error-message">{errors.title}</div>}
                    </div>

                    <div className="form-group">
                        <textarea
                            value={editedTodo.description || ''}
                            onChange={(e) => setEditedTodo({ ...editedTodo, description: e.target.value })}
                            placeholder="Description (optionnelle)"
                            className={`form-input ${errors.description ? 'error' : ''}`}
                            rows={3}
                        />
                        {errors.description && <div className="error-message">{errors.description}</div>}
                    </div>

                    {editedTodo.dueDate && (
                        <div className="form-group">
                            <input
                                type="date"
                                value={editedTodo.dueDate}
                                onChange={(e) => setEditedTodo({ ...editedTodo, dueDate: e.target.value })}
                                className={`form-input ${errors.dueDate ? 'error' : ''}`}
                            />
                            {errors.dueDate && <div className="error-message">{errors.dueDate}</div>}
                        </div>
                    )}

                    <div className="todo-actions">
                        <button onClick={handleUpdate} className="icon-button edit" title="Sauvegarder">
                            <i className="fas fa-save"></i>
                        </button>
                        <button onClick={handleCancel} className="icon-button" title="Annuler">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <div className="todo-content">
                <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={toggleComplete}
                    className="todo-checkbox"
                />
                <div className="todo-text">
                    <div className="todo-title">{todo.title}</div>
                    {hasDescription && (
                        <>
                            <button 
                                onClick={() => setIsDescriptionVisible(!isDescriptionVisible)}
                                className="description-toggle"
                                title={isDescriptionVisible ? "Masquer la description" : "Afficher la description"}
                            >
                                <i className={`fas fa-chevron-${isDescriptionVisible ? 'up' : 'down'}`}></i>
                            </button>
                            {isDescriptionVisible && (
                                <div className="todo-description">
                                    {todo.description}
                                </div>
                            )}
                        </>
                    )}
                    {todo.dueDate && (
                        <div className="todo-due-date">
                            Échéance : {new Date(todo.dueDate).toLocaleDateString()}
                        </div>
                    )}
                </div>
            </div>
            <div className="todo-actions">
                <button onClick={() => setIsEditing(true)} className="icon-button edit" title="Modifier">
                    <i className="fas fa-edit"></i>
                </button>
                <button 
                    onClick={() => {
                        if (todo.id !== undefined) {
                            onDelete(todo.id);
                        }
                    }}
                    className="icon-button delete"
                    title="Supprimer"
                >
                    <i className="fas fa-trash"></i>
                </button>
            </div>
        </div>
    );
};

export default TodoItem;