"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, PerspectiveCamera, Float, Text, Line, Billboard, Html, useTexture, useProgress } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect, Suspense, memo } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { motion, AnimatePresence } from "framer-motion";

const NeuralPulseEdge = memo(({ start, end, delay = 0 }: { start: [number, number, number], end: [number, number, number], delay?: number }) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null!);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), delay * 1000);
        return () => clearTimeout(timer);
    }, [delay]);

    const curve = useMemo(() => {
        const vStart = new THREE.Vector3(...start);
        const vEnd = new THREE.Vector3(...end);

        // Organic neural curve calculation
        const dist = vStart.distanceTo(vEnd);
        const midPoint = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);
        midPoint.y += dist * 0.2; // Curve height based on distance
        midPoint.z += (Math.random() - 0.5) * 1.5;

        return new THREE.QuadraticBezierCurve3(vStart, midPoint, vEnd);
    }, [start, end]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    if (!visible) return null;

    return (
        <mesh>
            <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
            <shaderMaterial
                ref={materialRef}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uniforms={{
                    uTime: { value: 0 },
                    uColor: { value: new THREE.Color(0x00f2ff) }
                }}
                vertexShader={`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `}
                fragmentShader={`
                    uniform float uTime;
                    uniform vec3 uColor;
                    varying vec2 vUv;
                    void main() {
                        // High-speed energy flow animation - even faster and wider
                        float flow = fract(vUv.x - uTime * 1.2);
                        float pulse = smoothstep(0.2, 0.5, flow) * smoothstep(0.8, 0.5, flow);
                        
                        // Softer side glow (maintains fullness from all angles)
                        // Lower power (1.2 instead of 2.5) means less transparent edges
                        float edgeGlow = pow(sin(vUv.y * 3.14159), 1.2);
                        
                        // Base constant brightness + dynamic pulse
                        float finalAlpha = (0.4 + pulse * 2.0) * edgeGlow * 0.8;
                        vec3 finalColor = mix(uColor, vec3(1.0), pulse * 0.8);
                        
                        gl_FragColor = vec4(finalColor, finalAlpha);
                    }
                `}
            />
        </mesh>
    );
});

