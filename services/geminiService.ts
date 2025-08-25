
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StepKey, MvpPlan, Citation, ProjectFile } from '../types';

// This service makes live calls to the Gemini API.
// The API key is expected to be available as process.env.API_KEY in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to safely parse JSON from the model's text response.
const parseJsonContent = (text: string, schemaDescription: string) => {
    try {
        // The model might sometimes wrap the JSON in ```json ... ```
        const cleanText = text.replace(/^```json\s*/, '').replace(/```\s*$/, '');
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("Failed to parse JSON:", text);
        throw new Error(`The model returned an invalid format for ${schemaDescription}.`);
    }
}

// --- Section Generation Service ---

const getPromptForSection = (section: StepKey, idea: string, planContext: Partial<MvpPlan>): string => {
    switch(section) {
        case StepKey.MARKET_ANALYSIS:
            return `Generate a market analysis for an application idea: "${idea}". 
            Focus on three key areas:
            1.  **Target Audience:** Who are the primary users? What are their pain points?
            2.  **Market Size & Potential:** Briefly describe the market and its growth potential.
            3.  **Key Market Trends:** List 2-3 current trends relevant to this idea (e.g., AI integration, niche specialization).
            Format the output as markdown.`;
        case StepKey.BUSINESS_ANALYSIS:
            return `Create a business model for an application idea: "${idea}".
            Cover these points:
            1.  **Subscription Tiers:** Propose a simple Free, Pro, and Enterprise plan structure.
            2.  **Revenue Streams:** How will the application make money?
            3.  **Value Proposition:** What is the core value offered to the user?
            Format the output as markdown.`;
        case StepKey.PROJECT_SCOPE:
            return `Based on the following idea and chosen tech stack, define 4-5 core features for an MVP. For each feature, provide a brief one-sentence description.
            Idea: "${idea}"
            Tech Stack: Frontend - ${planContext.techStack?.frontend}, Backend - ${planContext.techStack?.backend}, Database - ${planContext.techStack?.database}.
            Format the output as a numbered markdown list.`;
        case StepKey.EXPENDITURE_ESTIMATION:
            return `Provide a rough, high-level cost estimation to build an MVP for the idea: "${idea}", using the tech stack: ${planContext.techStack?.frontend}, ${planContext.techStack?.backend}, and ${planContext.techStack?.database}.
            Break down the estimated costs over a 6-month timeline into three categories:
            1.  **Development Team:** (e.g., developers, designers).
            2.  **Infrastructure & Tools:** (e.g., hosting, database, APIs).
            3.  **Marketing & Launch:** (e.g., initial ads, content).
            Provide a final total estimated cost. This is a rough estimate for a lean startup.
            **Crucially, all monetary values must be in Indian Rupees (INR) and use the '₹' symbol.**
            Format the output as markdown.`;
        case StepKey.COMPETITOR_ANALYSIS:
             return `Analyze the competitors for an application based on this idea: "${idea}". Identify at least 2 direct and 2 indirect competitors. For each, describe their main strength and weakness. Conclude with a suggestion for a unique competitive advantage for my app. Format the output as markdown.`;
        default:
            return '';
    }
}

export const generateMvpSection = async (
  section: StepKey,
  idea: string,
  planContext: Partial<MvpPlan>
): Promise<{ content: string, citations?: Citation[] }> => {
    const model = 'gemini-2.5-flash';
    const prompt = getPromptForSection(section, idea, planContext);

    if (section === StepKey.COMPETITOR_ANALYSIS) {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            }
        });

        const content = response.text;
        const rawCitations = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const citations: Citation[] = rawCitations.map((c: any) => ({
            uri: c.web?.uri || '',
            title: c.web?.title || 'Untitled Source'
        })).filter(c => c.uri);

        return { content, citations };

    } else {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        content: {
                            type: Type.STRING,
                            description: "The generated markdown content for the section."
                        }
                    }
                }
            }
        });
        
        const parsed = parseJsonContent(response.text, `${section} content`);
        return { content: parsed.content };
    }
};


// --- Dynamic Code and Preview Generation Service ---

const codeGenerationPrompt = (plan: MvpPlan): string => {
    const features = (plan.projectScope || '')
        .split('\n')
        .filter(line => /^\s*(\d+\.|-|\*)\s*\**/.test(line))
        .map(line => line.replace(/^\s*(\d+\.|-|\*)\s*/, '').replace(/\*\*|`/g, '').replace(/:.*/, '').trim())
        .join(', ');

    return `
You are an expert full-stack web developer. Your task is to generate the code for a new project based on the provided MVP plan.
You must provide a response in JSON format that includes two main keys: "files" and "previewHtml".

1.  **files**: This must be an array of objects, where each object represents a project file and has two keys: "path" (string) and "content" (string).
    -   Generate a complete, production-ready file structure.
    -   Create a React frontend in a 'client' directory using TypeScript and Vite.
    -   Create a Node.js/Express backend in a 'server' directory.
    -   The React app should have a simple router or state to display a separate page/component for each core feature identified in the project scope.
    -   The Express server should have a placeholder API endpoint for each core feature.
    -   Include package.json files for both client and server with necessary dependencies.
    -   Include a README.md at the root.

2.  **previewHtml**: This must be a single, self-contained HTML string.
    -   This HTML will be rendered in an iframe to provide a live preview of the generated website.
    -   It should look like a real, polished web application, not just a list of features.
    -   Include a header with the application's name.
    -   Include interactive navigation (buttons or links) that allows the user to switch between views for each of the core features.
    -   Each feature "page" should have a title and placeholder content.
    -   Use inline CSS for styling to ensure it's self-contained. Make it look clean and modern.

Here is the MVP plan to base the project on:
---
MVP PLAN:
Idea: ${plan.idea}
Tech Stack: 
  - Frontend: ${plan.techStack.frontend}
  - Backend: ${plan.techStack.backend}
  - Database: ${plan.techStack.database}
Core Features: ${features}
---
Generate the JSON output now.
`;
};

export const generateProjectCode = async (plan: MvpPlan): Promise<{ files: ProjectFile[], previewHtml: string }> => {
    const model = 'gemini-2.5-flash';
    const prompt = codeGenerationPrompt(plan);

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    files: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                path: { type: Type.STRING },
                                content: { type: Type.STRING }
                            },
                            required: ['path', 'content'],
                        }
                    },
                    previewHtml: {
                        type: Type.STRING
                    }
                },
                required: ['files', 'previewHtml'],
            }
        }
    });

    return parseJsonContent(response.text, "project code and preview");
};