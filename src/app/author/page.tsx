'use client';

import TransitionLink from '@/components/TransitionLink';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Author() {
    const heroRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'back.out(1.5)' } });

        if (heroRef.current) {
            tl.fromTo(heroRef.current, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 });
        }

        if (contentRef.current) {
            tl.fromTo(contentRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.2');
        }
    }, []);

    return (
        <section className="bg-primary flex-1 relative py-16 md:py-24 overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>

            {/* Floating Doodles */}
            <div className="absolute top-12 left-10 text-white/30 animate-bounce" style={{ animationDuration: '4s' }}>
                <span className="material-symbols-outlined text-6xl">code</span>
            </div>
            <div className="absolute top-24 right-16 text-white/20 animate-pulse" style={{ animationDuration: '3.5s' }}>
                <span className="material-symbols-outlined text-5xl">favorite</span>
            </div>
            <div className="absolute bottom-32 left-1/4 text-white/20 animate-spin" style={{ animationDuration: '10s' }}>
                <svg width="45" height="45" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
            </div>

            <div className="container mx-auto px-6 max-w-3xl relative z-10">
                {/* Back Button */}
                <div className="mb-6">
                    <TransitionLink href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/15 px-5 py-2 rounded-full font-bold text-lg transition-all">
                        <span className="material-symbols-outlined text-xl">home</span>
                        Go to Home
                    </TransitionLink>
                </div>

                {/* Hero Headers */}
                <div className="text-center mb-10" ref={heroRef}>
                    <h1 className="font-display text-gray-900 text-5xl md:text-6xl lg:text-7xl font-extrabold bg-white px-8 py-4 border-[4px] border-gray-900 rounded-[2rem] shadow-[6px_6px_0px_0px_#111827] inline-block mb-6 -rotate-2 hover:rotate-0 transition-transform cursor-default">
                        Meet the Gardener
                    </h1>
                    <p className="font-display text-white/90 text-3xl md:text-4xl font-bold drop-shadow-sm mt-2">
                        Hi, I&apos;m <span className="text-tertiary">Ayush</span>
                    </p>
                </div>

                {/* Bio Content Box */}
                <div className="bg-white rounded-[3rem] border-[4px] border-gray-900 shadow-[8px_8px_0px_0px_#111827] p-8 md:p-12 relative overflow-hidden" ref={contentRef}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-100/50 rounded-full -ml-20 -mb-20"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-24 h-24 shrink-0 bg-yellow-200 rounded-full border-[3px] border-gray-900 flex items-center justify-center shadow-[4px_4px_0px_0px_#111827] mx-auto md:mx-0">
                            <span className="material-symbols-outlined text-5xl text-gray-900">developer_board</span>
                        </div>

                        <div className="space-y-6 text-xl md:text-2xl text-gray-700 font-medium leading-relaxed font-display text-center md:text-left">
                            <p>
                                I&apos;m a developer from <span className="font-extrabold text-gray-900">India</span> who loves to code and bring cool ideas to life.
                            </p>
                            <p>
                                I started this project because I wanted to begin <span className="italic text-gray-900">somewhere</span>—to actually get my hands dirty and build things instead of just thinking about them. Action over ideas!
                            </p>
                            <p className="bg-orange-50 p-6 rounded-2xl border-2 border-dashed border-orange-300">
                                💡 <span className="font-extrabold text-gray-900">The Inspiration:</span> I really admired the playful UI of the Google <em>&quot;Quick! Draw&quot;</em> website. It felt so alive and fun. So, I thought to myself: <span className="font-bold text-gray-900 italic">&quot;Why not try making something like that myself?&quot;</span>
                            </p>
                            <p>
                                And that&apos;s how the <span className="font-extrabold text-gray-900">Doodle Garden</span> bloomed. I hope you enjoy drawing in it as much as I enjoyed building it! 🌻
                            </p>

                            {/* Social Buttons */}
                            <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                                <a href="https://github.com/TheAyushTandon" target="_blank" rel="noopener noreferrer" className="bubbly-btn bg-gray-900 text-white !px-6 !py-3 !text-lg shadow-[3px_3px_0px_0px_#f472b6] hover:shadow-[1px_1px_0px_0px_#f472b6] border-2 border-gray-900 flex items-center gap-3">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                        ></path>
                                    </svg>
                                    GitHub
                                </a>
                                <a href="https://www.linkedin.com/in/theayushtandon/" target="_blank" rel="noopener noreferrer" className="bubbly-btn bg-[#0077b5] text-white !px-6 !py-3 !text-lg shadow-[3px_3px_0px_0px_#111827] hover:shadow-[1px_1px_0px_0px_#111827] border-2 border-gray-900 flex items-center gap-3">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                                    </svg>
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
