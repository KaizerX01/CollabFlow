import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

export interface User {
    id: string;
    email: string;
    username: string;
    avatar?: string;
    displayName?: string;
    avatarUrl?: string;
    bio?: string;
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
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        // Validate the shape has the required fields
        if (
            typeof parsed === 'object' &&
            parsed !== null &&
            typeof parsed.id === 'string' &&
            typeof parsed.email === 'string' &&
            typeof parsed.username === 'string'
        ) {
            return parsed as User;
        }
        // Invalid shape — clear corrupted data
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
    } catch (error) {
        console.error('Failed to parse user from storage:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
    }
};

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        // Initialize from localStorage on mount
        return getUserFromStorage();
    });

    const setUser = useCallback((user: User | null) => {
        setCurrentUser(user);
        saveUserToStorage(user);
    }, []);

    const clearUser = useCallback(() => {
        setCurrentUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
    }, []);

    const value = useMemo(() => ({
        currentUser,
        currentUserId: currentUser?.id || null,
        isLoading: false,
        setUser,
        clearUser,
    }), [currentUser, setUser, clearUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};