'use client';

import TransitionLink from './TransitionLink';
import { useSession, signOut } from 'next-auth/react';

export default function Navigation() {
    const { data: session, status } = useSession();

    return (
        <nav className="bg-white text-gray-900 shadow-sm px-6 py-4 flex justify-between items-center z-50 relative border-b border-gray-100 font-display">
            <TransitionLink
                href="/"
                className="text-3xl tracking-tight flex items-center gap-3 hover:bg-gray-100 px-4 py-2 rounded-full transition-all font-extrabold"
            >
                <span className="material-symbols-outlined text-primary text-4xl">local_florist</span>
                Doodle Garden
            </TransitionLink>

            <div className="hidden md:flex space-x-10 items-center text-lg font-extrabold">
                <TransitionLink href="/garden" className="hover:bg-gray-100 px-5 py-2 rounded-full transition-all hover:text-primary">
                    Gallery
                </TransitionLink>
                <TransitionLink href="/about" className="hover:bg-gray-100 px-5 py-2 rounded-full transition-all hover:text-primary">
                    How it works
                </TransitionLink>

                {status === 'loading' && (
                    <div className="w-24 h-10 bg-gray-100 rounded-full animate-pulse"></div>
                )}

                {status === 'authenticated' && session?.user && (
                    <>
                        <TransitionLink
                            href="/profile"
                            className="flex items-center gap-2 bg-secondary text-white px-6 py-2.5 rounded-full font-bold shadow-soft hover:-translate-y-0.5 hover:shadow-soft-lg transition-all"
                        >
                            <span className="material-symbols-outlined text-xl">face</span>
                            {session.user.name || 'My Profile'}
                        </TransitionLink>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="bg-gray-100 text-gray-800 px-6 py-2.5 rounded-full font-bold hover:bg-gray-200 transition-colors"
                        >
                            Sign Out
                        </button>
                    </>
                )}

                {status === 'unauthenticated' && (
                    <TransitionLink
                        href="/login"
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-bold shadow-soft hover:-translate-y-0.5 hover:shadow-soft-lg transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">login</span>
                        Sign In
                    </TransitionLink>
                )}
            </div>

            <button className="md:hidden text-gray-800 focus:outline-none">
                <span className="material-symbols-outlined">menu</span>
            </button>
        </nav>
    );
}
