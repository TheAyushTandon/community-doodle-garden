'use client';

import TransitionLink from '@/components/TransitionLink';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function About() {
    const heroRef = useRef<HTMLDivElement>(null);
    const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
    const faqRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        gsap.fromTo(heroRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });

        stepsRef.current.forEach((step, i) => {
            if (!step) return;
            gsap.fromTo(step,
                { opacity: 0, y: 60, scale: 0.92 },
                {
                    opacity: 1, y: 0, scale: 1, duration: 0.7, delay: i * 0.15,
                    ease: 'back.out(1.4)', clearProps: 'transform',
                    scrollTrigger: { trigger: step, start: 'top 85%' }
                }
            );
        });

        if (faqRef.current) {
            gsap.fromTo(faqRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: faqRef.current, start: 'top 85%' } });
        }
        if (ctaRef.current) {
            gsap.fromTo(ctaRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)', clearProps: 'transform', scrollTrigger: { trigger: ctaRef.current, start: 'top 90%' } });
        }
    }, []);

    const steps = [
        {
            num: '1',
            title: 'Pick Up Your Pen',
            desc: 'Hit the big "DRAW" button on the homepage or navigation bar. Our simple canvas opens instantly, no downloads, no logins, no fuss!',
            img: '/images/draw_icon.png',
            bgColor: 'bg-blue-100',
            numColor: 'bg-yellow-300',
            rotate: '-rotate-2',
            decoColor: 'text-yellow-400',
            borderColor: 'border-blue-300'
        },
        {
            num: '2',
            title: 'Sketch Your Flower',
            desc: 'Choose your colors from a fun palette and let your imagination run wild. Draw a sunflower, a daisy, a fantasy bloom, or something nobody has ever seen before!',
            img: '/images/palette_doodle.png',
            bgColor: 'bg-green-100',
            numColor: 'bg-pink-300',
            rotate: 'rotate-2',
            decoColor: 'text-pink-400',
            borderColor: 'border-green-300'
        },
        {
            num: '3',
            title: 'Water & Watch It Grow',
            desc: 'Once you\'re happy with your masterpiece, click submit. Your flower gets "watered" and planted right into the community garden for the world to admire!',
            img: '/images/watering_can.png',
            bgColor: 'bg-pink-100',
            numColor: 'bg-blue-300',
            rotate: '-rotate-1',
            decoColor: 'text-blue-400',
            borderColor: 'border-pink-300'
        },
        {
            num: '4',
            title: 'Explore the Garden',
            desc: 'Visit the Gallery to wander through a meadow of flowers drawn by people from all over the world. Each one is unique. Each one adds colour to our shared space.',
            img: '/images/community_garden.png',
            bgColor: 'bg-orange-100',
            numColor: 'bg-green-300',
            rotate: 'rotate-1',
            decoColor: 'text-green-400',
            borderColor: 'border-orange-300'
        },
    ];

    const faqs = [
        { q: 'Do I need an account?', a: 'Nope! Anyone can draw. Having an account saves your doodles to your profile though.' },
        { q: 'Can I draw anything?', a: 'We\'re a flower garden, so we encourage flower-themed art. But hey, if your cactus is happy, we\'re happy!' },
        { q: 'Is it free?', a: 'Completely free. Always will be. This is about creativity, not cash.' },
        { q: 'Can I share my flower?', a: 'Absolutely! Every flower has a unique link you can share on social media.' },
    ];

    return (
        <>
            {/* Hero */}
            <section className="bg-secondary relative pt-20 pb-28 overflow-hidden wave-bottom">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>

                {/* Floating Decorative Doodles */}
                <div className="absolute top-10 left-10 text-white/30 animate-bounce" style={{ animationDuration: '3s' }}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6h8l-6.4 4.8 2.4 7.6-6.4-4.8-6.4 4.8 2.4-7.6-6.4-4.8h8z" /></svg>
                </div>
                <div className="absolute top-20 right-16 text-white/20 animate-pulse" style={{ animationDuration: '4s' }}>
                    <svg width="45" height="45" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
                </div>
                <div className="absolute bottom-32 left-1/4 text-white/20 animate-spin" style={{ animationDuration: '12s' }}>
                    <svg width="35" height="35" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6h8l-6.4 4.8 2.4 7.6-6.4-4.8-6.4 4.8 2.4-7.6-6.4-4.8h8z" /></svg>
                </div>

                <div className="container mx-auto px-6 max-w-5xl relative z-10 text-center" ref={heroRef}>
                    <div className="mb-8 text-left">
                        <TransitionLink href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/15 px-5 py-2 rounded-full font-bold text-lg transition-all">
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back to Home
                        </TransitionLink>
                    </div>
                    <h1 className="font-display text-white text-5xl md:text-7xl lg:text-8xl leading-tight mb-6 drop-shadow-lg">
                        How It <span className="text-tertiary">Works</span>
                    </h1>
                    <p className="text-2xl md:text-3xl text-white/90 max-w-3xl mx-auto font-semibold leading-relaxed whitespace-nowrap">
                        From blank canvas to blooming garden in 4 delightful steps
                    </p>
                </div>
            </section>

            {/* Steps Section — Zigzag Layout */}
            <section className="bg-tertiary relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-pattern opacity-5"></div>

                {/* Dashed connecting line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 border-l-[5px] border-dashed border-gray-900/10 transform -translate-x-1/2 hidden md:block z-0"></div>

                <div className="container mx-auto px-6 max-w-5xl relative z-10 space-y-20 md:space-y-28">
                    {steps.map((step, i) => {
                        const isReversed = i % 2 !== 0;
                        return (
                            <div
                                key={step.num}
                                ref={el => { stepsRef.current[i] = el; }}
                                className={`relative flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center justify-between gap-8 md:gap-16 group`}
                            >
                                {/* Number Blob */}
                                <div className={`absolute top-0 md:-top-8 left-1/2 transform -translate-x-1/2 w-20 h-20 ${step.numColor} rounded-full flex items-center justify-center font-display text-5xl font-bold text-gray-900 border-4 border-gray-900 shadow-[4px_4px_0px_0px_#111827] z-20 group-hover:scale-110 transition-transform ${step.rotate}`}>
                                    {step.num}
                                </div>

                                {/* Image Card */}
                                <div className="md:w-5/12 relative pt-12 md:pt-0">
                                    {/* Floating decorative star */}
                                    <div className={`absolute -top-4 ${isReversed ? '-left-4' : '-right-4'} ${step.decoColor} rotate-12 z-30`}>
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6h8l-6.4 4.8 2.4 7.6-6.4-4.8-6.4 4.8 2.4-7.6-6.4-4.8h8z" /></svg>
                                    </div>
                                    <div className={`${step.bgColor} rounded-[3rem] p-10 border-[4px] border-gray-900 shadow-[8px_8px_0px_0px_#111827] transform transition-all hover:-translate-y-3 ${isReversed ? 'hover:-rotate-2' : 'hover:rotate-2'} duration-300 relative overflow-hidden`}>
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-15 rounded-full -mr-20 -mt-20"></div>
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mb-16"></div>
                                        <img src={step.img} alt={step.title} className="w-44 h-44 object-contain mx-auto drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                </div>

                                {/* Text Content */}
                                <div className={`md:w-5/12 text-center ${isReversed ? 'md:text-right' : 'md:text-left'}`}>
                                    <h3 className={`font-display text-4xl md:text-5xl mb-5 text-gray-900 font-bold inline-block bg-white px-5 py-2 border-[3px] border-gray-900 rounded-2xl shadow-[5px_5px_0px_0px_#111827] ${step.rotate}`}>
                                        {step.title}
                                    </h3>
                                    <p className={`text-gray-700 font-display text-xl md:text-2xl font-medium leading-relaxed mt-4 bg-white p-6 rounded-[2rem] border-[3px] shadow-sm ${step.borderColor}`}>
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-white relative py-24">
                <div className="absolute inset-0 bg-pattern opacity-5"></div>
                <div className="container mx-auto px-6 max-w-4xl relative z-10" ref={faqRef}>
                    <h2 className="font-display text-5xl md:text-6xl text-center mb-4 font-bold text-gray-900">
                        Got Questions? <span className="text-secondary">🤔</span>
                    </h2>
                    <p className="text-center text-xl text-gray-500 mb-16 font-semibold">We&apos;ve got adorable answers.</p>

                    <div className="space-y-6">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-gray-50 rounded-[2rem] p-8 border-[3px] border-gray-900 shadow-[5px_5px_0px_0px_#111827] hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_#111827] transition-all duration-300">
                                <h4 className="font-display text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                                    <span className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-lg border-2 border-gray-900 shrink-0">Q</span>
                                    {faq.q}
                                </h4>
                                <p className="text-gray-600 text-lg font-medium leading-relaxed pl-14">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-primary relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                {/* Floating doodles */}
                <div className="absolute top-8 left-12 text-white/20 animate-bounce" style={{ animationDuration: '3.5s' }}>
                    <span className="material-symbols-outlined text-6xl">local_florist</span>
                </div>
                <div className="absolute bottom-8 right-12 text-white/20 animate-pulse" style={{ animationDuration: '2.5s' }}>
                    <span className="material-symbols-outlined text-6xl">eco</span>
                </div>

                <div className="container mx-auto px-6 max-w-4xl text-center relative z-10" ref={ctaRef}>
                    <h2 className="font-display text-5xl md:text-6xl text-white mb-6 font-bold drop-shadow-lg">
                        Ready to Bloom?
                    </h2>
                    <p className="text-2xl text-white/90 mb-10 font-semibold max-w-2xl mx-auto">
                        Your flower is waiting to be drawn. The garden is waiting to grow. What are you waiting for?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <TransitionLink
                            href="/draw"
                            className="bubbly-btn bg-white text-gray-900 text-2xl py-5 px-14 uppercase tracking-wider border-[4px] border-gray-900 shadow-[6px_6px_0px_0px_#111827] hover:-translate-y-2"
                        >
                            <span className="material-symbols-outlined text-3xl text-primary mr-3">brush</span>
                            Start Drawing
                        </TransitionLink>
                        <TransitionLink
                            href="/garden"
                            className="bubbly-btn bg-tertiary text-gray-900 text-2xl py-5 px-14 uppercase tracking-wider border-[4px] border-gray-900 shadow-[6px_6px_0px_0px_#111827] hover:-translate-y-2"
                        >
                            <span className="material-symbols-outlined text-3xl mr-3">park</span>
                            Visit Garden
                        </TransitionLink>
                    </div>
                </div>
            </section>
        </>
    );
}
