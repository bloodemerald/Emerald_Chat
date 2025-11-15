import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { screenshot, recentChat, personalities, personalityPrompts, batchSize = 3, additionalContext = "" } = await req.json();
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");

    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured. Please set it in Supabase Edge Function secrets.");
    }

    // Batch generation: Generate multiple messages at once
    const systemPrompt = `You are simulating REALISTIC Twitch chat viewers watching a livestream. React to what you ACTUALLY SEE in the screenshot.

CRITICAL RULES:
1) Output EXACTLY ${batchSize} chat lines, one per line. NO preface, bullets, quotes, or numbering.
2) Each line is a DIFFERENT personality: ${personalities.join(", ")}
3) MOST IMPORTANT: Comment on what's ACTUALLY visible in the screenshot:
   - If CODE/IDE: mention language, file names, functions, errors, line numbers
   - If GAME: mention UI elements, health bars, items, characters
   - If BROWSER: mention website, tabs, specific content visible
   - If DESIGN: mention colors, tools, elements being edited
   - READ and reference ANY visible text, numbers, or UI labels
4) Use NATURAL, IMPERFFUL language:
   - Lowercase everything OR ALL CAPS for emphasis
   - Typos are GOOD (tho, actally, definetly, etc)
   - Missing punctuation is NORMAL
   - Stretched words (YOOOO, broooo, lmaoooo)
   - Short reactions (W, L, bruh, ???, nah)
5) VARY MESSAGE LENGTH realistically:
   - Short (3-15 chars): "bruh", "W", "???"
   - Medium (15-50 chars): "wait that was actually smart"
   - Long (50-140 chars): "ok but if you go left you skip the whole section"
6) **PRIORITY**: React to [MODERATOR] messages naturally (@mod_name style)
7) Use Twitch culture naturally:
   - Emotes: KEKW, OMEGALUL, Pog, monkaS, POGGERS, PogChamp, Clap, EZ, Sadge
   - Slang: no cap, fr fr, ngl, ratio, based, mid, L, W, skill issue
   - Casual: tbh, imo, tho, ur, u, rn

GOOD EXAMPLES (refer to actual screen content):
"wait ur hp is at 40% heal up"
"YOOO that shotgun combo"
"bro the minimap shows 3 enemies KEKW"
"why is the fps counter showing 20fps lmao"
"nice build but u need more armor"
"that Iron Man skin is clean ngl"
"175 damage headshot Pog"

BAD EXAMPLES (too generic, doesn't reference screen):
"nice play!"
"great job"
"keep it up"
"good gameplay"

Personality descriptions:
${personalityPrompts.join("\n")}`;

    const recentChatText = recentChat && recentChat.length > 0
      ? recentChat.join("\n")
      : "(no chat history yet)";

    const userPrompt = `SCREENSHOT: (see image)
RECENT_CHAT:
${recentChatText}

${additionalContext ? `SPECIAL INSTRUCTION: ${additionalContext}\n` : ""}
Generate ${batchSize} REALISTIC Twitch chat messages reacting to the screenshot and recent chat. Each message should feel like it was typed by a real human viewer with imperfections, varied lengths, and natural language. Use the personalities: ${personalities.join(", ")}

Output: One message per line, nothing else.`;

    // Extract base64 data from screenshot (remove data URL prefix if present)
    let base64Data = screenshot;
    let mimeType = "image/jpeg";

    if (screenshot.includes('base64,')) {
      const parts = screenshot.split('base64,');
      base64Data = parts[1];
      // Extract mime type from data URL (e.g., data:image/png;base64,...)
      if (parts[0].includes('image/png')) {
        mimeType = "image/png";
      } else if (parts[0].includes('image/webp')) {
        mimeType = "image/webp";
      }
    }

    console.log("Using mime type:", mimeType);

    // Use Google Gemini API directly (using Gemini 2.5 Flash)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\n${userPrompt}`
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google AI API error:", response.status, errorText);

      // Parse error for better messaging
      try {
        const errorData = JSON.parse(errorText);
        const errorMessage = errorData?.error?.message || errorText;
        return new Response(
          JSON.stringify({ error: `Google AI error: ${errorMessage}` }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        return new Response(
          JSON.stringify({ error: `Google AI error: ${errorText}` }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!content) {
      console.error("No content from Gemini API");
      return new Response(
        JSON.stringify({ error: "No content generated from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Success with Gemini API. Generated:", content);

    // Split the response into individual messages
    const messages = content
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .slice(0, batchSize); // Ensure we don't exceed batch size

    // Pair messages with personalities
    const results = messages.map((message: string, index: number) => ({
      message,
      personality: personalities[index % personalities.length]
    }));

    return new Response(
      JSON.stringify({ messages: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-chat-gemini function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
