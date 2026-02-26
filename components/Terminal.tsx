"use client";

import { useState } from "react";
import { Terminal as TerminalIcon, X, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { createNode } from "@/lib/supabase";

export default function Terminal({
    nodes,
    onNodeCreated,
    isOpen,
    setIsOpen
}: {
    nodes: any[],
    onNodeCreated: (node: any) => void,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void
}) {
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<string[]>(["System initialized...", "Type 'help' for commands."]);

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setHistory([...history, `> ${input}`]);

        const cmdParts = input.split(" ");
        const cmd = cmdParts[0].toLowerCase();

        if (cmd === "help") {
            setHistory(prev => [...prev, "Available: create [title], list, clear"]);
        } else if (cmd === "create" && cmdParts.length > 1) {
            const title = cmdParts.slice(1).join(" ");
            setHistory(prev => [...prev, `AI: Architecting node '${title}'...`]);

            try {
                const newNode = {
                    title,
                    color: Math.floor(Math.random() * 16777215),
                    position: { x: (Math.random() - 0.5) * 20, y: (Math.random() - 0.5) * 20, z: (Math.random() - 0.5) * 10 }
                };
                // For now, optimistic update + mock if no env
                onNodeCreated(newNode);
                setHistory(prev => [...prev, `Success: '${title}' materialized in the palace.`]);
            } catch (err) {
                setHistory(prev => [...prev, "Error: Failed to sync with Supabase."]);
            }
        } else if (cmd === "list") {
            if (nodes.length === 0) {
                setHistory(prev => [...prev, "AI: Your mind palace is currently empty."]);
            } else {
                setHistory(prev => [...prev, "Nodes in mind palace:", ...nodes.map(n => `- ${n.title}`)]);
            }
        } else if (cmd === "clear") {
            setHistory([]);
        } else {
            setHistory(prev => [...prev, `AI: Thinking about '${cmd}'...`]);
        }

        setInput("");
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="glass-dark p-4 rounded-full hover:scale-110 border border-cyan-500/30 transition-all pointer-events-auto palace-button shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                data-cursor="BOX"
                data-cursor-magnetic
            >
                <TerminalIcon className="w-6 h-6 text-cyan-400" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-24 right-8 w-96 h-[500px] z-[100] glass-dark rounded-2xl border border-white/10 flex flex-col overflow-hidden pointer-events-auto shadow-2xl"
                    >
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-2">
                                <Command className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-bold tracking-widest uppercase">Palace Terminal</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:text-red-400 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 text-cyan-50/70">
                            {history.map((line, i) => (
                                <div key={i} className={cn(line.startsWith(">") ? "text-purple-400" : "text-cyan-400/80")}>
                                    {line}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleCommand} className="p-4 bg-white/5">
                            <div className="flex items-center gap-2">
                                <span className="text-purple-400 font-bold">$</span>
                                <input
                                    autoFocus
                                    className="bg-transparent border-none outline-none flex-1 text-xs text-white"
                                    placeholder="Ask AI or manage nodes..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
