"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
    const [hoverType, setHoverType] = useState<string | null>(null);
    const [boxDimensions, setBoxDimensions] = useState<{ width: number, height: number } | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // The "Target" is what the spring follows. It shifts when magnetic.
    const targetX = useMotionValue(0);
    const targetY = useMotionValue(0);

    const ringX = useSpring(targetX, { damping: 30, stiffness: 600, mass: 0.5 });
    const ringY = useSpring(targetY, { damping: 30, stiffness: 600, mass: 0.5 });

    // Use a ref for the magnetic position to keep logic stable across renders
    const magneticPosRef = useRef<{ x: number, y: number } | null>(null);
    const currentHoverRef = useRef<string | null>(null); // Added currentHoverRef

    useEffect(() => {
        const updateTarget = () => {
            const mX = mouseX.get();
            const mY = mouseY.get();
            const mag = magneticPosRef.current;
            const type = currentHoverRef.current;

            if (mag) {
                // Break the magnetic lock if the mouse moves too far (e.g., 120px)
                const dist = Math.sqrt(Math.pow(mX - mag.x, 2) + Math.pow(mY - mag.y, 2));
                if (dist > 120) {
                    magneticPosRef.current = null;
                    targetX.set(mX);
                    targetY.set(mY);
                    return;
                }

                // Determine snap strength: 100% for BOX, 50% for planets
                const isBox = type === "BOX";
                const strength = isBox ? 1.0 : 0.5;

                targetX.set(mX + (mag.x - mX) * strength);
                targetY.set(mY + (mag.y - mY) * strength);
            } else {
                targetX.set(mX);
                targetY.set(mY);
            }
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

                // ONLY set magnetic position for BOX or specifically marked magnetic elements
                // The background EYE should NOT be magnetic
                if (type === "BOX" || interactable.hasAttribute("data-cursor-magnetic")) {
                    const rect = interactable.getBoundingClientRect();
                    magneticPosRef.current = {
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2
                    };
                } else {
                    magneticPosRef.current = null;
                }

                if (type === "BOX") {
                    const rect = interactable.getBoundingClientRect();
                    setBoxDimensions({
                        width: rect.width + 12,
                        height: rect.height + 12
                    });
                } else {
                    setBoxDimensions(null);
                }
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
                magneticPosRef.current = null;
                setBoxDimensions(null);
            }
            updateTarget();
        };

        const handleNodeMagnetic = (e: any) => {
            const { x, y } = e.detail;
            if (x !== undefined && y !== undefined) {
                magneticPosRef.current = { x, y };
                setHoverType("EYE");
                currentHoverRef.current = "EYE";
                setBoxDimensions(null);
            } else {
                magneticPosRef.current = null;
            }
            updateTarget();
        };

        window.addEventListener("mousemove", moveMouse);
        window.addEventListener("mouseover", handleHover);
        window.addEventListener("mind-palace-node-magnetic", handleNodeMagnetic);

        return () => {
            window.removeEventListener("mousemove", moveMouse);
            window.removeEventListener("mouseover", handleHover);
            window.removeEventListener("mind-palace-node-magnetic", handleNodeMagnetic);
        };
    }, [isVisible]); // Removed hoverType from dependencies

    if (!isVisible) return null;

    const isHovered = !!hoverType;
    const isBox = hoverType === "BOX" && !!boxDimensions;

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
                    {!isBox && (
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
                    )}

                    {/* Selection Box */}
                    <AnimatePresence>
                        {isBox && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    width: boxDimensions.width,
                                    height: boxDimensions.height,
                                    x: "-50%",
                                    y: "-50%"
                                }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                                className="absolute top-0 left-0 border border-cyan-400/60 bg-cyan-400/10 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                            >
                                <div className="absolute -top-1 -left-1 w-2.5 h-2 border-t-2 border-l-2 border-cyan-400" />
                                <div className="absolute -top-1 -right-1 w-2.5 h-2 border-t-2 border-r-2 border-cyan-400" />
                                <div className="absolute -bottom-1 -left-1 w-2.5 h-2 border-b-2 border-l-2 border-cyan-400" />
                                <div className="absolute -bottom-1 -right-1 w-2.5 h-2 border-b-2 border-r-2 border-cyan-400" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Circular Crosshairs */}
                    <AnimatePresence mode="wait">
                        {(isHovered && !isBox) && (
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
                                    x: isBox ? (boxDimensions.width / 2 + 10) : 25,
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