const Node = memo(({ id, position, title, color: nodeColor, isSelected, onClick, planetType, isLocked, onPositionChange, onDragStart, onDragEnd }: any) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const cloudsRef = useRef<THREE.Mesh>(null!);
    const ringsRef = useRef<THREE.Mesh>(null!);
    const [hovered, setHover] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [scale, setScale] = useState(0);
    const [currentPosition, setCurrentPosition] = useState(position);

    useEffect(() => {
        setCurrentPosition(position);
    }, [position]);

    // Map all 17 high-res textures
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
        ceres: "/planets/ceres_fictional.jpg",
        eris: "/planets/eris_fictional.jpg",
        haumea: "/planets/haumea_fictional.jpg",
        makemake: "/planets/makemake_fictional.jpg",
        generic: "/planets/moon.jpg"
    };

    const texture = useTexture(textureUrls[planetType] || textureUrls.generic);
    const cloudsTexture = planetType === "earth" ? useTexture("/planets/clouds.jpg") : null;
    const atmosphereTexture = planetType === "venus" ? useTexture("/planets/venus_atmosphere.jpg") : null;
    const ringsTexture = planetType === "saturn" ? useTexture("/planets/saturn_ring.png") : null;

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.to({ val: 0 }, {
                val: 1,
                duration: 1.5,
                delay: 1.5 + Math.random() * 0.5,
                onUpdate: function () {
                    setScale(this.targets()[0].val);
                }
            });
        });
        return () => ctx.revert();
    }, []);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.002;
            meshRef.current.position.y += Math.sin(state.clock.getElapsedTime() + position[0]) * 0.002;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += 0.003;
        }
        if (ringsRef.current) {
            ringsRef.current.rotation.z += 0.001;
        }
        if (hovered) {
            const vector = new THREE.Vector3();
            meshRef.current.getWorldPosition(vector);
            vector.project(state.camera);
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;
            window.dispatchEvent(new CustomEvent('mind-palace-node-magnetic', { detail: { x, y } }));
        }
    });

    const handlePointerDown = (e: any) => {
        if (isLocked) return;
        e.stopPropagation();
        setDragging(true);
        onDragStart?.();
        // Set the mesh to be the capture target
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerUp = (e: any) => {
        if (!dragging) return;
        setDragging(false);
        onDragEnd?.();
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        onPositionChange?.(id, currentPosition);
    };

    const handlePointerMove = (e: any) => {
        if (!dragging || isLocked) return;
        e.stopPropagation();

        // Project mouse position to world space at the node's depth
        const vector = new THREE.Vector3(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1,
            0.5
        );

        vector.unproject(e.camera);
        const dir = vector.sub(e.camera.position).normalize();
        const distance = -e.camera.position.z / dir.z; // Assumes camera looks along Z
        const pos = e.camera.position.clone().add(dir.multiplyScalar(distance));

        setCurrentPosition([pos.x, pos.y, currentPosition[2]]);
    };

    return (
        <group position={currentPosition} scale={scale * (hovered || isSelected || dragging ? 1.2 : 1)}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => {
                    setHover(false);
                    window.dispatchEvent(new CustomEvent('mind-palace-node-magnetic', { detail: { x: undefined, y: undefined } }));
                }}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerMove={handlePointerMove}
                onClick={() => !dragging && onClick()}
            >
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={texture}
                    emissive={hovered ? 0xffffff : nodeColor}
                    emissiveIntensity={hovered ? 0.1 : 0.0}
                    metalness={0.0}
                    roughness={1.0}
                />

                {/* Atmosphere / Glow - Diffused Fresnel Effect */}
                <mesh scale={1.15}>
                    <sphereGeometry args={[1, 64, 64]} />
                    <shaderMaterial
                        transparent
                        blending={THREE.AdditiveBlending}
                        side={THREE.BackSide}
                        uniforms={{
                            color: { value: hovered || isSelected ? new THREE.Color(0xffffff) : new THREE.Color(nodeColor) },
                            coeficient: { value: 0.1 },
                            power: { value: hovered || isSelected ? 6.0 : 10.0 },
                            opacity: { value: hovered || isSelected ? 0.2 : 0.1 }
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

                {/* Clouds Layer (Earth) or Atmosphere Layer (Venus) */}
                {(cloudsTexture || atmosphereTexture) && (
                    <mesh ref={cloudsRef} scale={1.02}>
                        <sphereGeometry args={[1, 64, 64]} />
                        <meshStandardMaterial
                            map={cloudsTexture || atmosphereTexture}
                            transparent
                            opacity={0.4 * scale}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                )}
            </mesh>

            {/* Saturn Rings - Radial Shader for high-fidelity mapping */}
            {ringsTexture && (
                <mesh ref={ringsRef} rotation={[Math.PI / 6.6, 0.4, 0]}>
                    <ringGeometry args={[1.4, 2.4, 128]} />
                    <shaderMaterial
                        transparent
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                        uniforms={{
                            tRing: { value: ringsTexture },
                            innerRadius: { value: 1.4 },
                            outerRadius: { value: 2.4 },
                            opacity: { value: 0.8 * scale }
                        }}
                        vertexShader={`
                            varying vec2 vUv;
                            varying vec3 vPos;
                            void main() {
                                vUv = uv;
                                vPos = position;
                                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                            }
                        `}
                        fragmentShader={`
                            uniform sampler2D tRing;
                            uniform float opacity;
                            varying vec2 vUv;
                            varying vec3 vPos;
                            void main() {
                                // Calculate radial distance from center
                                float dist = length(vPos.xy);
                                float inner = 1.4;
                                float outer = 2.4;
                                
                                // Map distance (inner to outer) to texture UV (0 to 1)
                                float radialUv = (dist - inner) / (outer - inner);
                                
                                if (radialUv < 0.0 || radialUv > 1.0) discard;
                                
                                vec4 texColor = texture2D(tRing, vec2(radialUv, 0.5));
                                gl_FragColor = vec4(texColor.rgb, texColor.a * opacity);
                            }
                        `}
                    />
                </mesh>
            )}

            {(hovered || isSelected) && (
                <Html
                    position={[0, 2.5, 0]}
                    center
                    distanceFactor={6}
                    className="pointer-events-none select-none"
                    zIndexRange={[0, 0]}
                    transform
                >
                    <div className="flex flex-col items-center gap-2">
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1.2 }}
                            className="px-6 py-3 glass-dark border border-cyan-400/40 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.3)]"
                        >
                            <span className="text-white text-xl font-bold whitespace-nowrap tracking-wider font-space-grotesk uppercase">
                                {title}
                            </span>
                        </motion.div>
                        <div className="w-px h-8 bg-gradient-to-b from-cyan-400/50 to-transparent" />
                    </div>
                </Html>
            )}
        </group>
    );
});

