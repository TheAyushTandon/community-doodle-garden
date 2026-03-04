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
    const progressContainer = document.getElementById('shutter-progress-container');

    // Reset shutter position to TOP
    gsap.set(shutter, { yPercent: -100, y: 0 });
    // Reset stickers
    gsap.set(stickers, { scale: 0, opacity: 0 });
    // Reset progress
    if (progressBar) gsap.set(progressBar, { width: '0%' });
    if (progressContainer) gsap.set(progressContainer, { opacity: 0, y: 10 });

    // Play swoosh down sound
    playSwooshDown();

    const tl = gsap.timeline({ onComplete });

    // 1. Shutter drops down into view
    tl.to(shutter, {
        yPercent: 0,
        y: 0,
        duration: 0.8,
        ease: 'power3.inOut'
    })
        // 2. Pop in the stickers energetically
        .to(stickers, {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'back.out(2)'
        }, "-=0.2")
        // 3. Fade in progress bar container in sync with stickers
        .to(progressContainer, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out'
        }, "-=0.6")
        // 4. Fill the progress bar
        .to(progressBar, {
            width: '100%',
            duration: 0.8,
            ease: 'power1.inOut'
        }, "-=0.3");
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
