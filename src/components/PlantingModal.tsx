'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import TransitionLink from './TransitionLink';

interface PlantingModalProps {
    flowerName: string;
    imageDataUrl: string;
    onClose: () => void;
    onDrawAnother: () => void;
}

export default function PlantingModal({ flowerName, imageDataUrl, onClose, onDrawAnother }: PlantingModalProps) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const flowerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'back.out(1.7)' } });

        // Backdrop fade in
        tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });

        // Modal pop in
        tl.fromTo(modalRef.current,
            { opacity: 0, scale: 0.6, y: 60 },
            { opacity: 1, scale: 1, y: 0, duration: 0.5 },
            '-=0.1'
        );

        // Flower wiggle
        tl.fromTo(flowerRef.current,
            { rotation: -15, scale: 0.5 },
            { rotation: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' },
            '-=0.3'
        );

        // Burst confetti particles
        burstParticles();
    }, []);

    const burstParticles = () => {
        const colors = ['#facc15', '#f472b6', '#34d399', '#60a5fa', '#fb923c', '#a78bfa'];
        const modal = modalRef.current;
        if (!modal) return;
        const rect = modal.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 3;

        for (let i = 0; i < 40; i++) {
            const dot = document.createElement('div');
            const size = Math.random() * 10 + 6;
            dot.style.cssText = `
                position: fixed;
                pointer-events: none;
                z-index: 9999;
                border-radius: ${Math.random() > 0.5 ? '50%' : '3px'};
                width: ${size}px;
                height: ${size}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${cx}px;
                top: ${cy}px;
            `;
            document.body.appendChild(dot);

            const angle = (Math.random() * Math.PI * 2);
            const dist = Math.random() * 260 + 80;
            gsap.to(dot, {
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist - Math.random() * 100,
                rotation: Math.random() * 720 - 360,
                opacity: 0,
                duration: Math.random() * 1.2 + 0.8,
                ease: 'power2.out',
                onComplete: () => dot.remove(),
            });
        }
    };

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
        >
            <div
                ref={modalRef}
                className="bg-tertiary rounded-[3rem] border-[4px] border-gray-900 shadow-[10px_10px_0px_0px_#111827] p-8 md:p-12 max-w-md w-full text-center relative overflow-hidden"
            >
                {/* Background blobs */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-200/40 rounded-full -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-200/40 rounded-full -ml-16 -mb-16 pointer-events-none" />

                {/* Flower Preview */}
                <div ref={flowerRef} className="relative z-10 inline-block mb-6">
                    <div className="w-36 h-36 mx-auto rounded-[2rem] border-[4px] border-gray-900 shadow-[5px_5px_0px_0px_#111827] overflow-hidden bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageDataUrl} alt={flowerName} className="w-full h-full object-contain" />
                    </div>
                    <div className="absolute -bottom-3 -right-3 bg-yellow-300 rounded-full w-10 h-10 flex items-center justify-center border-[2px] border-gray-900 shadow-[2px_2px_0px_0px_#111827]">
                        🌱
                    </div>
                </div>

                {/* Title */}
                <h2 className="font-display text-gray-900 text-4xl md:text-5xl font-extrabold mb-2 relative z-10">
                    It&apos;s Planted! 🌸
                </h2>
                <p className="font-display text-gray-700 text-xl font-medium mb-1 relative z-10">
                    Your flower
                </p>
                <div className="inline-block bg-white px-5 py-2 rounded-2xl border-[3px] border-gray-900 shadow-[3px_3px_0px_0px_#111827] font-display text-2xl font-extrabold text-gray-900 mb-6 relative z-10">
                    &quot;{flowerName}&quot;
                </div>
                <p className="text-gray-600 font-medium mb-8 relative z-10">
                    is now growing in the community garden for everyone to see! 🎉
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
                    <button
                        onClick={onDrawAnother}
                        className="bubbly-btn bg-primary text-white border-[3px] border-gray-900 shadow-[4px_4px_0px_0px_#111827] flex items-center gap-2 justify-center"
                    >
                        <span className="material-symbols-outlined">brush</span>
                        Draw Another
                    </button>
                    <TransitionLink
                        href="/garden"
                        className="bubbly-btn bg-white text-gray-900 border-[3px] border-gray-900 shadow-[4px_4px_0px_0px_#111827] flex items-center gap-2 justify-center"
                    >
                        <span className="material-symbols-outlined">park</span>
                        Visit Garden
                    </TransitionLink>
                </div>
            </div>
        </div>
    );
}
