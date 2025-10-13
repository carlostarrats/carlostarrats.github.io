import React, { useState, useEffect } from 'react';
import Header from './Header';
import MoodAtlasScene from './MoodAtlasScene';
import { Song, mockSongs } from '@/data/mockSongs';

const MoodAtlas: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>(mockSongs);
  const [, setHoveredSong] = useState<Song | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [, setDataSource] = useState<'mock' | 'apple'>('mock');

  useEffect(() => {
    // Load Apple Music data if available
    const loadData = async () => {
      try {
        const appleMusicData = await import('@/data/appleMusicSongs.json');
        if (appleMusicData.default && appleMusicData.default.length > 0) {
          setSongs(appleMusicData.default as Song[]);
          setDataSource('apple');
        }
      } catch (err) {
        console.log('Using mock data');
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
