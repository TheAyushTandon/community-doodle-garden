'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export type Tool = 'brush' | 'eraser' | 'fill';

interface DrawingCanvasProps {
    onCapture: (dataUrl: string) => void;
}

const COLORS = [
    '#111827', '#ffffff',
    '#ef4444', '#f97316',
    '#fbbf24', '#22c55e',
    '#3b82f6', '#8b5cf6',
    '#ec4899', '#14b8a6',
    '#a855f7', '#6366f1',
    '#f43f5e', '#84cc16',
    '#06b6d4', '#d97706',
];

const SIZES = [3, 6, 12, 20];

// ── Cursor SVGs ──────────────────────────────────────────────────────────────
const makeCursor = (svg: string, x: number, y: number) =>
    `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}") ${x} ${y}, auto`;

const BUCKET_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect x="13" y="3" width="12" height="4" rx="2" fill="#fbbf24" stroke="#111" stroke-width="1.5"/>
  <rect x="15" y="7" width="8" height="13" rx="1" fill="#fbbf24" stroke="#111" stroke-width="1.5"/>
  <rect x="15" y="17" width="8" height="3" rx="0" fill="#f97316" stroke="#111" stroke-width="1"/>
  <path d="M7 22 Q7 27 11 27 Q15 27 15 22 Q15 18 11 14 Q7 18 7 22Z" fill="#2b8cee" stroke="#111" stroke-width="1.5"/>
  <line x1="19" y1="7" x2="11" y2="14" stroke="#555" stroke-width="1.5" stroke-dasharray="2,1"/>
</svg>`;

const ERASER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect x="4" y="16" width="20" height="11" rx="3" fill="#f9a8d4" stroke="#111" stroke-width="2"/>
  <rect x="4" y="21" width="20" height="6" rx="0" fill="#ec4899" stroke="none"/>
  <rect x="4" y="21" width="6" height="6" rx="0" fill="#fbbf24" stroke="none"/>
  <line x1="4" y1="21" x2="24" y2="21" stroke="#111" stroke-width="1.5"/>
  <line x1="10" y1="21" x2="10" y2="27" stroke="#111" stroke-width="1"/>
  <rect x="4" y="16" width="20" height="11" rx="3" fill="none" stroke="#111" stroke-width="2"/>
</svg>`;

// ── Flood fill algorithm ─────────────────────────────────────────────────────
function floodFill(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    fillColor: string,
    canvas: HTMLCanvasElement,
) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Parse fill color
    const tmp = document.createElement('canvas').getContext('2d')!;
    tmp.fillStyle = fillColor;
    tmp.fillRect(0, 0, 1, 1);
    const [fr, fg, fb, fa] = tmp.getImageData(0, 0, 1, 1).data;

    const idx = (x: number, y: number) => (y * canvas.width + x) * 4;
    const sx = Math.floor(startX), sy = Math.floor(startY);
    const si = idx(sx, sy);
    const [tr, tg, tb, ta] = [data[si], data[si + 1], data[si + 2], data[si + 3]];

    if (tr === fr && tg === fg && tb === fb && ta === fa) return;

    const tolerance = 30;
    const match = (i: number) =>
        Math.abs(data[i] - tr) <= tolerance &&
        Math.abs(data[i + 1] - tg) <= tolerance &&
        Math.abs(data[i + 2] - tb) <= tolerance &&
        Math.abs(data[i + 3] - ta) <= tolerance;

    const stack = [[sx, sy]];
    const visited = new Uint8Array(canvas.width * canvas.height);

    while (stack.length) {
        const [x, y] = stack.pop()!;
        if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
        const vi = y * canvas.width + x;
        if (visited[vi]) continue;
        const i = vi * 4;
        if (!match(i)) continue;
        visited[vi] = 1;
        data[i] = fr; data[i + 1] = fg; data[i + 2] = fb; data[i + 3] = fa;
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    ctx.putImageData(imageData, 0, 0);
}

