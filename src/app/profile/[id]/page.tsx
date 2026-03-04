'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TransitionLink from '@/components/TransitionLink';

interface Comment { id: string; content: string; username: string | null; }
interface ProfileDoodle {
    id: string;
    flower_name: string;
    image_url: string;
    star_count: number;
    timestamp: string;
    comments: Comment[];
}
interface PublicProfileData {
    username: string | null;
    avatar_url: string | null;
    stats: { total_planted: number; total_stars_received: number; };
    doodles: ProfileDoodle[];
}

function DoodleDetailModal({ doodle, onClose }: { doodle: ProfileDoodle, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[2.5rem] border-[4px] border-gray-900 shadow-[10px_10px_0px_0px_#111827] p-6 max-w-md w-full relative max-h-[90vh] flex flex-col">
                <button onClick={onClose}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full border-[2px] border-gray-900 flex items-center justify-center hover:bg-gray-100 transition-colors z-10 shrink-0">
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>

                <div className="overflow-y-auto pr-2 custom-scrollbar flex flex-col items-center text-center">
                    <div className="w-40 h-40 rounded-[2rem] border-[3px] border-gray-900 shadow-[4px_4px_0_0_#111827] overflow-hidden bg-gray-50 mb-4 shrink-0 relative">
                        {doodle.image_url
                            ? <img src={doodle.image_url} alt={doodle.flower_name} className="w-full h-full object-contain" />
                            : <div className="w-full h-full flex items-center justify-center text-5xl">🌸</div>
                        }
                    </div>

                    <h2 className="font-display text-2xl font-extrabold text-gray-900 mb-0.5">{doodle.flower_name}</h2>
                    <p className="text-gray-500 text-sm font-medium mb-4">
                        Planted on {new Date(doodle.timestamp).toLocaleDateString()}
                    </p>

                    <div className="flex justify-center mb-5 shrink-0 w-full">
                        <div className="bg-yellow-100 text-yellow-800 border-[2px] border-gray-900 shadow-[3px_3px_0_0_#111827] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
                            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            {doodle.star_count} Stars
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="border-t-[2px] border-gray-200 pt-4 mt-2 w-full text-left">
                        <h3 className="font-display font-bold text-gray-700 mb-3 text-sm">
                            💬 Comments ({doodle.comments.length})
                        </h3>
                        <div className="space-y-2">
                            {doodle.comments.length === 0 && (
                                <p className="text-gray-400 text-sm text-center py-4 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">No comments yet.</p>
                            )}
                            {doodle.comments.map(c => (
                                <div key={c.id} className="bg-gray-50 rounded-2xl border border-gray-200 px-3 py-2">
                                    <span className="font-bold text-xs text-gray-700">{c.username || 'Gardener'} </span>
                                    <span className="text-sm text-gray-600 ml-1 break-words">{c.content}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PublicProfile() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<PublicProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDoodle, setSelectedDoodle] = useState<ProfileDoodle | null>(null);

    useEffect(() => {
        if (!params.id) return;
        fetch(`/api/user/public/${params.id}`)
            .then(res => res.json())
            .then(d => {
                if (d.profile) setData(d.profile);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
                    <p className="font-display text-2xl font-bold text-gray-600 mt-4">Visiting the garden...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background-light p-6 text-center">
                <span className="material-symbols-outlined text-8xl text-red-300 mb-6">person_off</span>
                <h1 className="text-4xl font-black text-slate-900 mb-4">Gardener Not Found</h1>
                <p className="text-xl text-slate-600 mb-8 font-bold">This sketchbook must be hidden or doesn't exist.</p>
                <TransitionLink href="/garden" className="bubbly-btn bg-primary text-white text-xl px-10 py-4 border-4 border-slate-900 shadow-[6px_6px_0_0_#111827]">
                    Back to Garden
                </TransitionLink>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-background-light p-10 font-display relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-10 pointer-events-none"></div>

            <div className="max-w-[1200px] mx-auto relative z-10 pt-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-8 border-slate-900 pb-6">
                    <div>
                        <h1 className="text-6xl font-black text-slate-900 tracking-[-0.03em] drop-shadow-sm mb-2">
                            {data.username || 'Gardener'}'s Sketchbook
                        </h1>
                        <p className="text-2xl text-slate-700 font-bold italic opacity-60">
                            Exploring a collection of hand-drawn flowers
                        </p>
                    </div>
                    <TransitionLink href="/profile" className="bubbly-btn bg-secondary text-slate-900 border-4 border-slate-900 text-xl px-6 py-2 mt-6 md:mt-0">
                        <span className="material-symbols-outlined mr-2 font-bold">arrow_back</span>
                        My Profile
                    </TransitionLink>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Stats Card */}
                    <div className="col-span-1 bg-primary/10 rounded-[2rem] border-4 border-slate-900 p-8 shadow-[8px_8px_0_0_#111827]">
                        <div className="text-center mb-6">
                            <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-slate-900 flex items-center justify-center text-5xl mb-4 overflow-hidden shadow-inner">
                                {data.avatar_url ? <img src={data.avatar_url} className="w-full h-full object-cover" /> : '🧑‍🌾'}
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 truncate">{data.username || 'Gardener'}</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-white p-4 rounded-full border-2 border-slate-900">
                                <span className="material-symbols-outlined text-3xl text-primary font-bold">local_florist</span>
                                <div>
                                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block leading-none mb-1">Flowers</span>
                                    <span className="text-2xl font-black text-slate-900">{data.stats.total_planted}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white p-4 rounded-full border-2 border-slate-900">
                                <span className="material-symbols-outlined text-3xl text-yellow-500 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <div>
                                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block leading-none mb-1">Stars</span>
                                    <span className="text-2xl font-black text-slate-900">{data.stats.total_stars_received}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Doodles Grid */}
                    <div className="col-span-1 md:col-span-2 bg-white rounded-[3rem] border-4 border-slate-900 p-8 shadow-[8px_8px_0_0_#111827]">
                        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-secondary text-4xl">folder_shared</span>
                            Shared Gallery
                        </h2>

                        {data.doodles.length === 0 ? (
                            <div className="py-20 text-center">
                                <p className="text-xl font-bold text-slate-400">This gardener hasn't planted any flowers yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                {data.doodles.map(doodle => (
                                    <button
                                        key={doodle.id}
                                        onClick={() => setSelectedDoodle(doodle)}
                                        className="group relative aspect-square bg-slate-50 rounded-2xl border-2 border-slate-900 overflow-hidden hover:-translate-y-1 transition-transform shadow-[4px_4px_0_0_#111827]"
                                    >
                                        {doodle.image_url ? (
                                            <img src={doodle.image_url} alt={doodle.flower_name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">🌸</div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-slate-900/10 backdrop-blur-[2px] p-2">
                                            <div className="truncate font-bold text-xs text-slate-900">{doodle.flower_name}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {selectedDoodle && <DoodleDetailModal doodle={selectedDoodle} onClose={() => setSelectedDoodle(null)} />}
            </div>
        </div>
    );
}
