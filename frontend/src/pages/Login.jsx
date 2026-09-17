import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
//import { useAuth } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth';
import logoDark from '../assets/DevVault-Logo2.png';
import logoLight from '../assets/DevVault-Logo-LightMode.png';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        setLoading(true);
        setError('');

        try {
            await login(email, password);
            navigate('/');
        }catch (err){
            setError(err.message);
        }finally{
            setLoading(false);  
        }
    }

    return (
            <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                
                <div className="flex justify-center mb-5">
                    <img
                        src={logoLight}
                        alt="DevVault"
                        className="w-30 h-auto object-contain dark:hidden"
                    />
                    <img
                        src={logoDark}
                        alt="DevVault"
                        className="hidden w-30 h-auto object-contain dark:block"
                    />
                </div>
                <h1 className="text-2xl font-extrabold text-vault-text">Welcome back</h1>
                <p className="text-sm text-vault-muted mt-1">Log in to continue to DevVault</p>
                </div>
        
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-vault-muted mb-1.5">Email</label>
                    <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg bg-vault-elevated border border-vault-border px-3.5 py-2.5 text-sm text-vault-text outline-none focus:border-vault-accent transition-colors"
                    placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-vault-muted mb-1.5">Password</label>
                    <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg bg-vault-elevated border border-vault-border px-3.5 py-2.5 text-sm text-vault-text outline-none focus:border-vault-accent transition-colors"
                    placeholder="••••••••"
                    />
                </div>
        
                {error && <p className="text-sm text-vault-danger">{error}</p>}
        
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-vault-accent hover:bg-vault-accent-hover text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-60"
                >
                    {loading ? 'Logging in…' : 'Log in'}
                </button>
                </form>
        
                <p className="text-center text-sm text-vault-muted mt-6">
                Don't have an account?{' '}
                <Link to="/signup" className="text-vault-accent font-medium hover:underline">
                    Sign up
                </Link>
                </p>
        
                <p className="text-center text-xs text-vault-faint mt-4">
                Demo login: demo@devvault.dev / password123
                </p>
            </div>
            </div>
    );
}