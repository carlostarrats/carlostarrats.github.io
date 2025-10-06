# Solar Flare Visual Synth

An immersive 3D visualization of NASA solar flare data with generative ambient audio, inspired by the cinematic aesthetics of Interstellar.

## Features

- **Real-time NASA Data**: Fetches solar flare data from NASA's DONKI API
- **3D Visualization**: Interactive 3D space with volumetric particle bursts
- **Generative Audio**: Tone.js-powered ambient soundscape that responds to flare intensity
- **Cinematic Effects**: Bloom, depth of field, film grain, and vignette post-processing
- **Interstellar Aesthetic**: Warm golds, cool blues, and organic materials

## Solar Flare Classes

- **A Class**: Subtle intensity (0.1x) - Icy blue (#cfefff)
- **B Class**: Low intensity (0.5x) - Light blue (#9ad8ff)  
- **C Class**: Moderate intensity (1x) - Warm (#ffdca8)
- **M Class**: High intensity (3.5x) - Orange (#ffb36b)
- **X Class**: Extreme intensity (8x) - Hot red (#ff6b3a)

## Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Get a NASA API key:**
   - Visit [api.nasa.gov](https://api.nasa.gov/)
   - Request a free API key
   - Copy `env.example` to `.env`
   - Add your API key: `VITE_NASA_API_KEY=your_key_here`

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Controls

- **Mouse**: Orbit and zoom around the 3D scene
- **Click Flares**: Select flares to view detailed information
- **Sound Toggle**: Enable/disable generative audio
- **Sync**: Fetch latest solar flare data from NASA

## Technology Stack

- **React 18** + **TypeScript**
- **Three.js** + **@react-three/fiber** + **@react-three/drei**
- **@react-three/postprocessing** for cinematic effects
- **Tone.js** for generative audio synthesis
- **Anime.js** for smooth animations
- **Tailwind CSS** for styling
- **NASA DONKI API** for real-time solar flare data

## Audio Design

The generative soundscape features:
- Slowly evolving ambient drone
- Solar flare intensity modulates filter cutoff and synth parameters
- Reverb and long attack/decay envelopes for cinematic depth
- Each flare class triggers different harmonic responses

## Visual Design

Inspired by Interstellar's cinematography:
- Volumetric glow and corona effects
- Soft bloom and chromatic aberration
- Depth-of-field for cinematic focus
- Dust particles for spatial depth
- Warm/cool color grading

## License

MIT License - Feel free to use and modify for your own projects.