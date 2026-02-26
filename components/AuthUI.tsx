"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, User, ArrowRight, Loader2, X } from "lucide-react";

interface AuthUIProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthUI({ isOpen, onClose }: AuthUIProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const cleanEmail = email.trim();
            const cleanPassword = password.trim();

            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: cleanEmail,
                    password: cleanPassword,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email: cleanEmail,
                    password: cleanPassword,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                setError("Check your email for the confirmation link!");
            }
            if (!error) onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md glass-dark p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full" />
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full" />

                        {/* Header */}
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-white font-plus-jakarta">
                                    {isLogin ? "Welcome Back" : "Initialize Identity"}
                                </h2>
                                <p className="text-sm text-cyan-200/50 mt-1 uppercase tracking-widest font-mono">
                                    {isLogin ? "Access Knowledge OS" : "Join the Consciousness Grid"}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className={`mb-6 p-4 rounded-xl border text-sm ${error.includes("email")
                                    ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                                    : "bg-red-500/10 border-red-500/20 text-red-400"
                                    } font-medium`}
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleAuth} className="space-y-4 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 ml-1">Email Terminal</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                                        placeholder="user@knowledge.os"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 ml-1">Security Key</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative mt-4 inline-flex items-center justify-center px-8 py-5 font-bold text-white transition-all duration-200 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin text-cyan-400" size={24} />
                                ) : (
                                    <>
                                        <span className="tracking-[0.2em] font-bold uppercase">{isLogin ? "Authenticate" : "Register"}</span>
                                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform text-cyan-400" size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Switch Mode */}
                        <div className="mt-8 text-center relative z-10">
                            <p className="text-sm text-white/30">
                                {isLogin ? "New to the grid?" : "Already initialized?"}{" "}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-cyan-400 hover:text-cyan-300 font-bold tracking-wider transition-colors uppercase text-xs"
                                >
                                    {isLogin ? "Create Identity" : "Access Terminal"}
                                </button>
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
