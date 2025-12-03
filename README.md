# Emerald Chat - AI Twitch Simulator

A Twitch-style chat simulator that generates AI-powered chat messages based on your screen content. Perfect for streamers, content creators, and developers who want to add interactive chat overlays.

**🖥️ Now available as a native desktop app!** See [DESKTOP_APP.md](./DESKTOP_APP.md) for installation instructions.

## Features

- 🎮 Real-time screen capture with compression
- 🤖 AI-powered chat generation using **local Ollama** (100% free, privacy-focused)
- 👥 Multiple chat personalities (toxic, helpful, meme, backseat, hype, lurker, spammer, analyst, and more)
- 💬 Moderator mode to interact with AI chat
- 📊 Adjustable message frequency and personality settings
- 🪟 Popout window for OBS/streaming software integration
- ⌨️ Keyboard shortcuts for quick control
- 🎯 Channel points, bits, raids, predictions, and more engagement features
- 🎲 Mini-games (Blackjack)
- 🐉 Raid boss battles

## Technologies

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn-ui
- **Desktop**: Tauri (Rust backend, native performance)
- **AI**: Local Ollama (llava:7b for vision, llama3.2:3b for text)
- **State Management**: Zustand
- **Animations**: Framer Motion

## Setup Instructions

### 1. Prerequisites

- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Ollama ([install from ollama.ai](https://ollama.ai))

### 2. Install Ollama Models

```sh
# Install Ollama from https://ollama.ai
# Then pull the required models:

# Vision model (for analyzing screenshots)
ollama pull llava:7b

# Text model (optional, for faster text-only generation)
ollama pull llama3.2:3b

# Start Ollama server
ollama serve
```

### 3. Clone and Install

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd Emerald_Chat

# Install dependencies
npm install
```

### 4. Run Development Server

```sh
npm run dev
```

The app will open at `http://localhost:8080`

## How to Use

1. **Start Ollama**: Make sure Ollama is running (`ollama serve`)
2. **Capture Screen**: Click "Play" button to start screen capture
3. **AI Chat Begins**: Chat messages will automatically generate based on what's on screen
4. **Customize Settings**: Click the gear icon or press `Ctrl+/` to adjust personalities and frequency
5. **Moderator Mode**: Type in the input box to add your own messages that the AI will respond to
6. **Popout Window**: Click the popout icon to open chat in a separate window for OBS integration

## Keyboard Shortcuts

- `Ctrl+K` - Capture screen
- `Space` - Toggle chat generation (Start/Stop)
- `Ctrl+/` - Toggle settings
- `Ctrl+Shift+L` - Clear chat

## Project Structure

```
Emerald_Chat/
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and constants
│   ├── pages/          # Main application pages
│   └── types/          # TypeScript type definitions
├── src-tauri/          # Tauri desktop app configuration
└── public/             # Static assets
```

## Troubleshooting

### Chat not generating?
- Check that Ollama is running: `ollama list` should show installed models
- Verify llava:7b is installed: `ollama pull llava:7b`
- Check browser console for error messages
- Try using a smaller model if you have limited RAM (llava:7b instead of llava:13b)

### Screen capture not working?
- Ensure you grant screen sharing permissions in your browser
- Try using Chrome/Edge (best compatibility)

### Slow generation?
- Use llava:7b instead of llava:13b for faster responses
- Reduce message frequency in settings
- Make sure no other heavy applications are running

### "Ollama timeout" errors?
- Your GPU may not have enough VRAM for the model
- Try a smaller model: `ollama pull llava:7b`
- Close other applications to free up memory
- Increase timeout in settings if needed

## Desktop App

Build the desktop app with Tauri:

```sh
# Development
npm run tauri:dev

# Production build
npm run tauri:build
```

## Performance Tips

- **RTX 3070 or similar**: Use llava:7b for best balance of speed and quality
- **RTX 4080+ or high-end GPU**: Can use llava:13b for better quality
- **CPU-only or low VRAM**: Use llama3.2:3b (text-only, no vision)
- Adjust message frequency in settings to control generation rate

## Privacy

All AI processing happens **locally on your machine**. No data is sent to external servers. Your screen captures and chat messages stay on your computer.

## License

MIT

## Contributing

Pull requests are welcome! Feel free to open issues for bugs or feature requests.
