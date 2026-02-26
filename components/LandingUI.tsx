"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LandingUIProps {
    onEnter: () => void;
    onSignIn: () => void;
    isLoaded: boolean;
}

export default function LandingUI({ onEnter, onSignIn, isLoaded }: LandingUIProps) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 pointer-events-none">
            <AnimatePresence mode="wait">
                {!isLoaded ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
                            <motion.div
                                className="absolute inset-0 bg-cyan-500"
                                initial={{ x: "-100%" }}
                                animate={{ x: "0%" }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </div>
                        <span className="text-[10px] tracking-[0.5em] text-cyan-400 font-bold uppercase animate-pulse">
                            Initializing Systems...
                        </span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center pointer-events-auto"
                    >
                        {/* Header / Title Section */}
                        <motion.div
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="text-center relative"
                        >
                            {/* HUD Decorative Line */}
                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

                            <motion.h2
                                className="text-7xl md:text-[9.5rem] font-semibold tracking-[0.25em] mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 uppercase pb-4"
                                style={{
                                    filter: "drop-shadow(0 0 40px rgba(255,255,255,0.15))",
                                    fontFamily: "var(--font-space-grotesk), sans-serif",
                                    lineHeight: "1"
                                }}
                            >
                                MIND PALACE
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                transition={{ delay: 1, duration: 2 }}
                                className="text-[10px] md:text-xs font-bold uppercase tracking-[2.5em] text-cyan-200/60 ml-[2.5em] font-plus-jakarta"
                            >
                                Knowledge Visualization OS
                            </motion.p>
                        </motion.div>

                        {/* Action Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.8, duration: 1.2 }}
                            className="mt-32 flex flex-col items-center gap-8"
                        >
                            <button
                                onClick={onEnter}
                                data-cursor="BOX"
                                className="group relative px-16 py-6 bg-white/5 hover:bg-white/10 text-white font-black text-xl tracking-[0.3em] rounded-full transition-all duration-500 border border-white/20 hover:border-cyan-400/50 shadow-[0_0_50px_rgba(255,255,255,0.05)] hover:shadow-[0_0_80px_rgba(34,211,238,0.2)] hover:scale-105 active:scale-95"
                            >
                                <span className="relative z-10">DIVE IN</span>
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </button>
                        </motion.div>

                        {/* Version HUD */}
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-20 hover:opacity-40 transition-opacity duration-1000">
                            <div className="w-px h-16 bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
                            <span className="text-[9px] tracking-[0.8em] font-mono text-cyan-100">STABLE_BUILD_V1.0</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
