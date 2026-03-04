'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';
import { playSwooshDown } from '@/lib/sounds';

interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    children: React.ReactNode;
}

export const animateShutterIn = (onComplete: () => void) => {
    const shutter = document.getElementById('global-shutter');

    if (!shutter) {
        onComplete();
        return;
    }

    const stickers = document.querySelectorAll('.shutter-sticker');
    const progressBar = document.getElementById('shutter-progress');

    // Reset shutter position to TOP
    gsap.set(shutter, { yPercent: -100, y: 0 });
    // Reset stickers
    gsap.set(stickers, { scale: 0, opacity: 0 });
    if (progressBar) gsap.set(progressBar, { width: '0%' });

    // Play swoosh down sound
    playSwooshDown();

    const tl = gsap.timeline({ onComplete });

    // 1. Shutter drops down into view (the exit outro)
    tl.to(shutter, {
        yPercent: 0,
        y: 0,
        duration: 0.8,
        ease: 'power3.inOut'
    })
        // 2. Pop in the stickers and text energetically
        .to(stickers, {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'back.out(2)'
        }, "-=0.2") // Start slightly before shutter finishes dropping
        // 3. Fake progress bar load
        .to(progressBar, {
            width: '100%',
            duration: 0.8, // Slower progress bar to give more time to read
            ease: 'power1.inOut'
        }, "-=0.4");
};

export default function TransitionLink({ href, children, onClick, ...props }: TransitionLinkProps) {
    const router = useRouter();

    const handleTransition = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        if (onClick) onClick(e);

        // Only animate if navigating to a different page
        if (window.location.pathname !== href) {
            animateShutterIn(() => {
                router.push(href);
            });
        }
    };

    return (
        <a href={href} onClick={handleTransition} {...props}>
            {children}
        </a>
    );
}
