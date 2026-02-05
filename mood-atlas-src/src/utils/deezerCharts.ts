// Deezer Charts API - Free, no auth required
// Documentation: https://developers.deezer.com/api

import { CityChartSong, CityCluster } from '@/data/cityChartData';

// Deezer track type
interface DeezerTrack {
  id: number;
  title: string;
  duration: number;
  preview: string; // 30-second preview URL
  artist: {
    id: number;
    name: string;
  };
  album: {
    id: number;
    title: string;
    cover_medium: string;
  };
}

// Country/Region data with Deezer chart endpoints and cultural music profile
interface ChartRegion {
  id: string;
  name: string;
  country: string;
  endpoint: string;
  // Cultural music profile adjustments (based on dominant genres)
  energyBias: number;   // -0.3 to +0.3 adjustment
  valenceBias: number;  // -0.3 to +0.3 adjustment
}

// Deezer has editorial charts for many countries
// Energy/valence biases based on dominant regional music styles
const chartRegions: ChartRegion[] = [
  // Americas
  { id: 'usa', name: 'United States', country: 'USA', endpoint: '1313621735', energyBias: 0.1, valenceBias: 0.1 },
  { id: 'brazil', name: 'Brazil', country: 'Brazil', endpoint: '1116189381', energyBias: 0.25, valenceBias: 0.2 }, // Funk, samba - high energy/happy
  { id: 'mexico', name: 'Mexico', country: 'Mexico', endpoint: '1116190041', energyBias: 0.2, valenceBias: 0.15 }, // Regional, reggaeton
  { id: 'canada', name: 'Canada', country: 'Canada', endpoint: '1652248171', energyBias: 0.05, valenceBias: 0.05 },
  { id: 'argentina', name: 'Argentina', country: 'Argentina', endpoint: '1116188451', energyBias: 0.1, valenceBias: -0.05 }, // Tango influence - emotional
  { id: 'colombia', name: 'Colombia', country: 'Colombia', endpoint: '1116189491', energyBias: 0.25, valenceBias: 0.25 }, // Reggaeton capital
  { id: 'chile', name: 'Chile', country: 'Chile', endpoint: '1116189411', energyBias: 0.1, valenceBias: 0.1 },

  // Europe
  { id: 'uk', name: 'United Kingdom', country: 'UK', endpoint: '1111141961', energyBias: 0.0, valenceBias: -0.1 }, // More melancholic indie/grime
  { id: 'france', name: 'France', country: 'France', endpoint: '1109890291', energyBias: -0.1, valenceBias: 0.0 }, // Chanson, rap - varied
  { id: 'germany', name: 'Germany', country: 'Germany', endpoint: '1111143121', energyBias: 0.15, valenceBias: 0.05 }, // Techno influence
  { id: 'spain', name: 'Spain', country: 'Spain', endpoint: '1116187871', energyBias: 0.2, valenceBias: 0.2 }, // Flamenco, reggaeton
  { id: 'italy', name: 'Italy', country: 'Italy', endpoint: '1116188261', energyBias: 0.05, valenceBias: 0.15 }, // Melodic pop
  { id: 'netherlands', name: 'Netherlands', country: 'Netherlands', endpoint: '1266971851', energyBias: 0.2, valenceBias: 0.1 }, // EDM capital
  { id: 'poland', name: 'Poland', country: 'Poland', endpoint: '1116190371', energyBias: 0.1, valenceBias: -0.05 },
  { id: 'sweden', name: 'Sweden', country: 'Sweden', endpoint: '1313623485', energyBias: 0.1, valenceBias: 0.15 }, // Pop production hub
  { id: 'belgium', name: 'Belgium', country: 'Belgium', endpoint: '1116188891', energyBias: 0.15, valenceBias: 0.05 }, // EDM
  { id: 'portugal', name: 'Portugal', country: 'Portugal', endpoint: '1266972111', energyBias: -0.1, valenceBias: -0.15 }, // Fado - melancholic
  { id: 'austria', name: 'Austria', country: 'Austria', endpoint: '1116188811', energyBias: 0.0, valenceBias: 0.0 },
  { id: 'switzerland', name: 'Switzerland', country: 'Switzerland', endpoint: '1116187791', energyBias: 0.05, valenceBias: 0.05 },

  // Asia
  { id: 'japan', name: 'Japan', country: 'Japan', endpoint: '1116189621', energyBias: 0.15, valenceBias: 0.2 }, // J-pop - energetic, happy
  { id: 'korea', name: 'South Korea', country: 'South Korea', endpoint: '1362508115', energyBias: 0.25, valenceBias: 0.25 }, // K-pop - very high energy/happy
  { id: 'india', name: 'India', country: 'India', endpoint: '1116190491', energyBias: 0.15, valenceBias: 0.2 }, // Bollywood - dramatic, energetic
  { id: 'indonesia', name: 'Indonesia', country: 'Indonesia', endpoint: '1362516475', energyBias: 0.1, valenceBias: 0.15 },
  { id: 'philippines', name: 'Philippines', country: 'Philippines', endpoint: '1362517635', energyBias: 0.1, valenceBias: 0.1 },
  { id: 'thailand', name: 'Thailand', country: 'Thailand', endpoint: '1362519275', energyBias: 0.1, valenceBias: 0.15 },

  // Middle East & Africa
  { id: 'israel', name: 'Israel', country: 'Israel', endpoint: '1116189931', energyBias: 0.1, valenceBias: 0.1 },
  { id: 'turkey', name: 'Turkey', country: 'Turkey', endpoint: '1116187951', energyBias: 0.05, valenceBias: -0.1 }, // Arabesk - emotional
  { id: 'south-africa', name: 'South Africa', country: 'South Africa', endpoint: '1362508995', energyBias: 0.2, valenceBias: 0.15 }, // Amapiano - upbeat
  { id: 'egypt', name: 'Egypt', country: 'Egypt', endpoint: '1362507935', energyBias: 0.1, valenceBias: 0.0 },
  { id: 'morocco', name: 'Morocco', country: 'Morocco', endpoint: '1116190131', energyBias: 0.1, valenceBias: 0.05 },
  { id: 'nigeria', name: 'Nigeria', country: 'Nigeria', endpoint: '1362510935', energyBias: 0.25, valenceBias: 0.2 }, // Afrobeats - high energy

  // Oceania
  { id: 'australia', name: 'Australia', country: 'Australia', endpoint: '1116188731', energyBias: 0.05, valenceBias: 0.05 },
  { id: 'new-zealand', name: 'New Zealand', country: 'New Zealand', endpoint: '1362520355', energyBias: 0.0, valenceBias: 0.0 },
];

