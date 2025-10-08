import React, { useState } from 'react';
import Header from './Header';
import MoodAtlasScene from './MoodAtlasScene';
import { Song, mockSongs } from '@/data/mockSongs';

const MoodAtlas: React.FC = () => {
  const [songs] = useState<Song[]>(mockSongs);
  const [, setHoveredSong] = useState<Song | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);


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
        onResetView={handleResetView}
      />
      
      <main className="pt-20 h-screen" style={{ backgroundColor: '#1a1a1a' }}>
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
