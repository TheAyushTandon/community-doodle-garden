'use client';

import TransitionLink from '@/components/TransitionLink';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<SVGSVGElement>(null);
  const sproutRef = useRef<SVGSVGElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const drawBtnRef = useRef<HTMLDivElement>(null);

  // Party popper confetti burst
  const burstConfetti = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const colors = ['#ef4444', '#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c', '#2bee6c'];

    for (let i = 0; i < 40; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 6 + Math.random() * 6;
      const angle = (Math.PI * 2 * i) / 40 + (Math.random() - 0.5) * 0.5;
      const velocity = 120 + Math.random() * 180;
      const shape = Math.random() > 0.5 ? '50%' : '2px';

      Object.assign(particle.style, {
        position: 'fixed',
        left: `${cx}px`,
        top: `${cy}px`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: shape,
        pointerEvents: 'none',
        zIndex: '999999',
        transform: `rotate(${Math.random() * 360}deg)`,
      });

      document.body.appendChild(particle);

      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity - 60;

      gsap.to(particle, {
        x: dx,
        y: dy + 200,
        rotation: Math.random() * 720 - 360,
        opacity: 0,
        scale: 0.2,
        duration: 0.8 + Math.random() * 0.5,
        ease: 'power2.out',
        onComplete: () => particle.remove(),
      });
    }
  };

  useEffect(() => {
    // Get all doodle SVGs
    const doodles = document.querySelectorAll('.doodle-float');

    // Hide everything initially
    gsap.set(doodles, { opacity: 0, scale: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'back.out(1.7)' } });

    // 1. Title fades in
    tl.fromTo(titleRef.current,
      { opacity: 0, y: -30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7 }
    )
      // 2. DRAW button pops up
      .fromTo(drawBtnRef.current,
        { opacity: 0, scale: 0, rotation: -10 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' },
        '-=0.2'
      )
      // 3. Sun and sprout pop in
      .fromTo(sunRef.current,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.5 },
        '-=0.2'
      )
      .fromTo(sproutRef.current,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.5 },
        '-=0.3'
      )
      // 4. Bottom nav buttons
      .fromTo(buttonsRef.current?.children ? Array.from(buttonsRef.current.children) : [],
        { opacity: 0, y: 30, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08 },
        '-=0.2'
      )
      // 5. All SVG doodles radially burst outward
      .to(doodles, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: { each: 0.06, from: 'center' },
        ease: 'elastic.out(1, 0.6)'
      }, '-=0.2');

    // Floating animation for ALL doodles
    doodles.forEach((el, i) => {
      gsap.to(el, {
        y: `+=${6 + (i % 3) * 3}`,
        rotation: `+=${3 + (i % 2) * 2}`,
        duration: 2 + (i % 4) * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.15,
      });
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden" ref={heroRef}>
      {/* Top section - Peach/Pink */}
      <div className="relative flex-1 bg-secondary flex items-center justify-center">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>

        {/* Floating Doodle Decorations */}

        {/* SVG Cat — top left */}
        <svg className="doodle-float absolute top-6 left-[6%] drop-shadow-lg rotate-[-12deg] hidden md:block cursor-pointer" width="65" height="65" viewBox="0 0 60 60">
          <ellipse cx="30" cy="38" rx="18" ry="16" fill="#f4a460" stroke="#333" strokeWidth="2.5" />
          <ellipse cx="30" cy="50" rx="12" ry="6" fill="#e8944a" stroke="#333" strokeWidth="1.5" />
          <polygon points="14,28 10,10 22,22" fill="#f4a460" stroke="#333" strokeWidth="2" strokeLinejoin="round" />
          <polygon points="46,28 50,10 38,22" fill="#f4a460" stroke="#333" strokeWidth="2" strokeLinejoin="round" />
          <polygon points="16,24 13,14 22,22" fill="#f9a8d4" strokeWidth="0" />
          <polygon points="44,24 47,14 38,22" fill="#f9a8d4" strokeWidth="0" />
          <circle cx="23" cy="33" r="4" fill="white" stroke="#333" strokeWidth="1.5" />
          <circle cx="37" cy="33" r="4" fill="white" stroke="#333" strokeWidth="1.5" />
          <circle cx="24" cy="33" r="2" fill="#333" />
          <circle cx="38" cy="33" r="2" fill="#333" />
          <circle cx="24.5" cy="32" r="0.8" fill="white" />
          <circle cx="38.5" cy="32" r="0.8" fill="white" />
          <ellipse cx="30" cy="38" rx="3" ry="2" fill="#f472b6" stroke="#333" strokeWidth="1" />
          <path d="M27,40 Q30,43 33,40" stroke="#333" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <line x1="12" y1="36" x2="4" y2="34" stroke="#333" strokeWidth="1" strokeLinecap="round" />
          <line x1="12" y1="38" x2="4" y2="39" stroke="#333" strokeWidth="1" strokeLinecap="round" />
          <line x1="48" y1="36" x2="56" y2="34" stroke="#333" strokeWidth="1" strokeLinecap="round" />
          <line x1="48" y1="38" x2="56" y2="39" stroke="#333" strokeWidth="1" strokeLinecap="round" />
        </svg>

        {/* SVG Sheep — bottom right */}
        <svg className="doodle-float absolute bottom-16 right-[5%] drop-shadow-lg rotate-[8deg] hidden md:block cursor-pointer" width="70" height="60" viewBox="0 0 70 55">
          <circle cx="20" cy="22" r="10" fill="white" stroke="#333" strokeWidth="2" />
          <circle cx="35" cy="18" r="11" fill="white" stroke="#333" strokeWidth="2" />
          <circle cx="50" cy="22" r="10" fill="white" stroke="#333" strokeWidth="2" />
          <circle cx="25" cy="32" r="11" fill="white" stroke="#333" strokeWidth="2" />
          <circle cx="45" cy="32" r="11" fill="white" stroke="#333" strokeWidth="2" />
          <circle cx="35" cy="28" r="12" fill="white" stroke="#333" strokeWidth="2" />
          <ellipse cx="35" cy="38" rx="8" ry="6" fill="#333" />
          <circle cx="32" cy="36" r="2" fill="white" />
          <circle cx="38" cy="36" r="2" fill="white" />
          <circle cx="32.3" cy="36.3" r="0.8" fill="#333" />
          <circle cx="38.3" cy="36.3" r="0.8" fill="#333" />
          <ellipse cx="35" cy="40" rx="2" ry="1.2" fill="#f472b6" />
          <rect x="26" y="46" width="4" height="8" rx="2" fill="#333" />
          <rect x="40" y="46" width="4" height="8" rx="2" fill="#333" />
        </svg>

        {/* SVG Donut — top right */}
        <svg className="doodle-float absolute top-10 right-[8%] hidden md:block cursor-pointer rotate-[15deg]" width="55" height="55" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="#f9a8d4" stroke="#333" strokeWidth="3" />
          <circle cx="30" cy="30" r="10" fill="#fc8d8d" stroke="#333" strokeWidth="2" />
          <circle cx="20" cy="18" r="3" fill="#fbbf24" /><circle cx="40" cy="20" r="2.5" fill="#60a5fa" />
          <circle cx="22" cy="40" r="2.5" fill="#34d399" /><circle cx="42" cy="38" r="3" fill="#f472b6" />
          <circle cx="34" cy="14" r="2" fill="#a78bfa" /><circle cx="18" cy="30" r="2" fill="#fb923c" />
        </svg>

        {/* SVG Candle — bottom left */}
        <svg className="doodle-float absolute bottom-20 left-[10%] hidden md:block cursor-pointer rotate-[-6deg]" width="40" height="65" viewBox="0 0 40 70">
          <rect x="12" y="25" width="16" height="38" rx="3" fill="#ef4444" stroke="#333" strokeWidth="2" />
          <rect x="14" y="25" width="4" height="30" rx="1" fill="white" opacity="0.25" />
          <rect x="18" y="18" width="4" height="10" rx="1" fill="#fbbf24" stroke="#333" strokeWidth="1" />
          <ellipse cx="20" cy="14" rx="6" ry="8" fill="#fbbf24" stroke="#333" strokeWidth="1.5" />
          <ellipse cx="20" cy="13" rx="3" ry="5" fill="#fb923c" opacity="0.7" />
          <ellipse cx="20" cy="12" rx="1.5" ry="3" fill="white" opacity="0.5" />
        </svg>

        {/* SVG Star — left mid */}
        <svg className="doodle-float absolute top-[35%] left-[3%] hidden md:block cursor-pointer rotate-[20deg]" width="45" height="45" viewBox="0 0 50 50">
          <polygon points="25,2 31,18 49,18 35,28 39,46 25,35 11,46 15,28 1,18 19,18" fill="#fbbf24" stroke="#333" strokeWidth="2.5" strokeLinejoin="round" />
          <polygon points="25,10 28,20 38,20 30,26 33,36 25,30 17,36 20,26 12,20 22,20" fill="white" opacity="0.3" />
        </svg>

        {/* SVG Heart — right mid */}
        <svg className="doodle-float absolute top-[30%] right-[4%] hidden md:block cursor-pointer rotate-[-10deg]" width="48" height="45" viewBox="0 0 50 46">
          <path d="M25,44 C15,35 0,27 0,14 C0,5 7,0 14,0 C19,0 23,3 25,7 C27,3 31,0 36,0 C43,0 50,5 50,14 C50,27 35,35 25,44Z" fill="#f472b6" stroke="#333" strokeWidth="2.5" />
          <path d="M12,12 Q14,6 20,10" fill="white" opacity="0.35" strokeLinecap="round" />
        </svg>

        {/* SVG Cloud — top center-left */}
        <svg className="doodle-float absolute top-4 left-[28%] hidden md:block cursor-pointer" width="60" height="38" viewBox="0 0 70 42">
          <ellipse cx="35" cy="28" rx="30" ry="13" fill="white" stroke="#333" strokeWidth="2" />
          <circle cx="22" cy="20" r="12" fill="white" stroke="#333" strokeWidth="2" />
          <circle cx="38" cy="14" r="14" fill="white" stroke="#333" strokeWidth="2" />
          <circle cx="50" cy="22" r="10" fill="white" stroke="#333" strokeWidth="2" />
          <ellipse cx="30" cy="16" rx="5" ry="3" fill="#e0f2fe" opacity="0.6" />
        </svg>

        {/* SVG Flower — bottom center-right */}
        <svg className="doodle-float absolute bottom-14 right-[28%] hidden md:block cursor-pointer rotate-[12deg]" width="50" height="50" viewBox="0 0 50 50">
          <circle cx="25" cy="12" r="9" fill="#f9a8d4" stroke="#333" strokeWidth="2" />
          <circle cx="12" cy="22" r="9" fill="#c4b5fd" stroke="#333" strokeWidth="2" />
          <circle cx="38" cy="22" r="9" fill="#93c5fd" stroke="#333" strokeWidth="2" />
          <circle cx="16" cy="35" r="9" fill="#fde68a" stroke="#333" strokeWidth="2" />
          <circle cx="34" cy="35" r="9" fill="#6ee7b7" stroke="#333" strokeWidth="2" />
          <circle cx="25" cy="25" r="8" fill="#fbbf24" stroke="#333" strokeWidth="2" />
          <circle cx="23" cy="23" r="2" fill="white" opacity="0.4" />
        </svg>

        {/* SVG Rainbow — top center-right */}
        <svg className="doodle-float absolute top-8 right-[30%] hidden md:block cursor-pointer rotate-[-5deg]" width="55" height="32" viewBox="0 0 60 35">
          <path d="M5,32 A25,25 0 0,1 55,32" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
          <path d="M9,32 A21,21 0 0,1 51,32" fill="none" stroke="#fb923c" strokeWidth="4" strokeLinecap="round" />
          <path d="M13,32 A17,17 0 0,1 47,32" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
          <path d="M17,32 A13,13 0 0,1 43,32" fill="none" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
          <path d="M21,32 A9,9 0 0,1 39,32" fill="none" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" />
          <path d="M25,32 A5,5 0 0,1 35,32" fill="none" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" />
        </svg>

        {/* SVG Cupcake — bottom far left */}
        <svg className="doodle-float absolute bottom-28 left-[22%] hidden md:block cursor-pointer rotate-[5deg]" width="42" height="52" viewBox="0 0 44 55">
          <path d="M8,28 L12,50 L32,50 L36,28 Z" fill="#fbbf24" stroke="#333" strokeWidth="2" strokeLinejoin="round" />
          <line x1="16" y1="30" x2="15" y2="48" stroke="#333" strokeWidth="1" opacity="0.2" />
          <line x1="22" y1="30" x2="22" y2="48" stroke="#333" strokeWidth="1" opacity="0.2" />
          <line x1="28" y1="30" x2="29" y2="48" stroke="#333" strokeWidth="1" opacity="0.2" />
          <ellipse cx="22" cy="22" rx="16" ry="10" fill="#f9a8d4" stroke="#333" strokeWidth="2" />
          <ellipse cx="22" cy="20" rx="12" ry="6" fill="#f472b6" stroke="#333" strokeWidth="1.5" />
          <circle cx="22" cy="12" r="4" fill="#ef4444" stroke="#333" strokeWidth="1.5" />
          <circle cx="22" cy="10" r="1.5" fill="white" opacity="0.5" />
        </svg>

        {/* SVG Mushroom — top far left */}
        <svg className="doodle-float absolute top-[18%] left-[16%] hidden md:block cursor-pointer rotate-[6deg]" width="45" height="50" viewBox="0 0 45 52">
          <rect x="17" y="28" width="11" height="20" rx="4" fill="#fde68a" stroke="#333" strokeWidth="2" />
          <ellipse cx="22.5" cy="28" rx="20" ry="16" fill="#ef4444" stroke="#333" strokeWidth="2.5" />
          <circle cx="14" cy="22" r="3" fill="white" opacity="0.8" />
          <circle cx="28" cy="18" r="4" fill="white" opacity="0.8" />
          <circle cx="20" cy="14" r="2.5" fill="white" opacity="0.8" />
        </svg>

        {/* SVG Pencil — right mid-top */}
        <svg className="doodle-float absolute top-[20%] right-[16%] hidden md:block cursor-pointer rotate-[35deg]" width="18" height="55" viewBox="0 0 18 60">
          <rect x="3" y="8" width="12" height="40" rx="1" fill="#fbbf24" stroke="#333" strokeWidth="2" />
          <rect x="3" y="8" width="12" height="6" rx="1" fill="#fb923c" stroke="#333" strokeWidth="1.5" />
          <polygon points="3,48 15,48 9,58" fill="#fde68a" stroke="#333" strokeWidth="2" strokeLinejoin="round" />
          <polygon points="7,53 11,53 9,58" fill="#333" />
          <rect x="5" y="2" width="8" height="8" rx="1" fill="#f9a8d4" stroke="#333" strokeWidth="1.5" />
        </svg>

        {/* SVG Butterfly — bottom center */}
        <svg className="doodle-float absolute bottom-12 left-[42%] hidden md:block cursor-pointer rotate-[-8deg]" width="50" height="40" viewBox="0 0 50 40">
          <ellipse cx="15" cy="15" rx="12" ry="10" fill="#c4b5fd" stroke="#333" strokeWidth="2" transform="rotate(-20 15 15)" />
          <ellipse cx="35" cy="15" rx="12" ry="10" fill="#93c5fd" stroke="#333" strokeWidth="2" transform="rotate(20 35 15)" />
          <ellipse cx="13" cy="28" rx="8" ry="7" fill="#f9a8d4" stroke="#333" strokeWidth="2" transform="rotate(-10 13 28)" />
          <ellipse cx="37" cy="28" rx="8" ry="7" fill="#fde68a" stroke="#333" strokeWidth="2" transform="rotate(10 37 28)" />
          <ellipse cx="25" cy="22" rx="3" ry="12" fill="#333" />
          <line x1="23" y1="8" x2="18" y2="2" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="27" y1="8" x2="32" y2="2" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="18" cy="1" r="1.5" fill="#333" />
          <circle cx="32" cy="1" r="1.5" fill="#333" />
        </svg>

        {/* SVG Ice Cream — right bottom */}
        <svg className="doodle-float absolute bottom-24 right-[18%] hidden md:block cursor-pointer rotate-[-12deg]" width="35" height="55" viewBox="0 0 35 58">
          <polygon points="10,28 25,28 17.5,55" fill="#fde68a" stroke="#333" strokeWidth="2" strokeLinejoin="round" />
          <line x1="13" y1="32" x2="16" y2="50" stroke="#d97706" strokeWidth="0.8" opacity="0.3" />
          <line x1="22" y1="32" x2="19" y2="50" stroke="#d97706" strokeWidth="0.8" opacity="0.3" />
          <circle cx="17.5" cy="20" r="10" fill="#f9a8d4" stroke="#333" strokeWidth="2" />
          <circle cx="10" cy="16" r="8" fill="#a78bfa" stroke="#333" strokeWidth="2" />
          <circle cx="25" cy="16" r="8" fill="#6ee7b7" stroke="#333" strokeWidth="2" />
          <circle cx="9" cy="14" r="2" fill="white" opacity="0.4" />
        </svg>

        <div className="relative z-10 flex flex-col items-center text-center px-6 pb-16 pt-4">
          {/* Title */}
          <div ref={titleRef}>
            <h1 className="font-display text-white text-5xl md:text-6xl lg:text-7xl leading-none mb-1 drop-shadow-md">
              <span className="block text-3xl md:text-4xl -mb-3 opacity-90 text-yellow-200 tracking-wide">bloom</span>
              together
            </h1>
            <p className="text-lg md:text-xl font-extrabold text-gray-900 mb-6 max-w-md">
              A community doodle garden 🌻
            </p>
          </div>

          {/* Mascots Row */}
          <div className="flex items-center gap-6 md:gap-12 mb-4">
            {/* SVG Smiling Sun */}
            <svg ref={sunRef} className="w-28 h-28 md:w-36 md:h-36 drop-shadow-xl hover:scale-110 transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" viewBox="0 0 100 100">
              <line x1="50" y1="5" x2="50" y2="18" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
              <line x1="50" y1="82" x2="50" y2="95" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
              <line x1="5" y1="50" x2="18" y2="50" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
              <line x1="82" y1="50" x2="95" y2="50" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
              <line x1="18" y1="18" x2="27" y2="27" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
              <line x1="73" y1="18" x2="64" y2="27" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
              <line x1="18" y1="82" x2="27" y2="73" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
              <line x1="73" y1="82" x2="64" y2="73" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
              <circle cx="50" cy="50" r="28" fill="#fbbf24" stroke="#333" strokeWidth="3" />
              <circle cx="50" cy="50" r="24" fill="#fde68a" />
              <circle cx="50" cy="50" r="28" fill="none" stroke="#333" strokeWidth="3" />
              <circle cx="40" cy="45" r="4" fill="#333" />
              <circle cx="60" cy="45" r="4" fill="#333" />
              <circle cx="41" cy="43.5" r="1.5" fill="white" />
              <circle cx="61" cy="43.5" r="1.5" fill="white" />
              <ellipse cx="33" cy="55" rx="5" ry="3" fill="#f9a8d4" opacity="0.5" />
              <ellipse cx="67" cy="55" rx="5" ry="3" fill="#f9a8d4" opacity="0.5" />
              <path d="M38,55 Q50,68 62,55" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>

            <div className="hidden md:block" ref={drawBtnRef}>
              <TransitionLink
                href="/draw"
                onClick={burstConfetti}
                className="bubbly-btn flex items-center gap-2 bg-primary text-white text-2xl md:text-3xl font-extrabold uppercase tracking-wider py-4 px-10 border-[4px] border-gray-900 shadow-[6px_6px_0px_0px_#111827] hover:shadow-[4px_4px_0px_0px_#111827] active:shadow-none"
              >
                <span className="material-symbols-outlined text-3xl md:text-4xl">edit</span>
                DRAW
              </TransitionLink>
            </div>

            {/* SVG Flower Sprout */}
            <svg ref={sproutRef} className="w-28 h-28 md:w-36 md:h-36 drop-shadow-xl hover:scale-110 transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" viewBox="0 0 100 100">
              <path d="M30,72 L35,92 L65,92 L70,72 Z" fill="#e8944a" stroke="#333" strokeWidth="2.5" strokeLinejoin="round" />
              <rect x="27" y="68" width="46" height="7" rx="3" fill="#f4a460" stroke="#333" strokeWidth="2" />
              <path d="M38,78 L40,88 L60,88 L62,78" fill="#d97706" opacity="0.3" />
              <path d="M50,68 Q50,50 48,38" stroke="#22c55e" strokeWidth="4" fill="none" strokeLinecap="round" />
              <ellipse cx="38" cy="48" rx="12" ry="7" fill="#4ade80" stroke="#333" strokeWidth="2" transform="rotate(-30 38 48)" />
              <line x1="38" y1="48" x2="46" y2="50" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" transform="rotate(-30 38 48)" />
              <ellipse cx="60" cy="42" rx="12" ry="7" fill="#4ade80" stroke="#333" strokeWidth="2" transform="rotate(25 60 42)" />
              <line x1="60" y1="42" x2="52" y2="44" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" transform="rotate(25 60 42)" />
              <circle cx="47" cy="30" r="8" fill="#f472b6" stroke="#333" strokeWidth="2" />
              <circle cx="55" cy="28" r="7" fill="#f9a8d4" stroke="#333" strokeWidth="2" />
              <circle cx="50" cy="24" r="6" fill="#ec4899" stroke="#333" strokeWidth="2" />
              <circle cx="50" cy="25" r="3" fill="#fbbf24" stroke="#333" strokeWidth="1.5" />
              <circle cx="49" cy="24" r="1" fill="white" opacity="0.5" />
            </svg>
          </div>

          {/* Mobile Draw Button */}
          <div className="md:hidden mb-2">
            <TransitionLink
              href="/draw"
              onClick={burstConfetti}
              className="bubbly-btn flex items-center justify-center gap-2 bg-primary text-white text-2xl font-extrabold uppercase tracking-wider py-4 px-10 w-full max-w-xs mx-auto border-[4px] border-gray-900 shadow-[6px_6px_0px_0px_#111827]"
            >
              <span className="material-symbols-outlined text-3xl">edit</span>
              DRAW
            </TransitionLink>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="relative -mt-1 z-10">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-12 md:h-16 block">
          <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,0 L0,0 Z" fill="var(--color-secondary)" />
        </svg>
      </div>

      {/* Bottom section - Yellow with navigation buttons */}
      <div className="relative bg-tertiary flex-1 flex items-start justify-center">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>

        <div className="relative z-10 w-full max-w-3xl px-6 pt-4 pb-8" ref={buttonsRef}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">

            <TransitionLink href="/draw" className="group h-full flex">
              <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[1.5rem] border-[3px] border-gray-900 shadow-[5px_5px_0px_0px_#111827] p-6 md:p-8 text-center hover:-translate-y-2 hover:shadow-[3px_3px_0px_0px_#111827] active:translate-y-0 active:shadow-none transition-all duration-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-6 -mt-6 opacity-60"></div>
                <span className="material-symbols-outlined text-5xl md:text-6xl text-primary mb-2 relative z-10 group-hover:scale-110 transition-transform block">brush</span>
                <p className="font-display text-base md:text-xl font-extrabold text-gray-900 relative z-10">Draw</p>
              </div>
            </TransitionLink>

            <TransitionLink href="/garden" className="group h-full flex">
              <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[1.5rem] border-[3px] border-gray-900 shadow-[5px_5px_0px_0px_#111827] p-6 md:p-8 text-center hover:-translate-y-2 hover:shadow-[3px_3px_0px_0px_#111827] active:translate-y-0 active:shadow-none transition-all duration-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -mr-6 -mt-6 opacity-60"></div>
                <span className="material-symbols-outlined text-5xl md:text-6xl text-green-500 mb-2 relative z-10 group-hover:scale-110 transition-transform block">park</span>
                <p className="font-display text-base md:text-xl font-extrabold text-gray-900 relative z-10">Garden</p>
              </div>
            </TransitionLink>

            <TransitionLink href="/about" className="group h-full flex">
              <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[1.5rem] border-[3px] border-gray-900 shadow-[5px_5px_0px_0px_#111827] p-6 md:p-8 text-center hover:-translate-y-2 hover:shadow-[3px_3px_0px_0px_#111827] active:translate-y-0 active:shadow-none transition-all duration-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-6 -mt-6 opacity-60"></div>
                <span className="material-symbols-outlined text-5xl md:text-6xl text-purple-500 mb-2 relative z-10 group-hover:scale-110 transition-transform block">info</span>
                <p className="font-display text-base md:text-xl font-extrabold text-gray-900 relative z-10">How it Works</p>
              </div>
            </TransitionLink>

            <TransitionLink href="/profile" className="group h-full flex">
              <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[1.5rem] border-[3px] border-gray-900 shadow-[5px_5px_0px_0px_#111827] p-6 md:p-8 text-center hover:-translate-y-2 hover:shadow-[3px_3px_0px_0px_#111827] active:translate-y-0 active:shadow-none transition-all duration-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-pink-100 rounded-full -mr-6 -mt-6 opacity-60"></div>
                <span className="material-symbols-outlined text-5xl md:text-6xl text-secondary mb-2 relative z-10 group-hover:scale-110 transition-transform block">person</span>
                <p className="font-display text-base md:text-xl font-extrabold text-gray-900 relative z-10">Profile</p>
              </div>
            </TransitionLink>

          </div>

          <p className="text-center mt-4 font-display text-base text-gray-800/70 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-pink-500 text-lg">favorite</span>
            Join thousands of doodlers
            <span className="material-symbols-outlined text-pink-500 text-lg">favorite</span>
          </p>
        </div>
      </div>
    </div>
  );
}