export default function DrawingCanvas({ onCapture }: DrawingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tool, setTool] = useState<Tool>('brush');
    const [color, setColor] = useState('#111827');
    const [size, setSize] = useState(6);
    const [isDrawing, setIsDrawing] = useState(false);
    const [history, setHistory] = useState<ImageData[]>([]);
    const [redoStack, setRedoStack] = useState<ImageData[]>([]);
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    // Canvas cursor — applied via useEffect so encodeURIComponent runs in browser
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (tool === 'fill') {
            canvas.style.cursor = makeCursor(BUCKET_SVG, 7, 27);
        } else if (tool === 'eraser') {
            canvas.style.cursor = makeCursor(ERASER_SVG, 4, 26);
        } else {
            canvas.style.cursor = 'crosshair';
        }
    }, [tool]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    }, []);

    const getPos = useCallback((e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if ('touches' in e) {
            const touch = e.touches[0];
            return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
        }
        return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    }, []);

    const saveSnapshot = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prev => [...prev.slice(-30), snap]);
        setRedoStack([]);
    }, []);

    const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const pos = getPos(e, canvas);

        if (tool === 'fill') {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            saveSnapshot();
            floodFill(ctx, pos.x, pos.y, color, canvas);
            saveSnapshot();
            onCapture(canvas.toDataURL('image/png'));
            return;
        }

        setIsDrawing(true);
        lastPos.current = pos;
    }, [getPos, tool, color, saveSnapshot, onCapture]);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing || tool === 'fill') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx || !lastPos.current) return;
        const pos = getPos(e, canvas);
        ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color;
        ctx.lineWidth = tool === 'eraser' ? size * 3 : size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastPos.current = pos;
    }, [isDrawing, tool, color, size, getPos]);

    const stopDraw = useCallback(() => {
        if (!isDrawing) return;
        setIsDrawing(false);
        lastPos.current = null;
        saveSnapshot();
        onCapture(canvasRef.current?.toDataURL('image/png') || '');
    }, [isDrawing, onCapture, saveSnapshot]);

    const undo = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx || history.length <= 1) return;
        const newHistory = [...history];
        const last = newHistory.pop()!;
        setRedoStack(prev => [last, ...prev]);
        setHistory(newHistory);
        ctx.putImageData(newHistory[newHistory.length - 1], 0, 0);
        onCapture(canvas.toDataURL('image/png'));
    }, [history, onCapture]);

    const redo = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx || redoStack.length === 0) return;
        const [next, ...rest] = redoStack;
        setRedoStack(rest);
        setHistory(prev => [...prev, next]);
        ctx.putImageData(next, 0, 0);
        onCapture(canvas.toDataURL('image/png'));
    }, [redoStack, onCapture]);

    const clear = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveSnapshot();
        onCapture(canvas.toDataURL('image/png'));
    }, [saveSnapshot, onCapture]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [undo, redo]);

    const toolBtn = (t: Tool, icon: string, label: string) => (
        <button
            key={t}
            onClick={() => setTool(t)}
            title={label}
            className={`w-11 h-11 rounded-xl border-[2.5px] flex items-center justify-center transition-all font-bold text-sm gap-1
                ${tool === t
                    ? 'border-gray-900 shadow-[2px_2px_0px_0px_#111827] bg-gray-900 text-white scale-105'
                    : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:border-gray-500'}`}
        >
            <span className="material-symbols-outlined text-xl">{icon}</span>
        </button>
    );

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* ── Toolbar ── */}
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-[2rem] border-[3px] border-gray-900 shadow-[4px_4px_0px_0px_#111827] p-3 md:p-4 flex flex-wrap items-center gap-3 md:gap-4">

                {/* Tools: Brush / Fill / Eraser */}
                <div className="flex gap-1.5">
                    {toolBtn('brush', 'brush', 'Brush')}
                    {toolBtn('fill', 'format_color_fill', 'Fill Bucket')}
                    {toolBtn('eraser', 'ink_eraser', 'Eraser')}
                </div>

                <div className="w-px h-8 bg-gray-200 hidden sm:block" />

                {/* Stroke Sizes */}
                <div className="flex items-center gap-1.5">
                    {SIZES.map(s => (
                        <button
                            key={s}
                            onClick={() => setSize(s)}
                            title={`Size ${s}`}
                            className={`w-11 h-11 rounded-xl border-[2.5px] flex items-center justify-center transition-all
                                ${size === s
                                    ? 'border-gray-900 bg-gray-900 shadow-[2px_2px_0px_0px_#6366f1]'
                                    : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-500'}`}
                        >
                            <div
                                className={`rounded-full ${size === s ? 'bg-white' : 'bg-gray-700'}`}
                                style={{ width: Math.max(4, s * 0.8), height: Math.max(4, s * 0.8) }}
                            />
                        </button>
                    ))}
                </div>

                <div className="w-px h-8 bg-gray-200 hidden sm:block" />

                {/* ── Colour Palette — new theme ── */}
                <div className="flex flex-wrap gap-1.5 items-center">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); if (tool === 'eraser') setTool('brush'); }}
                            title={c}
                            className={`w-7 h-7 rounded-full border-[2.5px] transition-all hover:scale-110
                                ${color === c && tool !== 'eraser'
                                    ? 'border-gray-900 scale-125 shadow-[2px_2px_0px_0px_#111827] ring-2 ring-white ring-offset-1'
                                    : c === '#ffffff'
                                        ? 'border-gray-300 hover:border-gray-500'
                                        : 'border-transparent hover:border-gray-400'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}

                    {/* Active color swatch */}
                    <div className="flex items-center gap-1.5 ml-1 bg-gray-100 rounded-xl px-2 py-1 border-[2px] border-gray-300">
                        <div className="w-5 h-5 rounded-full border-[2px] border-gray-400 shadow-sm" style={{ backgroundColor: color }} />
                        <label title="Custom color" className="cursor-pointer flex items-center" >
                            <span className="material-symbols-outlined text-base text-gray-500 hover:text-primary transition-colors">colorize</span>
                            <input
                                type="color"
                                value={color}
                                className="w-0 h-0 opacity-0 absolute"
                                onChange={e => { setColor(e.target.value); if (tool === 'eraser') setTool('brush'); }}
                            />
                        </label>
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden md:block" />

                {/* Undo / Redo / Clear */}
                <div className="flex gap-1.5 ml-auto">
                    <button onClick={undo} disabled={history.length <= 1} title="Undo (Ctrl+Z)"
                        className="w-11 h-11 rounded-xl border-[2.5px] border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-500 flex items-center justify-center disabled:opacity-30 transition-all">
                        <span className="material-symbols-outlined text-xl">undo</span>
                    </button>
                    <button onClick={redo} disabled={redoStack.length === 0} title="Redo (Ctrl+Y)"
                        className="w-11 h-11 rounded-xl border-[2.5px] border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-500 flex items-center justify-center disabled:opacity-30 transition-all">
                        <span className="material-symbols-outlined text-xl">redo</span>
                    </button>
                    <button onClick={clear} title="Clear canvas"
                        className="w-11 h-11 rounded-xl border-[2.5px] border-red-300 bg-red-50 hover:bg-red-100 hover:border-red-500 text-red-500 flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                </div>
            </div>

            {/* ── Canvas ── */}
            <div
                ref={containerRef}
                className="relative rounded-[2rem] border-[3px] border-gray-900 shadow-[6px_6px_0px_0px_#111827] overflow-hidden bg-white select-none aspect-square mx-auto w-full max-w-[65vh] md:max-w-[75vh]"
                style={{ touchAction: 'none' }}
            >
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={800}
                    className="w-full h-full block touch-none"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                />
            </div>
        </div>
    );
}
