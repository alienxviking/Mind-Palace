"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import Experience from "@/components/Experience";
import Terminal from "@/components/Terminal";
import NodeModal from "@/components/NodeModal";
import LandingUI from "@/components/LandingUI";
import AuthUI from "@/components/AuthUI";

import { analyzeNodeContent, suggestLinks } from "@/lib/ai";
import { getDeepDiveContent } from "@/lib/actions";
import { fetchNodes, fetchEdges, createNode, createEdge, deleteNode, updateNode, supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";

const ALL_PLANET_TYPES = [
    "earth", "mars", "jupiter", "saturn", "venus",
    "mercury", "neptune", "uranus", "moon",
    "ceres", "eris", "haumea", "makemake"
];

export default function Home() {
    const router = useRouter();
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [nodes, setNodes] = useState<any[]>([]);
    const [edges, setEdges] = useState<any[]>([]);
    const [planetPool, setPlanetPool] = useState<string[]>([]);

    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const [isEntered, setIsEntered] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
    const [isLocked, setIsLocked] = useState(true);

    // Initial Setup
    useEffect(() => {
        const initData = async () => {
            if (session) {
                try {
                    const [dbNodes, dbEdges] = await Promise.all([fetchNodes(), fetchEdges()]);

                    // Format nodes for 3D state
                    const formattedNodes = dbNodes.map((n: any) => ({
                        ...n,
                        planetType: n.planet_type,
                    }));

                    // Format edges for 3D state
                    const formattedEdges = dbEdges.map((e: any) => ({
                        id: e.id,
                        source: e.source_id,
                        target: e.target_id
                    }));

                    setNodes(formattedNodes);
                    setEdges(formattedEdges);

                    // Initialize planet pool excluding existing planets
                    const usedPlanets = formattedNodes.map((n: any) => n.planetType);
                    const available = ALL_PLANET_TYPES.filter(p => !usedPlanets.includes(p));
                    setPlanetPool(available.sort(() => Math.random() - 0.5));
                } catch (err) {
                    console.error("Failed to fetch Mind Palace:", err);
                }
            }
        };
        initData();
    }, [session]);

    useEffect(() => {
        // Handle Auth State
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            if (session && event === 'SIGNED_IN') {
                setIsEntered(true);
                setIsAuthOpen(false);
            }
        });

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSelectedNode(null);
                setIsTerminalOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            subscription.unsubscribe();
        };
    }, []);

    const handleNodeCreated = async (newNode: any) => {
        const aiResult = await analyzeNodeContent(newNode.title);

        let pool = [...planetPool];
        if (pool.length === 0) {
            pool = [...ALL_PLANET_TYPES].sort(() => Math.random() - 0.5);
        }

        const selectedPlanet = pool.pop()!;
        setPlanetPool(pool);

        const nodeData = {
            ...newNode,
            position: [newNode.position.x, newNode.position.y, newNode.position.z],
            tags: aiResult.tags,
            summary: aiResult.summary,
            planetType: selectedPlanet
        };

        try {
            // Persist Node to Supabase
            const savedNode = await createNode(nodeData);
            const formattedNode = { ...savedNode, planetType: savedNode.planet_type };

            setNodes(prev => [...prev, formattedNode]);

            // Suggest and Persist Edges
            const allNodes = [...nodes, formattedNode];
            const suggestedLinks = await suggestLinks(allNodes);

            // Only save NEW links to avoid duplicates
            const currentEdgeKeys = new Set(edges.map(e => `${e.source}-${e.target}`));
            const newLinks = suggestedLinks.filter(l => !currentEdgeKeys.has(`${l.source}-${l.target}`));

            for (const link of newLinks) {
                await createEdge({ source_id: link.source, target_id: link.target });
            }

            // Refresh local edges
            const refreshedEdges = await fetchEdges();
            setEdges(refreshedEdges.map((e: any) => ({
                id: e.id,
                source: e.source_id,
                target: e.target_id
            })));

        } catch (err) {
            console.error("Failed to save node:", err);
        }
    };

    const handleNodeDelete = async (id: any) => {
        try {
            await deleteNode(id);
            setNodes(prev => prev.filter(n => n.id !== id));
            setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
            setSelectedNode(null);
        } catch (err) {
            console.error("Failed to delete node:", err);
        }
    };

    const handleConnectNodes = async (sourceId: string, targetId: string) => {
        try {
            await createEdge({ source_id: sourceId, target_id: targetId });
            const refreshedEdges = await fetchEdges();
            setEdges(refreshedEdges.map((e: any) => ({
                id: e.id,
                source: e.source_id,
                target: e.target_id
            })));
        } catch (err) {
            console.error("Failed to connect nodes:", err);
        }
    };

    const handleDeepDive = async (id: any) => {
        router.push(`/deep-dive/${id}`);
    };

    const handleNodePositionUpdate = async (id: string, newPos: [number, number, number]) => {
        try {
            await updateNode(id, { position: newPos });
            setNodes(prev => prev.map(n => n.id === id ? { ...n, position: newPos } : n));
        } catch (err) {
            console.error("Failed to update node position:", err);
        }
    };

    return (
        <main className="relative w-full h-screen overflow-hidden">
            <Experience
                nodes={nodes}
                edges={edges}
                selectedNode={selectedNode}
                onNodeSelect={setSelectedNode}
                isEntered={isEntered}
                onLoaded={setIsLoaded}
                isLocked={isLocked}
                onNodePositionUpdate={handleNodePositionUpdate}
            />

            {!isEntered && (
                <LandingUI
                    isLoaded={isLoaded}
                    onEnter={() => {
                        if (session) {
                            setIsEntered(true);
                        } else {
                            setIsAuthOpen(true);
                        }
                    }}
                    onSignIn={() => setIsAuthOpen(true)}
                />
            )}

            <AuthUI
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
            />

            {isEntered && (
                <>
                    <div id="ui-layer" className="fixed inset-0 z-10 pointer-events-none p-8 flex flex-col justify-between">
                        <header className="pointer-events-auto flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-semibold tracking-[0.2em] logo text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 uppercase">
                                    MIND PALACE
                                </h1>
                                <p className="text-[10px] opacity-40 font-bold uppercase tracking-[0.8em] mt-2 font-plus-jakarta">
                                    Knowledge Visualization OS
                                </p>
                            </div>

                            {session && (
                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        onClick={() => {
                                            supabase.auth.signOut();
                                            setIsEntered(false);
                                        }}
                                        className="group flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-full transition-all"
                                    >
                                        <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 group-hover:text-red-400 transition-colors uppercase">
                                            Terminate Session
                                        </span>
                                        <LogOut size={14} className="text-white/20 group-hover:text-red-400 transition-colors" />
                                    </button>

                                    <button
                                        onClick={() => setIsLocked(!isLocked)}
                                        className={cn(
                                            "group flex items-center gap-3 px-6 py-3 border rounded-full transition-all",
                                            isLocked
                                                ? "bg-white/5 border-white/10 hover:border-cyan-500/30"
                                                : "bg-cyan-500/20 border-cyan-500/50 hover:bg-cyan-500/30"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-[10px] font-bold tracking-[0.3em] uppercase transition-colors",
                                            isLocked ? "text-white/40 group-hover:text-cyan-400" : "text-cyan-400"
                                        )}>
                                            {isLocked ? "Palace Locked" : "Palace Editing"}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </header>

                        <footer className="pointer-events-auto flex justify-between items-end w-full">
                            <div className="glass p-4 rounded-xl max-w-xs">
                                <p className="text-xs opacity-50 mb-2">HOTKEYS</p>
                                <div className="flex flex-col gap-1 text-[10px] font-mono text-white/60">
                                    <div className="flex gap-3">
                                        <span className="text-cyan-400 font-bold">[L-CLICK]</span> <span>PAN</span>
                                        <span className="text-cyan-400 font-bold">[R-CLICK]</span> <span>ROTATE</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-cyan-400 font-bold">[ESC]</span> <span>RESET VIEW</span>
                                    </div>
                                </div>
                            </div>

                            <Terminal
                                nodes={nodes}
                                onNodeCreated={handleNodeCreated}
                                onNodeDelete={handleNodeDelete}
                                onNodeSelect={setSelectedNode}
                                onConnect={handleConnectNodes}
                                isOpen={isTerminalOpen}
                                setIsOpen={setIsTerminalOpen}
                            />
                        </footer>
                    </div>

                    <NodeModal
                        node={selectedNode}
                        onClose={() => setSelectedNode(null)}
                        onDelete={handleNodeDelete}
                        onDeepDive={handleDeepDive}
                    />
                </>
            )}
        </main>
    );
}
