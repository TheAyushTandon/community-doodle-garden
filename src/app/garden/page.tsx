'use client';

import { useRef, useMemo, Suspense, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Billboard, Html, Outlines } from '@react-three/drei';
import { useSession } from 'next-auth/react';
import * as THREE from 'three';
import TransitionLink from '@/components/TransitionLink';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Doodle {
    id: string;
    image_url: string;
    flower_name: string;
    coord_x: number;
    coord_y: number;
    star_count: number;
    user_id?: string;
    user: { username: string | null; avatar_url: string | null; email?: string };
}
interface Comment { id: string; content: string; username: string | null; }
interface LeaderEntry { id: string; flower_name: string; image_url: string; star_count: number; username: string | null; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function doodleToSphere(cx: number, cy: number, r: number) {
    const lon = (cx / 100) * 360 - 180;
    const lat = (cy / 100) * 160 - 80;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
    );
}

// ─── Grass + Ponds Texture ────────────────────────────────────────────────────
function makeGrassTexture(): THREE.CanvasTexture {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Green base gradient
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.7);
    grad.addColorStop(0, '#7ecf2b');
    grad.addColorStop(0.6, '#5bb818');
    grad.addColorStop(1, '#3a9010');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Grass strokes
    ctx.strokeStyle = 'rgba(0,0,0,0.11)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 0; i < 380; i++) {
        const x = Math.random() * size, y = Math.random() * size, h = 16 + Math.random() * 22;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 18, y - h * 0.6, x + (Math.random() - 0.5) * 12, y - h);
        ctx.stroke();
    }

    // Darker grass patches
    for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * size, Math.random() * size, 12 + Math.random() * 28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,80,0,0.05)';
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
}

// ─── Globe ────────────────────────────────────────────────────────────────────
const GLOBE_R = 2.6;

function Globe() {
    const texture = useMemo(() => makeGrassTexture(), []);
    return (
        <mesh castShadow receiveShadow>
            <sphereGeometry args={[GLOBE_R, 64, 64]} />
            <meshStandardMaterial map={texture} roughness={0.85} metalness={0.0} />
        </mesh>
    );
}

// Bold black toon outline around the globe
function GlobeOutline() {
    return (
        <mesh>
            <sphereGeometry args={[GLOBE_R * 1.042, 64, 64]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} />
        </mesh>
    );
}

// Atmosphere (subtle outer glow)
function Atmosphere() {
    return (
        <mesh>
            <sphereGeometry args={[GLOBE_R * 1.09, 48, 48]} />
            <meshStandardMaterial color="#4f86f7" transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} />
        </mesh>
    );
}

// ─── Clouds ───────────────────────────────────────────────────────────────────
function makeCloudTexture(): THREE.CanvasTexture {
    const w = 280, h = 160;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d')!; ctx.clearRect(0, 0, w, h);
    const blobs = [{ x: 140, y: 100, r: 46 }, { x: 88, y: 102, r: 36 }, { x: 188, y: 102, r: 40 }, { x: 58, y: 115, r: 28 }, { x: 218, y: 115, r: 30 }];
    ctx.fillStyle = '#1a1a1a';
    blobs.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 5, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = '#ffffff';
    blobs.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    blobs.forEach(b => { ctx.beginPath(); ctx.arc(b.x - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.35, 0, Math.PI * 2); ctx.fill(); });
    return new THREE.CanvasTexture(c);
}

