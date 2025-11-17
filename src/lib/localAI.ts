import { PersonalityType } from "@/types/personality";

const OLLAMA_BASE_URL = "http://localhost:11434";

function getOllamaBaseUrl(overrideUrl?: string): string {
  const base = (overrideUrl && overrideUrl.trim().length > 0
    ? overrideUrl.trim()
    : OLLAMA_BASE_URL);
  return base.replace(/\/$/, "");
}

/**
 * Generate text-only messages with Ollama (no vision needed)
 */
export async function generateTextWithOllama({
  prompt,
  model = "llama3.2:3b", // Use smaller model for text-only
  ollamaApiUrl,
}: {
  prompt: string;
  model?: string;
  ollamaApiUrl?: string;
}): Promise<string> {
  try {
    const baseUrl = getOllamaBaseUrl(ollamaApiUrl);

    console.log("💬 Sending text-only prompt to Ollama with model:", model);

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "llama3.2:3b",
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7, // Reduced for more focused responses
          num_predict: 80,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ollama text API error:", response.status, errorText);
      throw new Error(`Ollama text API error: ${errorText}`);
    }

    const data = await response.json();
    const content = data.response?.trim() || "";

    if (!content) {
      console.error("❌ Empty Ollama text response:", data);
      throw new Error("No content generated from Ollama text");
    }

    console.log("✅ RAW Ollama text output:", content);
    return content;
  } catch (error) {
    console.error("❌ Local Ollama text generation failed:", error);
    throw error;
  }
}

/**
 * Check if Ollama is running and available by checking for any models.
 */
export async function isOllamaAvailable(apiUrl?: string): Promise<boolean> {
  try {
    const baseUrl = getOllamaBaseUrl(apiUrl);
    console.log("🔍 Checking Ollama availability at:", baseUrl);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    console.log("📋 Ollama models found:", data.models?.length || 0);
    // Ensure there's at least one model available to be used.
    return data.models && data.models.length > 0;
  } catch (error) {
    console.error("❌ Ollama availability check failed:", error);
    // This will catch network errors if the server isn't running.
    return false;
  }
}

/**
 * Generate chat messages by calling Ollama directly (no Supabase needed - 100% free!)
 */
export async function generateWithOllama({
  screenshot,
  recentChat,
  personalities,
  model = "llava:13b", // Default to 13b model for better vision understanding
  ollamaApiUrl,
  batchSize = 3,
  additionalContext,
}: {
  screenshot: string;
  recentChat: string[];
  personalities: PersonalityType[];
  model?: string;
  ollamaApiUrl?: string;
  batchSize?: number;
  additionalContext?: string;
}): Promise<{ 
  messages: Array<{ message: string; personality: PersonalityType }>;
  detectedContent?: string;
 }> {
  try {
    const baseUrl = getOllamaBaseUrl(ollamaApiUrl);

    // Extract base64 data from screenshot (remove data URL prefix)
    let base64Image = screenshot;
    if (screenshot.includes('base64,')) {
      base64Image = screenshot.split('base64,')[1];
    }

    console.log("📸 Image size:", (base64Image.length / 1024).toFixed(2), "KB");
    console.log("🎮 Sending to Ollama with model:", model);

    const moderatorFocus = additionalContext && additionalContext.trim().length > 0
      ? `\n\nMODERATOR FOCUS: ${additionalContext.trim()}`
      : "";

    // Enhanced prompt for specific, contextual reactions
    const visionPrompt = `You are ${batchSize} different viewers watching screen content. Write ${batchSize} SHORT chat messages about what you see.

CRITICAL RULES:
- Output ONLY ${batchSize} chat messages, one per line
- Each message MUST be under 100 characters
- NO descriptions, NO explanations, NO paragraphs
- Write like REAL stream chat - casual, imperfect, short
- If you can identify what application, game, or content is being shown, reference it naturally
- React to what's happening on screen, not the streaming platform
- PRIORITY: If a moderator asks "what game is this?" or similar, AT LEAST ONE message MUST identify the game/application name

GOOD EXAMPLES:
"that syntax error lol"
"75hp left heal up"
"localhost:8080 working"
"nice theme ngl"
"200hp pog"
"fix that import"
"looks like Tarkov to me"
"pretty sure thats Valorant"

BAD EXAMPLES (DO NOT DO THIS):
"The image shows a computer screen with..."
"This appears to be a screenshot of..."
"The user is displaying a web browser..."

Recent chat: ${recentChat.slice(-3).join(", ") || "none"}${moderatorFocus}

Write ${batchSize} SHORT messages about what you see:`;

    // Call Ollama's native API (better vision support than OpenAI-compatible endpoint)
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "llava:13b",
        prompt: visionPrompt,
        images: [base64Image],
        stream: false,
        options: {
          temperature: 0.7, // Reduced from 0.9 for more focused responses
          num_predict: 150,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ollama API error:", response.status, errorText);
      throw new Error(`Ollama API error: ${errorText}`);
    }

    const data = await response.json();
    // Ollama native API returns response in 'response' field, not 'choices'
    const content = data.response?.trim() || "";

    if (!content) {
      console.error("❌ Empty Ollama response:", data);
      throw new Error("No content generated from Ollama");
    }

    console.log("✅ RAW Ollama output:", content);
    console.log("📊 Response length:", content.length, "chars");

    // Parse the response into individual messages
    const messages = content
      .split("\n")
      .map((line: string) => {
        let cleaned = line.trim();
        // Remove common AI formatting artifacts
        cleaned = cleaned.replace(/^["']|["']$/g, ''); // Remove quotes
        cleaned = cleaned.replace(/^\d+\.\s*/, ''); // Remove "1. "
        cleaned = cleaned.replace(/^[-*]\s*/, ''); // Remove "- " or "* "
        cleaned = cleaned.replace(/^Personality\s+\d+\s*[-:]\s*/i, ''); // Remove "Personality 1 - "
        cleaned = cleaned.replace(/^\w+\s*[-:]\s*["']?/i, ''); // Remove "toxic: " or "Lurker - "
        return cleaned;
      })
      .filter((line: string) => line.length > 0 && line.length <= 140)
      .slice(0, batchSize);

    const results = messages.map((message: string, index: number) => ({
      message,
      personality: personalities[index % personalities.length],
    }));

    return { messages: results };
  } catch (error) {
    console.error("❌ Local Ollama generation failed:", error);
    throw error;
  }
}
