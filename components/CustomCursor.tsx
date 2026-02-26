"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
    const [hoverType, setHoverType] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia("(pointer: coarse), (max-width: 768px)").matches);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // The "Target" is what the spring follows. It shifts when magnetic.
    const targetX = useMotionValue(0);
    const targetY = useMotionValue(0);

    const ringX = useSpring(targetX, { damping: 30, stiffness: 600, mass: 0.5 });
    const ringY = useSpring(targetY, { damping: 30, stiffness: 600, mass: 0.5 });

    const currentHoverRef = useRef<string | null>(null);

    useEffect(() => {
        const updateTarget = () => {
            targetX.set(mouseX.get());
            targetY.set(mouseY.get());
        };

        const moveMouse = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            updateTarget();
            if (!isVisible) setIsVisible(true);
        };

        const handleHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const interactable = target.closest("[data-cursor]");

            if (interactable) {
                const type = interactable.getAttribute("data-cursor");
                setHoverType(type);
                currentHoverRef.current = type;
            } else {
                const fallback = target.closest("button, a, .interactive");
                if (fallback) {
                    setHoverType("SELECT");
                    currentHoverRef.current = "SELECT";
                } else if (target.tagName === "CANVAS" || target.closest("canvas")) {
                    setHoverType("EYE");
                    currentHoverRef.current = "EYE";
                } else {
                    setHoverType(null);
                    currentHoverRef.current = null;
                }
            }
            updateTarget();
        };

        window.addEventListener("mousemove", moveMouse);
        window.addEventListener("mouseover", handleHover);

        return () => {
            window.removeEventListener("mousemove", moveMouse);
            window.removeEventListener("mouseover", handleHover);
        };
    }, [isVisible]);
    // Removed hoverType from dependencies

    if (!isVisible || isMobile) return null;

    const isHovered = !!hoverType;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {/* Standard Cursor Layer (Ring & Crosshairs) */}
            <motion.div
                style={{
                    x: ringX,
                    y: ringY,
                }}
                className="absolute top-0 left-0"
            >
                <div className="relative">
                    {/* Rotating Dash Ring */}
                    <motion.div
                        style={{ x: "-50%", y: "-50%" }}
                        animate={{
                            scale: isHovered ? 1.6 : 1,
                            rotate: isHovered ? 180 : 0,
                            borderColor: isHovered ? "rgba(34, 211, 238, 0.5)" : "rgba(34, 211, 238, 0.2)",
                        }}
                        transition={{
                            rotate: isHovered ? { repeat: Infinity, duration: 4, ease: "linear" } : { duration: 0.3 },
                            scale: { type: "spring", stiffness: 300, damping: 25 }
                        }}
                        className="absolute border border-dashed mix-blend-screen w-10 h-10 rounded-full"
                    />


                    {/* Circular Crosshairs */}
                    <AnimatePresence mode="wait">
                        {isHovered && (
                            <motion.div
                                key="brackets"
                                initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
                                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                                exit={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
                                className="absolute top-0 left-0 w-12 h-12"
                            >
                                <div className="absolute top-0 left-0 w-2 h-1.5 border-t border-l border-cyan-400/60" />
                                <div className="absolute top-0 right-0 w-2 h-1.5 border-t border-r border-cyan-400/60" />
                                <div className="absolute bottom-0 left-0 w-2 h-1.5 border-b border-l border-cyan-400/60" />
                                <div className="absolute bottom-0 right-0 w-2 h-1.5 border-b border-r border-cyan-400/60" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Label Wrapper */}
                    <AnimatePresence mode="wait">
                        {hoverType && (
                            <motion.div
                                key={hoverType}
                                initial={{ opacity: 0, x: 15, y: "-50%" }}
                                animate={{
                                    opacity: 1,
                                    x: 25,
                                    y: "-50%"
                                }}
                                exit={{ opacity: 0, x: 15 }}
                                className="absolute top-0 left-0 text-[6px] font-bold tracking-[0.4em] text-cyan-400/80 uppercase whitespace-nowrap"
                            >
                                {hoverType === "EYE" ? "SCANNING_ID" : hoverType === "BOX" ? "SYS_ACTION" : "INTERACT"}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Inner Dot Layer */}
            <motion.div
                style={{ x: mouseX, y: mouseY }}
                className="absolute top-0 left-0"
            >
                <motion.div
                    style={{ x: "-50%", y: "-50%" }}
                    animate={{
                        scale: isHovered ? 0.4 : 1,
                        backgroundColor: isHovered ? "#a855f7" : "#22d3ee",
                    }}
                    className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.6)]"
                />
            </motion.div>
        </div>
    );
}
