"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MousePointer2, Move, RotateCw, ZoomIn, Info, Keyboard, LogOut } from "lucide-react";

interface UserManualProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserManual({ isOpen, onClose }: UserManualProps) {
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const controls = [
        { icon: <MousePointer2 size={18} />, label: "PAN", description: "Left Click + Drag" },
        { icon: <RotateCw size={18} />, label: "ROTATE", description: "Right Click + Drag" },
        { icon: <ZoomIn size={18} />, label: "ZOOM", description: "Scroll Wheel" },
        { icon: <Move size={18} />, label: "SELECT", description: "Click on any Planet Node" },
        { icon: <Keyboard size={18} />, label: "BACK", description: "[ESC] key to go back" },
        { icon: <LogOut size={18} />, label: "EXIT", description: "Terminate session & exit" },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl glass-dark border border-cyan-500/30 rounded-[2.5rem] p-10 overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.1)]"
                    >
                        {/* Background Glows */}
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full" />
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full" />

                        {/* Header */}
                        <div className="flex justify-between items-start mb-10 relative z-10">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                                        <Info size={20} className="text-cyan-400" />
                                    </div>
                                    <span className="text-[10px] font-bold tracking-[0.5em] text-cyan-400 uppercase">
                                        System Protocol
                                    </span>
                                </div>
                                <h2 className="text-4xl font-bold text-white font-plus-jakarta tracking-tight">
                                    Neural Navigation Manual
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-white/5 rounded-2xl transition-all text-white/40 hover:text-white border border-transparent hover:border-white/10"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">Controls</h3>
                                <div className="space-y-4">
                                    {controls.map((control, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
                                            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform">
                                                {control.icon}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-cyan-400/60 uppercase tracking-widest leading-none mb-1">
                                                    {control.label}
                                                </p>
                                                <p className="text-sm text-white/80 font-medium whitespace-nowrap">
                                                    {control.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">Mind Palace Features</h3>
                                <div className="space-y-4">
                                    <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-3xl">
                                        <h4 className="text-cyan-400 font-bold text-sm mb-2 uppercase tracking-wider">Neural Terminal</h4>
                                        <p className="text-xs text-white/60 leading-relaxed uppercase tracking-widest font-medium">
                                            Type commands or use natural language to create new knowledge nodes and explore links.
                                        </p>
                                    </div>
                                    <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl">
                                        <h4 className="text-indigo-400 font-bold text-sm mb-2 uppercase tracking-wider">Palace Locking</h4>
                                        <p className="text-xs text-white/60 leading-relaxed uppercase tracking-widest font-medium">
                                            Toggle the lock at the bottom to switch between dynamic exploration and structural editing mode.
                                        </p>
                                    </div>
                                    <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-3xl">
                                        <h4 className="text-purple-400 font-bold text-sm mb-2 uppercase tracking-wider">Deep Dive</h4>
                                        <p className="text-xs text-white/60 leading-relaxed uppercase tracking-widest font-medium">
                                            Select a planet and enter "Deep Dive" to interact with the core concepts via AI dialogue.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-12 pt-8 border-t border-white/5 flex justify-center relative z-10">
                            <button
                                onClick={onClose}
                                className="px-12 py-4 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 rounded-2xl text-white font-bold tracking-[0.3em] uppercase transition-all hover:scale-105 active:scale-95"
                            >
                                Acknowledge & Initialize
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
