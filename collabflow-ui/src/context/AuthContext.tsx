import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

interface User {
    id: string;
    email: string;
    username: string;
    avatar?: string;
}

interface AuthContextType {
    currentUser: User | null;
    currentUserId: string | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    clearUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Helper functions for localStorage
const USER_STORAGE_KEY = 'current_user';

const saveUserToStorage = (user: User | null) => {
    if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(USER_STORAGE_KEY);
    }
};

const getUserFromStorage = (): User | null => {
    try {
        const stored = localStorage.getItem(USER_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Failed to parse user from storage:', error);
        return null;
    }
};

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        // Initialize from localStorage on mount
        return getUserFromStorage();
    });
    const [isLoading, setIsLoading] = useState(false);

    const setUser = (user: User | null) => {
        setCurrentUser(user);
        saveUserToStorage(user);
    };

    const clearUser = () => {
        setCurrentUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem('access_token');
    };

    const value = useMemo(() => ({
        currentUser,
        currentUserId: currentUser?.id || null,
        isLoading,
        setUser,
        clearUser,
    }), [currentUser, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};