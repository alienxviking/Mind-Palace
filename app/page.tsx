"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import LandingUI from "@/components/LandingUI";
import AuthUI from "@/components/AuthUI";
import Experience from "@/components/Experience";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

export default function LandingPage() {
    const router = useRouter();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDiving, setIsDiving] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
    const isAuthRef = useRef(false);

    useEffect(() => {
        isAuthRef.current = isAuthOpen;
    }, [isAuthOpen]);

    useEffect(() => {
        // Initial setup
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                // If already logged in, we let the user see the landing page 
                // but clicking "Enter" will take them to /palace
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            // Only redirect if a sign-in event happens while the auth modal is open
            // This prevents automatic redirection on page focus/session refresh
            if (session && event === 'SIGNED_IN' && isAuthRef.current) {
                setIsDiving(true);
                router.push("/palace");
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    return (
        <main className="relative w-full h-screen overflow-hidden">
            {/* Background for landing page */}
            <Experience
                nodes={[]}
                edges={[]}
                selectedNode={null}
                onNodeSelect={() => { }}
                isEntered={false}
                onLoaded={setIsLoaded}
                isLocked={true}
                onNodePositionUpdate={() => { }}
            />

            <LandingUI
                isLoaded={isLoaded}
                isDiving={isDiving}
                onEnter={async () => {
                    setIsDiving(true);
                    // Re-check session right before entering to be sure
                    const { data: { session: currentSession } } = await supabase.auth.getSession();
                    if (currentSession) {
                        router.push("/palace");
                    } else {
                        setIsAuthOpen(true);
                        setIsDiving(false); // Reset if auth modal opens
                    }
                }}
                onSignIn={() => setIsAuthOpen(true)}
            />

            <AuthUI
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
            />
        </main>
    );
}
