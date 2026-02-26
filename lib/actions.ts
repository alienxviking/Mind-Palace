"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!.trim());

export async function getDeepDiveContent(title: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `You are an educational AI. Provide a concise, factual summary (2 sentences) and 3-5 accurate tags for the topic: "${title}".
        Avoid any space-themed, poetic, or flowery metaphors. Focus strictly on real-world knowledge.
        Format as JSON: { "summary": "...", "tags": ["...", "..."] }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanJson = text.replace(/```json|```/g, "").trim();
        const content = JSON.parse(cleanJson);

        return {
            summary: content.summary || "No factual data available for this concept.",
            tags: content.tags || ["General"]
        };
    } catch (error) {
        console.error("Gemini Error:", error);
        return {
            summary: "Error synthesizing factual data.",
            tags: ["Unclassified"]
        };
    }
}

export async function getTopicResponse(topic: string, message: string, history: any[]) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: `You are an expert on "${topic}". You MUST ONLY answer questions related to "${topic}". 
            Provide comprehensive, well-structured, and complete answers. 
            Aim for depth when necessary but remain concise and clear. 
            NEVER leave an answer unfinished or truncated.
            If a user asks about anything else, politely decline and steer the conversation back to "${topic}".`
        });

        const chat = model.startChat({
            history: history,
            generationConfig: { maxOutputTokens: 1500 }
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Chat Error:", error);
        return "I am currently unable to cross-reference my data banks for this specific query.";
    }
}

export async function checkSimilarity(nodeATitle: string, nodeBTitle: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `Determine if a logical connection should exist between these two topics: "${nodeATitle}" and "${nodeBTitle}".
        A connection should exist if they are in the same or highly related fields (e.g., Data Science and Machine Learning).
        No connection should exist if they are distinct fields despite similar names (e.g., Quantum Computing vs Quantum Physics).
        Respond ONLY with 'true' or 'false'.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().toLowerCase().trim();
        return text.includes("true");
    } catch (error) {
        console.error("Similarity Check Error:", error);
        return false;
    }
}
