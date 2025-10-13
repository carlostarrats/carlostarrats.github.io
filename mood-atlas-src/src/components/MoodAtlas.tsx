import React, { useState, useEffect } from 'react';
import Header from './Header';
import MoodAtlasScene from './MoodAtlasScene';
import { Song, mockSongs } from '@/data/mockSongs';
import appleMusicData from '@/data/appleMusicSongs.json';

const MoodAtlas: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [, setHoveredSong] = useState<Song | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [, setDataSource] = useState<'mock' | 'apple'>('mock');

  useEffect(() => {
    // Load Apple Music data directly
    console.log('Loading Apple Music data...');
    console.log('Apple Music data available:', appleMusicData?.length, 'songs');
    
    if (appleMusicData && appleMusicData.length > 0) {
      setSongs(appleMusicData as Song[]);
      setDataSource('apple');
      console.log('Successfully loaded Apple Music data with', appleMusicData.length, 'songs');
    } else {
      console.log('Apple Music data is empty, using mock data');
      setSongs(mockSongs);
      setDataSource('mock');
    }
    
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
