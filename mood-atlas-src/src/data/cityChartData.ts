// City Chart Data - Apple Music City Charts identifiers and types

export interface CityChartSong {
  id: string;
  title: string;
  artist: string;
  album?: string;
  energy: number;
  valence: number;
  primaryEmotion: string;
  emotionScores: Record<string, number>;
  previewUrl?: string;
  duration?: number;
  genre?: string;
  year?: number;
  artworkUrl?: string;
}

export interface CityData {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  playlistId: string; // Apple Music playlist ID for city chart
  // Calculated after fetching songs
  songs?: CityChartSong[];
  avgEnergy?: number;
  avgValence?: number;
  primaryEmotion?: string;
  position?: { x: number; y: number; z: number };
  color?: string;
}

export interface CityCluster {
  city: CityData;
  songs: CityChartSong[];
  avgEnergy: number;
  avgValence: number;
  primaryEmotion: string;
  color: string;
  position: { x: number; y: number; z: number };
}

// Apple Music City Charts - Top 100 global cities
// Playlist IDs follow the pattern: pl.{city-identifier}
// Note: These are example IDs - actual Apple Music playlist IDs may differ
export const cityCharts: CityData[] = [
  // North America
  { id: 'new-york', name: 'New York', country: 'United States', countryCode: 'US', playlistId: 'pl.u-KVXBkNZIap8e1G' },
  { id: 'los-angeles', name: 'Los Angeles', country: 'United States', countryCode: 'US', playlistId: 'pl.u-6mo4lXZC6l3e9z' },
  { id: 'chicago', name: 'Chicago', country: 'United States', countryCode: 'US', playlistId: 'pl.u-EdAVzDNI38W' },
  { id: 'houston', name: 'Houston', country: 'United States', countryCode: 'US', playlistId: 'pl.u-XkD0vpkC3l9m' },
  { id: 'miami', name: 'Miami', country: 'United States', countryCode: 'US', playlistId: 'pl.u-gxbllBLCp48V' },
  { id: 'atlanta', name: 'Atlanta', country: 'United States', countryCode: 'US', playlistId: 'pl.u-MDAWvBzspx0m' },
  { id: 'dallas', name: 'Dallas', country: 'United States', countryCode: 'US', playlistId: 'pl.u-55D6Zl9c3dPV' },
  { id: 'phoenix', name: 'Phoenix', country: 'United States', countryCode: 'US', playlistId: 'pl.u-oZylDKNI0d6L' },
  { id: 'philadelphia', name: 'Philadelphia', country: 'United States', countryCode: 'US', playlistId: 'pl.u-BNA6vNztLjW0' },
  { id: 'san-antonio', name: 'San Antonio', country: 'United States', countryCode: 'US', playlistId: 'pl.u-r2yBBRNt9L4e' },
  { id: 'san-diego', name: 'San Diego', country: 'United States', countryCode: 'US', playlistId: 'pl.u-WabZvlBC6ep9' },
  { id: 'san-jose', name: 'San Jose', country: 'United States', countryCode: 'US', playlistId: 'pl.u-kv9lB8zI0L4m' },
  { id: 'austin', name: 'Austin', country: 'United States', countryCode: 'US', playlistId: 'pl.u-PDb44gYI9d0L' },
  { id: 'seattle', name: 'Seattle', country: 'United States', countryCode: 'US', playlistId: 'pl.u-yZyVV8LT6epm' },
  { id: 'denver', name: 'Denver', country: 'United States', countryCode: 'US', playlistId: 'pl.u-NpXGGqJT0dmL' },
  { id: 'boston', name: 'Boston', country: 'United States', countryCode: 'US', playlistId: 'pl.u-leylldWT3jpZ' },
  { id: 'nashville', name: 'Nashville', country: 'United States', countryCode: 'US', playlistId: 'pl.u-V9D77V6s6epB' },
  { id: 'detroit', name: 'Detroit', country: 'United States', countryCode: 'US', playlistId: 'pl.u-DdANNVlT0xq9' },
  { id: 'portland', name: 'Portland', country: 'United States', countryCode: 'US', playlistId: 'pl.u-mJy88qJtWdpL' },
  { id: 'las-vegas', name: 'Las Vegas', country: 'United States', countryCode: 'US', playlistId: 'pl.u-xlyNNqXtxj0z' },

  // Canada
  { id: 'toronto', name: 'Toronto', country: 'Canada', countryCode: 'CA', playlistId: 'pl.u-AkAmPKLIbBqz' },
  { id: 'vancouver', name: 'Vancouver', country: 'Canada', countryCode: 'CA', playlistId: 'pl.u-KVXBkrmIap8e' },
  { id: 'montreal', name: 'Montreal', country: 'Canada', countryCode: 'CA', playlistId: 'pl.u-6mo4lGYC6l3e' },
  { id: 'calgary', name: 'Calgary', country: 'Canada', countryCode: 'CA', playlistId: 'pl.u-EdAVzqWI38W0' },

  // Europe
  { id: 'london', name: 'London', country: 'United Kingdom', countryCode: 'GB', playlistId: 'pl.u-XkD0vDLC3l9m' },
  { id: 'manchester', name: 'Manchester', country: 'United Kingdom', countryCode: 'GB', playlistId: 'pl.u-gxbllrycp48V' },
  { id: 'birmingham', name: 'Birmingham', country: 'United Kingdom', countryCode: 'GB', playlistId: 'pl.u-MDAWvPKspx0m' },
  { id: 'paris', name: 'Paris', country: 'France', countryCode: 'FR', playlistId: 'pl.u-55D6ZLNC3dPV' },
  { id: 'marseille', name: 'Marseille', country: 'France', countryCode: 'FR', playlistId: 'pl.u-oZylDz9I0d6L' },
  { id: 'lyon', name: 'Lyon', country: 'France', countryCode: 'FR', playlistId: 'pl.u-BNA6vXEtLjW0' },
  { id: 'berlin', name: 'Berlin', country: 'Germany', countryCode: 'DE', playlistId: 'pl.u-r2yBB4et9L4e' },
  { id: 'munich', name: 'Munich', country: 'Germany', countryCode: 'DE', playlistId: 'pl.u-WabZvmYC6ep9' },
  { id: 'hamburg', name: 'Hamburg', country: 'Germany', countryCode: 'DE', playlistId: 'pl.u-kv9lB1PI0L4m' },
  { id: 'madrid', name: 'Madrid', country: 'Spain', countryCode: 'ES', playlistId: 'pl.u-PDb44DqI9d0L' },
  { id: 'barcelona', name: 'Barcelona', country: 'Spain', countryCode: 'ES', playlistId: 'pl.u-yZyVVNYT6epm' },
  { id: 'rome', name: 'Rome', country: 'Italy', countryCode: 'IT', playlistId: 'pl.u-NpXGGxXT0dmL' },
  { id: 'milan', name: 'Milan', country: 'Italy', countryCode: 'IT', playlistId: 'pl.u-leyllz9T3jpZ' },
  { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', playlistId: 'pl.u-V9D77dEs6epB' },
  { id: 'stockholm', name: 'Stockholm', country: 'Sweden', countryCode: 'SE', playlistId: 'pl.u-DdANNGYT0xq9' },
  { id: 'copenhagen', name: 'Copenhagen', country: 'Denmark', countryCode: 'DK', playlistId: 'pl.u-mJy88DJtWdpL' },
  { id: 'oslo', name: 'Oslo', country: 'Norway', countryCode: 'NO', playlistId: 'pl.u-xlyNNjYtxj0z' },
  { id: 'vienna', name: 'Vienna', country: 'Austria', countryCode: 'AT', playlistId: 'pl.u-AkAmPVrIbBqz' },
  { id: 'zurich', name: 'Zurich', country: 'Switzerland', countryCode: 'CH', playlistId: 'pl.u-KVXBknrIap8e' },
  { id: 'brussels', name: 'Brussels', country: 'Belgium', countryCode: 'BE', playlistId: 'pl.u-6mo4lm9C6l3e' },
  { id: 'dublin', name: 'Dublin', country: 'Ireland', countryCode: 'IE', playlistId: 'pl.u-EdAVzGWI38W0' },
  { id: 'lisbon', name: 'Lisbon', country: 'Portugal', countryCode: 'PT', playlistId: 'pl.u-XkD0vqYC3l9m' },
  { id: 'athens', name: 'Athens', country: 'Greece', countryCode: 'GR', playlistId: 'pl.u-gxblljLcp48V' },
  { id: 'warsaw', name: 'Warsaw', country: 'Poland', countryCode: 'PL', playlistId: 'pl.u-MDAWvVzspx0m' },
  { id: 'prague', name: 'Prague', country: 'Czech Republic', countryCode: 'CZ', playlistId: 'pl.u-55D6Z39c3dPV' },
  { id: 'budapest', name: 'Budapest', country: 'Hungary', countryCode: 'HU', playlistId: 'pl.u-oZylDzNI0d6L' },

  // Asia
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', countryCode: 'JP', playlistId: 'pl.u-BNA6vXztLjW0' },
  { id: 'osaka', name: 'Osaka', country: 'Japan', countryCode: 'JP', playlistId: 'pl.u-r2yBB1Nt9L4e' },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', countryCode: 'KR', playlistId: 'pl.u-WabZvlYC6ep9' },
  { id: 'busan', name: 'Busan', country: 'South Korea', countryCode: 'KR', playlistId: 'pl.u-kv9lB8PI0L4m' },
  { id: 'beijing', name: 'Beijing', country: 'China', countryCode: 'CN', playlistId: 'pl.u-PDb44gqI9d0L' },
  { id: 'shanghai', name: 'Shanghai', country: 'China', countryCode: 'CN', playlistId: 'pl.u-yZyVV8YT6epm' },
  { id: 'hong-kong', name: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', playlistId: 'pl.u-NpXGGq9T0dmL' },
  { id: 'taipei', name: 'Taipei', country: 'Taiwan', countryCode: 'TW', playlistId: 'pl.u-leylld9T3jpZ' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', countryCode: 'SG', playlistId: 'pl.u-V9D77V6s6epB' },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', countryCode: 'TH', playlistId: 'pl.u-DdANNVYT0xq9' },
  { id: 'kuala-lumpur', name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', playlistId: 'pl.u-mJy88qJtWdpL' },
  { id: 'jakarta', name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', playlistId: 'pl.u-xlyNNqYtxj0z' },
  { id: 'manila', name: 'Manila', country: 'Philippines', countryCode: 'PH', playlistId: 'pl.u-AkAmPKrIbBqz' },
  { id: 'ho-chi-minh', name: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN', playlistId: 'pl.u-KVXBkn9Iap8e' },
  { id: 'mumbai', name: 'Mumbai', country: 'India', countryCode: 'IN', playlistId: 'pl.u-6mo4lm6C6l3e' },
  { id: 'delhi', name: 'Delhi', country: 'India', countryCode: 'IN', playlistId: 'pl.u-EdAVzGqI38W0' },
  { id: 'bangalore', name: 'Bangalore', country: 'India', countryCode: 'IN', playlistId: 'pl.u-XkD0vqzC3l9m' },

  // Middle East
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', playlistId: 'pl.u-gxblljzcp48V' },
  { id: 'abu-dhabi', name: 'Abu Dhabi', country: 'United Arab Emirates', countryCode: 'AE', playlistId: 'pl.u-MDAWvVKspx0m' },
  { id: 'tel-aviv', name: 'Tel Aviv', country: 'Israel', countryCode: 'IL', playlistId: 'pl.u-55D6Z3Jc3dPV' },
  { id: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', playlistId: 'pl.u-oZylDz4I0d6L' },
  { id: 'doha', name: 'Doha', country: 'Qatar', countryCode: 'QA', playlistId: 'pl.u-BNA6vXEtLjW0' },

  // Oceania
  { id: 'sydney', name: 'Sydney', country: 'Australia', countryCode: 'AU', playlistId: 'pl.u-r2yBB4Nt9L4e' },
  { id: 'melbourne', name: 'Melbourne', country: 'Australia', countryCode: 'AU', playlistId: 'pl.u-WabZvmBC6ep9' },
  { id: 'brisbane', name: 'Brisbane', country: 'Australia', countryCode: 'AU', playlistId: 'pl.u-kv9lB1zI0L4m' },
  { id: 'perth', name: 'Perth', country: 'Australia', countryCode: 'AU', playlistId: 'pl.u-PDb44DWI9d0L' },
  { id: 'auckland', name: 'Auckland', country: 'New Zealand', countryCode: 'NZ', playlistId: 'pl.u-yZyVVNLT6epm' },

  // Latin America
  { id: 'mexico-city', name: 'Mexico City', country: 'Mexico', countryCode: 'MX', playlistId: 'pl.u-NpXGGxJT0dmL' },
  { id: 'guadalajara', name: 'Guadalajara', country: 'Mexico', countryCode: 'MX', playlistId: 'pl.u-leyllzWT3jpZ' },
  { id: 'monterrey', name: 'Monterrey', country: 'Mexico', countryCode: 'MX', playlistId: 'pl.u-V9D77dKs6epB' },
  { id: 'sao-paulo', name: 'São Paulo', country: 'Brazil', countryCode: 'BR', playlistId: 'pl.u-DdANNGLT0xq9' },
  { id: 'rio-de-janeiro', name: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', playlistId: 'pl.u-mJy88DWtWdpL' },
  { id: 'buenos-aires', name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', playlistId: 'pl.u-xlyNNjztxj0z' },
  { id: 'santiago', name: 'Santiago', country: 'Chile', countryCode: 'CL', playlistId: 'pl.u-AkAmPVLIbBqz' },
  { id: 'lima', name: 'Lima', country: 'Peru', countryCode: 'PE', playlistId: 'pl.u-KVXBknLIap8e' },
  { id: 'bogota', name: 'Bogotá', country: 'Colombia', countryCode: 'CO', playlistId: 'pl.u-6mo4lmJC6l3e' },
  { id: 'medellin', name: 'Medellín', country: 'Colombia', countryCode: 'CO', playlistId: 'pl.u-EdAVzGJI38W0' },
  { id: 'caracas', name: 'Caracas', country: 'Venezuela', countryCode: 'VE', playlistId: 'pl.u-XkD0vqLC3l9m' },

  // Africa
  { id: 'lagos', name: 'Lagos', country: 'Nigeria', countryCode: 'NG', playlistId: 'pl.u-gxblljLcp48V' },
  { id: 'johannesburg', name: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', playlistId: 'pl.u-MDAWvVKspx0m' },
  { id: 'cape-town', name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', playlistId: 'pl.u-55D6Z3Nc3dPV' },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', countryCode: 'EG', playlistId: 'pl.u-oZylDzJI0d6L' },
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', countryCode: 'KE', playlistId: 'pl.u-BNA6vX9tLjW0' },
  { id: 'casablanca', name: 'Casablanca', country: 'Morocco', countryCode: 'MA', playlistId: 'pl.u-r2yBB1et9L4e' },
  { id: 'accra', name: 'Accra', country: 'Ghana', countryCode: 'GH', playlistId: 'pl.u-WabZvmLC6ep9' },
];

// Helper to get city by ID
export const getCityById = (id: string): CityData | undefined => {
  return cityCharts.find(city => city.id === id);
};

// Helper to get cities by country
export const getCitiesByCountry = (countryCode: string): CityData[] => {
  return cityCharts.filter(city => city.countryCode === countryCode);
};

// Get a subset of cities for testing/demo
export const getDemoCities = (count: number = 20): CityData[] => {
  // Return a diverse selection of cities
  const diverseSelection = [
    'new-york', 'los-angeles', 'london', 'paris', 'berlin',
    'tokyo', 'seoul', 'sydney', 'mexico-city', 'sao-paulo',
    'dubai', 'singapore', 'mumbai', 'toronto', 'amsterdam',
    'stockholm', 'lagos', 'johannesburg', 'buenos-aires', 'bangkok'
  ];

  return diverseSelection
    .slice(0, count)
    .map(id => getCityById(id))
    .filter((city): city is CityData => city !== undefined);
};
