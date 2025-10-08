import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import MoodAtlasScene from './MoodAtlasScene';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Song, mockSongs } from '@/data/mockSongs';
import { 
  initMusicKit, 
  authorizeMusicKit, 
  searchSongs, 
  mapAppleMusicToSong,
  defaultConfig 
} from '@/utils/musicKit';
import { Loader2, WifiOff } from 'lucide-react';

const MoodAtlas: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>(mockSongs);
  const [musicKit, setMusicKit] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setHoveredSong] = useState<Song | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Initialize MusicKit on component mount
  useEffect(() => {
    const initializeMusicKit = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // For development, we'll use mock data
        // In production, you would initialize MusicKit here
        console.log('Initializing MusicKit...');
        
        // Simulate initialization delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For now, we'll just use mock data
        setSongs(mockSongs);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize MusicKit:', err);
        setError('Failed to initialize Apple Music connection');
        setIsLoading(false);
      }
    };

    initializeMusicKit();
  }, []);

  const handleSyncLibrary = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!musicKit) {
        // Initialize MusicKit first
        const mk = await initMusicKit(defaultConfig);
        setMusicKit(mk);
      }

      // Authorize user
      const authorized = await authorizeMusicKit(musicKit);
      if (!authorized) {
        throw new Error('Authorization failed');
      }

      setIsAuthorized(true);

      // Search for synthwave/new wave songs
      const searchResults = await searchSongs(musicKit, 'synthwave new wave 80s', 25);
      const mappedSongs = searchResults.map(mapAppleMusicToSong);
      
      setSongs(mappedSongs.length > 0 ? mappedSongs : mockSongs);
      setIsLoading(false);
    } catch (err) {
      console.error('Sync failed:', err);
      setError('Failed to sync with Apple Music. Using demo data.');
      setSongs(mockSongs);
      setIsLoading(false);
    }
  };

  const handleHomeClick = () => {
    window.location.href = '/'; // Navigate back to main portfolio
  };

  const handleResetView = () => {
    setResetTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen text-white overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
      <Header 
        onHomeClick={handleHomeClick}
        onSyncClick={handleSyncLibrary}
        onResetView={handleResetView}
        isAuthorized={isAuthorized}
      />
      
      <main className="pt-20 h-screen" style={{ backgroundColor: '#1a1a1a' }}>
        <MoodAtlasScene 
          songs={songs}
          onSongHover={setHoveredSong}
          resetTrigger={resetTrigger}
          musicKit={musicKit}
        />
      </main>

      {/* Loading overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <Card className="bg-black border border-white/20">
            <CardContent className="p-6 text-center">
              <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
              <div className="font-mono text-white mb-2">Connecting to Apple Music</div>
              <div className="text-sm text-gray-400">
                {isAuthorized ? 'Syncing your library...' : 'Initializing MusicKit...'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Error overlay */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Card className="bg-red-900/90 border border-red-500/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-red-400" />
                <div className="font-mono text-red-200">{error}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-200"
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

    </div>
  );
};

export default MoodAtlas;
