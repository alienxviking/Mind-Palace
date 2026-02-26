import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono, Varela_Round } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    weight: ["300", "400", "500", "600", "700"]
});

const plusJakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-plus-jakarta",
    weight: ["300", "400", "500", "600", "700"]
});

const varelaRound = Varela_Round({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-varela-round",
});

const jetBrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
    title: "Mind Palace | Full-Stack AI Knowledge OS",
    description: "Navigate your consciousness in 3D with AI-powered linking.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${spaceGrotesk.variable} ${plusJakarta.variable} ${varelaRound.variable} ${jetBrainsMono.variable} antialiased bg-black text-white`}>
                <CustomCursor />
                {children}
            </body>
        </html>
    );
}
