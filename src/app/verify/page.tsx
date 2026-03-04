'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import TransitionLink from '@/components/TransitionLink';

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [success, setSuccess] = useState(false);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    // Focus first input on mount
    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only last char
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // On backspace, go to previous input
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
        // Focus last filled or next empty
        const focusIndex = Math.min(pastedData.length, 5);
        inputsRef.current[focusIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit code.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Verification failed.');
                setLoading(false);
                return;
            }

            setSuccess(true);

            // Auto sign-in after verification
            const password = sessionStorage.getItem('_signup_pw');
            if (password) {
                sessionStorage.removeItem('_signup_pw');
                await signIn('credentials', { email, password, redirect: false });
            }

            setTimeout(() => {
                router.push('/');
                router.refresh();
            }, 1500);
        } catch {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setError('');

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setResendCooldown(60);
                setOtp(['', '', '', '', '', '']);
                inputsRef.current[0]?.focus();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to resend OTP.');
            }
        } catch {
            setError('Failed to resend OTP.');
        }
    };

    if (success) {
        return (
            <div className="flex-1 flex items-center justify-center bg-green-400 relative overflow-hidden py-12 px-6">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <div className="relative z-10 text-center">
                    <span className="material-symbols-outlined text-8xl text-white mb-4 drop-shadow-lg">check_circle</span>
                    <h1 className="font-display text-5xl font-bold text-white mb-4 drop-shadow-lg">Verified! 🎉</h1>
                    <p className="text-xl text-white/90 font-semibold">Welcome to the garden. Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex items-center justify-center bg-primary relative overflow-hidden py-12 px-6">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>

            {/* Floating Decorations */}
            <div className="absolute top-16 left-12 text-white/15 animate-bounce" style={{ animationDuration: '3s' }}>
                <span className="material-symbols-outlined text-7xl">mail</span>
            </div>
            <div className="absolute bottom-20 right-16 text-white/10 animate-pulse" style={{ animationDuration: '4s' }}>
                <span className="material-symbols-outlined text-7xl">verified</span>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Back to Home */}
                <div className="mb-8">
                    <TransitionLink href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white font-bold text-lg transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Home
                    </TransitionLink>
                </div>

                {/* Card */}
                <div className="bg-white rounded-[3rem] border-[4px] border-gray-900 shadow-[8px_8px_0px_0px_#111827] p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-tertiary/10 rounded-full -ml-16 -mb-16"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <span className="material-symbols-outlined text-6xl text-primary mb-2">mark_email_read</span>
                            <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">Check Your Email!</h1>
                            <p className="text-gray-500 font-semibold text-lg">
                                We sent a 6-digit code to
                            </p>
                            <p className="text-primary font-bold text-lg mt-1">{email}</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 border-2 border-red-200 rounded-2xl p-4 mb-6 font-semibold text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* OTP Input Boxes */}
                            <div className="flex justify-center gap-3" onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => { inputsRef.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleChange(index, e.target.value)}
                                        onKeyDown={e => handleKeyDown(index, e)}
                                        className="w-14 h-16 text-center text-2xl font-bold border-[3px] border-gray-900 rounded-2xl bg-gray-50 focus:border-primary focus:ring-0 outline-none transition-colors"
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.join('').length !== 6}
                                className="bubbly-btn w-full bg-primary text-white text-xl uppercase tracking-wider py-4 border-[4px] border-gray-900 shadow-[6px_6px_0px_0px_#111827] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Verifying...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">verified</span>
                                        Verify Email
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-500 font-semibold mb-2">Didn&apos;t receive the code?</p>
                            <button
                                onClick={handleResend}
                                disabled={resendCooldown > 0}
                                className="text-primary hover:text-primary/80 font-bold underline underline-offset-4 decoration-2 disabled:text-gray-400 disabled:no-underline transition-colors"
                            >
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center bg-primary">
                <span className="material-symbols-outlined text-6xl text-white animate-spin">progress_activity</span>
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
