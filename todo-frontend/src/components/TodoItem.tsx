import React, { useState } from 'react';
import { Todo, ValidationError } from '../services/todoService';

interface TodoItemProps {
    todo: Todo;
    onUpdate: (id: number, updatedTodo: Partial<Todo>) => Promise<void>;
    onDelete: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
    const [editedTodo, setEditedTodo] = useState<Todo>({ ...todo });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (todo.id === undefined) return;

        setErrors({});
        try {
            await onUpdate(todo.id, {
                title: editedTodo.title.trim(),
                description: editedTodo.description?.trim(),
                dueDate: editedTodo.dueDate
            });
            setIsEditing(false);
        } catch (err: any) {
            if (err.validationErrors) {
                const newErrors: Record<string, string> = {};
                err.validationErrors.forEach((error: ValidationError) => {
                    newErrors[error.field] = error.message;
                });
                setErrors(newErrors);
            }
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleComplete = async (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (todo.id === undefined || isUpdating) return;
        
        setIsUpdating(true);
        try {
            await onUpdate(todo.id, {
                completed: !todo.completed
            });
        } catch (err) {
            console.error('Erreur lors de la mise à jour du statut:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.preventDefault();
        setEditedTodo({ ...todo });
        setIsEditing(false);
        setErrors({});
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (todo.id !== undefined) {
            onDelete(todo.id);
        }
    };

    if (isEditing) {
        return (
            <div className="todo-item">
                <form className="todo-edit-form" onSubmit={handleUpdate}>
                    <input
                        type="text"
                        value={editedTodo.title}
                        onChange={(e) => setEditedTodo({ ...editedTodo, title: e.target.value })}
                        className={errors.title ? 'error' : ''}
                        placeholder="Titre de la tâche"
                    />
                    {errors.title && <div className="form-error">{errors.title}</div>}
                    
                    <textarea
                        value={editedTodo.description || ''}
                        onChange={(e) => setEditedTodo({ ...editedTodo, description: e.target.value })}
                        rows={3}
                        className={errors.description ? 'error' : ''}
                        placeholder="Description (optionnelle)"
                    />
                    {errors.description && <div className="form-error">{errors.description}</div>}
                    
                    <input
                        type="date"
                        value={editedTodo.dueDate || ''}
                        onChange={(e) => setEditedTodo({ ...editedTodo, dueDate: e.target.value })}
                        className={errors.dueDate ? 'error' : ''}
                    />
                    {errors.dueDate && <div className="form-error">{errors.dueDate}</div>}
                    
                    <div className="todo-actions">
                        <button type="submit" className="todo-button" disabled={isUpdating}>
                            Sauvegarder
                        </button>
                        <button 
                            type="button" 
                            className="todo-button" 
                            onClick={handleCancel}
                            disabled={isUpdating}
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <div
                className={`todo-checkbox ${todo.completed ? 'completed' : ''}`}
                onClick={handleToggleComplete}
                role="checkbox"
                aria-checked={todo.completed}
                tabIndex={0}
                onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        handleToggleComplete(e);
                    }
                }}
            />
            
            <div className="todo-content">
                <div className={`todo-title ${todo.completed ? 'completed' : ''}`}>
                    {todo.title}
                </div>
                
                {todo.description && (
                    <>
                        <button
                            className="todo-button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsDescriptionVisible(!isDescriptionVisible);
                            }}
                        >
                            {isDescriptionVisible ? 'Masquer' : 'Voir plus'}
                        </button>
                        
                        {isDescriptionVisible && (
                            <div className="todo-description">
                                {todo.description}
                            </div>
                        )}
                    </>
                )}
                
                {todo.dueDate && (
                    <div className="todo-date">
                        Échéance : {new Date(todo.dueDate).toLocaleDateString()}
                    </div>
                )}
            </div>
            
            <div className="todo-actions">
                <button 
                    className="todo-button" 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditing(true);
                    }} 
                    title="Modifier"
                    disabled={isUpdating}
                >
                    ✏️
                </button>
                <button 
                    className="todo-button delete" 
                    onClick={handleDelete}
                    title="Supprimer"
                    disabled={isUpdating}
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};

export default TodoItem;