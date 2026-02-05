// MusicKit utility functions for Apple Music integration

declare global {
  interface Window {
    MusicKit: any;
  }
}

export interface MusicKitConfig {
  developerToken: string;
  app: {
    name: string;
    build: string;
  };
}

export class MusicKitError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'MusicKitError';
  }
}

export async function initMusicKit(config: MusicKitConfig) {
  try {
    if (!window.MusicKit) {
      throw new MusicKitError('MusicKit SDK not loaded');
    }

    await window.MusicKit.configure({
      developerToken: config.developerToken,
      app: {
        name: config.app.name,
        build: config.app.build,
      },
    });

    const musicKit = window.MusicKit.getInstance();
    return musicKit;
  } catch (error) {
    console.error('Failed to initialize MusicKit:', error);
    throw new MusicKitError('Failed to initialize MusicKit');
  }
}

export async function authorizeMusicKit(musicKit: any): Promise<boolean> {
  try {
    const isAuthorized = await musicKit.authorize();
    return isAuthorized;
  } catch (error) {
    console.error('MusicKit authorization failed:', error);
    return false;
  }
}

export async function searchSongs(musicKit: any, query: string, limit: number = 25) {
  try {
    const response = await musicKit.api.search(query, {
      types: ['songs'],
      limit: limit,
    });

    return response.songs?.data || [];
  } catch (error) {
    console.error('Song search failed:', error);
    throw new MusicKitError('Failed to search songs');
  }
}

export async function getUserLibrary(musicKit: any, limit: number = 50) {
  try {
    const response = await musicKit.api.library.songs(null, {
      limit: limit,
    });

    return response.data || [];
  } catch (error) {
    console.error('Failed to get user library:', error);
    throw new MusicKitError('Failed to get user library');
  }
}

export async function playPreview(musicKit: any, songId: string) {
  try {
    // Get song details first
    const song = await musicKit.api.song(songId);
    
    if (song.attributes?.previews?.[0]?.url) {
      const audio = new Audio(song.attributes.previews[0].url);
      audio.play();
      return audio;
    } else {
      throw new MusicKitError('No preview available for this song');
    }
  } catch (error) {
    console.error('Failed to play preview:', error);
    throw new MusicKitError('Failed to play preview');
  }
}

export function mapAppleMusicToSong(appleSong: any) {
  return {
    id: appleSong.id,
    title: appleSong.attributes?.name || 'Unknown',
    artist: appleSong.attributes?.artistName || 'Unknown Artist',
    album: appleSong.attributes?.albumName || 'Unknown Album',
    energy: 0.5, // Default energy level - would need additional API calls to get audio features
    mood: 'neutral', // Default mood - would need analysis or user input
    previewUrl: appleSong.attributes?.previews?.[0]?.url,
    duration: appleSong.attributes?.durationInMillis ? 
      Math.round(appleSong.attributes.durationInMillis / 1000) : undefined,
    genre: appleSong.attributes?.genreNames?.[0],
    year: appleSong.attributes?.releaseDate ? 
      new Date(appleSong.attributes.releaseDate).getFullYear() : undefined,
  };
}

// Fetch a catalog playlist (public, no user auth needed)
export async function fetchCatalogPlaylist(musicKit: any, playlistId: string, storefront: string = 'us') {
  try {
    const response = await musicKit.api.music(`/v1/catalog/${storefront}/playlists/${playlistId}`, {
      include: 'tracks',
    });
    return response.data?.data?.[0] || null;
  } catch (error) {
    console.error('Failed to fetch catalog playlist:', error);
    return null;
  }
}

// Search for playlists in the catalog (public, no user auth needed)
export async function searchCatalogPlaylists(musicKit: any, query: string, storefront: string = 'us', limit: number = 5) {
  try {
    const response = await musicKit.api.music(`/v1/catalog/${storefront}/search`, {
      term: query,
      types: 'playlists',
      limit: limit,
    });
    return response.data?.results?.playlists?.data || [];
  } catch (error) {
    console.error('Failed to search playlists:', error);
    return [];
  }
}

// Fetch charts for a storefront (public, no user auth needed)
export async function fetchCharts(musicKit: any, storefront: string = 'us', types: string = 'songs', limit: number = 25) {
  try {
    const response = await musicKit.api.music(`/v1/catalog/${storefront}/charts`, {
      types: types,
      limit: limit,
    });
    return response.data?.results || null;
  } catch (error) {
    console.error('Failed to fetch charts:', error);
    return null;
  }
}

// Default configuration for development
export const defaultConfig: MusicKitConfig = {
  developerToken: '', // Set this in your .env file
  app: {
    name: 'MoodAtlas',
    build: '1.0.0',
  },
};
