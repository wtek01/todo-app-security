import React, { useState } from 'react';
import { Todo } from '../services/todoService';

interface AddTodoProps {
  onAdd: (todo: Omit<Todo, 'id'>) => void;
}

const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      description: description.trim(),
      completed: false
    });

    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="add-todo-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre de la tâche"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optionnelle)"
        rows={3}
      />
      <button type="submit">Ajouter la tâche</button>
    </form>
  );
};

export default AddTodo;
