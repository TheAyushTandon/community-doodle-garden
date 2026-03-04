'use client';

import { useEffect, useState } from 'react';

const PETAL_IMAGES = [
    '/images/petal_pink.png',
    '/images/petal_blue.png',
    '/images/petal_yellow.png',
    '/images/petal_purple.png',
];

interface Petal {
    id: number;
    img: string;
    left: number;
    size: number;
    delay: number;
    duration: number;
    swayAmount: number;
    startRotation: number;
    opacity: number;
}

function generatePetals(count: number): Petal[] {
    const petals: Petal[] = [];
    for (let i = 0; i < count; i++) {
        petals.push({
            id: i,
            img: PETAL_IMAGES[Math.floor(Math.random() * PETAL_IMAGES.length)],
            left: Math.random() * 100,
            size: 24 + Math.random() * 28,
            delay: Math.random() * 12,
            duration: 10 + Math.random() * 10,
            swayAmount: 40 + Math.random() * 60,
            startRotation: Math.random() * 360,
            opacity: 0.4 + Math.random() * 0.4,
        });
    }
    return petals;
}

export default function PetalRain({ count = 18 }: { count?: number }) {
    const [petals, setPetals] = useState<Petal[]>([]);

    useEffect(() => {
        setPetals(generatePetals(count));
    }, [count]);

    if (petals.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
            {petals.map((petal) => (
                <div
                    key={petal.id}
                    className="absolute petal-fall"
                    style={{
                        left: `${petal.left}%`,
                        top: '-60px',
                        width: petal.size,
                        height: petal.size,
                        animationDelay: `${petal.delay}s`,
                        animationDuration: `${petal.duration}s`,
                        opacity: petal.opacity,
                        '--sway': `${petal.swayAmount}px`,
                        '--start-rot': `${petal.startRotation}deg`,
                    } as React.CSSProperties}
                >
                    <img
                        src={petal.img}
                        alt=""
                        className="w-full h-full object-contain"
                        draggable={false}
                    />
                </div>
            ))}
        </div>
    );
}
