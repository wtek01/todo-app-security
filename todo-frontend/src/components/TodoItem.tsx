import React, { useState } from 'react';
import { Todo } from '../services/todoService';

interface TodoItemProps {
    todo: Todo;
    onUpdate: (id: number, updatedTodo: Todo) => void;
    onDelete: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
    const [editedTodo, setEditedTodo] = useState<Todo>({ ...todo });

    const handleUpdate = () => {
        if (todo.id === undefined) {
            console.error('Cannot update todo without an id');
            return;
        }
        if (!editedTodo.title.trim()) {
            return;
        }
        onUpdate(todo.id, {
            ...editedTodo,
            title: editedTodo.title.trim(),
            description: editedTodo.description?.trim()
        });
        setIsEditing(false);
    };

    const toggleComplete = () => {
        if (todo.id === undefined) return;
        onUpdate(todo.id, { ...todo, completed: !todo.completed });
    };

    const handleCancel = () => {
        setEditedTodo({ ...todo });
        setIsEditing(false);
    };

    const hasDescription = todo.description && todo.description.trim().length > 0;

    if (isEditing) {
        return (
            <div className="todo-item">
                <div className="todo-edit-form">
                    <input
                        type="text"
                        value={editedTodo.title}
                        onChange={(e) => setEditedTodo({ ...editedTodo, title: e.target.value })}
                        placeholder="Titre de la tâche"
                        autoFocus
                    />
                    <textarea
                        value={editedTodo.description || ''}
                        onChange={(e) => setEditedTodo({ ...editedTodo, description: e.target.value })}
                        placeholder="Description (optionnelle)"
                        rows={3}
                    />
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