function Clouds() {
    const cloudTex = useMemo(() => makeCloudTexture(), []);
    const cloudsRef = useRef<THREE.Group>(null!);
    const positions = useMemo(() => [
        { pos: new THREE.Vector3(-6, 2.5, -3), scale: 1.8, speed: 0.008 },
        { pos: new THREE.Vector3(6, 3, -2), scale: 1.4, speed: 0.006 },
        { pos: new THREE.Vector3(-4.5, -1.5, 4), scale: 1.6, speed: 0.01 },
        { pos: new THREE.Vector3(5, -2.5, 3), scale: 1.2, speed: 0.009 },
        { pos: new THREE.Vector3(0, 4.5, -5), scale: 2.0, speed: 0.005 },
        { pos: new THREE.Vector3(-7, 1, 2), scale: 1.3, speed: 0.007 },
        { pos: new THREE.Vector3(3, -4, -4), scale: 1.5, speed: 0.011 },
    ], []);
    useFrame(state => {
        if (!cloudsRef.current) return;
        cloudsRef.current.children.forEach((child, i) => {
            const t = state.clock.elapsedTime * positions[i].speed;
            child.position.x = positions[i].pos.x + Math.sin(t) * 0.5;
            child.position.y = positions[i].pos.y + Math.cos(t * 0.7) * 0.2;
        });
    });
    return (
        <group ref={cloudsRef}>
            {positions.map((cloud, i) => (
                <Billboard key={i} position={cloud.pos}>
                    <mesh>
                        <planeGeometry args={[cloud.scale * 2.5, cloud.scale * 1.4]} />
                        <meshBasicMaterial map={cloudTex} color="#b3d4ff" transparent alphaTest={0.1} opacity={0.85} depthWrite={false} />
                    </mesh>
                </Billboard>
            ))}
        </group>
    );
}

// ─── Procedural Trees ────────────────────────────────────────────────────────
function Tree({ position, normal, scale }: { position: THREE.Vector3, normal: THREE.Vector3, scale: number }) {
    const ref = useRef<THREE.Group>(null!);

    useEffect(() => {
        if (ref.current) {
            const target = position.clone().add(normal);
            ref.current.lookAt(target);
            ref.current.rotateX(Math.PI / 2);
        }
    }, [position, normal]);

    return (
        <group position={position} ref={ref} scale={scale}>
            {/* Trunk */}
            <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.08, 0.12, 0.8, 7]} />
                <meshStandardMaterial color="#5c4033" roughness={0.9} />
                <Outlines thickness={0.04} color="black" />
            </mesh>
            {/* Canopy Layer 1 */}
            <mesh position={[0, 1.0, 0]}>
                <dodecahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial color="#22c55e" roughness={0.8} />
                <Outlines thickness={0.04} color="black" />
            </mesh>
            {/* Canopy Layer 2 */}
            <mesh position={[0.1, 1.4, -0.1]}>
                <dodecahedronGeometry args={[0.35, 0]} />
                <meshStandardMaterial color="#4ade80" roughness={0.8} />
                <Outlines thickness={0.04} color="black" />
            </mesh>
            {/* Canopy Layer 3 */}
            <mesh position={[-0.15, 1.2, 0.2]}>
                <dodecahedronGeometry args={[0.3, 0]} />
                <meshStandardMaterial color="#16a34a" roughness={0.8} />
                <Outlines thickness={0.04} color="black" />
            </mesh>
        </group>
    );
}

function Trees({ radius, count = 40 }: { radius: number, count?: number }) {
    const treeData = useMemo(() => {
        const pts: { pos: THREE.Vector3, norm: THREE.Vector3, scale: number }[] = [];
        const phi = Math.PI * (Math.sqrt(5) - 1); // Golden angle

        for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
            const r = Math.sqrt(1 - y * y);
            const theta = phi * i;

            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;

            const norm = new THREE.Vector3(x, y, z).normalize();
            // Sink them very slightly into the grass so they don't float
            const pos = norm.clone().multiplyScalar(radius - 0.05);

            // Randomize scale a bit between 0.3 and 0.6
            // We use a seeded pseudo-random approach based on index so it's stable
            const hash = Math.sin(i * 1234.5678) * 10000;
            const randomFraction = hash - Math.floor(hash);
            const scale = 0.3 + randomFraction * 0.4;

            pts.push({ pos, norm, scale });
        }
        return pts;
    }, [radius, count]);

    return (
        <group>
            {treeData.map((t, i) => (
                <Tree key={`tree-${i}`} position={t.pos} normal={t.norm} scale={t.scale} />
            ))}
        </group>
    );
}

