import React, { useState } from 'react';
import { Todo } from '../services/todoService';
import '../styles/todo.css';

interface AddTodoProps {
    onAdd: (todo: Omit<Todo, 'id'>) => Promise<void>;
}

const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({}); // Réinitialiser les erreurs

        try {
            await onAdd({
                title: title.trim(),
                description: description.trim() || undefined,
                completed: false,
                dueDate: dueDate || undefined
            });
            // Réinitialiser le formulaire après succès
            setTitle('');
            setDescription('');
            setDueDate('');
        } catch (err: any) {
            if (err.validationErrors) {
                const newErrors: Record<string, string> = {};
                err.validationErrors.forEach((error: {field: string, message: string}) => {
                    newErrors[error.field] = error.message;
                });
                setErrors(newErrors);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-todo-form">
            <div className="form-group">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre de la tâche"
                    className={`form-input ${errors.title ? 'error' : ''}`}
                />
                {errors.title && <div className="error-message">{errors.title}</div>}
            </div>

            <div className="form-group">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optionnelle)"
                    className={`form-input ${errors.description ? 'error' : ''}`}
                />
                {errors.description && <div className="error-message">{errors.description}</div>}
            </div>

            <div className="form-group">
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={`form-input ${errors.dueDate ? 'error' : ''}`}
                />
                {errors.dueDate && <div className="error-message">{errors.dueDate}</div>}
            </div>

            <button type="submit" className="submit-button">
                Ajouter la tâche
            </button>
        </form>
    );
};

export default AddTodo;