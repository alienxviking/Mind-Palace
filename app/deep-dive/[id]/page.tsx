"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, PerspectiveCamera, OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { fetchNodes } from "@/lib/supabase";
import { getTopicResponse } from "@/lib/actions";
import { ArrowLeft, Send, Sparkles, Loader2, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const ImmersivePlanet = ({ planetType }: { planetType: string }) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const textureUrls: Record<string, string> = {
        earth: "/planets/earth_day.jpg",
        mars: "/planets/mars.jpg",
        jupiter: "/planets/jupiter.jpg",
        saturn: "/planets/saturn.jpg",
        venus: "/planets/venus.jpg",
        mercury: "/planets/mercury.jpg",
        neptune: "/planets/neptune.jpg",
        uranus: "/planets/uranus.jpg",
        moon: "/planets/moon.jpg",
        generic: "/planets/moon.jpg"
    };

    const cloudsRef = useRef<THREE.Mesh>(null!);
    const texture = useTexture(textureUrls[planetType] || textureUrls.generic);
    const cloudsTexture = planetType === "earth" ? useTexture("/planets/clouds.jpg") : null;
    const atmosphereTexture = planetType === "venus" ? useTexture("/planets/venus_atmosphere.jpg") : null;

    useFrame(() => {
        if (meshRef.current) meshRef.current.rotation.y += 0.001;
        if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0015;
    });

    return (
        <group>
            <mesh ref={meshRef} position={[0, 0, 0]}>
                <sphereGeometry args={[5, 64, 64]} />
                <meshStandardMaterial map={texture} />
            </mesh>

            {/* Atmosphere / Clouds Layer */}
            {(cloudsTexture || atmosphereTexture) && (
                <mesh ref={cloudsRef} scale={1.02}>
                    <sphereGeometry args={[5, 64, 64]} />
                    <meshStandardMaterial
                        map={cloudsTexture || atmosphereTexture}
                        transparent
                        opacity={0.4}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            )}

            {/* Atmosphere Glow */}
            <mesh scale={1.1}>
                <sphereGeometry args={[5, 64, 64]} />
                <shaderMaterial
                    transparent
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                    uniforms={{
                        color: { value: new THREE.Color(0x4488ff) },
                        coeficient: { value: 0.1 },
                        power: { value: 6.0 },
                        opacity: { value: 0.3 }
                    }}
                    vertexShader={`
                        varying vec3 vNormal;
                        varying vec3 vEyeVector;
                        void main() {
                            vNormal = normalize(normalMatrix * normal);
                            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                            vEyeVector = -vec3(mvPosition.xyz);
                            gl_Position = projectionMatrix * mvPosition;
                        }
                    `}
                    fragmentShader={`
                        uniform vec3 color;
                        uniform float coeficient;
                        uniform float power;
                        uniform float opacity;
                        varying vec3 vNormal;
                        varying vec3 vEyeVector;
                        void main() {
                            float dotProduct = dot(vNormal, normalize(vEyeVector));
                            float intensity = pow(coeficient + dotProduct, power);
                            gl_FragColor = vec4(color, intensity * opacity);
                        }
                    `}
                />
            </mesh>
        </group>
    );
};

