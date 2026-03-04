'use client';

import { useState } from 'react';
import TransitionLink from './TransitionLink';
import { useSession, signOut } from 'next-auth/react';

const menuSlideDown = `
@keyframes menuSlideDown {
  from { opacity: 0; transform: translateY(-12px) scaleY(0.95); }
  to   { opacity: 1; transform: translateY(0)     scaleY(1);    }
}
.menu-slide-down {
  animation: menuSlideDown 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-origin: top;
}
.menu-item-fade > * {
  opacity: 0;
  animation: menuSlideDown 0.30s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.menu-item-fade > *:nth-child(1) { animation-delay: 0.06s; }
.menu-item-fade > *:nth-child(2) { animation-delay: 0.12s; }
.menu-item-fade > *:nth-child(3) { animation-delay: 0.18s; }
.menu-item-fade > *:nth-child(4) { animation-delay: 0.24s; }
.menu-item-fade > *:nth-child(5) { animation-delay: 0.30s; }
`;

export default function Navigation() {
    const { data: session, status } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    return (
        <>
            <style>{menuSlideDown}</style>
            <nav className="bg-white text-gray-900 shadow-sm px-4 md:px-6 py-3 md:py-4 flex justify-between items-center z-50 relative border-b border-gray-100 font-display">
                {/* Logo */}
                <TransitionLink
                    href="/"
                    onClick={closeMenu}
                    className="text-xl md:text-3xl tracking-tight flex items-center gap-2 md:gap-3 hover:bg-gray-100 px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all font-extrabold"
                >
                    <span className="material-symbols-outlined text-primary text-2xl md:text-4xl">local_florist</span>
                    <span className="hidden sm:inline">Doodle Garden</span>
                    <span className="sm:hidden">Doodle</span>
                </TransitionLink>

                {/* Desktop nav links */}
                <div className="hidden md:flex space-x-10 items-center text-lg font-extrabold">
                    <TransitionLink href="/draw" className="hover:bg-gray-100 px-5 py-2 rounded-full transition-all hover:text-primary">Draw</TransitionLink>
                    <TransitionLink href="/garden" className="hover:bg-gray-100 px-5 py-2 rounded-full transition-all hover:text-primary">Gallery</TransitionLink>
                    <TransitionLink href="/about" className="hover:bg-gray-100 px-5 py-2 rounded-full transition-all hover:text-primary">How it works</TransitionLink>

                    {status === 'loading' && <div className="w-24 h-10 bg-gray-100 rounded-full animate-pulse" />}

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

                {/* Mobile hamburger button */}
                <button
                    className="md:hidden text-gray-800 focus:outline-none p-2 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className="material-symbols-outlined text-3xl">
                        {menuOpen ? 'close' : 'menu'}
                    </span>
                </button>

                {/* Mobile dropdown menu */}
                {menuOpen && (
                    <div className="menu-slide-down md:hidden absolute top-full left-0 right-0 bg-white border-b-4 border-gray-900 shadow-[0_8px_0_0_#111827] z-50 overflow-hidden">
                        <div className="menu-item-fade flex flex-col font-extrabold text-lg">
                            <TransitionLink href="/draw" onClick={closeMenu} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 border-b border-gray-100 transition-colors">
                                <span className="material-symbols-outlined text-primary">brush</span>
                                Draw
                            </TransitionLink>
                            <TransitionLink href="/garden" onClick={closeMenu} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 border-b border-gray-100 transition-colors">
                                <span className="material-symbols-outlined text-primary">park</span>
                                Gallery
                            </TransitionLink>
                            <TransitionLink href="/about" onClick={closeMenu} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 border-b border-gray-100 transition-colors">
                                <span className="material-symbols-outlined text-primary">help_outline</span>
                                How it works
                            </TransitionLink>

                            {status === 'authenticated' && session?.user && (
                                <>
                                    <TransitionLink href="/profile" onClick={closeMenu} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 border-b border-gray-100 transition-colors text-secondary font-bold">
                                        <span className="material-symbols-outlined">face</span>
                                        {session.user.name || 'My Profile'}
                                    </TransitionLink>
                                    <button
                                        onClick={() => { closeMenu(); signOut({ callbackUrl: '/' }); }}
                                        className="flex items-center gap-3 px-6 py-4 hover:bg-red-50 text-red-500 transition-colors w-full text-left"
                                    >
                                        <span className="material-symbols-outlined">logout</span>
                                        Sign Out
                                    </button>
                                </>
                            )}

                            {status === 'unauthenticated' && (
                                <TransitionLink href="/login" onClick={closeMenu} className="flex items-center gap-3 px-6 py-4 bg-primary text-white transition-colors">
                                    <span className="material-symbols-outlined">login</span>
                                    Sign In
                                </TransitionLink>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
