import { useEffect, useState, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { api } from '../lib/api';
import { clearOfflineUserData } from '../lib/offlineStore';

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
                localStorage.setItem('devvault_user', JSON.stringify(user));

                if (!cancelled) {
                    setUser(user);
                }
            } catch(err) {
                if(err.status === 401){
                    // The server says the token is bad: log out for real.
                    localStorage.removeItem('devvault_token');
                    localStorage.removeItem('devvault_user');
                    if (!cancelled) setUser(null);
                }else{
                    // Offline or server down: stay logged in with the last known user.
                    const cached = localStorage.getItem('devvault_user');
                    if (cached && !cancelled) {
                        try {
                            setUser(JSON.parse(cached));
                        } catch {
                            // ignore a corrupted cache
                        }
                    }
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
        localStorage.setItem('devvault_user', JSON.stringify(user));
        setUser(user);

        return user;
    }, []);
    const signup = useCallback(
        (name, email, password) => api.signup({ name, email, password }),
        []
    );
    
    const logout = useCallback(() => {
        localStorage.removeItem('devvault_token');
        localStorage.removeItem('devvault_user');
        globalThis.caches?.delete('devvault-api');
        clearOfflineUserData().catch(() => {});
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

