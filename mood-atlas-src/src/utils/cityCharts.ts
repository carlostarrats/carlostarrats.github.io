// City Charts utility functions for fetching and processing city chart data

import { CityData, CityChartSong, CityCluster, getDemoCities } from '@/data/cityChartData';
import { emotionColors } from '@/data/mockSongs';
import { analyzeSongEmotion, generateEmotionScores } from './emotionAnalysis';

// Generate audio features based on genre (extracted from offlineMode.ts)
function generateAudioFeatures(genre: string): { energy: number; valence: number } {
  const genreLower = genre?.toLowerCase() || '';

  // Genre-based audio feature estimation
  let baseEnergy = 0.5;
  let baseValence = 0.5;

  if (genreLower.includes('electronic') || genreLower.includes('dance') || genreLower.includes('edm') || genreLower.includes('house') || genreLower.includes('techno')) {
    baseEnergy = 0.85;
    baseValence = 0.7;
  } else if (genreLower.includes('hip-hop') || genreLower.includes('hip hop') || genreLower.includes('rap')) {
    baseEnergy = 0.75;
    baseValence = 0.55;
  } else if (genreLower.includes('r&b') || genreLower.includes('rnb') || genreLower.includes('soul')) {
    baseEnergy = 0.5;
    baseValence = 0.65;
  } else if (genreLower.includes('rock') || genreLower.includes('metal') || genreLower.includes('punk') || genreLower.includes('grunge')) {
    baseEnergy = 0.8;
    baseValence = 0.5;
  } else if (genreLower.includes('indie') || genreLower.includes('alternative')) {
    baseEnergy = 0.55;
    baseValence = 0.5;
  } else if (genreLower.includes('pop')) {
    baseEnergy = 0.65;
    baseValence = 0.75;
  } else if (genreLower.includes('latin') || genreLower.includes('reggaeton') || genreLower.includes('salsa') || genreLower.includes('bachata')) {
    baseEnergy = 0.8;
    baseValence = 0.8;
  } else if (genreLower.includes('afrobeat') || genreLower.includes('afro')) {
    baseEnergy = 0.75;
    baseValence = 0.75;
  } else if (genreLower.includes('k-pop') || genreLower.includes('kpop') || genreLower.includes('j-pop') || genreLower.includes('jpop')) {
    baseEnergy = 0.8;
    baseValence = 0.8;
  } else if (genreLower.includes('reggae') || genreLower.includes('dub')) {
    baseEnergy = 0.5;
    baseValence = 0.7;
  } else if (genreLower.includes('country') || genreLower.includes('folk')) {
    baseEnergy = 0.5;
    baseValence = 0.6;
  } else if (genreLower.includes('jazz') || genreLower.includes('blues')) {
    baseEnergy = 0.4;
    baseValence = 0.55;
  } else if (genreLower.includes('classical') || genreLower.includes('orchestra') || genreLower.includes('symphony')) {
    baseEnergy = 0.35;
    baseValence = 0.6;
  } else if (genreLower.includes('ambient') || genreLower.includes('chill') || genreLower.includes('lofi') || genreLower.includes('lo-fi')) {
    baseEnergy = 0.25;
    baseValence = 0.6;
  } else if (genreLower.includes('singer') || genreLower.includes('songwriter')) {
    baseEnergy = 0.4;
    baseValence = 0.5;
  } else if (genreLower.includes('funk') || genreLower.includes('disco')) {
    baseEnergy = 0.8;
    baseValence = 0.8;
  } else if (genreLower.includes('new wave') || genreLower.includes('synth') || genreLower.includes('synthpop')) {
    baseEnergy = 0.7;
    baseValence = 0.6;
  } else if (genreLower.includes('post-punk') || genreLower.includes('darkwave') || genreLower.includes('goth')) {
    baseEnergy = 0.6;
    baseValence = 0.35;
  } else if (genreLower.includes('soundtrack') || genreLower.includes('score') || genreLower.includes('cinematic')) {
    baseEnergy = 0.5;
    baseValence = 0.5;
  }

  // Add some randomness for realism
  const randomFactor = 0.2;

  return {
    energy: Math.max(0.1, Math.min(1.0, baseEnergy + (Math.random() - 0.5) * randomFactor)),
    valence: Math.max(0.1, Math.min(1.0, baseValence + (Math.random() - 0.5) * randomFactor)),
  };
}

// Fetch a city chart playlist from Apple Music
export async function fetchCityChart(musicKit: any, city: CityData): Promise<CityChartSong[]> {
  try {
    const response = await musicKit.api.music(`/v1/catalog/${city.countryCode.toLowerCase()}/playlists/${city.playlistId}`, {
      include: 'tracks',
    });

    const tracks = response.data?.data?.[0]?.relationships?.tracks?.data || [];
    const songs: CityChartSong[] = [];

    // Take first 25 songs
    const tracksToProcess = tracks.slice(0, 25);

    for (const track of tracksToProcess) {
      const genre = track.attributes?.genreNames?.[0] || '';
      const features = generateAudioFeatures(genre);
      const primaryEmotion = analyzeSongEmotion(features.energy, features.valence);
      const emotionScores = generateEmotionScores(features.energy, features.valence);

      songs.push({
        id: track.id,
        title: track.attributes?.name || 'Unknown',
        artist: track.attributes?.artistName || 'Unknown Artist',
        album: track.attributes?.albumName,
        energy: features.energy,
        valence: features.valence,
        primaryEmotion,
        emotionScores,
        previewUrl: track.attributes?.previews?.[0]?.url,
        duration: track.attributes?.durationInMillis ? Math.round(track.attributes.durationInMillis / 1000) : undefined,
        genre,
        year: track.attributes?.releaseDate ? new Date(track.attributes.releaseDate).getFullYear() : undefined,
        artworkUrl: track.attributes?.artwork?.url?.replace('{w}', '300').replace('{h}', '300'),
      });
    }

    return songs;
  } catch {
    return [];
  }
}

