# 🎵 Mood Atlas - 3D Music Visualization

An interactive 3D visualization of your Apple Music library with retro synthwave aesthetics, built with React, Three.js, and Apple Music API integration.

![Mood Atlas Preview](https://via.placeholder.com/800x400/02021b/00ffff?text=Mood+Atlas+3D+Visualization)

## ✨ Features

- **3D Interactive Scene**: Navigate through your music library in a stunning 3D space
- **Retro Synthwave Aesthetic**: Neon colors, wireframe grids, and 1980s-inspired design
- **Apple Music Integration**: Connect to your Apple Music library and play 30-second previews
- **Mood-Based Visualization**: Songs are positioned and colored based on their energy and mood
- **Hover Tooltips**: Get detailed information about each song
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Apple Developer Account (for Apple Music API access)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd mood-atlas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Apple Music API:**
   - Get your developer token from [Apple Developer Console](https://developer.apple.com/account/resources/authkeys/list)
   - Copy `env.example` to `.env` and add your token:
     ```bash
     cp env.example .env
     ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🎨 Visual Design

The Mood Atlas features a retro 1980s aesthetic with:

- **Color Palette**: Neon cyan (#00ffff), magenta (#ff00ff), and dark navy background (#02021b)
- **Typography**: JetBrains Mono for that authentic terminal feel
- **3D Elements**: Wireframe grids, glowing spheres, and animated particles
- **Effects**: Neon glows, pulsing animations, and smooth transitions

## 🎵 Music Integration

### Apple Music API Setup

1. **Create an Apple Developer Account** at [developer.apple.com](https://developer.apple.com)
2. **Generate a MusicKit JS token** in your developer console
3. **Add the token** to your `.env` file
4. **Configure your app** in the Apple Developer Console

### Features

- **Library Sync**: Import your Apple Music library
- **Preview Playback**: Play 30-second previews directly in the 3D scene
- **Search Integration**: Find new music with integrated search
- **Offline Mode**: Works with demo data when not connected

## 🎮 Controls

- **Mouse/Touch**: Click and drag to rotate the 3D view
- **Scroll**: Zoom in and out
- **Click Nodes**: Play song previews
- **Hover**: View song details and information

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Three.js** for 3D graphics
- **@react-three/fiber** for React-Three.js integration
- **@react-three/drei** for Three.js helpers
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **MusicKit JS** for Apple Music integration
- **ShadCN/UI** for UI components

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # ShadCN UI components
│   ├── GridPlane.tsx      # 3D grid component
│   ├── SongNode.tsx       # Individual song visualization
│   ├── MoodAtlasScene.tsx # Main 3D scene
│   ├── MoodAtlas.tsx      # Main application component
│   ├── Header.tsx         # Navigation header
│   └── Footer.tsx         # Footer component
├── data/
│   └── mockSongs.ts       # Demo song data
├── utils/
│   └── musicKit.ts        # Apple Music API utilities
└── lib/
    └── utils.ts           # General utilities
```

## 🎯 Customization

### Adding New Songs

Edit `src/data/mockSongs.ts` to add your own song data:

```typescript
{
  id: "unique-id",
  title: "Song Title",
  artist: "Artist Name",
  energy: 0.8,        // 0-1 scale
  mood: "bright",     // Used for color mapping
  previewUrl: "url",  // Optional preview URL
}
```

### Customizing Colors

Modify the mood color mapping in `src/data/mockSongs.ts`:

```typescript
export const moodColors: Record<string, string> = {
  dreamy: "#ff00ff",
  bright: "#00ffff",
  // Add your own moods and colors
};
```

### 3D Scene Adjustments

Customize the 3D scene in `src/components/MoodAtlasScene.tsx`:

- Camera position and controls
- Lighting setup
- Grid appearance
- Node positioning algorithm

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Apple Music API for music integration
- Three.js community for 3D graphics
- Synthwave/Retrowave aesthetic inspiration
- The React and TypeScript communities

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/mood-atlas/issues) page
2. Create a new issue with detailed information
3. Include your browser console logs and error messages

---

**Built with ❤️ for the synthwave community**

