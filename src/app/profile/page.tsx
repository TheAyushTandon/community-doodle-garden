'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
interface ProfileData {
    stats: { total_planted: number; total_stars_received: number; };
    doodles: ProfileDoodle[];
}

function DoodleDetailModal({ doodle, onClose, onDeleteDoodle, onDeleteComment }: { doodle: ProfileDoodle, onClose: () => void, onDeleteDoodle: (id: string) => void, onDeleteComment: (doodleId: string, commentId: string) => void }) {
    const [deletingDoodle, setDeletingDoodle] = useState(false);
    const [confirmingDoodle, setConfirmingDoodle] = useState(false);
    const [deletingList, setDeletingList] = useState<string[]>([]);
    const [confirmingList, setConfirmingList] = useState<string[]>([]);

    const handleDeleteDoodle = async () => {
        if (!confirmingDoodle) {
            setConfirmingDoodle(true);
            return;
        }

        setDeletingDoodle(true);
        try {
            console.log(`Sending DELETE to /api/doodles/${doodle.id}`);
            const res = await fetch(`/api/doodles/${doodle.id}`, { method: 'DELETE' });
            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                onDeleteDoodle(doodle.id);
                onClose();
            } else {
                alert(`Backend Error: ${data.error || res.statusText || 'Unknown backend error'}`);
                setConfirmingDoodle(false);
            }
        } catch (e) {
            alert(`Network Error: ${e instanceof Error ? e.message : 'Unknown network failure'}`);
            setConfirmingDoodle(false);
        }
        setDeletingDoodle(false);
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirmingList.includes(commentId)) {
            setConfirmingList(prev => [...prev, commentId]);
            return;
        }

        setDeletingList(prev => [...prev, commentId]);
        try {
            console.log(`Sending DELETE to /api/comments/${commentId}`);
            const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                onDeleteComment(doodle.id, commentId);
            } else {
                alert(`Backend Error: ${data.error || res.statusText || 'Unknown backend error'}`);
            }
        } catch (e) {
            alert(`Network Error: ${e instanceof Error ? e.message : 'Unknown network failure'}`);
        }
        setDeletingList(prev => prev.filter(id => id !== commentId));
        setConfirmingList(prev => prev.filter(id => id !== commentId));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[2.5rem] border-[4px] border-gray-900 shadow-[10px_10px_0px_0px_#111827] p-6 max-w-md w-full relative max-h-[90vh] flex flex-col">
                <button onClick={onClose}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full border-[2px] border-gray-900 flex items-center justify-center hover:bg-gray-100 transition-colors z-10 shrink-0">
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>

                <div className="overflow-y-auto pr-2 custom-scrollbar flex flex-col items-center">
                    {/* Image */}
                    <div className="w-40 h-40 rounded-[2rem] border-[3px] border-gray-900 shadow-[4px_4px_0_0_#111827] overflow-hidden bg-gray-50 mb-4 shrink-0 relative">
                        {doodle.image_url
                            ? <img src={doodle.image_url} alt={doodle.flower_name} className="w-full h-full object-contain" />
                            : <div className="w-full h-full flex items-center justify-center text-5xl">🌸</div>
                        }

                        {confirmingDoodle && (
                            <div className="absolute inset-0 bg-red-500/90 flex flex-col items-center justify-center p-2 text-center fade-in">
                                <span className="text-white font-bold text-sm mb-2">Uproot forever?</span>
                                <div className="flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); setConfirmingDoodle(false); }} className="px-3 py-1 bg-white/20 hover:bg-white/40 text-white rounded-full text-xs font-bold transition-colors">Cancel</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteDoodle(); }} disabled={deletingDoodle} className="px-3 py-1 bg-red-900/50 hover:bg-red-900/80 text-white rounded-full text-xs font-bold flex items-center justify-center min-w-[50px] transition-colors">{deletingDoodle ? <span className="material-symbols-outlined text-[10px] animate-spin">sync</span> : 'Yes'}</button>
                                </div>
                            </div>
                        )}
                        {!confirmingDoodle && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteDoodle(); }}
                                title="Uproot Flower"
                                className="absolute bottom-2 right-2 bg-red-100/90 border border-red-500 text-red-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-200 hover:scale-110 transition-all cursor-pointer shadow-sm"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        )}
                    </div>

                    <h2 className="font-display text-2xl font-extrabold text-gray-900 text-center mb-0.5">{doodle.flower_name}</h2>
                    <p className="text-center text-gray-500 text-sm font-medium mb-4">
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
                                <div key={c.id} className="bg-gray-50 rounded-2xl border border-gray-200 px-3 py-2 flex justify-between items-start gap-2">
                                    <div className="flex-1">
                                        <span className="font-bold text-xs text-gray-700">{c.username || 'Gardener'} </span>
                                        <span className="text-sm text-gray-600 ml-1 break-words">{c.content}</span>
                                    </div>
                                    {confirmingList.includes(c.id) ? (
                                        <div className="flex items-center gap-1 shrink-0 fade-in">
                                            <span className="text-[10px] font-bold text-red-600 uppercase mr-1">Sure?</span>
                                            <button onClick={() => setConfirmingList(prev => prev.filter(id => id !== c.id))} className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300">
                                                <span className="material-symbols-outlined text-[12px]">close</span>
                                            </button>
                                            <button onClick={() => handleDeleteComment(c.id)} disabled={deletingList.includes(c.id)} className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50">
                                                {deletingList.includes(c.id) ? <span className="material-symbols-outlined text-[12px] animate-spin">sync</span> : <span className="material-symbols-outlined text-[12px]">check</span>}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleDeleteComment(c.id)}
                                            title="Delete comment"
                                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-7 h-7 flex items-center justify-center rounded-lg transition-all shrink-0"
                                        >
                                            <span className="material-symbols-outlined text-[1rem]">delete</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Profile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [data, setData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDoodle, setSelectedDoodle] = useState<ProfileDoodle | null>(null);

    // Friends state
    const [friends, setFriends] = useState<{ id: string, username: string, avatar_url: string }[]>([]);
    const [myUid, setMyUid] = useState<string>('');
    const [friendUidInput, setFriendUidInput] = useState('');
    const [addingFriend, setAddingFriend] = useState(false);
    const [addFriendError, setAddFriendError] = useState('');

    // Edit Profile state
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ username: '', avatar_url: '', linkedin_url: '', github_url: '' });
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            // Fetch profile
            fetch('/api/user/profile')
                .then(res => res.json())
                .then(d => {
                    if (d.doodles) setData(d);
                    if (d.id) setMyUid(d.id);
                    if (d.friends) setFriends(d.friends);
                    setEditData({
                        username: d.username || '',
                        avatar_url: d.avatar_url || '',
                        linkedin_url: d.linkedin_url || '',
                        github_url: d.github_url || ''
                    });
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [status, router]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            const d = await res.json();
            if (res.ok) {
                // Technically session name doesn't update until next login,
                // but we can just close the modal.
                setIsEditing(false);
                alert('Profile updated successfully! 🌷');
            } else {
                alert(d.error || 'Failed to update profile');
            }
        } catch {
            alert('Connection error');
        }
        setSavingProfile(false);
    };

    const handleAddFriend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!friendUidInput.trim()) return;
        setAddingFriend(true);
        setAddFriendError('');
        try {
            const res = await fetch('/api/user/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friend_uid: friendUidInput.trim() }),
            });
            const d = await res.json();
            if (res.ok) {
                setFriends(prev => [...prev, { id: d.friend.id, username: d.friend.username, avatar_url: '' }]);
                setFriendUidInput('');
                alert('Friend added! 🌻');
            } else {
                setAddFriendError(d.error || 'Failed to add friend');
            }
        } catch {
            setAddFriendError('Connection error');
        }
        setAddingFriend(false);
    };

    const copyUid = () => {
        navigator.clipboard.writeText(myUid);
        alert('UID copied to clipboard! Share it with your friends. 🎀');
    };

    const handleDeleteDoodle = (id: string) => {
        setData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                stats: { ...prev.stats, total_planted: prev.stats.total_planted - 1 },
                doodles: prev.doodles.filter(d => d.id !== id),
            };
        });
    };

    const handleDeleteComment = (doodleId: string, commentId: string) => {
        setData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                doodles: prev.doodles.map(d => {
                    if (d.id === doodleId) {
                        return { ...d, comments: d.comments.filter(c => c.id !== commentId) };
                    }
                    return d;
                })
            };
        });
        if (selectedDoodle && selectedDoodle.id === doodleId) {
            setSelectedDoodle(prev => prev ? { ...prev, comments: prev.comments.filter(c => c.id !== commentId) } : null);
        }
    };


    if (status === 'loading' || loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
                    <p className="font-display text-2xl font-bold text-gray-600 mt-4">Loading your sketchbook...</p>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="flex-1 bg-background-light p-10 font-display relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-pattern opacity-10 pointer-events-none"></div>

            <div className="max-w-[1200px] mx-auto relative z-10 pt-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-8 border-slate-900 pb-6">
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-6xl font-black text-slate-900 tracking-[-0.03em] drop-shadow-sm mb-2">My Sketchbook</h1>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-10 h-10 rounded-full border-2 border-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-600 mt-2"
                                title="Edit Profile"
                            >
                                <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                        </div>
                        <p className="text-2xl text-slate-700 font-bold">
                            Welcome, <span className="text-primary">{editData.username || session.user?.name || session.user?.email}</span>!
                        </p>
                    </div>
                    <TransitionLink href="/" className="bubbly-btn bg-secondary text-slate-900 border-4 border-slate-900 text-xl px-6 py-2 mt-6 md:mt-0">
                        <span className="material-symbols-outlined mr-2 font-bold">home</span>
                        Back Home
                    </TransitionLink>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Left Column: Stats & Friends */}
                    <div className="col-span-1 space-y-8">
                        {/* Stats Card */}
                        <div className="bg-[#ff6b6b] rounded-[2rem] border-4 border-slate-900 p-8 shadow-[8px_8px_0_0_rgba(15,23,42,1)] transform hover:-translate-y-2 transition-transform">
                            <h2 className="text-3xl font-black text-slate-900 mb-6 border-b-4 border-slate-900/20 pb-4">Stats</h2>
                            <div className="flex items-center gap-4 mb-4 bg-white/30 p-4 rounded-full border-2 border-slate-900">
                                <span className="material-symbols-outlined text-4xl text-slate-900 bg-white rounded-full p-2 border-2 border-slate-900">local_florist</span>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 uppercase tracking-wider text-sm">Planted</span>
                                    <span className="text-3xl font-black text-slate-900">{data?.stats?.total_planted || 0}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white/30 p-4 rounded-full border-2 border-slate-900">
                                <span className="material-symbols-outlined text-4xl text-slate-900 bg-white rounded-full p-2 border-2 border-slate-900" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 uppercase tracking-wider text-sm">Stars Received</span>
                                    <span className="text-3xl font-black text-slate-900">{data?.stats?.total_stars_received || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Friends Card */}
                        <div className="bg-[#4facfe] rounded-[2rem] border-4 border-slate-900 p-8 shadow-[8px_8px_0_0_rgba(15,23,42,1)] flex flex-col">
                            <h2 className="text-3xl font-black text-slate-900 mb-6 border-b-4 border-slate-900/20 pb-4">Garden Mates</h2>

                            {/* My UID */}
                            <div className="bg-white/30 rounded-2xl p-4 border-2 border-slate-900 mb-6 group">
                                <label className="text-[10px] font-black uppercase text-slate-900 mb-1 block opacity-60">My Friend UID</label>
                                <div className="flex items-center justify-between gap-2 overflow-hidden">
                                    <code className="text-[11px] font-bold text-slate-900 truncate flex-1">{myUid || 'Generating...'}</code>
                                    <button onClick={copyUid} className="shrink-0 bg-white p-1.5 rounded-lg border-2 border-slate-900 hover:bg-slate-100 transition-colors">
                                        <span className="material-symbols-outlined text-sm">content_copy</span>
                                    </button>
                                </div>
                            </div>

                            {/* Add Friend Form */}
                            <form onSubmit={handleAddFriend} className="mb-6">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={friendUidInput}
                                        onChange={e => setFriendUidInput(e.target.value)}
                                        placeholder="Friend's UID..."
                                        className="flex-1 px-4 py-2 rounded-xl border-2 border-slate-900 text-sm font-bold outline-none focus:ring-2 ring-primary/30 min-w-0"
                                    />
                                    <button type="submit" disabled={addingFriend} className="bg-slate-900 text-white rounded-xl px-4 font-bold border-2 border-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-50">
                                        {addingFriend ? '...' : 'Add'}
                                    </button>
                                </div>
                                {addFriendError && <p className="text-[10px] text-red-100 font-bold mt-2 bg-red-600/50 px-2 py-1 rounded-lg border border-red-700">{addFriendError}</p>}
                            </form>

                            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                {friends.length === 0 && (
                                    <div className="text-center py-6 bg-white/10 rounded-[1.5rem] border-2 border-slate-900 border-dashed">
                                        <p className="text-sm font-bold text-slate-900 opacity-60">No mates added yet!</p>
                                    </div>
                                )}
                                {friends.map(friend => (
                                    <TransitionLink key={friend.id} href={`/profile/${friend.id}`} className="flex items-center gap-3 bg-white p-3 rounded-full border-2 border-slate-900 hover:translate-x-1 hover:bg-slate-50 transition-all group">
                                        <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-200 flex items-center justify-center text-lg overflow-hidden shrink-0">
                                            {friend.avatar_url ? <img src={friend.avatar_url} className="w-full h-full object-cover" /> : '🧑‍🌾'}
                                        </div>
                                        <div className="flex-1 truncate">
                                            <span className="font-bold text-slate-900 block truncate">{friend.username || 'Gardener'}</span>
                                            <span className="text-[10px] text-slate-400 font-bold">View Sketchbook →</span>
                                        </div>
                                    </TransitionLink>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Doodles Grid */}
                    <div className="col-span-1 md:col-span-2 bg-white rounded-[3rem] border-4 border-slate-900 p-8 shadow-[8px_8px_0_0_rgba(15,23,42,1)]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-4xl">palette</span>
                                Recent Doodles
                            </h2>
                            {data && data.doodles.length > 0 && (
                                <TransitionLink href="/draw" className="bubbly-btn bg-secondary text-gray-900 border-2 border-gray-900 shadow-[2px_2px_0_0_#111827] text-sm py-1.5 px-4">
                                    Plant More 🌱
                                </TransitionLink>
                            )}
                        </div>

                        {!data || data.doodles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <span className="material-symbols-outlined text-8xl text-gray-200 mb-4">draw</span>
                                <p className="text-2xl font-bold text-gray-400 mb-2">No doodles yet!</p>
                                <p className="text-lg text-gray-400 font-semibold mb-8">Time to plant your first flower in the garden.</p>
                                <TransitionLink
                                    href="/draw"
                                    className="bubbly-btn bg-primary text-white text-xl px-8 py-3 border-4 border-slate-900 shadow-[6px_6px_0_0_rgba(15,23,42,1)]"
                                >
                                    <span className="material-symbols-outlined mr-2">brush</span>
                                    Start Drawing
                                </TransitionLink>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2 custom-scrollbar max-h-[60vh] overflow-y-auto pr-2 pb-2">
                                {data.doodles.map(doodle => (
                                    <button
                                        key={doodle.id}
                                        onClick={() => setSelectedDoodle(doodle)}
                                        className="group relative aspect-square bg-gray-50 rounded-2xl border-2 border-gray-900 cursor-pointer overflow-hidden transition-all hover:-translate-y-1 shadow-[4px_4px_0_0_#111827]"
                                    >
                                        {doodle.image_url ? (
                                            <img src={doodle.image_url} alt={doodle.flower_name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl">🌸</div>
                                        )}
                                        {/* Floating stat chips */}
                                        <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                                            <div className="bg-white/90 backdrop-blur-sm border border-gray-900 px-2 py-0.5 rounded-full shadow-sm text-xs font-bold text-gray-700 max-w-[60%] truncate">
                                                {doodle.flower_name}
                                            </div>
                                            <div className="flex gap-1">
                                                {doodle.star_count > 0 && (
                                                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 text-[10px] font-bold shadow-sm">
                                                        <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                        {doodle.star_count}
                                                    </div>
                                                )}
                                                {doodle.comments.length > 0 && (
                                                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 text-[10px] font-bold shadow-sm">
                                                        <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                                                        {doodle.comments.length}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {selectedDoodle && (
                    <DoodleDetailModal
                        doodle={selectedDoodle}
                        onClose={() => setSelectedDoodle(null)}
                        onDeleteDoodle={handleDeleteDoodle}
                        onDeleteComment={handleDeleteComment}
                    />
                )}

                {/* Edit Profile Modal */}
                {isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
                        onClick={e => { if (e.target === e.currentTarget) setIsEditing(false); }}>
                        <div className="bg-white rounded-[2.5rem] border-[4px] border-slate-900 shadow-[10px_10px_0px_0px_#111827] p-8 max-w-sm w-full relative">
                            <button onClick={() => setIsEditing(false)}
                                className="absolute top-4 right-4 w-9 h-9 rounded-full border-[2px] border-slate-900 flex items-center justify-center hover:bg-slate-100 transition-colors">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>

                            <h2 className="text-3xl font-black text-slate-900 mb-6 text-center">Edit Profile</h2>

                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div>
                                    <label className="text-xs font-black uppercase text-slate-500 mb-1 block">Username</label>
                                    <input type="text" value={editData.username} onChange={e => setEditData({ ...editData, username: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-900 font-bold outline-none focus:ring-2 focus:ring-primary/30"
                                        placeholder="Your gardener name..." />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-slate-500 mb-2 block">Choose an Avatar</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            '/images/doodle_cat.png',
                                            '/images/doodle_sheep.png',
                                            '/images/smiling_sun_white.png',
                                            'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Lily',
                                            'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Rose',
                                            'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Daisy'
                                        ].map((url) => (
                                            <button
                                                key={url}
                                                type="button"
                                                onClick={() => setEditData({ ...editData, avatar_url: url })}
                                                className={`aspect-square rounded-2xl border-4 ${editData.avatar_url === url ? 'border-primary shadow-[4px_4px_0_0_#111827] scale-105' : 'border-transparent hover:border-slate-300 bg-slate-50 hover:bg-slate-100'} transition-all overflow-hidden flex items-center justify-center`}
                                            >
                                                <img src={url} alt="Avatar option" className="w-[80%] h-[80%] object-contain drop-shadow-sm" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">link</span> Github
                                        </label>
                                        <input type="text" value={editData.github_url} onChange={e => setEditData({ ...editData, github_url: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/30"
                                            placeholder="URL..." />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">link</span> LinkedIn
                                        </label>
                                        <input type="text" value={editData.linkedin_url} onChange={e => setEditData({ ...editData, linkedin_url: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/30"
                                            placeholder="URL..." />
                                    </div>
                                </div>

                                <button type="submit" disabled={savingProfile}
                                    className="w-full mt-4 bubbly-btn bg-primary text-white text-lg py-3 rounded-[1.5rem] border-[3px] border-slate-900 shadow-[4px_4px_0_0_#111827] disabled:opacity-50 flex justify-center items-center">
                                    {savingProfile ? <span className="material-symbols-outlined animate-spin">sync</span> : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
