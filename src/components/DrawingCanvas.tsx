'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export type Tool = 'brush' | 'eraser';

interface DrawingCanvasProps {
    onCapture: (dataUrl: string) => void;
}

const COLORS = [
    '#111827', // near-black
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f59e0b', // amber
    '#6366f1', // indigo
    '#ffffff', // white
];

const SIZES = [3, 6, 12, 20];

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

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Save initial blank state
        setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    }, []);

    const getPos = useCallback((e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if ('touches' in e) {
            const touch = e.touches[0];
            return {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY,
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    }, []);

    const saveSnapshot = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prev => [...prev.slice(-30), snap]); // keep last 30
        setRedoStack([]);
    }, []);

    const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        setIsDrawing(true);
        lastPos.current = getPos(e, canvas);
    }, [getPos]);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing) return;
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

    // Keyboard shortcuts
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [undo, redo]);

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Toolbar */}
            <div className="bg-white rounded-[2rem] border-[3px] border-gray-900 shadow-[4px_4px_0px_0px_#111827] p-3 md:p-4 flex flex-wrap items-center gap-3 md:gap-4">
                {/* Brush / Eraser */}
                <div className="flex gap-2">
                    {(['brush', 'eraser'] as Tool[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTool(t)}
                            title={t.charAt(0).toUpperCase() + t.slice(1)}
                            className={`w-11 h-11 rounded-xl border-[2px] border-gray-900 flex items-center justify-center transition-all
                                ${tool === t ? 'bg-primary text-white shadow-[2px_2px_0px_0px_#111827]' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
                        >
                            <span className="material-symbols-outlined text-xl">
                                {t === 'brush' ? 'brush' : 'ink_eraser'}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="w-px h-8 bg-gray-200 hidden sm:block" />

                {/* Stroke Sizes */}
                <div className="flex items-center gap-2">
                    {SIZES.map(s => (
                        <button
                            key={s}
                            onClick={() => setSize(s)}
                            title={`Size ${s}`}
                            className={`w-11 h-11 rounded-xl border-[2px] border-gray-900 flex items-center justify-center transition-all
                                ${size === s ? 'bg-gray-900 shadow-[2px_2px_0px_0px_#6366f1]' : 'bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <div
                                className={`rounded-full ${size === s ? 'bg-white' : 'bg-gray-900'}`}
                                style={{ width: Math.max(4, s * 0.8), height: Math.max(4, s * 0.8) }}
                            />
                        </button>
                    ))}
                </div>

                <div className="w-px h-8 bg-gray-200 hidden sm:block" />

                {/* Color Palette */}
                <div className="flex flex-wrap gap-1.5">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); setTool('brush'); }}
                            title={c}
                            className={`w-8 h-8 rounded-full border-[2px] transition-all
                                ${color === c && tool === 'brush'
                                    ? 'border-gray-900 scale-125 shadow-[2px_2px_0px_0px_#111827]'
                                    : 'border-gray-300 hover:scale-110'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                    {/* Custom color */}
                    <label title="Custom color" className="w-8 h-8 rounded-full border-[2px] border-dashed border-gray-400 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform overflow-hidden relative">
                        <span className="material-symbols-outlined text-base text-gray-400">palette</span>
                        <input
                            type="color"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={e => { setColor(e.target.value); setTool('brush'); }}
                        />
                    </label>
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden md:block" />

                {/* Undo / Redo / Clear */}
                <div className="flex gap-2 ml-auto">
                    <button onClick={undo} disabled={history.length <= 1} title="Undo (Ctrl+Z)" className="w-11 h-11 rounded-xl border-[2px] border-gray-900 bg-gray-50 hover:bg-gray-100 flex items-center justify-center disabled:opacity-30 transition-all">
                        <span className="material-symbols-outlined text-xl">undo</span>
                    </button>
                    <button onClick={redo} disabled={redoStack.length === 0} title="Redo (Ctrl+Y)" className="w-11 h-11 rounded-xl border-[2px] border-gray-900 bg-gray-50 hover:bg-gray-100 flex items-center justify-center disabled:opacity-30 transition-all">
                        <span className="material-symbols-outlined text-xl">redo</span>
                    </button>
                    <button onClick={clear} title="Clear canvas" className="w-11 h-11 rounded-xl border-[2px] border-red-400 bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div
                ref={containerRef}
                className="relative rounded-[2rem] border-[3px] border-gray-900 shadow-[6px_6px_0px_0px_#111827] overflow-hidden bg-white cursor-crosshair select-none"
                style={{ touchAction: 'none' }}
            >
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={560}
                    className="w-full h-auto block"
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