// ─── Floating Petals ──────────────────────────────────────────────────────────
function Petals() {
    const count = 28;
    const petalRef = useRef<THREE.InstancedMesh>(null!);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const petals = useMemo(() => Array.from({ length: count }, () => ({
        phi: Math.random() * Math.PI * 2, theta: Math.random() * Math.PI,
        r: GLOBE_R + 0.5 + Math.random() * 2.5, speed: 0.1 + Math.random() * 0.25, offset: Math.random() * Math.PI * 2,
    })), []);
    useFrame(state => {
        if (!petalRef.current) return;
        petals.forEach((p, i) => {
            const t = state.clock.elapsedTime * p.speed + p.offset;
            const phi = p.phi + t * 0.3, theta = p.theta + Math.sin(t * 0.4) * 0.5;
            dummy.position.set(p.r * Math.sin(theta) * Math.cos(phi), p.r * Math.cos(theta), p.r * Math.sin(theta) * Math.sin(phi));
            dummy.rotation.set(t, t * 0.7, 0); dummy.scale.setScalar(0.04 + Math.random() * 0.02); dummy.updateMatrix();
            petalRef.current.setMatrixAt(i, dummy.matrix);
        });
        petalRef.current.instanceMatrix.needsUpdate = true;
    });
    return (
        <instancedMesh ref={petalRef} args={[undefined, undefined, count]}>
            <circleGeometry args={[1, 5]} />
            <meshBasicMaterial color="#f9a8d4" transparent opacity={0.75} side={THREE.DoubleSide} />
        </instancedMesh>
    );
}

// ─── Flower Pin ───────────────────────────────────────────────────────────────
function FlowerPin({ doodle, onSelect, isOwner }: { doodle: Doodle; onSelect: (d: Doodle) => void; isOwner: boolean }) {
    const [hovered, setHovered] = useState(false);
    const [pos, setPos] = useState(() => doodleToSphere(doodle.coord_x, doodle.coord_y, GLOBE_R + 0.12));
    const pinRef = useRef<THREE.Group>(null!);

    useEffect(() => {
        setPos(doodleToSphere(doodle.coord_x, doodle.coord_y, GLOBE_R + 0.12));
    }, [doodle.coord_x, doodle.coord_y]);

    useFrame(() => {
        if (pinRef.current) {
            const target = hovered ? 1.3 : 1.0;
            pinRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
        }
    });

    return (
        <Billboard position={pos}>
            <group ref={pinRef}
                onPointerOver={e => { e.stopPropagation(); setHovered(true); document.body.classList.add('force-pointer'); }}
                onPointerOut={() => { setHovered(false); document.body.classList.remove('force-pointer'); }}
                onClick={e => { e.stopPropagation(); onSelect(doodle); }}
            >
                {/* Outer black circle */}
                <mesh><circleGeometry args={[0.2, 32]} /><meshBasicMaterial color="#000000" /></mesh>
                {/* Owner indicator — gold dot */}
                {isOwner && <mesh position={[0.14, 0.14, 0.003]}><circleGeometry args={[0.048, 16]} /><meshBasicMaterial color="#f59e0b" /></mesh>}

                <Html center distanceFactor={6} pointerEvents="none"
                    zIndexRange={[99, 0]}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: '50%', overflow: 'hidden',
                        border: `3px solid ${isOwner ? '#f59e0b' : '#000000'}`,
                        boxShadow: hovered ? '0 4px 14px rgba(0,0,0,0.45)' : '2px 2px 0 #000000',
                        transition: 'box-shadow 0.15s', background: '#fff',
                    }}>
                        {doodle.image_url
                            ? <img src={doodle.image_url} alt={doodle.flower_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌸</div>
                        }
                    </div>
                </Html>

                {hovered && (
                    <Html center distanceFactor={6} pointerEvents="none" position={[0, 0.36, 0]} zIndexRange={[99, 0]}>
                        <div style={{
                            background: '#fff', border: '2.5px solid #000000', borderRadius: 14,
                            padding: '4px 10px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                            boxShadow: '3px 3px 0 #000000', pointerEvents: 'none',
                        }}>
                            🌸 {doodle.flower_name}
                            {doodle.user.username && <span style={{ color: '#6b7280', fontWeight: 500, marginLeft: 4 }}>by {doodle.user.username}</span>}
                        </div>
                    </Html>
                )}
            </group>
        </Billboard>
    );
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene({ doodles, onSelect, currentUserId }: { doodles: Doodle[]; onSelect: (d: Doodle) => void; currentUserId?: string }) {
    return (
        <>
            <ambientLight intensity={1.2} color="#8fb3ff" />
            <directionalLight position={[6, 8, 4]} intensity={2.0} color="#ffeedd" castShadow />
            <directionalLight position={[-4, -2, -4]} intensity={0.6} color="#4f86f7" />
            <Globe />
            <GlobeOutline />
            <Atmosphere />
            <Clouds />
            <Trees radius={GLOBE_R} count={50} />
            <Petals />
            {doodles.map(d => (
                <FlowerPin key={d.id} doodle={d} onSelect={onSelect} isOwner={!!currentUserId && d.user_id === currentUserId} />
            ))}
            <OrbitControls enablePan={false} enableZoom minDistance={4} maxDistance={10} enableDamping dampingFactor={0.06} rotateSpeed={0.5} autoRotate={false} makeDefault />
        </>
    );
}

