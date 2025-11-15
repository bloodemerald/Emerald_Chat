# 🖥️ Emerald Chat - Desktop Application

Emerald Chat is now available as a native desktop application using **Tauri**! This provides better performance, improved screen capture, and seamless integration with your system.

## 📦 Why Desktop App?

- **Better Screen Capture** - More reliable access to screen recording APIs
- **Standalone Application** - No need to open a browser
- **Smaller Size** - ~10-15MB vs 150MB+ for Electron
- **System Integration** - Notifications, system tray, better performance
- **Local AI Integration** - Better integration with Ollama for free local AI
- **Privacy First** - Everything runs locally on your machine

## 🚀 Getting Started

### Prerequisites

1. **Rust** - Required for building Tauri apps
   ```bash
   # Install Rust (Windows, macOS, Linux)
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

   # Or on Windows, download from: https://rustup.rs/
   ```

2. **Node.js** - Already installed ✅

3. **System Dependencies** (Linux only)
   ```bash
   # Debian/Ubuntu
   sudo apt install libwebkit2gtk-4.1-dev \
     build-essential \
     curl \
     wget \
     file \
     libxdo-dev \
     libssl-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev
   ```

### Development Mode

Run the desktop app in development mode:

```bash
npm run tauri:dev
```

This will:
1. Start the Vite dev server
2. Compile the Rust backend
3. Launch the desktop app with hot-reload enabled

### Building for Production

Build a production-ready executable:

```bash
npm run tauri:build
```

This creates platform-specific installers:

**Windows:**
- `.exe` installer (NSIS) → `src-tauri/target/release/bundle/nsis/`
- `.msi` installer (WiX) → `src-tauri/target/release/bundle/msi/`

**macOS:**
- `.app` bundle → `src-tauri/target/release/bundle/macos/`
- `.dmg` installer → `src-tauri/target/release/bundle/dmg/`

**Linux:**
- `.AppImage` → `src-tauri/target/release/bundle/appimage/`
- `.deb` package → `src-tauri/target/release/bundle/deb/`

## 🎨 Customization

### Window Configuration

Edit `src-tauri/tauri.conf.json`:

```json
{
  "app": {
    "windows": [{
      "title": "Emerald Chat",
      "width": 1400,
      "height": 900,
      "minWidth": 800,
      "minHeight": 600,
      "resizable": true,
      "fullscreen": false,
      "center": true
    }]
  }
}
```

### App Icon

Replace icons in `src-tauri/icons/`:
- `icon.png` - 1024x1024 source image
- `icon.ico` - Windows icon
- `icon.icns` - macOS icon
- Various PNG sizes for different platforms

Generate icons automatically:
```bash
npm install -g @tauri-apps/cli
tauri icon path/to/your/icon.png
```

## 🔧 Troubleshooting

### Build Errors

**Rust not found:**
```bash
# Restart terminal after installing Rust
source $HOME/.cargo/env
```

**Port 8080 already in use:**
```bash
# Kill the process using port 8080
# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8080 | xargs kill -9
```

**WebView2 missing (Windows):**
- Windows 10/11: WebView2 is usually pre-installed
- Download from: https://developer.microsoft.com/microsoft-edge/webview2/

### Development Issues

**Hot reload not working:**
```bash
# Clear Tauri cache
rm -rf src-tauri/target
npm run tauri:dev
```

**Screen capture not working:**
- Make sure you granted screen recording permissions
- On macOS: System Preferences → Security & Privacy → Screen Recording
- On Windows: Should work out of the box

## 📱 Features

### Desktop-Specific Features

- ✅ Native window management
- ✅ System notifications
- ✅ Better screen capture APIs
- ✅ Auto-updates (can be configured)
- ✅ System tray integration (optional)
- ✅ Custom file dialogs
- ✅ Better performance than browser

### All Web Features Still Work

- ✅ AI chat generation (Ollama + Cloud)
- ✅ Real-time message likes
- ✅ User profiles and badges
- ✅ Poll voting system
- ✅ Moderation controls
- ✅ All personality types

## 🔐 Security

Tauri apps are more secure than Electron:
- Smaller attack surface (no Node.js in frontend)
- Rust backend (memory-safe)
- Sandboxed by default
- CSP (Content Security Policy) enforced

## 🎯 Next Steps

1. **Run dev mode**: `npm run tauri:dev`
2. **Customize icons**: Update `src-tauri/icons/`
3. **Build for production**: `npm run tauri:build`
4. **Distribute**: Share the installer from `src-tauri/target/release/bundle/`

## 📚 Resources

- [Tauri Documentation](https://tauri.app/)
- [Tauri API Reference](https://tauri.app/v1/api/js/)
- [Publishing Guide](https://tauri.app/v1/guides/distribution/)
- [Code Signing](https://tauri.app/v1/guides/distribution/sign-windows)

## 🤝 Support

For issues specific to the desktop app:
1. Check this documentation
2. Review Tauri logs: `src-tauri/target/release/logs/`
3. Open an issue on GitHub

---

**Enjoy your native Emerald Chat desktop app!** 🚀
