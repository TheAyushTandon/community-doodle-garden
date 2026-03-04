'use client';

import { useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import DrawingCanvas from '@/components/DrawingCanvas';
import PlantingModal from '@/components/PlantingModal';
import TransitionLink from '@/components/TransitionLink';

type PageState = 'drawing' | 'submitting' | 'success';

export default function DrawPage() {
    const { data: session } = useSession();
    const [capturedImage, setCapturedImage] = useState<string>('');
    const [flowerName, setFlowerName] = useState('');
    const [pageState, setPageState] = useState<PageState>('drawing');
    const [error, setError] = useState('');
    const [savedImageUrl, setSavedImageUrl] = useState('');
    const [savedFlowerName, setSavedFlowerName] = useState('');
    const resetCanvasRef = useRef<(() => void) | null>(null);

    const handleCapture = useCallback((dataUrl: string) => {
        setCapturedImage(dataUrl);
    }, []);

    const handleSubmit = async () => {
        if (!capturedImage) {
            setError('Please draw something first!');
            return;
        }
        if (!flowerName.trim()) {
            setError('Give your flower a name! 🌸');
            return;
        }
        if (!session) {
            setError('Please sign in to plant your flower in the garden.');
            return;
        }

        setError('');
        setPageState('submitting');

        try {
            const res = await fetch('/api/doodles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_data: capturedImage,
                    flower_name: flowerName.trim(),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Something went wrong');
            }

            setSavedImageUrl(capturedImage);
            setSavedFlowerName(flowerName.trim());
            setPageState('success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save. Please try again!');
            setPageState('drawing');
        }
    };

    const handleDrawAnother = () => {
        setFlowerName('');
        setCapturedImage('');
        setError('');
        setPageState('drawing');
        // Signal canvas to clear – we'll reload the component trick
        setSavedImageUrl('');
    };

    return (
        <>
            {/* Success Modal */}
            {pageState === 'success' && (
                <PlantingModal
                    flowerName={savedFlowerName}
                    imageDataUrl={savedImageUrl}
                    onClose={handleDrawAnother}
                    onDrawAnother={handleDrawAnother}
                />
            )}

            <div className="flex-1 bg-blue-50 relative overflow-hidden min-h-screen">
                <div className="absolute inset-0 bg-pattern opacity-5 pointer-events-none" />

                {/* Floating Decorations */}
                <div className="absolute top-16 right-8 text-primary/20 animate-pulse pointer-events-none" style={{ animationDuration: '3s' }}>
                    <span className="material-symbols-outlined text-8xl">local_florist</span>
                </div>
                <div className="absolute bottom-20 left-6 text-secondary/20 animate-bounce pointer-events-none" style={{ animationDuration: '4s' }}>
                    <span className="material-symbols-outlined text-7xl">palette</span>
                </div>

                <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <TransitionLink href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-white/70 px-4 py-2 rounded-full font-bold transition-all border-2 border-transparent hover:border-gray-200">
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back
                        </TransitionLink>

                        <h1 className="font-display text-2xl md:text-4xl font-extrabold text-gray-900 bg-white px-4 md:px-6 py-2 md:py-3 rounded-[1.5rem] border-[3px] border-gray-900 shadow-[4px_4px_0px_0px_#111827] -rotate-1">
                            🖌️ Draw Your Flower
                        </h1>

                        {/* Sign-in nudge */}
                        {!session && (
                            <TransitionLink href="/login" className="bubbly-btn bg-primary text-white border-[2px] border-gray-900 shadow-[3px_3px_0px_0px_#111827] text-sm flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">login</span>
                                Sign in to Save
                            </TransitionLink>
                        )}
                        {session && (
                            <div className="hidden sm:flex items-center gap-2 bg-green-100 border-[2px] border-green-400 rounded-full px-4 py-2 text-green-700 font-bold text-sm">
                                <span className="material-symbols-outlined text-base text-green-500">check_circle</span>
                                Signed in as {session.user?.name?.split(' ')[0] || 'you'}
                            </div>
                        )}
                    </div>

                    {/* Canvas */}
                    <DrawingCanvas onCapture={handleCapture} />

                    {/* Submit Section */}
                    <div className="mt-6 bg-white rounded-[2rem] border-[3px] border-gray-900 shadow-[5px_5px_0px_0px_#111827] p-6 flex flex-col sm:flex-row gap-4 items-center">
                        {/* Flower Name Input */}
                        <div className="flex-1 w-full">
                            <label className="font-display text-sm font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                                Name your flower
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl pointer-events-none">🌸</span>
                                <input
                                    type="text"
                                    maxLength={50}
                                    value={flowerName}
                                    onChange={e => setFlowerName(e.target.value)}
                                    placeholder="e.g. Sunshine Daisy, Neon Tulip..."
                                    className="w-full pl-12 pr-4 py-3 rounded-[1.2rem] border-[2px] border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 font-display text-lg font-medium outline-none transition-all bg-gray-50 focus:bg-white"
                                    onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col items-center gap-2 sm:items-end">
                            {error && (
                                <p className="text-red-500 font-bold text-sm font-display flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base">error</span>
                                    {error}
                                </p>
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={pageState === 'submitting'}
                                className="bubbly-btn bg-primary text-white border-[3px] border-gray-900 shadow-[5px_5px_0px_0px_#111827] text-xl flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed min-w-[180px] justify-center"
                            >
                                {pageState === 'submitting' ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                                        Planting…
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-xl">local_florist</span>
                                        Plant It! 🌱
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="mt-4 flex flex-wrap gap-3 justify-center text-sm font-medium text-gray-400">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">touch_app</span> Touch & mouse supported</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">keyboard</span> Ctrl+Z to undo</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">palette</span> Pick any color</span>
                    </div>
                </div>
            </div>
        </>
    );
}