// Process city mood from songs
export function processCityMood(songs: CityChartSong[]): { avgEnergy: number; avgValence: number; primaryEmotion: string } {
  if (songs.length === 0) {
    return { avgEnergy: 0.5, avgValence: 0.5, primaryEmotion: 'Calm' };
  }

  const avgEnergy = songs.reduce((sum, song) => sum + song.energy, 0) / songs.length;
  const avgValence = songs.reduce((sum, song) => sum + song.valence, 0) / songs.length;
  const primaryEmotion = analyzeSongEmotion(avgEnergy, avgValence);

  return { avgEnergy, avgValence, primaryEmotion };
}

// Calculate 3D position based on Thayer model
// X = valence (negative to positive)
// Y = energy (low to high)
// Z = random spread for visual separation
export function calculateCityPosition(avgEnergy: number, avgValence: number, seed: number = 0): { x: number; y: number; z: number } {
  // Map valence (0-1) to X (-40 to 40)
  const x = (avgValence - 0.5) * 80;

  // Map energy (0-1) to Y (-40 to 40)
  const y = (avgEnergy - 0.5) * 80;

  // Random Z spread based on seed for consistent positioning
  const seededRandom = Math.sin(seed * 9999) * 10000;
  const z = ((seededRandom - Math.floor(seededRandom)) - 0.5) * 40;

  return { x, y, z };
}

// Get color based on emotion
export function getCityColor(primaryEmotion: string): string {
  return emotionColors[primaryEmotion] || '#ffffff';
}

// Fetch all city charts with rate limiting and caching
const cityChartCache: Map<string, { data: CityCluster; timestamp: number }> = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function fetchAllCityCharts(
  musicKit: any,
  cities: CityData[] = getDemoCities(20),
  onProgress?: (loaded: number, total: number) => void
): Promise<CityCluster[]> {
  const clusters: CityCluster[] = [];
  const now = Date.now();

  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];

    // Check cache first
    const cached = cityChartCache.get(city.id);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      clusters.push(cached.data);
      onProgress?.(i + 1, cities.length);
      continue;
    }

    // Rate limiting - wait between requests
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    try {
      const songs = await fetchCityChart(musicKit, city);

      if (songs.length > 0) {
        const { avgEnergy, avgValence, primaryEmotion } = processCityMood(songs);
        const position = calculateCityPosition(avgEnergy, avgValence, i);
        const color = getCityColor(primaryEmotion);

        const cluster: CityCluster = {
          city: { ...city, songs, avgEnergy, avgValence, primaryEmotion, position, color },
          songs,
          avgEnergy,
          avgValence,
          primaryEmotion,
          color,
          position,
        };

        // Cache the result
        cityChartCache.set(city.id, { data: cluster, timestamp: now });
        clusters.push(cluster);
      }
    } catch {
      // Skip failed cities
    }

    onProgress?.(i + 1, cities.length);
  }

  return clusters;
}

// Generate mock city clusters for testing/demo
export function generateMockCityClusters(cities: CityData[] = getDemoCities(20)): CityCluster[] {
  return cities.map((city, index) => {
    // Generate random mood for each city
    const avgEnergy = 0.3 + Math.random() * 0.5;
    const avgValence = 0.3 + Math.random() * 0.5;
    const actualEmotion = analyzeSongEmotion(avgEnergy, avgValence);
    const position = calculateCityPosition(avgEnergy, avgValence, index);
    const color = getCityColor(actualEmotion);

    // Generate mock songs
    const songs: CityChartSong[] = Array.from({ length: 25 }, (_, songIndex) => {
      const songEnergy = avgEnergy + (Math.random() - 0.5) * 0.3;
      const songValence = avgValence + (Math.random() - 0.5) * 0.3;
      const songEmotion = analyzeSongEmotion(songEnergy, songValence);

      return {
        id: `${city.id}-song-${songIndex}`,
        title: `Song ${songIndex + 1}`,
        artist: `Artist ${songIndex + 1}`,
        energy: Math.max(0.1, Math.min(1.0, songEnergy)),
        valence: Math.max(0.1, Math.min(1.0, songValence)),
        primaryEmotion: songEmotion,
        emotionScores: generateEmotionScores(songEnergy, songValence),
        genre: 'Pop',
      };
    });

    return {
      city: { ...city, songs, avgEnergy, avgValence, primaryEmotion: actualEmotion, position, color },
      songs,
      avgEnergy,
      avgValence,
      primaryEmotion: actualEmotion,
      color,
      position,
    };
  });
}

// Clear cache
export function clearCityChartCache(): void {
  cityChartCache.clear();
}
