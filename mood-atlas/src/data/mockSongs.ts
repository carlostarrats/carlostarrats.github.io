export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  energy: number; // 0-1 scale
  mood: string;
  previewUrl?: string;
  duration?: number;
  genre?: string;
  year?: number;
}

export const mockSongs: Song[] = [
  {
    id: "1",
    title: "Midnight City",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    energy: 0.9,
    mood: "dreamy",
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
    mood: "bright",
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
    mood: "melancholic",
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
    mood: "energetic",
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
    mood: "dark",
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
    mood: "melancholic",
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
    mood: "bright",
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
    mood: "mechanical",
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
    mood: "nostalgic",
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
    mood: "playful",
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
    mood: "melancholic",
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
    mood: "sophisticated",
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
    mood: "intense",
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
    mood: "melancholic",
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
    mood: "dreamy",
    duration: 209,
    genre: "New Wave",
    year: 1987
  }
];

// Mood color mapping for visual representation
export const moodColors: Record<string, string> = {
  dreamy: "#ff00ff",     // Magenta
  bright: "#00ffff",     // Cyan
  melancholic: "#448aff", // Blue
  energetic: "#ff8800",  // Orange
  dark: "#6b46c1",       // Purple
  mechanical: "#888888", // Gray
  nostalgic: "#ff6b6b",  // Red
  playful: "#ffff00",    // Yellow
  sophisticated: "#00ff88", // Green
  intense: "#ff0080",    // Pink
};

// Energy to size mapping
export const getNodeSize = (energy: number): number => {
  return 0.2 + (energy * 0.4); // Range from 0.2 to 0.6
};

// Generate layered emotional analysis
export const generateMoodLayers = (songs: Song[]) => {
  // Group songs by mood
  const moodGroups = songs.reduce((acc, song) => {
    if (!acc[song.mood]) {
      acc[song.mood] = [];
    }
    acc[song.mood].push(song);
    return acc;
  }, {} as Record<string, Song[]>);

  // Create layers with different sizes based on song count
  const layers = Object.entries(moodGroups).map(([mood, songs], index) => {
    const totalSongs = songs.length;
    const avgEnergy = songs.reduce((sum, song) => sum + song.energy, 0) / totalSongs;
    const radius = Math.max(4, Math.min(10, 3 + totalSongs * 0.4));
    const height = 8 + (index * 6); // Start well above the topmost grid (height 0) and corner markers (height 2)
    
    return {
      id: mood,
      name: mood,
      songs,
      totalSongs,
      avgEnergy,
      radius,
      height,
      color: moodColors[mood] || '#ffffff'
    };
  });

  return layers;
};
