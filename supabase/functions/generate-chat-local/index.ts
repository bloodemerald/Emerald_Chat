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
    const { screenshot, recentChat, personalities, personalityPrompts, model = "llava:latest", ollamaApiUrl, batchSize = 3, additionalContext = "" } = await req.json();

    // NOTE: No API key needed for local Ollama

    // Use the provided API URL or default to the host machine from within the container
    const OLLAMA_API_ENDPOINT = (ollamaApiUrl || "http://host.docker.internal:11434").replace(/\/$/, "");

    const systemPrompt = `You are simulating REALISTIC Twitch chat. Your goal is to make messages feel authentically human-written by real viewers.

CRITICAL AUTHENTICITY RULES:
1) Output EXACTLY ${batchSize} chat lines, one per line. NO preface, bullets, quotes, or numbering.
2) Each line is a DIFFERENT personality: ${personalities.join(", ")}
3) Use NATURAL, IMPERFECT language:
   - Lowercase everything OR ALL CAPS for emphasis
   - Typos are GOOD (tho, actally, definetly, etc)
   - Missing punctuation is NORMAL
   - Stretched words (YOOOO, broooo, lmaoooo)
   - Short reactions (W, L, bruh, ???, nah)
4) VARY MESSAGE LENGTH (be realistic):
   - Short (3-15 chars): "bruh", "W", "???"
   - Medium (15-50 chars): "wait that was actually smart"
   - Long (50-140 chars): "ok but if you go left you skip the whole section"
   - Mix all three lengths
5) **PRIORITY**: React to [MODERATOR] messages naturally (@mod_name style)
6) Use Twitch culture naturally:
   - Emotes: KEKW, OMEGALUL, Pog, monkaS, POGGERS, PogChamp, Clap, EZ
   - Slang: no cap, fr fr, ngl, ratio, based, mid, L, W, skill issue
   - Casual: tbh, imo, tho, ur, u, rn
7) Be AUTHENTIC, not perfect:
   - Real people make typos
   - Real people use ellipsis...
   - Real people trail off
   - Real people react with just emotes

GOOD EXAMPLES (copy this style):
"wait what just happened"
"YOOOO"
"bro is lost LULW"
"???"
"that timing tho"
"nah"
"OMEGALUL"
"actally smart ngl"
"W streamer W chat"
"skill issue fr"
"bruh..."

BAD EXAMPLES (never do this):
"That was a great play!"
"I think you should go left."
"Very impressive gameplay."

Personality descriptions:
${personalityPrompts.join("\n")}`;

    const recentChatText = recentChat && recentChat.length > 0
      ? recentChat.join("\n")
      : "(no chat history yet)";

    const userPrompt = `RECENT_CHAT:
${recentChatText}

${additionalContext ? `SPECIAL INSTRUCTION: ${additionalContext}\n` : ""}
Generate ${batchSize} REALISTIC Twitch chat messages reacting to the screenshot and recent chat. Each message should feel like it was typed by a real human viewer with imperfections, varied lengths, and natural language. Use the personalities: ${personalities.join(", ")}

Output: One message per line, nothing else.`;

    // Ollama uses the OpenAI compatible API format.
    const response = await fetch(
      `${OLLAMA_API_ENDPOINT}/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model, // The model we downloaded
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: userPrompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: screenshot,
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
          temperature: 0.8,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ollama API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Ollama API error: ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";

    if (!content) {
      console.error("No content from Ollama API");
      return new Response(
        JSON.stringify({ error: "No content generated from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Success with Ollama API. Generated:", content);

    const messages = content
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .slice(0, batchSize);

    const results = messages.map((message: string, index: number) => ({
      message,
      personality: personalities[index % personalities.length]
    }));

    return new Response(
      JSON.stringify({ messages: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-chat-local function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    // Important: Ollama might not be running. Give a helpful error.
    if (errorMessage.includes('Failed to fetch')) {
        return new Response(
            JSON.stringify({ error: "Could not connect to local Ollama server. Is it running? Check the API URL in settings." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
