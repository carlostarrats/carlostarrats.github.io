import React, { useState, useEffect } from 'react';
import Header from './Header';
import MoodAtlasScene from './MoodAtlasScene';
import { Song, mockSongs } from '@/data/mockSongs';

const MoodAtlas: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [, setHoveredSong] = useState<Song | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [, setDataSource] = useState<'mock' | 'apple'>('mock');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Apple Music data if available
    const loadData = async () => {
      try {
        console.log('Attempting to load Apple Music data...');
        const appleMusicData = await import('@/data/appleMusicSongs.json');
        console.log('Apple Music data loaded:', appleMusicData.default?.length, 'songs');
        if (appleMusicData.default && appleMusicData.default.length > 0) {
          setSongs(appleMusicData.default as Song[]);
          setDataSource('apple');
        } else {
          setSongs(mockSongs);
          setDataSource('mock');
        }
      } catch (err) {
        console.log('Failed to load Apple Music data, using mock data:', err);
        setSongs(mockSongs);
        setDataSource('mock');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);


  const handleHomeClick = () => {
    window.location.href = '/'; // Navigate back to main portfolio
  };

  const handleResetView = () => {
    setResetTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen text-white overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="text-center">
          <div className="text-2xl font-mono mb-4">Loading Mood Atlas...</div>
          <div className="text-gray-400 font-mono">Processing your music data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white overflow-hidden">
      <Header 
        onHomeClick={handleHomeClick}
        onResetView={handleResetView}
      />
      
      <main className="h-screen">
        <MoodAtlasScene 
          songs={songs}
          onSongHover={setHoveredSong}
          resetTrigger={resetTrigger}
        />
      </main>
    </div>
  );
};

export default MoodAtlas;
