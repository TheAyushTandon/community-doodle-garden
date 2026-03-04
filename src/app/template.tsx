'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';
import { playSwooshUp } from '@/lib/sounds';

export default function ShutterTemplate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        const shutter = document.getElementById('global-shutter');
        const stickers = document.querySelectorAll('.shutter-sticker');

        if (shutter) {
            const tl = gsap.timeline();

            // 1. Zoom out stickers
            if (stickers.length > 0) {
                tl.to(stickers, {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.2,
                    stagger: 0.01,
                    ease: 'power2.in'
                });
            }

            // 2. Play swoosh UP sound when shutter lifts
            tl.call(() => {
                playSwooshUp();
            });

            // 3. Slide the shutter BACK UP
            tl.to(shutter, {
                yPercent: -100,
                y: 0,
                duration: 0.8,
                ease: 'power3.inOut'
            }, "-=0.1");
        }
    }, [pathname]);

    return <>{children}</>;
}
