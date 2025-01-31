// src/components/ProtectedRoute.tsx
import { Navigate, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps ) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            navigate('/');
        }
    }, [navigate]);

    return authService.isAuthenticated() ? children : null;
};

export default ProtectedRoute;