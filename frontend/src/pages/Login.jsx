import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logoDark from '../assets/DevVault-Logo2.png';
import logoLight from '../assets/DevVault-Logo-LightMode.png';
import LoadingScreen from '../components/LoadingScreen';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showLoadingScreen, setShowLoadingScreen] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        setLoading(true);
        setError('');

        try {
            await login(email, password);
            setShowLoadingScreen(true);
        }catch (err){
            if (err.code === 'EMAIL_NOT_VERIFIED') {
                navigate('/verify-email', { state: { email } });
                return;
            }
            setError(err.message);
        }finally{
            setLoading(false);  
        }
    }

    if (showLoadingScreen) {
        return <LoadingScreen label="Logging you in…" onComplete={() => navigate('/')} />;
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
                {state?.verified && !error && (
                    <p className="text-sm text-vault-accent">Email verified. You can log in now.</p>
                )}
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
                
            </div>
            </div>
    );
}