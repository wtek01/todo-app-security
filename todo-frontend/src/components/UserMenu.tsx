import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/userMenu.css';

interface UserMenuProps {
    userInfo: {
        firstName?: string;
        lastName?: string;
        email: string;
    };
    onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ userInfo, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDisplayName = () => {
        console.log("🚀 ~ file: UserMenu.tsx:32 ~ userInfo:", userInfo)
        if (userInfo.firstName && userInfo.lastName) {
            return `${userInfo.firstName} ${userInfo.lastName}`;
        }
        return userInfo.email.split('@')[0];
    };

    const handleProfileClick = () => {
        setIsOpen(false);
        navigate('/profile');
    };

    const handleLogoutClick = () => {
        setIsOpen(false);
        onLogout();
    };

    return (
        <div className="user-menu" ref={menuRef}>
            <div 
                className="user-menu-trigger" 
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="user-avatar">
                    {getDisplayName().charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{getDisplayName()}</span>
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="menu-header">
                        <span className="user-email">{userInfo.email}</span>
                    </div>
                    <div className="menu-items">
                        <button onClick={handleProfileClick} className="menu-item">
                            <span className="icon">👤</span>
                            Mon Profil
                        </button>
                        <button onClick={handleLogoutClick} className="menu-item">
                            <span className="icon">🚪</span>
                            Déconnexion
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