// Simple emotion analyzer based on audio features
function analyzeSongEmotion(energy: number, valence: number): string {
  if (energy > 0.7 && valence > 0.7) return 'Happy';
  if (energy > 0.7 && valence > 0.4) return 'Energetic';
  if (energy > 0.7 && valence <= 0.4) return 'Angry';
  if (energy > 0.4 && valence > 0.7) return 'Excited';
  if (energy > 0.4 && valence > 0.4) return 'Romantic';
  if (energy <= 0.4 && valence > 0.5) return 'Peaceful';
  if (energy <= 0.4 && valence > 0.3) return 'Calm';
  if (energy > 0.3 && valence <= 0.4) return 'Melancholic';
  return 'Sad';
}

// Generate emotion scores
function generateEmotionScores(energy: number, valence: number): Record<string, number> {
  const emotions = ['Happy', 'Energetic', 'Excited', 'Romantic', 'Calm', 'Peaceful', 'Sad', 'Melancholic', 'Angry'];
  const scores: Record<string, number> = {};

  emotions.forEach(emotion => {
    let score = 0.1;
    switch (emotion) {
      case 'Happy': score = (energy > 0.5 ? 0.5 : 0.2) + (valence * 0.5); break;
      case 'Energetic': score = energy * 0.8 + (valence > 0.4 ? 0.2 : 0); break;
      case 'Excited': score = (energy * 0.5) + (valence * 0.5); break;
      case 'Romantic': score = (1 - Math.abs(energy - 0.5)) * 0.5 + valence * 0.3; break;
      case 'Calm': score = (1 - energy) * 0.6 + (valence > 0.4 ? 0.4 : 0.2); break;
      case 'Peaceful': score = (1 - energy) * 0.5 + valence * 0.4; break;
      case 'Sad': score = (1 - valence) * 0.7 + (energy < 0.5 ? 0.3 : 0); break;
      case 'Melancholic': score = (1 - valence) * 0.5 + (energy * 0.3); break;
      case 'Angry': score = energy * 0.7 + (1 - valence) * 0.3; break;
    }
    scores[emotion] = Math.max(0.1, Math.min(1.0, score));
  });

  return scores;
}

// Estimate energy/valence from track characteristics + regional culture
// Since Deezer doesn't provide audio features, we estimate based on patterns
function estimateAudioFeatures(
  track: DeezerTrack,
  index: number,
  energyBias: number = 0,
  valenceBias: number = 0
): { energy: number; valence: number } {
  const durationMinutes = track.duration / 60;

  // Base energy on duration (shorter = more energetic typically)
  let energy = durationMinutes < 3 ? 0.65 : durationMinutes < 4 ? 0.55 : 0.45;

  // Higher chart position = slightly more energy
  energy += (25 - index) / 150;

  // Add deterministic variation based on track ID
  const seed = track.id % 100;
  energy += (seed / 100 - 0.5) * 0.15;

  // Valence estimation
  let valence = 0.45 + (seed % 50) / 150;

  // Add some variation based on different seed
  const seed2 = (track.id * 7) % 100;
  valence += (seed2 / 100 - 0.5) * 0.15;

  // Apply regional cultural biases
  energy += energyBias;
  valence += valenceBias;

  // Clamp values
  energy = Math.max(0.15, Math.min(0.95, energy));
  valence = Math.max(0.15, Math.min(0.95, valence));

  return { energy, valence };
}

// CORS proxies to try (fallback chain)
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

