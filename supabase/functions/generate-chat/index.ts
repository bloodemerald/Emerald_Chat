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
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured. Please set it in Supabase Edge Function secrets.");
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
4) Use NATURAL, IMPERFECT language:
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

    // Free models with vision support - try in order until one works
    const models = [
      "google/gemini-2.0-flash-exp:free",
      "google/gemini-flash-1.5:free",
      "meta-llama/llama-3.2-11b-vision-instruct:free",
    ];

    let lastError = null;
    let content = "";

    // Try each model until one succeeds
    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://screen-chatter-ai.app",
            "X-Title": "Screen Chatter AI",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: userPrompt
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: screenshot
                    }
                  }
                ]
              }
            ],
            temperature: 0.8,
            max_tokens: 300,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Model ${model} failed:`, response.status, errorText);

          // If auth error, don't try other models
          if (response.status === 403 || response.status === 401) {
            return new Response(
              JSON.stringify({ error: "Invalid API key. Please check your OPENROUTER_API_KEY in Supabase secrets." }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Rate limit or other error - try next model
          lastError = `${model}: ${response.status} - ${errorText}`;
          continue;
        }

        const data = await response.json();
        content = data.choices?.[0]?.message?.content?.trim() || "";

        if (content) {
          console.log(`Success with model: ${model}`);
          break; // Successfully got content
        } else {
          console.error(`No content from model ${model}`);
          lastError = `${model}: No content in response`;
        }
      } catch (error) {
        console.error(`Exception with model ${model}:`, error);
        lastError = `${model}: ${error.message}`;
      }
    }

    // If no model succeeded, return error
    if (!content) {
      console.error("All models failed. Last error:", lastError);
      return new Response(
        JSON.stringify({ error: `All AI models unavailable. Last error: ${lastError}` }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
    console.error("Error in generate-chat function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