const HeroPlanet = ({ isEntered }: { isEntered: boolean }) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const cloudsRef = useRef<THREE.Mesh>(null!);
    const earthTexture = useTexture("/planets/earth.jpg");
    const cloudsTexture = useTexture("/planets/clouds.jpg");
    const [opacity, setOpacity] = useState(1);

    useFrame((state) => {
        if (meshRef.current) meshRef.current.rotation.y += 0.001;
        if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0012;
    });

    useEffect(() => {
        if (isEntered) {
            gsap.to({ val: 1 }, {
                val: 0,
                duration: 2,
                ease: "power2.inOut",
                onUpdate: function () {
                    setOpacity(this.targets()[0].val);
                }
            });
            gsap.to(meshRef.current.scale, {
                x: 8,
                y: 8,
                z: 8,
                duration: 2.5,
                ease: "power2.inOut"
            });
        } else {
            // Reset Earth when session terminates or user is at landing
            gsap.to({ val: opacity }, {
                val: 1,
                duration: 1.5,
                ease: "power2.out",
                onUpdate: function () {
                    setOpacity(this.targets()[0].val);
                }
            });
            gsap.to(meshRef.current.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 1.5,
                ease: "power2.out"
            });
        }
    }, [isEntered]);

    return (
        <group scale={4}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={earthTexture}
                    transparent
                    opacity={opacity}
                    metalness={0.0}
                    roughness={1.0}
                />

                {/* Atmosphere Glow */}
                <mesh scale={1.2}>
                    <sphereGeometry args={[1, 64, 64]} />
                    <shaderMaterial
                        transparent
                        blending={THREE.AdditiveBlending}
                        side={THREE.BackSide}
                        uniforms={{
                            color: { value: new THREE.Color(0x4488ff) },
                            coeficient: { value: 0.05 },
                            power: { value: 10.0 },
                            opacity: { value: 0.3 * opacity }
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
            </mesh>

            <mesh ref={cloudsRef} scale={1.02}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={cloudsTexture}
                    transparent
                    opacity={0.4 * opacity}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
};

const SceneContent = ({ nodes, edges, selectedNode, onNodeSelect, isEntered, onLoaded, isLocked, onNodePositionUpdate }: any) => {
    const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
    const controlsRef = useRef<any>(null!);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isDraggingNode, setIsDraggingNode] = useState(false);

    useFrame(() => {
        if (controlsRef.current && isEntered && !isTransitioning && !isDraggingNode) {
            controlsRef.current.update();
        }
    });

    // Handle initial entry transition
    useEffect(() => {
        if (isEntered && cameraRef.current) {
            setIsTransitioning(true);
            // Even faster camera glide (1.2s)
            gsap.to(cameraRef.current.position, {
                x: 0,
                y: 0,
                z: 15,
                duration: 1.2,
                ease: "power3.inOut",
                onComplete: () => {
                    setIsTransitioning(false);
                }
            });
        } else if (!isEntered) {
            setIsTransitioning(false);
        }
    }, [isEntered]);

    useEffect(() => {
        if (!isEntered || isTransitioning) return;

        if (selectedNode && cameraRef.current && controlsRef.current) {
            const nodePos = new THREE.Vector3(...selectedNode.position);
            const targetCamPos = new THREE.Vector3(
                nodePos.x,
                nodePos.y,
                nodePos.z + 5
            );

            gsap.to(cameraRef.current.position, {
                x: targetCamPos.x,
                y: targetCamPos.y,
                z: targetCamPos.z,
                duration: 1,
                ease: "power2.out"
            });

            gsap.to(controlsRef.current.target, {
                x: nodePos.x,
                y: nodePos.y,
                z: nodePos.z,
                duration: 1,
                ease: "power2.out"
            });
        } else if (!selectedNode && cameraRef.current && controlsRef.current) {
            gsap.to(cameraRef.current.position, {
                x: 0,
                y: 0,
                z: 15,
                duration: 1,
                ease: "power2.out"
            });

            gsap.to(controlsRef.current.target, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1,
                ease: "power2.out"
            });
        }
    }, [selectedNode, isEntered, isTransitioning]);

    const starTexture = useTexture("/planets/stars.jpg");

    return (
        <>
            <LoadingTracker onLoaded={onLoaded} />
            <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 15]} far={1000} />
            <color attach="background" args={["#000000"]} />

            {/* Custom Starfield Background - Dimmed for focus */}
            <mesh scale={150}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshBasicMaterial map={starTexture} side={THREE.BackSide} fog={false} transparent opacity={0.4} />
            </mesh>

            <ambientLight intensity={0.1} />
            <directionalLight position={[20, 10, 20]} intensity={2.5} color="#fff" />
            <fog attach="fog" args={["#000000", 30, 180]} />

            <HeroPlanet isEntered={isEntered} />

            {/* PRE-MOUNTED: Mount early but keep inactive during transition */}
            {isEntered && (
                <>
                    {edges?.map((edge: any) => {
                        const sourceNode = nodes.find((n: any) => n.id === edge.source);
                        const targetNode = nodes.find((n: any) => n.id === edge.target);
                        if (!sourceNode || !targetNode) return null;
                        return (
                            <NeuralPulseEdge
                                key={`${edge.source}-${edge.target}`}
                                start={sourceNode.position}
                                end={targetNode.position}
                                delay={2.5} // Wait for planets to scale up (1.5s delay + 1.5s duration approx)
                            />
                        );
                    })}

                    {nodes.map((node: any) => (
                        <Node
                            key={node.id}
                            {...node}
                            isLocked={isLocked}
                            onDragStart={() => setIsDraggingNode(true)}
                            onDragEnd={() => setIsDraggingNode(false)}
                            onPositionChange={onNodePositionUpdate}
                            isSelected={selectedNode?.id === node.id}
                            onClick={() => !isTransitioning && onNodeSelect(node)}
                        />
                    ))}

                    <OrbitControls
                        ref={controlsRef}
                        enabled={!isTransitioning && !isDraggingNode}
                        enablePan={true}
                        screenSpacePanning={true}
                        enableZoom={true}
                        minDistance={1.5}
                        maxDistance={50}
                        autoRotate={!selectedNode && !isTransitioning}
                        autoRotateSpeed={0.5}
                        mouseButtons={{
                            LEFT: THREE.MOUSE.PAN,
                            MIDDLE: THREE.MOUSE.DOLLY,
                            RIGHT: THREE.MOUSE.ROTATE
                        }}
                    />
                </>
            )}
        </>
    );
};

const LoadingTracker = ({ onLoaded }: { onLoaded: (loaded: boolean) => void }) => {
    const { progress } = useProgress();
    useEffect(() => {
        if (progress === 100) {
            // Add a small buffer to ensure everything is actually rendered
            const timer = setTimeout(() => onLoaded(true), 500);
            return () => clearTimeout(timer);
        }
    }, [progress, onLoaded]);
    return null;
};

const Experience = memo(({ nodes, edges, selectedNode, onNodeSelect, isEntered, onLoaded, isLocked, onNodePositionUpdate }: any) => {
    return (
        <div className="absolute inset-0">
            <Canvas
                shadows
                gl={{ antialias: true, alpha: true }}
                camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 15] }}
            >
                <Suspense fallback={null}>
                    <SceneContent
                        nodes={nodes}
                        edges={edges}
                        selectedNode={selectedNode}
                        onNodeSelect={onNodeSelect}
                        isEntered={isEntered}
                        onLoaded={onLoaded}
                        isLocked={isLocked}
                        onNodePositionUpdate={onNodePositionUpdate}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
});

export default Experience;