// Fetch with CORS proxy fallback
async function fetchWithCorsProxy(url: string): Promise<Response> {
  for (const proxy of CORS_PROXIES) {
    try {
      const response = await fetch(proxy + encodeURIComponent(url));
      if (response.ok) return response;
    } catch (e) {
      console.warn(`Proxy ${proxy} failed, trying next...`);
    }
  }
  throw new Error('All CORS proxies failed');
}

// Fetch chart for a specific region
async function fetchRegionChart(region: ChartRegion): Promise<CityChartSong[]> {
  try {
    // Use Deezer's playlist endpoint for country charts with CORS proxy
    const apiUrl = `https://api.deezer.com/playlist/${region.endpoint}/tracks?limit=25`;
    const response = await fetchWithCorsProxy(apiUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch chart for ${region.name}`);
    }

    const data = await response.json();
    const tracks: DeezerTrack[] = data.data || [];

    return tracks.map((track, index) => {
      const { energy, valence } = estimateAudioFeatures(track, index, region.energyBias, region.valenceBias);
      const primaryEmotion = analyzeSongEmotion(energy, valence);

      return {
        id: `dz-${track.id}`,
        title: track.title,
        artist: track.artist.name,
        album: track.album.title,
        energy,
        valence,
        primaryEmotion,
        emotionScores: generateEmotionScores(energy, valence),
        previewUrl: track.preview, // Deezer provides 30-sec preview!
        duration: track.duration,
        artworkUrl: track.album.cover_medium,
      };
    });
  } catch (error) {
    console.error(`Failed to fetch chart for ${region.name}:`, error);
    return [];
  }
}

// Calculate 3D position based on Thayer emotion model
// X = valence (negative emotions left, positive right)
// Y = energy (low energy bottom, high energy top)
// Z = spread for visual separation
function calculatePosition(avgEnergy: number, avgValence: number, index: number, totalRegions: number): { x: number; y: number; z: number } {
  // Map energy/valence to X/Y (Thayer model)
  const x = (avgValence - 0.5) * 100;  // -50 to +50
  const y = (avgEnergy - 0.5) * 100;   // -50 to +50

  // Z spread based on index to prevent overlap at similar positions
  const angle = (index / totalRegions) * Math.PI * 2;
  const z = Math.sin(angle * 3) * 25 + Math.cos(angle * 2) * 15;

  return { x, y, z };
}

// Interpolate between two hex colors
function lerpColor(color1: string, color2: string, t: number): string {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Get color based on position using bilinear interpolation
// Smoothly blends between the four Thayer quadrant colors
function getQuadrantColor(avgEnergy: number, avgValence: number): string {
  // Corner colors:
  // Top-right (1,1): Yellow #ffff00 - Happy
  // Top-left (1,0): Red #ff0000 - Frantic
  // Bottom-right (0,1): Cyan #00ffff - Calm
  // Bottom-left (0,0): Blue #448aff - Sad

  const topLeft = '#ff0000';     // Red - Frantic
  const topRight = '#ffff00';    // Yellow - Happy
  const bottomLeft = '#448aff';  // Blue - Sad
  const bottomRight = '#00ffff'; // Cyan - Calm

  // Bilinear interpolation
  // First interpolate along top edge (red to yellow) based on valence
  const topColor = lerpColor(topLeft, topRight, avgValence);
  // Then interpolate along bottom edge (blue to cyan) based on valence
  const bottomColor = lerpColor(bottomLeft, bottomRight, avgValence);
  // Finally interpolate between bottom and top based on energy
  return lerpColor(bottomColor, topColor, avgEnergy);
}

// Fetch all region charts
export async function fetchAllRegionCharts(
  onProgress?: (loaded: number, total: number) => void
): Promise<CityCluster[]> {
  const clusters: CityCluster[] = [];
  const regions = chartRegions; // All 34 regions

  console.log(`🌍 Fetching charts for ${regions.length} regions...`);

  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];

    try {
      const songs = await fetchRegionChart(region);

      if (songs.length > 0) {
        // Calculate average mood
        const avgEnergy = songs.reduce((sum, s) => sum + s.energy, 0) / songs.length;
        const avgValence = songs.reduce((sum, s) => sum + s.valence, 0) / songs.length;
        const primaryEmotion = analyzeSongEmotion(avgEnergy, avgValence);
        const position = calculatePosition(avgEnergy, avgValence, i, regions.length);
        const color = getQuadrantColor(avgEnergy, avgValence);

        clusters.push({
          city: {
            id: region.id,
            name: region.name,
            country: region.country,
            countryCode: region.id.toUpperCase(),
            playlistId: region.endpoint,
            songs,
            avgEnergy,
            avgValence,
            primaryEmotion,
            position,
            color,
          },
          songs,
          avgEnergy,
          avgValence,
          primaryEmotion,
          color,
          position,
        });

        console.log(`✅ Loaded ${songs.length} songs for ${region.name}`);
      }
    } catch (error) {
      console.error(`Failed to load ${region.name}:`, error);
    }

    onProgress?.(i + 1, regions.length);

    // Small delay to avoid rate limiting
    if (i < regions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`🎉 Loaded ${clusters.length} region charts`);
  return clusters;
}

// Export region list for reference
export { chartRegions };
