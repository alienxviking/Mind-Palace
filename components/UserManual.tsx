"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MousePointer2, Move, RotateCw, ZoomIn, Info, Keyboard, LogOut } from "lucide-react";

interface UserManualProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserManual({ isOpen, onClose }: UserManualProps) {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia("(pointer: coarse), (max-width: 768px)").matches);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            window.removeEventListener("resize", checkMobile);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    const controls = [
        { icon: <MousePointer2 size={18} />, label: "PAN", description: isMobile ? "One Finger Drag" : "Left Click + Drag" },
        { icon: <RotateCw size={18} />, label: "ROTATE", description: isMobile ? "Two Finger Rotate" : "Right Click + Drag" },
        { icon: <ZoomIn size={18} />, label: "ZOOM", description: isMobile ? "Pinch to Zoom" : "Scroll Wheel" },
        { icon: <Move size={18} />, label: "SELECT", description: isMobile ? "Tap on Planet Node" : "Click on any Planet Node" },
        { icon: <Keyboard size={18} />, label: "BACK", description: isMobile ? "Tap X to Close" : "[ESC] key to go back" },
        { icon: <LogOut size={18} />, label: "EXIT", description: "Terminate session" },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl max-h-[90vh] glass-dark border border-cyan-500/30 rounded-[2rem] md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.1)]"
                    >
                        {/* Background Glows */}
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full" />
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full" />

                        {/* Sticky Header */}
                        <div className="flex justify-between items-start p-6 md:p-10 mb-0 md:mb-0 relative z-20 bg-black/20 backdrop-blur-sm border-b border-white/5">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                                        <Info size={16} className="text-cyan-400" />
                                    </div>
                                    <span className="text-[10px] font-bold tracking-[0.5em] text-cyan-400 uppercase">
                                        System Protocol
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-4xl font-bold text-white font-plus-jakarta tracking-tight">
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

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">Controls</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {controls.map((control, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
                                                <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform">
                                                    {React.cloneElement(control.icon as React.ReactElement, { size: 18 })}
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
                                        <div className="p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-3xl">
                                            <h4 className="text-cyan-400 font-bold text-sm mb-2 uppercase tracking-wider">Neural Terminal</h4>
                                            <p className="text-[11px] text-white/60 leading-relaxed uppercase tracking-widest font-medium">
                                                Use the terminal to create new knowledge nodes and explore links.
                                            </p>
                                        </div>
                                        <div className="p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl">
                                            <h4 className="text-indigo-400 font-bold text-sm mb-2 uppercase tracking-wider">Palace Locking</h4>
                                            <p className="text-[11px] text-white/60 leading-relaxed uppercase tracking-widest font-medium">
                                                Toggle exploration vs structural editing mode via the footer lock.
                                            </p>
                                        </div>
                                        <div className="p-5 bg-purple-500/5 border border-purple-500/20 rounded-3xl">
                                            <h4 className="text-purple-400 font-bold text-sm mb-2 uppercase tracking-wider">Deep Dive</h4>
                                            <p className="text-[11px] text-white/60 leading-relaxed uppercase tracking-widest font-medium">
                                                Select a planet and enter "Deep Dive" to interact with core concepts via AI.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="p-6 md:p-8 border-t border-white/5 flex justify-center relative z-20 bg-black/20 backdrop-blur-sm">
                            <button
                                onClick={onClose}
                                className="w-full md:w-auto px-12 py-4 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 rounded-2xl text-white font-bold tracking-[0.3em] uppercase transition-all hover:scale-105 active:scale-95"
                            >
                                Acknowledge
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
