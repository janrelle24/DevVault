import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoDark from '../assets/DevVault-Logo2.png';
import logoLight from '../assets/DevVault-Logo-LightMode.png';
import ButtonSpinner from '../components/ButtonSpinner';
import { api } from '../lib/api';

export default function ForgotPassword(){
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e){
        e.preventDefault();
        setLoading(true);
        setError('');

        try{
            await api.forgotPassword( { email });
            navigate('/reset-password', { state: { email, codeJustSent: true }});
        }catch(err){
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
                        <img src={logoLight} alt="DevVault" className="w-30 h-auto object-contain dark:hidden" />
                        <img src={logoDark} alt="DevVault" className="hidden w-30 h-auto object-contain dark:block" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-vault-text">Forgot your password?</h1>
                    <p className="text-sm text-vault-muted mt-1">
                        Enter your email and we'll send you a code to reset it.
                    </p>
                </div>
    
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-vault-muted mb-1.5">Email</label>
                        <input
                            type="email"
                            required
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg bg-vault-elevated border border-vault-border px-3.5 py-2.5 text-sm text-vault-text outline-none focus:border-vault-accent transition-colors"
                            placeholder="youremail@gmail.com"
                        />
                    </div>
    
                    {error && <p className="text-sm text-vault-danger">{error}</p>}
    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-10 rounded-lg bg-vault-accent hover:bg-vault-accent-hover text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-60 flex items-center justify-center"
                    >
                        {loading ? <ButtonSpinner size={16} /> : 'Send reset code'}
                    </button>
                </form>
    
                <p className="text-center text-sm text-vault-muted mt-6">
                    <Link to="/login" className="text-vault-accent font-medium hover:underline">
                        Back to log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
