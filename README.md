# Screen Chatter AI

A Twitch-style chat simulator that generates AI-powered chat messages based on your screen content. Perfect for streamers, content creators, and developers who want to add interactive chat overlays.

## Features

- 🎮 Real-time screen capture with compression
- 🤖 AI-powered chat generation using Google Gemini
- 👥 Multiple chat personalities (toxic, helpful, meme, backseat, hype, lurker, spammer, analyst)
- 💬 Moderator mode to interact with AI chat
- 📊 Adjustable message frequency and personality settings
- 🪟 Popout window for OBS/streaming software integration
- 💾 Chat history export (TXT & JSON)
- ⌨️ Keyboard shortcuts for quick control

## Technologies

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn-ui
- **Backend**: Supabase Edge Functions (Deno)
- **AI**: Google Gemini 2.0 Flash (with vision support)

## Setup Instructions

### 1. Prerequisites

- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase account ([sign up](https://supabase.com))
- Google AI API key ([get free key](https://aistudio.google.com/app/apikey))

### 2. Clone and Install

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd screen-chatter-ai

# Install dependencies
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory from the example template:

```sh
# Copy the example file
cp .env.example .env
```

Then edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

You can find these values in your [Supabase Dashboard](https://app.supabase.com) under Settings → API.

### 4. Set Up Google AI API Key in Supabase

The Google AI API key must be set as a Supabase Edge Function secret:

**Option 1: Using Supabase CLI (Recommended)**

```sh
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref yunsheqekpywelmpzawz

# Set the secret
supabase secrets set GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

**Option 2: Using Supabase Dashboard**

1. Go to your [Supabase Dashboard](https://app.supabase.com/project/yunsheqekpywelmpzawz)
2. Navigate to **Edge Functions** → **Secrets**
3. Add secret: `GOOGLE_AI_API_KEY` = `your_google_ai_api_key_here`

### 5. Deploy Edge Function

```sh
# Deploy the generate-chat function
supabase functions deploy generate-chat
```

### 6. Run Development Server

```sh
npm run dev
```

The app will open at `http://localhost:8080`

## How to Use

1. **Capture Screen**: Click "Capture Screen" or press `Ctrl+K` to capture your screen
2. **Start Generation**: Click "Start" or press `Space` to begin generating chat messages
3. **Customize Settings**: Click the gear icon or press `Ctrl+/` to adjust personalities and frequency
4. **Moderator Mode**: Type in the input box to add your own messages that the AI will respond to
5. **Popout Window**: Click the popout icon to open chat in a separate window for OBS integration

## Keyboard Shortcuts

- `Ctrl+K` - Capture screen
- `Space` - Toggle chat generation (Start/Stop)
- `Ctrl+/` - Toggle settings
- `Ctrl+Shift+L` - Clear chat

## Getting Your Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the key and use it in the Supabase secrets setup

**Note**: Google Gemini has a generous free tier, perfect for getting started!

## Project Structure

```
screen-chatter-ai/
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and constants
│   ├── pages/          # Main application pages
│   └── integrations/   # Supabase client
├── supabase/
│   └── functions/
│       └── generate-chat/  # Edge function for AI generation
└── public/             # Static assets
```

## Troubleshooting

### Chat not generating?
- Check that `GOOGLE_AI_API_KEY` is set in Supabase secrets
- Verify the edge function is deployed: `supabase functions list`
- Check browser console for error messages

### Screen capture not working?
- Ensure you grant screen sharing permissions in your browser
- Try using Chrome/Edge (best compatibility)

### Rate limit errors?
- Google Gemini free tier has rate limits
- Increase message frequency in settings to reduce API calls
- Consider upgrading to a paid plan for higher limits

## Deployment

To deploy this as a standalone web app:

1. Deploy frontend to Vercel/Netlify/your hosting provider
2. Ensure Supabase Edge Functions are deployed
3. Update CORS settings if needed

## License

MIT

## Contributing

Pull requests are welcome! Feel free to open issues for bugs or feature requests.
