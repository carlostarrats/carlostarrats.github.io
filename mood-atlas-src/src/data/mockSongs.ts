export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  energy: number; // 0-1 scale
  primaryEmotion: string; // The emotion this song aligns with MOST
  emotionScores: Record<string, number>; // Scores for all emotions (0-1)
  previewUrl?: string;
  duration?: number;
  genre?: string;
  year?: number;
  trackId?: string; // Apple Music track identifier
  playCount?: number; // Number of times played
  skipCount?: number; // Number of times skipped
  completionRate?: number; // Percentage of times played to completion
  dataSource?: 'apple' | 'mock'; // Source of the data
}

export const mockSongs: Song[] = [
  {
    id: "1",
    title: "Midnight City",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    energy: 0.9,
    primaryEmotion: "Energetic",
    emotionScores: { Energetic: 0.9, Excited: 0.7, Happy: 0.5, Romantic: 0.3, Calm: 0.1, Peaceful: 0.1, Sad: 0.1, Melancholic: 0.2, Angry: 0.1 },
    duration: 244,
    genre: "Electronic",
    year: 2011
  },
  {
    id: "2",
    title: "Take On Me",
    artist: "a-ha",
    album: "Hunting High and Low",
    energy: 0.8,
    primaryEmotion: "Happy",
    emotionScores: { Happy: 0.9, Energetic: 0.8, Excited: 0.7, Romantic: 0.4, Calm: 0.2, Peaceful: 0.1, Sad: 0.1, Melancholic: 0.1, Angry: 0.1 },
    duration: 225,
    genre: "Synthpop",
    year: 1984
  },
  {
    id: "3",
    title: "Enjoy the Silence",
    artist: "Depeche Mode",
    album: "Violator",
    energy: 0.6,
    primaryEmotion: "Melancholic",
    emotionScores: { Melancholic: 0.9, Sad: 0.7, Calm: 0.5, Peaceful: 0.4, Romantic: 0.3, Happy: 0.1, Energetic: 0.2, Excited: 0.1, Angry: 0.1 },
    duration: 271,
    genre: "Synthpop",
    year: 1990
  },
  {
    id: "4",
    title: "Blue Monday",
    artist: "New Order",
    album: "Power, Corruption & Lies",
    energy: 0.85,
    primaryEmotion: "Energetic",
    emotionScores: { Energetic: 0.95, Excited: 0.8, Happy: 0.6, Angry: 0.3, Melancholic: 0.3, Romantic: 0.2, Calm: 0.1, Peaceful: 0.1, Sad: 0.2 },
    duration: 452,
    genre: "New Wave",
    year: 1983
  },
  {
    id: "5",
    title: "Sweet Dreams (Are Made of This)",
    artist: "Eurythmics",
    album: "Sweet Dreams (Are Made of This)",
    energy: 0.75,
    primaryEmotion: "Energetic",
    emotionScores: { Energetic: 0.85, Excited: 0.6, Melancholic: 0.5, Happy: 0.4, Angry: 0.3, Romantic: 0.2, Calm: 0.2, Peaceful: 0.1, Sad: 0.3 },
    duration: 216,
    genre: "New Wave",
    year: 1983
  },
  {
    id: "6",
    title: "Tainted Love",
    artist: "Soft Cell",
    album: "Non-Stop Erotic Cabaret",
    energy: 0.7,
    primaryEmotion: "Sad",
    emotionScores: { Sad: 0.8, Melancholic: 0.7, Energetic: 0.6, Romantic: 0.4, Angry: 0.3, Happy: 0.2, Calm: 0.2, Peaceful: 0.1, Excited: 0.3 },
    duration: 156,
    genre: "Synthpop",
    year: 1981
  },
  {
    id: "7",
    title: "Don't You Want Me",
    artist: "The Human League",
    album: "Dare",
    energy: 0.8,
    primaryEmotion: "Excited",
    emotionScores: { Excited: 0.85, Happy: 0.7, Energetic: 0.75, Romantic: 0.5, Sad: 0.3, Melancholic: 0.2, Calm: 0.2, Peaceful: 0.1, Angry: 0.2 },
    duration: 213,
    genre: "Synthpop",
    year: 1981
  },
  {
    id: "8",
    title: "Cars",
    artist: "Gary Numan",
    album: "The Pleasure Principle",
    energy: 0.65,
    primaryEmotion: "Calm",
    emotionScores: { Calm: 0.75, Melancholic: 0.5, Peaceful: 0.4, Energetic: 0.5, Sad: 0.3, Happy: 0.2, Romantic: 0.2, Excited: 0.3, Angry: 0.1 },
    duration: 211,
    genre: "New Wave",
    year: 1979
  },
  {
    id: "9",
    title: "Video Killed the Radio Star",
    artist: "The Buggles",
    album: "The Age of Plastic",
    energy: 0.7,
    primaryEmotion: "Happy",
    emotionScores: { Happy: 0.8, Excited: 0.6, Energetic: 0.7, Melancholic: 0.4, Sad: 0.3, Romantic: 0.3, Calm: 0.3, Peaceful: 0.2, Angry: 0.1 },
    duration: 244,
    genre: "New Wave",
    year: 1979
  },
  {
    id: "10",
    title: "Safety Dance",
    artist: "Men Without Hats",
    album: "Rhythm of Youth",
    energy: 0.85,
    primaryEmotion: "Happy",
    emotionScores: { Happy: 0.95, Excited: 0.9, Energetic: 0.85, Romantic: 0.2, Calm: 0.1, Peaceful: 0.1, Sad: 0.1, Melancholic: 0.1, Angry: 0.1 },
    duration: 168,
    genre: "New Wave",
    year: 1982
  },
  {
    id: "11",
    title: "Bizarre Love Triangle",
    artist: "New Order",
    album: "Brotherhood",
    energy: 0.75,
    primaryEmotion: "Romantic",
    emotionScores: { Romantic: 0.9, Melancholic: 0.7, Sad: 0.5, Energetic: 0.6, Happy: 0.4, Excited: 0.5, Calm: 0.3, Peaceful: 0.2, Angry: 0.2 },
    duration: 240,
    genre: "New Wave",
    year: 1986
  },
  {
    id: "12",
    title: "West End Girls",
    artist: "Pet Shop Boys",
    album: "Please",
    energy: 0.6,
    primaryEmotion: "Calm",
    emotionScores: { Calm: 0.85, Peaceful: 0.6, Melancholic: 0.6, Romantic: 0.4, Energetic: 0.5, Sad: 0.4, Happy: 0.3, Excited: 0.3, Angry: 0.1 },
    duration: 295,
    genre: "Synthpop",
    year: 1985
  },
  {
    id: "13",
    title: "Relax",
    artist: "Frankie Goes to Hollywood",
    album: "Welcome to the Pleasuredome",
    energy: 0.9,
    primaryEmotion: "Excited",
    emotionScores: { Excited: 0.95, Energetic: 0.9, Happy: 0.7, Romantic: 0.6, Angry: 0.4, Calm: 0.1, Peaceful: 0.1, Sad: 0.1, Melancholic: 0.2 },
    duration: 238,
    genre: "New Wave",
    year: 1983
  },
  {
    id: "14",
    title: "Love Will Tear Us Apart",
    artist: "Joy Division",
    album: "Closer",
    energy: 0.5,
    primaryEmotion: "Sad",
    emotionScores: { Sad: 0.95, Melancholic: 0.9, Romantic: 0.5, Calm: 0.4, Peaceful: 0.3, Angry: 0.3, Happy: 0.1, Energetic: 0.3, Excited: 0.1 },
    duration: 238,
    genre: "Post-Punk",
    year: 1980
  },
  {
    id: "15",
    title: "Just Like Heaven",
    artist: "The Cure",
    album: "Kiss Me, Kiss Me, Kiss Me",
    energy: 0.7,
    primaryEmotion: "Romantic",
    emotionScores: { Romantic: 0.85, Happy: 0.7, Excited: 0.6, Energetic: 0.6, Melancholic: 0.4, Calm: 0.3, Peaceful: 0.3, Sad: 0.3, Angry: 0.1 },
    duration: 209,
    genre: "New Wave",
    year: 1987
  }
];