// ─── Doodle Modal (full featured) ─────────────────────────────────────────────
function DoodleModal({ doodle, onClose, onRelocate, isOwner }: {
    doodle: Doodle; onClose: () => void;
    onRelocate: (d: Doodle) => void; isOwner: boolean;
}) {
    const [starred, setStarred] = useState(false);
    const [stars, setStars] = useState(doodle.star_count);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [posting, setPosting] = useState(false);
    const [commentError, setCommentError] = useState('');
    const { data: session } = useSession();

    // Load comments on open
    useEffect(() => {
        fetch(`/api/doodles/${doodle.id}`)
            .then(r => r.json())
            .then(data => {
                setComments(data.comments || []);
                if (data.has_starred !== undefined) setStarred(data.has_starred);
                if (data.star_count !== undefined) setStars(data.star_count);
            })
            .catch(() => { });
    }, [doodle.id]);

    const [starError, setStarError] = useState('');

    const handleStar = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setStarError('');
        const newStarred = !starred;
        setStarred(newStarred);
        setStars(s => newStarred ? s + 1 : s - 1);
        try {
            const res = await fetch(`/api/doodles/${doodle.id}/star`, { method: 'POST' });
            if (!res.ok) {
                // Revert optimistic update
                setStarred(!newStarred);
                setStars(s => newStarred ? s - 1 : s + 1);
                const data = await res.json();
                setStarError(data.error || 'Could not update star');
            }
        } catch {
            setStarred(!newStarred);
            setStars(s => newStarred ? s - 1 : s + 1);
            setStarError('Network error');
        }
    };

    const handleComment = async () => {
        if (!newComment.trim() || posting) return;
        setCommentError('');
        setPosting(true);
        try {
            const res = await fetch(`/api/doodles/${doodle.id}/comment`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment }),
            });
            const data = await res.json();
            if (res.ok) {
                setComments(prev => [...prev, data]);
                setNewComment('');
            } else {
                setCommentError(data.error || 'Failed to post — are you signed in?');
            }
        } catch {
            setCommentError('Network error — please try again.');
        } finally { setPosting(false); }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[2.5rem] border-[4px] border-gray-900 shadow-[10px_10px_0px_0px_#111827] p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full border-[2px] border-gray-900 flex items-center justify-center hover:bg-gray-100 transition-colors z-10">
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>

                {/* Image */}
                <div className="w-40 h-40 mx-auto rounded-[2rem] border-[3px] border-gray-900 shadow-[4px_4px_0_0_#111827] overflow-hidden bg-gray-50 mb-4">
                    {doodle.image_url
                        ? <img src={doodle.image_url} alt={doodle.flower_name} className="w-full h-full object-contain" />
                        : <div className="w-full h-full flex items-center justify-center text-5xl">🌸</div>
                    }
                </div>

                <h2 className="font-display text-2xl font-extrabold text-gray-900 text-center mb-0.5">{doodle.flower_name}</h2>
                <p className="text-center text-gray-500 text-sm font-medium mb-4">by {doodle.user.username || 'Anonymous Gardener'}</p>

                {/* Actions row */}
                <div className="flex gap-2 justify-center mb-5 flex-wrap">
                    <button type="button" onClick={handleStar}
                        className={`bubbly-btn flex items-center gap-1.5 border-[2px] border-gray-900 shadow-[3px_3px_0_0_#111827] text-sm transition-all
                            ${starred ? 'bg-yellow-300 text-gray-900' : 'bg-gray-50 text-gray-700 hover:bg-yellow-100'}`}>
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: starred ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                        {stars} {stars === 1 ? 'Star' : 'Stars'}
                    </button>
                    {starError && <p className="text-red-500 text-xs w-full text-center">{starError}</p>}

                    {isOwner && (
                        <button onClick={() => { onClose(); onRelocate(doodle); }}
                            className="bubbly-btn bg-blue-100 text-blue-800 border-[2px] border-gray-900 shadow-[3px_3px_0_0_#111827] flex items-center gap-1.5 text-sm hover:bg-blue-200">
                            <span className="material-symbols-outlined text-base">my_location</span>
                            Move Flower
                        </button>
                    )}

                    <TransitionLink href="/draw"
                        className="bubbly-btn bg-primary text-white border-[2px] border-gray-900 shadow-[3px_3px_0_0_#111827] flex items-center gap-1.5 text-sm">
                        <span className="material-symbols-outlined text-base">brush</span>
                        Draw yours
                    </TransitionLink>
                </div>

                {/* Comments */}
                <div className="border-t-[2px] border-gray-200 pt-4">
                    <h3 className="font-display font-bold text-gray-700 mb-3 text-sm">
                        💬 Comments ({comments.length})
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                        {comments.length === 0 && (
                            <p className="text-gray-400 text-xs text-center py-3">No comments yet — be the first! 🌱</p>
                        )}
                        {comments.map(c => (
                            <div key={c.id} className="bg-gray-50 rounded-2xl border border-gray-200 px-3 py-2">
                                <span className="font-bold text-xs text-gray-700">{c.username || 'Gardener'} </span>
                                <span className="text-xs text-gray-600">{c.content}</span>
                            </div>
                        ))}
                    </div>

                    {session ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <input
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleComment()}
                                    placeholder="Say something nice… 🌸"
                                    maxLength={300}
                                    className="flex-1 rounded-2xl border-[2px] border-gray-900 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                                <button onClick={handleComment} disabled={posting || !newComment.trim()}
                                    className="bubbly-btn bg-primary text-white border-[2px] border-gray-900 shadow-[3px_3px_0_0_#111827] text-sm px-4 disabled:opacity-50">
                                    {posting ? '…' : 'Post'}
                                </button>
                            </div>
                            {commentError && (
                                <p className="text-red-500 text-xs font-medium px-1">{commentError}</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-gray-500">
                            <TransitionLink href="/login" className="text-primary font-bold underline">Sign in</TransitionLink> to comment
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Relocation Picker ────────────────────────────────────────────────────────
function RelocatePicker({ doodle, onDone, onCancel }: { doodle: Doodle; onDone: (cx: number, cy: number) => void; onCancel: () => void }) {
    const [cx, setCx] = useState(doodle.coord_x);
    const [cy, setCy] = useState(doodle.coord_y);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`/api/doodles/${doodle.id}/relocate`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coord_x: cx, coord_y: cy }),
            });
            onDone(cx, cy);
        } catch { /* ignore */ } finally { setSaving(false); }
    };

    // Visual: a mini 2D map of the globe surface (equirectangular projection)
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
            <div className="bg-white rounded-[2.5rem] border-[4px] border-gray-900 shadow-[10px_10px_0_0_#111827] p-6 max-w-sm w-full">
                <h2 className="font-display text-2xl font-extrabold text-gray-900 mb-1 text-center">Move your flower 🌸</h2>
                <p className="text-center text-gray-500 text-sm mb-5">Pick a new spot on the globe for <strong>{doodle.flower_name}</strong></p>

                {/* Globe map preview — click to reposition */}
                <div className="relative w-full aspect-[2/1] rounded-2xl border-[3px] border-gray-900 overflow-hidden mb-4 cursor-crosshair"
                    style={{ background: 'linear-gradient(180deg, #5bb818 0%, #3a9010 100%)' }}
                    onClick={e => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const nx = ((e.clientX - rect.left) / rect.width) * 100;
                        const ny = ((e.clientY - rect.top) / rect.height) * 100;
                        setCx(Math.round(nx)); setCy(Math.round(ny));
                    }}>
                    {/* Grid lines */}
                    {[25, 50, 75].map(v => (
                        <div key={v} style={{ position: 'absolute', left: `${v}%`, top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.15)' }} />
                    ))}
                    {[33, 66].map(v => (
                        <div key={v} style={{ position: 'absolute', top: `${v}%`, left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.15)' }} />
                    ))}
                    {/* Flower marker */}
                    <div style={{
                        position: 'absolute', left: `${cx}%`, top: `${cy}%`,
                        transform: 'translate(-50%,-50%)',
                        width: 28, height: 28, borderRadius: '50%',
                        border: '3px solid #111827', background: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, boxShadow: '2px 2px 0 #111827', pointerEvents: 'none',
                    }}>🌸</div>
                    <div style={{ position: 'absolute', bottom: 6, left: 8, fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                        Click anywhere to place
                    </div>
                </div>

                <div className="flex gap-2 mb-2">
                    <div className="flex-1 text-center text-xs text-gray-500">Longitude: {Math.round((cx / 100) * 360 - 180)}°</div>
                    <div className="flex-1 text-center text-xs text-gray-500">Latitude: {Math.round((cy / 100) * 160 - 80)}°</div>
                </div>

                <div className="flex gap-3 mt-4">
                    <button onClick={onCancel} className="flex-1 bubbly-btn bg-gray-100 text-gray-700 border-[2px] border-gray-900 shadow-[3px_3px_0_0_#111827]">Cancel</button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex-1 bubbly-btn bg-primary text-white border-[2px] border-gray-900 shadow-[3px_3px_0_0_#111827] disabled:opacity-60">
                        {saving ? 'Saving…' : 'Plant here! 🌱'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Leaderboard Sidebar ──────────────────────────────────────────────────────
function Leaderboard({ onClose, onSelect }: { onClose: () => void; onSelect: (id: string) => void }) {
    const [entries, setEntries] = useState<LeaderEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/leaderboard')
            .then(r => r.json())
            .then(d => { setEntries(d.leaderboard || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const medals = ['🥇', '🥈', '🥉'];

    return (
        <div className="absolute top-4 right-4 z-20 w-72 bg-white rounded-[2rem] border-[3px] border-gray-900 shadow-[6px_6px_0_0_#111827] overflow-hidden">
            <div className="bg-secondary px-5 py-3 border-b-[2.5px] border-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-900">emoji_events</span>
                    <span className="font-display font-extrabold text-gray-900 text-lg">Leaderboard</span>
                </div>
                <button onClick={onClose} className="w-7 h-7 rounded-full border border-gray-900 flex items-center justify-center hover:bg-yellow-200 transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>

            <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                {loading && <div className="text-center py-6 text-gray-400 text-sm">Loading…</div>}
                {!loading && entries.length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-sm">No flowers yet! Be the first 🌸</div>
                )}
                {entries.map((e, i) => (
                    <button key={e.id} onClick={() => onSelect(e.id)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-50 transition-colors text-left border border-transparent hover:border-gray-200">
                        <span className="text-xl shrink-0">{medals[i] || `${i + 1}.`}</span>
                        <div className="w-9 h-9 rounded-full border-[2px] border-gray-900 bg-gray-50 overflow-hidden shrink-0">
                            {e.image_url
                                ? <img src={e.image_url} alt={e.flower_name} className="w-full h-full object-contain" />
                                : <div className="w-full h-full flex items-center justify-center text-lg">🌸</div>
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 text-sm truncate">{e.flower_name}</div>
                            <div className="text-gray-500 text-xs">{e.username || 'Anonymous'}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="font-bold text-sm text-gray-700">{e.star_count}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GardenPage() {
    const { data: session } = useSession();
    const [doodles, setDoodles] = useState<Doodle[]>([]);
    const [selected, setSelected] = useState<Doodle | null>(null);
    const [relocating, setRelocating] = useState<Doodle | null>(null);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [loading, setLoading] = useState(true);

    // Current user's DB id — needed to mark owned flowers
    const currentUserId = (session?.user as { id?: string })?.id;

    useEffect(() => {
        fetch('/api/doodles?limit=80')
            .then(r => r.json())
            .then(data => { setDoodles(data.doodles || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSelect = useCallback((d: Doodle) => setSelected(d), []);

    const handleRelocateDone = (id: string, cx: number, cy: number) => {
        setDoodles(prev => prev.map(d => d.id === id ? { ...d, coord_x: cx, coord_y: cy } : d));
        setRelocating(null);
    };

    // When leaderboard entry clicked, find that doodle and open modal
    const handleLeaderSelect = (id: string) => {
        const d = doodles.find(x => x.id === id);
        if (d) { setSelected(d); setShowLeaderboard(false); }
    };

    // Owner: match by user_id (from session token) OR by email (fallback)
    const currentUserEmail = session?.user?.email;
    const selectedIsOwner = !!selected && !!session && (
        (!!currentUserId && selected.user_id === currentUserId) ||
        (!!currentUserEmail && selected.user?.email === currentUserEmail)
    );

    return (
        <div className="flex-1 relative overflow-hidden bg-slate-900">
            {/* 3D Globe Canvas */}
            <Canvas camera={{ position: [0, 0, 7], fov: 55 }} shadows gl={{ antialias: true, alpha: false }}
                style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                <color attach="background" args={['#0f172a']} />
                <Suspense fallback={null}>
                    <Scene doodles={doodles} onSelect={handleSelect} currentUserId={currentUserId} />
                </Suspense>
            </Canvas>

            {/* HUD — Top Left */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <TransitionLink href="/"
                    className="bubbly-btn bg-white text-gray-800 border-[3px] border-gray-900 shadow-[4px_4px_0_0_#111827] flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-base">home</span>
                    <span className="hidden sm:inline">Home</span>
                </TransitionLink>
                <TransitionLink href="/draw"
                    className="bubbly-btn bg-secondary text-gray-900 border-[3px] border-gray-900 shadow-[4px_4px_0_0_#111827] flex items-center gap-2 text-base">
                    <span className="material-symbols-outlined">brush</span>
                    <span className="hidden sm:inline">Plant a Flower</span>
                </TransitionLink>
            </div>

            {/* HUD — Top Right (flower count + leaderboard toggle) */}
            {!showLeaderboard && (
                <div className="absolute top-4 right-4 z-10 flex gap-2 items-center">
                    <div className="hidden sm:flex bg-white/90 rounded-[1.5rem] border-[3px] border-gray-900 shadow-[4px_4px_0_0_#111827] px-4 py-2 font-display font-bold text-gray-700 text-sm items-center gap-2 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-primary text-base">local_florist</span>
                        {loading ? '…' : doodles.length} flowers growing
                    </div>
                    <button onClick={() => setShowLeaderboard(true)}
                        className="bubbly-btn bg-secondary text-gray-900 border-[3px] border-gray-900 shadow-[4px_4px_0_0_#111827] flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined">emoji_events</span>
                        <span className="hidden sm:inline">Leaderboard</span>
                    </button>
                </div>
            )}

            {/* Leaderboard Sidebar */}
            {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} onSelect={handleLeaderSelect} />}

            {/* Bottom hint */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-[90vw] max-w-lg">
                <div className="bg-white/80 rounded-full border-[2px] border-gray-900 shadow-[3px_3px_0_0_#111827] px-4 py-2 font-display font-bold text-gray-600 text-xs sm:text-sm backdrop-blur-sm flex items-center justify-center gap-2 text-center">
                    <span className="material-symbols-outlined text-sm">drag_pan</span>
                    <span className="hidden sm:inline">Drag to rotate · Scroll to zoom · Click flowers to inspect</span>
                    <span className="sm:hidden">Drag · Pinch · Tap flowers</span>
                    {currentUserId && <span className="text-yellow-600 ml-1 hidden sm:inline">· Gold ring = your flower 🌟</span>}
                </div>
            </div>

            {/* Modals */}
            {selected && (
                <DoodleModal
                    doodle={selected}
                    onClose={() => setSelected(null)}
                    onRelocate={d => { setSelected(null); setRelocating(d); }}
                    isOwner={selectedIsOwner}
                />
            )}
            {relocating && (
                <RelocatePicker
                    doodle={relocating}
                    onDone={(cx, cy) => handleRelocateDone(relocating.id, cx, cy)}
                    onCancel={() => setRelocating(null)}
                />
            )}
        </div>
    );
}
