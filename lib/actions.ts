"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!.trim());

export async function getDeepDiveContent(title: string) {
    try {
        // Using 'gemini-flash-latest' as it was confirmed present in diagnostic results
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `You are an AI specialized in deep-diving into concepts for a 'Mind Palace'. 
        Provide a detailed, visionary, and slightly poetic summary (2-3 sentences) and 3 unique, relevant tags for the topic provided.
        Format your response as a valid JSON object ONLY, with no markdown formatting:
        { "summary": "...", "tags": ["...", "...", "..."] }
        
        Topic: ${title}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean potential markdown formatting from Gemini response
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const content = JSON.parse(cleanJson);

        return {
            summary: content.summary || "A deeper exploration of this concept remains shrouded in mystery.",
            tags: content.tags || ["Advanced"]
        };
    } catch (error) {
        console.error("Gemini Error:", error);
        return {
            summary: "The neural network encountered an interference while deep diving. This concept is too complex for immediate synthesis.",
            tags: ["Complex", "Uncharted"]
        };
    }
} 
