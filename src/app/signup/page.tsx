'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TransitionLink from '@/components/TransitionLink';

export default function SignupPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Step 1: Create the account
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong.');
                setLoading(false);
                return;
            }

            // Step 2: Send OTP
            const otpRes = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!otpRes.ok) {
                const otpData = await otpRes.json();
                setError(otpData.error || 'Failed to send verification email.');
                setLoading(false);
                return;
            }

            // Store password temporarily for auto-login after verification
            sessionStorage.setItem('_signup_pw', password);

            // Step 3: Redirect to verify page
            router.push(`/verify?email=${encodeURIComponent(email)}`);
        } catch {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center bg-tertiary relative overflow-hidden py-12 px-6">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>

            {/* Floating Decorations */}
            <div className="absolute top-16 right-12 text-gray-900/10 animate-bounce" style={{ animationDuration: '3.5s' }}>
                <span className="material-symbols-outlined text-7xl">palette</span>
            </div>
            <div className="absolute bottom-16 left-16 text-gray-900/10 animate-pulse" style={{ animationDuration: '4s' }}>
                <span className="material-symbols-outlined text-7xl">eco</span>
            </div>
            <div className="absolute top-1/4 left-10 text-gray-900/5 animate-spin" style={{ animationDuration: '20s' }}>
                <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6h8l-6.4 4.8 2.4 7.6-6.4-4.8-6.4 4.8 2.4-7.6-6.4-4.8h8z" /></svg>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Back to Home */}
                <div className="mb-8">
                    <TransitionLink href="/" className="inline-flex items-center gap-2 text-gray-800/70 hover:text-gray-900 font-bold text-lg transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Home
                    </TransitionLink>
                </div>

                {/* Card */}
                <div className="bg-white rounded-[3rem] border-[4px] border-gray-900 shadow-[8px_8px_0px_0px_#111827] p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-tertiary/15 rounded-full -ml-20 -mt-20"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/15 rounded-full -mr-16 -mb-16"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <span className="material-symbols-outlined text-6xl text-tertiary mb-2">local_florist</span>
                            <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">Join the Garden!</h1>
                            <p className="text-gray-500 font-semibold text-lg">Create your account and start doodling</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 border-2 border-red-200 rounded-2xl p-4 mb-6 font-semibold text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="doodle_master"
                                    className="w-full px-5 py-4 rounded-2xl border-[3px] border-gray-900 font-semibold text-lg placeholder-gray-400 focus:border-tertiary focus:ring-0 outline-none transition-colors bg-gray-50"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="artist@doodles.com"
                                    className="w-full px-5 py-4 rounded-2xl border-[3px] border-gray-900 font-semibold text-lg placeholder-gray-400 focus:border-tertiary focus:ring-0 outline-none transition-colors bg-gray-50"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 rounded-2xl border-[3px] border-gray-900 font-semibold text-lg placeholder-gray-400 focus:border-tertiary focus:ring-0 outline-none transition-colors bg-gray-50"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bubbly-btn w-full bg-tertiary text-gray-900 text-xl uppercase tracking-wider py-4 border-[4px] border-gray-900 shadow-[6px_6px_0px_0px_#111827] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Sending Code...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">person_add</span>
                                        Create Account
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-500 font-semibold">
                                Already have an account?{' '}
                                <TransitionLink href="/login" className="text-primary hover:text-primary/80 font-bold underline underline-offset-4 decoration-2">
                                    Log In →
                                </TransitionLink>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
