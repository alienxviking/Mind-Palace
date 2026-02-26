"use client";

export async function analyzeNodeContent(title: string) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const keywordMap: Record<string, string[]> = {
        "quantum": ["Physics", "Subatomic"],
        "neural": ["AI", "Brain", "Computation"],
        "myth": ["History", "Ancient"],
        "ocean": ["Biology", "Water", "Marine"],
        "sea": ["Biology", "Water", "Marine"],
        "marine": ["Biology", "Water", "Marine"],
        "life": ["Biology", "Nature"],
        "space": ["Cosmos", "Astro"],
        "star": ["Cosmos", "Astro"],
        "planet": ["Cosmos", "Astro"],
        "black hole": ["Cosmos", "Physics"],
        "ai": ["AI", "Tech"],
        "tech": ["Tech", "Future"]
    };

    const lowerTitle = title.toLowerCase();
    const allTags = new Set<string>();

    // Multi-keyword matching
    Object.keys(keywordMap).forEach(key => {
        if (lowerTitle.includes(key)) {
            keywordMap[key].forEach(tag => allTags.add(tag));
        }
    });

    const tags = Array.from(allTags);

    return {
        tags,
        summary: tags.length === 0
            ? "A new branch of thought in the mind palace."
            : `Exploring the intersection of ${tags.slice(0, 2).join(" & ")} related concepts.`
    };
}

export async function suggestLinks(nodes: any[]) {
    // Basic logic: suggest links between nodes with matching tags
    const IGNORED_TAGS = ["General", "Knowledge"];
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const commonTags = nodes[i].tags?.filter((t: string) =>
                !IGNORED_TAGS.includes(t) && nodes[j].tags?.includes(t)
            );
            if (commonTags?.length > 0) {
                links.push({ source: nodes[i].id, target: nodes[j].id, reason: `Shared concepts: ${commonTags.join(", ")}` });
            }
        }
    }
    return links;
}
