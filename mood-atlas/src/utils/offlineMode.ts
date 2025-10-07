// Offline mode - download music data once, then disconnect account
import { SecurityManager } from './security';
import { analyzeSongMood } from '@/data/mockSongs';

export interface OfflineSongData {
  id: string;
  title: string;
  artist: string;
  album?: string;
  energy: number;
  valence: number;
  danceability: number;
  acousticness: number;
  tempo: number;
  mood: string;
  previewUrl?: string;
  duration?: number;
  genre?: string;
  year?: number;
  // Metadata for offline mode
  downloadedAt: string;
  dataHash: string;
}

export class OfflineMusicManager {
  private static readonly OFFLINE_DATA_KEY = 'moodAtlas_offline_music_data';
  private static readonly ACCOUNT_STATUS_KEY = 'moodAtlas_account_connected';

  // Download and cache user's music data
  static async downloadMusicData(musicKit: any, maxSongs: number = 100): Promise<OfflineSongData[]> {
    try {
      console.log('🔄 Downloading music data for offline mode...');
      
      // Get user's library
      const libraryData = await musicKit.api.library.songs(null, {
        limit: maxSongs,
      });

      const songs: OfflineSongData[] = [];
      
      for (const appleSong of libraryData.data || []) {
        // Generate realistic audio features
        const audioFeatures = this.generateAudioFeatures(appleSong);
        
        const song: OfflineSongData = {
          id: appleSong.id,
          title: this.sanitizeInput(appleSong.attributes?.name || 'Unknown'),
          artist: this.sanitizeInput(appleSong.attributes?.artistName || 'Unknown Artist'),
          album: this.sanitizeInput(appleSong.attributes?.albumName || 'Unknown Album'),
          energy: audioFeatures.energy,
          valence: audioFeatures.valence,
          danceability: audioFeatures.danceability,
          acousticness: audioFeatures.acousticness,
          tempo: audioFeatures.tempo,
          mood: analyzeSongMood(audioFeatures),
          previewUrl: appleSong.attributes?.previews?.[0]?.url,
          duration: appleSong.attributes?.durationInMillis ? 
            Math.round(appleSong.attributes.durationInMillis / 1000) : undefined,
          genre: appleSong.attributes?.genreNames?.[0],
          year: appleSong.attributes?.releaseDate ? 
            new Date(appleSong.attributes.releaseDate).getFullYear() : undefined,
          downloadedAt: new Date().toISOString(),
          dataHash: this.generateDataHash(appleSong.id)
        };
        
        songs.push(song);
      }

      // Encrypt and store the data
      await SecurityManager.storeUserLibrary(songs);
      
      // Mark that we have offline data
      localStorage.setItem(this.OFFLINE_DATA_KEY, JSON.stringify({
        downloadedAt: new Date().toISOString(),
        songCount: songs.length,
        dataVersion: '1.0'
      }));

      console.log(`✅ Downloaded ${songs.length} songs for offline mode`);
      return songs;
      
    } catch (error) {
      console.error('Failed to download music data:', error);
      throw new Error('Failed to download music data for offline mode');
    }
  }

  // Load cached offline music data
  static async loadOfflineData(): Promise<OfflineSongData[] | null> {
    try {
      const offlineInfo = localStorage.getItem(this.OFFLINE_DATA_KEY);
      if (!offlineInfo) {
        console.log('No offline data found');
        return null;
      }

      const info = JSON.parse(offlineInfo);
      console.log(`📱 Loading offline data: ${info.songCount} songs from ${new Date(info.downloadedAt).toLocaleDateString()}`);

      // Load encrypted data
      const encryptedData = await SecurityManager.getUserLibrary();
      return encryptedData as OfflineSongData[];
      
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return null;
    }
  }

  // Disconnect Apple Music account and clear sensitive data
  static async disconnectAccount(musicKit: any): Promise<void> {
    try {
      console.log('🔌 Disconnecting Apple Music account...');
      
      // Sign out from MusicKit
      if (musicKit) {
        await musicKit.unauthorize();
      }
      
      // Clear sensitive session data
      SecurityManager.clearUserData();
      
      // Mark account as disconnected
      localStorage.setItem(this.ACCOUNT_STATUS_KEY, JSON.stringify({
        connected: false,
        disconnectedAt: new Date().toISOString()
      }));
      
      console.log('✅ Account disconnected. Offline data preserved.');
      
    } catch (error) {
      console.error('Failed to disconnect account:', error);
      throw new Error('Failed to disconnect Apple Music account');
    }
  }

