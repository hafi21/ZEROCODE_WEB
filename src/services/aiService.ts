import { GoogleGenAI, Type } from "@google/genai";
import { WebsiteLayout } from "../types";

export const generateWebsiteCode = async (layout: WebsiteLayout) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please add your API key in the Secrets panel (gear icon) with the name GEMINI_API_KEY.");
  }
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are a senior frontend engineer and AI website generator.
    Generate a high-quality, production-ready website based on the provided JSON layout.
    
    CORE GOAL:
    - Treat every frame as a separate webpage section (<section id="frameId">)
    - Preserve layout and structure from JSON
    - Implement navigation using anchor tags
    - Generate clean, working HTML/CSS/JS
    
    WORKFLOW UNDERSTANDING:
    1. Users design UI in frames
    2. Each frame represents a webpage/page
    3. Elements belong to frames
    4. Elements may contain navigation links (linkTo)
    5. JSON is the single source of truth
    
    FRAME RULES:
    - Each frame MUST be converted into a section: <section id="frameId">
    - Frames should be stacked vertically
    - Maintain spacing between sections
    - Center frames horizontally in the page
    - Use the 'size' property from the frame for its dimensions (width/height)
    
    ELEMENT RULES:
    - Place elements inside their respective frame section
    - Every element MUST have an id attribute: <div id="elementId">...</div> (use the exact element id from JSON)
    - Maintain relative positioning ('top', 'left' in styles) and spacing
    - Preserve content and styles from the JSON
    
    LINKING RULES (CRITICAL):
    - If an element contains "linkTo": "targetId", you MUST convert it into: <a href="#targetId"><!-- element --></a>
    - The targetId can be a frame ID or an element ID.
    - Use exact id from JSON
    - Do NOT skip linking
    - Ensure target section or element exists
    
    NAVIGATION BEHAVIOR:
    - Clicking linked elements should scroll to target section
    - Add smooth scrolling via CSS or JS
    
    STYLE RULES:
    - Use Tailwind CSS for all styling. Assume Tailwind is available.
    - Maintain approximate layout from JSON but ALIGN IT PROPERLY to be a clean and professional website.
    - Keep the structure safe and design clean, modern, and professional.
    - You MUST add polished hover effects, transitions, and entrance animations (e.g., using Tailwind's animate-* classes or custom CSS keyframes) to make the site feel alive and premium.
    - Do NOT change the core structure or move elements randomly, but ensure they are aligned beautifully.
    
    Layout Data:
    ${JSON.stringify(layout, null, 2)}
    
    Return a JSON object with:
    - 'html': The complete HTML structure.
    - 'css': Any custom CSS (keep minimal, use Tailwind).
    - 'js': JavaScript for smooth scrolling to anchors and other interactivity.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          html: { type: Type.STRING },
          css: { type: Type.STRING },
          js: { type: Type.STRING },
        },
        required: ["html", "css", "js"],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response received from AI service");
  }

  try {
    let text = response.text;
    // Strip markdown code blocks if present
    if (text.startsWith('```')) {
      text = text.replace(/^```json\n?/, '').replace(/```$/, '').trim();
    }
    const result = JSON.parse(text);
    return result;
  } catch (e) {
    console.error("Failed to parse AI response:", response.text);
    throw new Error("Invalid response format from AI service");
  }
};
