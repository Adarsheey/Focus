import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn } from 'lucide-react';

export default function Login({ onSwitchToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.error(err);
            setError('Failed to log in. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto mt-10 p-8 bg-panel rounded-2xl border border-white/5 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                    Welcome Back
                </h2>
                <p className="text-textMuted">Log in to continue your focus journey</p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder-textMuted focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium shadow-inner"
                        placeholder="you@example.com"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder-textMuted focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium shadow-inner"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-5 py-3 rounded-xl transition-all font-bold flex justify-center items-center shadow-lg hover:shadow-blue-500/20 active:scale-95"
                >
                    {loading ? 'Logging in...' : (
                        <>
                            <LogIn size={20} className="mr-2" /> Log In
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-textMuted">
                Don't have an account?{' '}
                <button
                    onClick={onSwitchToRegister}
                    className="text-blue-400 hover:text-blue-300 hover:underline transition-all font-medium"
                >
                    Sign up
                </button>
            </div>
        </div>
    );
}
