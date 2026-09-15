
import { useEffect, useState, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { api } from '../lib/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(
        () => !!localStorage.getItem('devvault_token')
    );

    useEffect(() => {
        const token = localStorage.getItem('devvault_token');

        if (!token) return;

        let cancelled = false;

        async function checkAuth() {
            try {
                const { user } = await api.me();

                if (!cancelled) {
                    setUser(user);
                }
            } catch {
                localStorage.removeItem('devvault_token');

                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        checkAuth();

        return () => {
            cancelled = true;
        };
    }, []);

    const login = useCallback(async (email, password) => {
        const { token, user } = await api.login({
            email,
            password,
        });

        localStorage.setItem('devvault_token', token);
        setUser(user);

        return user;
    }, []);

    const signup = useCallback(async (name, email, password) => {
        const { token, user } = await api.signup({
            name,
            email,
            password,
        });

        localStorage.setItem('devvault_token', token);
        setUser(user);

        return user;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('devvault_token');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

