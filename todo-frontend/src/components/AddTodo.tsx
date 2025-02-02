import React, { useState } from 'react';
import { Todo, ValidationError } from '../services/todoService';

interface AddTodoProps {
    onAdd: (todo: Omit<Todo, 'id'>) => Promise<void>;
}

const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            await onAdd({
                title: title.trim(),
                description: description.trim() || undefined,
                dueDate: dueDate || undefined,
                completed: false
            });

            // Réinitialiser le formulaire après l'ajout réussi
            setTitle('');
            setDescription('');
            setDueDate('');
        } catch (err: any) {
            if (err.validationErrors) {
                const newErrors: Record<string, string> = {};
                err.validationErrors.forEach((error: ValidationError) => {
                    newErrors[error.field] = error.message;
                });
                setErrors(newErrors);
            }
        } finally {
            setIsSubmitting(false);
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
                    className={errors.title ? 'error' : ''}
                    disabled={isSubmitting}
                />
                {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            <div className="form-group">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optionnelle)"
                    rows={3}
                    className={errors.description ? 'error' : ''}
                    disabled={isSubmitting}
                />
                {errors.description && <div className="form-error">{errors.description}</div>}
            </div>

            <div className="form-group">
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={errors.dueDate ? 'error' : ''}
                    disabled={isSubmitting}
                />
                {errors.dueDate && <div className="form-error">{errors.dueDate}</div>}
            </div>

            {errors.submit && (
                <div className="error-message">{errors.submit}</div>
            )}

            <button 
                type="submit" 
                className="add-todo-button"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Ajout en cours...' : 'Ajouter la tâche'}
            </button>
        </form>
    );
};

export default AddTodo;