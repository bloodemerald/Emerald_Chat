# MCP / Internet Access Proposal for Emerald Chat

## ❓ The Question
**"Would an MCP do us any good? So chat can use internet in brain?"**

## 💡 The Short Answer
**YES.** Giving your AI personalities access to the internet (via MCP or direct tool usage) would be a **massive leap in immersion**.

Right now, your "Chat Personalities" are hallucinating or limited to generic responses. Real Twitch chatters have Google open. They check stats, look up wiki pages, and comment on breaking news.

## 🚀 What is MCP in this context?
The **Model Context Protocol (MCP)** is a standard for connecting AI models to external data sources. For Emerald Chat, it effectively means **"giving the AI tools"**.

Instead of just:
`Prompt -> Text Response`

It becomes:
`Prompt -> "I need to search for X" -> App searches Web -> Search Results -> Text Response`

## 🌟 Use Cases for Emerald Chat

### 1. The "Fact Checker" (Backseater)
**Current:** "You're playing wrong."
**With Internet:** "Bro, the wiki says that boss has 50% fire resistance, stop using fireball."
*   **How:** AI searches the game name + "boss weakness" when it detects a boss fight.

### 2. The "Meta Analyst"
**Current:** "Nice build."
**With Internet:** "Is that the new patch 1.4 build? I saw Shroud running that yesterday."
*   **How:** AI searches "[Game Name] current meta" or "[Game Name] patch notes".

### 3. Real-Time News & Trends
**Current:** *Silence about real world*
**With Internet:** "Did you see the GTA 6 trailer just dropped? It looks insane."
*   **How:** AI periodically checks "gaming news" RSS/API and injects it into conversation.

### 4. Live Game Stats (Esports/Competitive)
**Current:** "Who is winning?"
**With Internet:** "TSM is up 2-0 right now, check HLTV."
*   **How:** AI searches for live scores if you are playing a competitive game.

## 🛠️ Implementation Strategy

Since you are using **Ollama (Local AI)**, we don't strictly need a full "MCP Server" architecture (which can be complex). We can implement a **Lightweight Tool Loop**:

1.  **Define Tools**: Create a function `searchWeb(query: string)` in your app (using a free API like DuckDuckGo or Brave Search).
2.  **Update Prompt**: Tell the AI: "You have access to a search tool. If you need to look up game info, output `TOOL:SEARCH: <query>`."
3.  **Interception**:
    *   If `localAI.ts` detects `TOOL:SEARCH:`, it pauses generation.
    *   It runs the search.
    *   It feeds the top 3 results back to the AI: "Here is the info. Now write the chat message."
4.  **Final Output**: The AI writes the message using the new knowledge.

## ⚠️ Challenges & Trade-offs

| Feature | Benefit | Cost/Risk |
| :--- | :--- | :--- |
| **Latency** | Smarter chat | Responses take 2-3s longer (search time). |
| **Privacy** | Real info | Queries leave the local machine (to the search engine). |
| **Complexity** | High immersion | Requires parsing tool calls & managing state. |
| **Cost** | None (if using free APIs) | Paid search APIs (Google/Bing) cost money. |

## 📋 Recommendation

**Start small.** Don't build a full MCP server yet.
Implement a **"Wiki Lookup"** feature for the **"Backseater"** personality only.
1.  Detect the game name from the window title.
2.  Let the Backseater search for "tips" about that game.
3.  See if it makes the roasting more accurate.