export default function DeepDivePage() {
    const { id } = useParams();
    const router = useRouter();
    const [node, setNode] = useState<any>(null);
    const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                router.push("/palace");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    useEffect(() => {
        const loadNode = async () => {
            try {
                const nodes = await fetchNodes();
                // Ensure String comparison to handle both UUID and Integer IDs
                const found = nodes.find((n: any) => String(n.id) === String(id));
                if (found) {
                    setNode(found);
                    setMessages([{
                        role: "ai",
                        content: `Welcome to the core of '${found.title}'. I'm here to provide a deep dive into this topic. What would you like to explore?`
                    }]);
                } else {
                    console.error("Node not found:", id);
                    router.push("/palace");
                }
            } catch (err) {
                console.error("Failed to load node:", err);
                router.push("/palace");
            }
        };
        loadNode();
    }, [id, router]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isThinking) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsThinking(true);

        try {
            // Gemini history MUST start with a 'user' message. 
            // Our index 0 is always the AI greeting, so we skip it for history.
            const historyForAi = messages.slice(1).map(m => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }]
            }));
            const aiResponse = await getTopicResponse(node.title, userMsg, historyForAi);
            setMessages(prev => [...prev, { role: "ai", content: aiResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: "ai", content: "I encountered an error while processing your request. Please try again." }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <main className="relative h-screen w-full bg-[#020408] overflow-hidden flex">
            <AnimatePresence>
                {!node && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black flex items-center justify-center"
                    >
                        <div className="flex flex-col items-center gap-8">
                            <div className="w-64 h-[2px] bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                                <motion.div
                                    className="absolute inset-0 bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "0%" }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </div>
                            <span className="text-[10px] tracking-[0.8em] text-cyan-400 font-bold uppercase animate-pulse">
                                Accessing Core Concepts...
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 15] }}>
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <ambientLight intensity={0.1} />
                    <directionalLight position={[10, 10, 10]} intensity={2.5} color="#ffffff" castShadow />
                    <pointLight position={[-10, -5, -10]} intensity={0.5} color="#4488ff" />
                    {node && <ImmersivePlanet planetType={node.planet_type || "generic"} />}
                    <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} enablePan={false} />
                </Canvas>
            </div>

            {/* UI Overlay */}
            <div className="relative z-10 flex w-full h-full p-8 gap-8">
                {/* Content Panel */}
                <div className="flex-1 flex flex-col justify-between">
                    {node && (
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <button
                                onClick={() => router.push("/palace")}
                                className="flex items-center gap-2 text-white/40 hover:text-cyan-400 transition-colors mb-8 group"
                            >
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                <span className="text-xs font-bold uppercase tracking-[0.3em]">Return to Palace</span>
                            </button>

                            <h1 className="text-6xl font-bold logo text-white mb-4 tracking-tight uppercase">
                                {node.title}
                            </h1>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {node.tags?.map((tag: string) => (
                                    <span key={tag} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="glass p-8 rounded-3xl border border-white/10 max-w-2xl">
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.4em] mb-4">Core Knowledge Summary</h3>
                                <p className="text-lg text-white/80 leading-relaxed font-plus-jakarta">
                                    {node.summary}
                                </p>
                            </div>

                            {/* Hotkeys Section */}
                            <div className="mt-8 flex gap-6 text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-400 font-bold">ESC</span>
                                    <span>Return to Palace</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Chat Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-[450px] glass rounded-[2.5rem] border border-white/10 flex flex-col overflow-hidden backdrop-blur-3xl bg-black/40"
                >
                    {node && (
                        <>
                            <div className="p-6 border-b border-white/5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                                    <Sparkles size={20} className="text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Topic Expert</h3>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Context Locked: {node.title}</p>
                                </div>
                            </div>

                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
                            >
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex gap-4 max-w-[85%]",
                                            msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border",
                                            msg.role === "user" ? "bg-white/5 border-white/10" : "bg-cyan-500/20 border-cyan-500/30"
                                        )}>
                                            {msg.role === "user" ? <User size={14} className="text-white/40" /> : <Bot size={14} className="text-cyan-400" />}
                                        </div>
                                        <div className={cn(
                                            "p-4 rounded-2xl text-sm leading-relaxed",
                                            msg.role === "user"
                                                ? "bg-white/5 text-white/80 rounded-tr-none"
                                                : "bg-cyan-500/5 text-cyan-100/90 border border-cyan-500/10 rounded-tl-none prose prose-invert prose-sm max-w-none"
                                        )}>
                                            {msg.role === "user" ? (
                                                msg.content
                                            ) : (
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkMath]}
                                                    rehypePlugins={[rehypeKatex]}
                                                    components={{
                                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                        h1: ({ children }) => <h1 className="text-lg font-bold text-cyan-400 mb-2">{children}</h1>,
                                                        h2: ({ children }) => <h2 className="text-base font-bold text-cyan-400 mb-2">{children}</h2>,
                                                        h3: ({ children }) => <h3 className="text-sm font-bold text-cyan-400 mb-2">{children}</h3>,
                                                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 gap-1 flex flex-col">{children}</ul>,
                                                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 gap-1 flex flex-col">{children}</ol>,
                                                        li: ({ children }) => <li className="text-white/80">{children}</li>,
                                                        strong: ({ children }) => <strong className="text-cyan-400 font-bold">{children}</strong>,
                                                        code: ({ children }) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-xs">{children}</code>
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {isThinking && (
                                    <div className="flex gap-4 mr-auto">
                                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                                            <Loader2 size={14} className="text-cyan-400 animate-spin" />
                                        </div>
                                        <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-400/50 text-xs tracking-widest italic rounded-tl-none">
                                            SYNCHRONIZING_NEURAL_NET...
                                        </div>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSendMessage} className="p-6 bg-black/20">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={`Ask about ${node.title}...`}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isThinking}
                                        className="absolute right-2 top-2 bottom-2 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:hover:bg-cyan-500 text-black rounded-xl transition-all flex items-center justify-center"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
        </main>
    );
}
