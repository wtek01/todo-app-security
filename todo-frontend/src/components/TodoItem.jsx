import { useState } from "react";

const TodoItem = ({ todo, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [editedTodo, setEditedTodo] = useState({ ...todo });
  
    const handleUpdate = () => {
      onUpdate(todo.id, editedTodo);
      setIsEditing(false);
    };

    const hasDescription = todo.description && todo.description.trim().length > 0;
  
    return (
      <div className={`todo-item ${isExpanded ? 'expanded' : ''}`}>
        {isEditing ? (
          <div className="edit-form">
            <div className="edit-inputs">
              <input
                type="text"
                value={editedTodo.title}
                onChange={(e) => setEditedTodo({ ...editedTodo, title: e.target.value })}
                className="edit-input"
                placeholder="Titre"
              />
              <textarea
                value={editedTodo.description}
                onChange={(e) => setEditedTodo({ ...editedTodo, description: e.target.value })}
                className="edit-input description"
                placeholder="Description (optionnelle)"
              />
            </div>
            <div className="edit-actions">
              <button onClick={handleUpdate} className="icon-button">
                <i className="fas fa-check"></i>
              </button>
              <button onClick={() => setIsEditing(false)} className="icon-button cancel">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="todo-main" onClick={() => hasDescription && setIsExpanded(!isExpanded)}>
              <div className="todo-content">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => onUpdate(todo.id, { ...todo, completed: !todo.completed })}
                  className="todo-checkbox"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="todo-text">
                  <span className={`todo-title ${todo.completed ? 'completed' : ''}`}>
                    {todo.title}
                  </span>
                  {hasDescription && (
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} description-indicator`}></i>
                  )}
                </div>
              </div>
              <div className="todo-actions" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="icon-button edit"
                  title="Modifier"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  onClick={() => onDelete(todo.id)} 
                  className="icon-button delete"
                  title="Supprimer"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            {hasDescription && (
              <div className="todo-description">
                {todo.description}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  export default TodoItem;