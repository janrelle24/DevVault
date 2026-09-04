import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();

        setLoading(true);
        setError('');

        // Temporary signup logic
        console.log('Signup:', {
            name,
            email,
            password
        });

        setTimeout(() => {
            setLoading(false);
        }, 500);
    }

    return (
        <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="h-10 w-10 rounded-lg bg-vault-accent flex items-center justify-center text-white font-bold mx-auto mb-3">
                        DV
                    </div>

                    <h1 className="text-2xl font-extrabold text-white">
                        Create your account
                    </h1>

                    <p className="text-sm text-vault-muted mt-1">
                        Bookmark docs and track your progress
                    </p>
                </div>

                {/* Signup Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-medium text-vault-muted mb-1.5">
                            Name
                        </label>

                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg bg-vault-elevated border border-vault-border px-3.5 py-2.5 text-sm text-white outline-none focus:border-vault-accent transition-colors"
                            placeholder="Ada Lovelace"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-medium text-vault-muted mb-1.5">
                            Email
                        </label>

                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg bg-vault-elevated border border-vault-border px-3.5 py-2.5 text-sm text-white outline-none focus:border-vault-accent transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-medium text-vault-muted mb-1.5">
                            Password
                        </label>

                        <input
                            type="password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg bg-vault-elevated border border-vault-border px-3.5 py-2.5 text-sm text-white outline-none focus:border-vault-accent transition-colors"
                            placeholder="At least 8 characters"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-vault-danger">
                            {error}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-vault-accent hover:bg-vault-accent-hover text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-60"
                    >
                        {loading
                            ? 'Creating account…'
                            : 'Create account'
                        }
                    </button>

                </form>

                {/* Login Link */}
                <p className="text-center text-sm text-vault-muted mt-6">
                    Already have an account?{' '}

                    <Link
                        to="/login"
                        className="text-vault-accent font-medium hover:underline"
                    >
                        Log in
                    </Link>
                </p>

            </div>
        </div>
    );
}