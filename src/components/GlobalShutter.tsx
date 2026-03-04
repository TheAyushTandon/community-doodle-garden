import React from 'react';

export default function GlobalShutter() {
    return (
        <div
            id="global-shutter"
            className="fixed top-0 left-0 w-full h-[120vh] z-[99999] overflow-hidden border-b-8 border-slate-900"
            style={{
                transform: 'translateY(0%)',
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBOsJa7RMIlsVnsM-GxiCU1nH9imvUzYdiNZ1qMUzFpmd-48QWysBPCvrXtS4fyfW5Vo8V0_YZdcIgm4MjcNxdhLQeS5vOjc9YGOEEjoqbg4d1uuNwfY3sxoFB6lp--5v1vl-H1AGYS2Dhsp4qUDBzRGjy40LnFST3qhJouMlcFCTkEJxKsekiPfgOHhYZIPwh1FEhwQpBnh8dwYQKO2dTKQsG1bkfC0e9dBrCLCP2apayFB4Dujcu7eJUGCZ_gaT1jbjPcfvKkw4o')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* ── Mobile layout: centered flex column ── */}
            <div className="flex md:hidden h-[100vh] flex-col items-center justify-center gap-4 px-6">
                <div className="shutter-sticker bg-[#2bee6c] px-8 py-5 rounded-[2.5rem] shadow-xl border-4 border-slate-900 -rotate-2">
                    <p className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em] text-center drop-shadow-md">
                        Unleash your<br />creativity
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="shutter-sticker bg-white px-5 py-2.5 rounded-full shadow-lg border-4 border-slate-900 rotate-[-6deg]">
                        <p className="text-slate-900 text-lg font-black uppercase">Dream it.</p>
                    </div>
                    <div className="shutter-sticker bg-white px-5 py-2.5 rounded-full shadow-lg border-4 border-slate-900 rotate-[6deg]">
                        <p className="text-slate-900 text-lg font-black uppercase">Design it.</p>
                    </div>
                </div>
                <div className="shutter-sticker bg-[#ff6b6b] px-7 py-3 rounded-full shadow-lg border-4 border-slate-900 rotate-1">
                    <p className="text-slate-900 text-2xl font-black uppercase">Build it!</p>
                </div>
            </div>

            {/* ── Desktop layout: absolute positioned stickers ── */}
            <div className="hidden md:block relative w-full h-[100vh] max-w-[1200px] mx-auto">
                <div className="shutter-sticker absolute top-[25%] left-[25%] transform -translate-x-1/2 -rotate-12 bg-white px-6 py-3 rounded-full shadow-lg border-4 border-slate-900">
                    <p className="text-slate-900 text-3xl font-black leading-tight tracking-tighter uppercase text-center">Dream it.</p>
                </div>
                <div className="shutter-sticker absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2bee6c] px-10 py-5 rounded-[3rem] shadow-xl border-4 border-slate-900 -rotate-3 z-20">
                    <p id="shutter-text" className="text-slate-900 text-7xl font-black leading-tight tracking-[-0.033em] text-center drop-shadow-md">
                        Unleash your<br />creativity
                    </p>
                </div>
                <div className="shutter-sticker absolute top-[60%] right-[15%] transform rotate-6 bg-white px-6 py-3 rounded-full shadow-lg border-4 border-slate-900">
                    <p className="text-slate-900 text-2xl font-black leading-tight tracking-tighter uppercase text-center">Design it.</p>
                </div>
                <div className="shutter-sticker absolute bottom-[20%] left-[30%] transform -rotate-6 bg-[#ff6b6b] px-8 py-4 rounded-full shadow-lg border-4 border-slate-900">
                    <p className="text-slate-900 text-4xl font-black leading-tight tracking-tighter uppercase text-center">Build it!</p>
                </div>
                {/* Decorative shapes */}
                <div className="shutter-sticker absolute top-20 right-1/4 text-yellow-400 rotate-45">
                    <span className="material-symbols-outlined text-7xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <div className="shutter-sticker absolute bottom-40 left-32 text-blue-400 -rotate-12">
                    <span className="material-symbols-outlined text-8xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
                </div>
                <div className="shutter-sticker absolute top-1/3 right-10 text-[#2bee6c] rotate-12">
                    <span className="material-symbols-outlined text-6xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                </div>
            </div>

            {/* ── Single shared progress bar — always visible, not a shutter-sticker ── */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-56 md:w-64 flex flex-col gap-2 z-10">
                <div className="rounded-full border-2 border-slate-900 overflow-hidden p-[2px] shadow-inner h-5 md:h-6 bg-white">
                    <div id="shutter-progress" className="h-full rounded-full bg-[#2bee6c] border-r-2 border-slate-900" style={{ width: '0%' }} />
                </div>
                <p className="text-center font-display font-bold text-slate-900 text-xs md:text-sm tracking-widest bg-white/70 rounded-full px-2 py-1 border-2 border-slate-900">
                    BLOOMING...
                </p>
            </div>
        </div>
    );
}
