import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import logoDark from '../assets/DevVault-Logo2.png';
import logoLight from '../assets/DevVault-Logo-LightMode.png';
import ButtonSpinner from '../components/ButtonSpinner';
import { api } from '../lib/api';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

function useCountdown(initialSeconds) {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
        return () => clearTimeout(timer);
    }, [secondsLeft]);

    return [secondsLeft, setSecondsLeft];
}

export default function VerifyEmail() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const email = state?.email;
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [loading, setLoading] = useState(false);
    const [secondsLeft, setSecondsLeft] = useCountdown(state?.codeJustSent ? RESEND_COOLDOWN_SECONDS : 0);

    if (!email) return <Navigate to="/login" replace />;

    function handleCodeChange(e) {
        setCode(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setNotice('');

        try {
            await api.verifyEmail({ email, code });
            navigate('/login', { replace: true, state: { verified: true } });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        setError('');
        setNotice('');

        try {
            await api.resendOtp({ email });
            setNotice('A new code is on its way.');
            setSecondsLeft(RESEND_COOLDOWN_SECONDS);
        } catch (err) {
            setError(err.message);
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
                    <h1 className="text-2xl font-extrabold text-vault-text">Verify your email</h1>
                    <p className="text-sm text-vault-muted mt-1">
                        Enter the {OTP_LENGTH}-digit code we sent to <span className="font-medium text-vault-text">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-vault-muted mb-1.5">Verification code</label>
                        <input
                            required
                            autoFocus
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={code}
                            onChange={handleCodeChange}
                            className="w-full rounded-lg bg-vault-elevated border border-vault-border px-3.5 py-2.5 text-center text-xl font-semibold tracking-[0.5em] text-vault-text outline-none focus:border-vault-accent transition-colors"
                            placeholder="••••••"
                        />
                    </div>

                    {error && <p className="text-sm text-vault-danger">{error}</p>}
                    {notice && <p className="text-sm text-vault-accent">{notice}</p>}

                    <button
                        type="submit"
                        disabled={loading || code.length !== OTP_LENGTH}
                        className="w-full h-10 rounded-lg bg-vault-accent hover:bg-vault-accent-hover text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-60 flex items-center justify-center"
                    >
                        {loading ? <ButtonSpinner size={16} /> : 'Verify email'}
                    </button>
                </form>

                <p className="text-center text-sm text-vault-muted mt-6">
                    Didn't get a code?{' '}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={secondsLeft > 0}
                        className="text-vault-accent font-medium hover:underline disabled:opacity-60 disabled:no-underline"
                    >
                        {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}
                    </button>
                </p>

                <p className="text-center text-sm text-vault-muted mt-3">
                    <Link to="/login" className="text-vault-accent font-medium hover:underline">
                        Back to log in
                    </Link>
                </p>
            </div>
        </div>
    );
}