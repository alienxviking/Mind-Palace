import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Link as LinkIcon, Trash2, Loader2 } from "lucide-react";

interface NodeModalProps {
    node: any;
    onClose: () => void;
    onDelete: (id: any) => void;
    onDeepDive: (id: any) => Promise<void> | void;
}

export default function NodeModal({ node, onClose, onDelete, onDeepDive }: NodeModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!node) return null;

    const handleDeepDive = async () => {
        if (isLoading) return;
        setIsLoading(true);
        // Add a small delay so the user sees the 'Analyzing...' state
        // and the button becomes 'inactive' as requested.
        setTimeout(async () => {
            await onDeepDive(node.id);
        }, 300);
    };

    const hasDeepDive = false; // Allow deep dive even if summary exists

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="fixed top-1/2 left-1/2 md:left-12 -translate-x-1/2 md:translate-x-0 -translate-y-1/2 w-[calc(100vw-4rem)] md:w-80 z-40 glass p-6 rounded-3xl border border-white/20 pointer-events-auto"
            >
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `#${node.color.toString(16)}22`, border: `1px solid #${node.color.toString(16)}` }}>
                        <Sparkles className="w-5 h-5 pointer-events-none" style={{ color: `#${node.color.toString(16)}` }} />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onDelete(node.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 palace-button"
                            title="Delete Node"
                            data-cursor="BOX"
                            data-cursor-magnetic
                        >
                            <Trash2 className="w-4 h-4 pointer-events-none" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors palace-button"
                            data-cursor="BOX"
                            data-cursor-magnetic
                        >
                            <X className="w-5 h-5 text-white/50 pointer-events-none" />
                        </button>
                    </div>
                </div>

                <h2 className="text-3xl font-bold logo mb-2 tracking-tight">{node.title}</h2>
                <p className="text-sm text-white/60 mb-6 leading-relaxed">
                    {node.summary || "This node represents a cluster of knowledge in your mind palace. AI has analyzed its connections."}
                </p>

                <div className="space-y-4">
                    <div className="glass-dark p-4 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-white/40 uppercase tracking-widest">
                            <LinkIcon className="w-3 h-3" />
                            AI Tags
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {node.tags?.map((tag: string) => (
                                <span key={tag} className="text-[10px] bg-white/5 px-2 py-1 rounded-md border border-white/10">{tag}</span>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleDeepDive}
                        disabled={isLoading || hasDeepDive}
                        className={`w-full py-4 rounded-2xl font-bold text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 palace-button group ${(isLoading || hasDeepDive)
                            ? 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
                            : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]'
                            }`}
                        data-cursor={(isLoading || hasDeepDive) ? "SELECT" : "BOX"}
                        data-cursor-magnetic={!(isLoading || hasDeepDive)}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                                Analyzing...
                            </>
                        ) : hasDeepDive ? (
                            "Analysis Complete"
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                                Deep Dive
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
