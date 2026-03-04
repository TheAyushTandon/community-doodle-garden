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
        // Tick sound on hover over interactive elements
        const handleMouseEnter = (e: Event) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button') ||
                target.closest('[role="button"]') ||
                target.classList.contains('bubbly-btn')
            ) {
                playTick();
            }
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
