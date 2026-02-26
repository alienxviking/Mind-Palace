"use client";

import { getDeepDiveContent, checkSimilarity } from "./actions";

export async function analyzeNodeContent(title: string) {
    // Call server-side AI for factual summary and tags
    return await getDeepDiveContent(title);
}

export async function suggestLinks(nodes: any[]) {
    const links = [];
    // Only compare the newest node (last one) against others to save tokens
    const newNode = nodes[nodes.length - 1];
    if (!newNode) return [];

    for (let i = 0; i < nodes.length - 1; i++) {
        const otherNode = nodes[i];
        const isSimilar = await checkSimilarity(newNode.title, otherNode.title);

        if (isSimilar) {
            links.push({
                source: newNode.id,
                target: otherNode.id,
                reason: `Semantic similarity: ${newNode.title} & ${otherNode.title}`
            });
        }
    }
    return links;
}
