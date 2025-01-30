import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import TodoList from './components/TodoList';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                    path="/todos" 
                    element={
                        <ProtectedRoute>
                            <TodoList />
                        </ProtectedRoute>
                    } 
                />
                <Route path="/" element={<Navigate to="/todos" />} />
            </Routes>
        </Router>
    );
}

export default App;