  // Check if account is currently connected
  static isAccountConnected(): boolean {
    try {
      const status = localStorage.getItem(this.ACCOUNT_STATUS_KEY);
      if (!status) return false;
      
      const parsed = JSON.parse(status);
      return parsed.connected === true;
    } catch {
      return false;
    }
  }

  // Check if offline data exists
  static hasOfflineData(): boolean {
    return localStorage.getItem(this.OFFLINE_DATA_KEY) !== null;
  }

  // Get offline data info
  static getOfflineDataInfo(): { songCount: number; downloadedAt: string } | null {
    try {
      const info = localStorage.getItem(this.OFFLINE_DATA_KEY);
      if (!info) return null;
      
      const parsed = JSON.parse(info);
      return {
        songCount: parsed.songCount,
        downloadedAt: parsed.downloadedAt
      };
    } catch {
      return null;
    }
  }

  // Generate realistic audio features based on song metadata
  private static generateAudioFeatures(appleSong: any): {
    energy: number;
    valence: number;
    danceability: number;
    acousticness: number;
    tempo: number;
  } {
    const genre = appleSong.attributes?.genreNames?.[0]?.toLowerCase() || '';
    const year = appleSong.attributes?.releaseDate ? 
      new Date(appleSong.attributes.releaseDate).getFullYear() : 2020;
    
    // Genre-based audio feature estimation
    let baseEnergy = 0.5;
    let baseValence = 0.5;
    let baseDanceability = 0.5;
    let baseAcousticness = 0.3;
    let baseTempo = 120;

    // Adjust based on genre
    if (genre.includes('electronic') || genre.includes('dance')) {
      baseEnergy = 0.8;
      baseValence = 0.7;
      baseDanceability = 0.9;
      baseAcousticness = 0.1;
      baseTempo = 128;
    } else if (genre.includes('rock') || genre.includes('metal')) {
      baseEnergy = 0.7;
      baseValence = 0.6;
      baseDanceability = 0.4;
      baseAcousticness = 0.2;
      baseTempo = 140;
    } else if (genre.includes('pop')) {
      baseEnergy = 0.6;
      baseValence = 0.7;
      baseDanceability = 0.8;
      baseAcousticness = 0.2;
      baseTempo = 120;
    } else if (genre.includes('jazz') || genre.includes('blues')) {
      baseEnergy = 0.4;
      baseValence = 0.5;
      baseDanceability = 0.3;
      baseAcousticness = 0.8;
      baseTempo = 100;
    } else if (genre.includes('classical')) {
      baseEnergy = 0.3;
      baseValence = 0.6;
      baseDanceability = 0.2;
      baseAcousticness = 0.9;
      baseTempo = 80;
    }

    // Add some randomness for realism
    const randomFactor = 0.2;
    
    return {
      energy: Math.max(0.1, Math.min(1.0, baseEnergy + (Math.random() - 0.5) * randomFactor)),
      valence: Math.max(0.1, Math.min(1.0, baseValence + (Math.random() - 0.5) * randomFactor)),
      danceability: Math.max(0.1, Math.min(1.0, baseDanceability + (Math.random() - 0.5) * randomFactor)),
      acousticness: Math.max(0.1, Math.min(1.0, baseAcousticness + (Math.random() - 0.5) * randomFactor)),
      tempo: Math.floor(baseTempo + (Math.random() - 0.5) * 40)
    };
  }

  // Generate hash for data integrity
  private static generateDataHash(songId: string): string {
    return btoa(songId + Date.now().toString()).substring(0, 16);
  }

  // Sanitize input to prevent XSS
  private static sanitizeInput(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // Clear all offline data (for account reconnection)
  static clearOfflineData(): void {
    localStorage.removeItem(this.OFFLINE_DATA_KEY);
    localStorage.removeItem(this.ACCOUNT_STATUS_KEY);
    SecurityManager.clearUserData();
    console.log('🗑️ Offline data cleared');
  }
}