// Thayer's 8 emotion categories with color mapping
export const emotionColors: Record<string, string> = {
  Happy: "#ffff00",         // Yellow - High energy, Low stress
  Exuberant: "#ff8800",     // Orange - High energy, Low stress
  Energetic: "#ff0080",     // Pink - High energy, High stress  
  Frantic: "#ff0000",       // Red - High energy, High stress
  'Anxious/Sad': "#448aff", // Blue - Low energy, High stress
  Depression: "#6b46c1",    // Purple - Low energy, High stress
  Calm: "#00ffff",          // Cyan - Low energy, Low stress
  Contentment: "#00ff88",   // Green - Low energy, Low stress
  
  // Legacy mappings for backwards compatibility
  Excited: "#ff0080",    // Pink
  Romantic: "#ff00ff",   // Magenta
  Peaceful: "#00ff88",   // Green
  Sad: "#448aff",        // Blue
  Melancholic: "#6b46c1", // Purple
  Angry: "#ff0000",      // Red
};

// Energy to size mapping
export const getNodeSize = (energy: number): number => {
  return 0.01 + (energy * 0.02); // Range from 0.01 to 0.03 (tiny!)
};

// Generate layered emotional analysis
export const generateMoodLayers = (songs: Song[]) => {
  // Group songs by primary emotion
  const emotionGroups = songs.reduce((acc, song) => {
    if (!acc[song.primaryEmotion]) {
      acc[song.primaryEmotion] = [];
    }
    acc[song.primaryEmotion].push(song);
    return acc;
  }, {} as Record<string, Song[]>);

  // Create layers with different sizes based on song count
  const layers = Object.entries(emotionGroups).map(([emotion, emotionSongs], index) => {
    const totalSongs = emotionSongs.length;
    const avgEnergy = emotionSongs.reduce((sum, song) => sum + song.energy, 0) / totalSongs;
    const radius = Math.max(4, Math.min(10, 3 + totalSongs * 0.4));
    const height = 8 + (index * 6); // Start well above the topmost grid (height 0) and corner markers (height 2)
    
    return {
      id: emotion,
      name: emotion,
      songs: emotionSongs,
      totalSongs,
      avgEnergy,
      radius,
      height,
      color: emotionColors[emotion] || '#ffffff'
    };
  });

  return layers;
};
