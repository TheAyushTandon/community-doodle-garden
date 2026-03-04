'use client';

import { useEffect, useRef, useCallback } from 'react';
import { resumeAudio, playTick } from '@/lib/sounds';

export default function SoundProvider({ children }: { children: React.ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const startedRef = useRef(false);

    const startBgMusic = useCallback(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        resumeAudio();

        if (!audioRef.current) {
            const audio = new Audio('/bg-music.mp3');
            audio.loop = true;
            audio.volume = 0.18; // subtle background level
            audioRef.current = audio;
        }

        audioRef.current.play().catch(() => {
            // Autoplay blocked — will retry on next interaction
            startedRef.current = false;
        });
    }, []);

    useEffect(() => {
        // Tick sound on hover over interactive elements — fires once per button, not per child
        const handleMouseEnter = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const related = e.relatedTarget as HTMLElement | null;

            // Find the nearest interactive ancestor of the hovered element
            const interactive = (el: HTMLElement | null): HTMLElement | null => {
                if (!el) return null;
                if (
                    el.tagName === 'A' ||
                    el.tagName === 'BUTTON' ||
                    el.getAttribute('role') === 'button' ||
                    el.classList.contains('bubbly-btn')
                ) return el;
                return interactive(el.parentElement);
            };

            const entered = interactive(target);
            if (!entered) return;

            // Only fire if we're coming from OUTSIDE this interactive element
            // i.e. relatedTarget is not inside the same button/link
            if (related && entered.contains(related)) return;

            playTick();
        };

        // Start bg music on first user interaction (browser autoplay policy)
        document.addEventListener('mouseover', handleMouseEnter);
        document.addEventListener('click', startBgMusic, { once: true });
        document.addEventListener('keydown', startBgMusic, { once: true });

        return () => {
            document.removeEventListener('mouseover', handleMouseEnter);
            document.removeEventListener('click', startBgMusic);
            document.removeEventListener('keydown', startBgMusic);
            audioRef.current?.pause();
        };
    }, [startBgMusic]);

    return <>{children}</>;
}
