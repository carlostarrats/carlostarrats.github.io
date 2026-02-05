import React, { useState, useEffect, useCallback } from 'react';
import Header, { ViewMode } from './Header';
import MoodAtlasScene from './MoodAtlasScene';
import { Song, mockSongs } from '@/data/mockSongs';
import { CityCluster, CityChartSong } from '@/data/cityChartData';
import { fetchAllRegionCharts } from '@/utils/deezerCharts';
import appleMusicData from '@/data/appleMusicSongs.json';

interface ExamineMode {
  emotion: string;
  color: string;
  songs: Song[];
}

interface CityExamineMode {
  city: CityCluster;
  songs: CityChartSong[];
}

const MoodAtlas: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [, setHoveredSong] = useState<Song | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [, setDataSource] = useState<'mock' | 'apple'>('mock');
  const [examineMode, setExamineMode] = useState<ExamineMode | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // City Galaxies state
  const [viewMode, setViewMode] = useState<ViewMode>('personal');
  const [cityCharts, setCityCharts] = useState<CityCluster[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [cityExamineMode, setCityExamineMode] = useState<CityExamineMode | null>(null);
  const [selectedCitySong, setSelectedCitySong] = useState<CityChartSong | null>(null);

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

  // Load city charts when switching to discover mode
  const loadCityCharts = useCallback(async () => {
    if (cityCharts.length > 0) return; // Already loaded

    setIsLoadingCities(true);
    try {
      // Fetch real chart data from Deezer API (free, no auth)
      const clusters = await fetchAllRegionCharts((loaded, total) => {
        console.log(`Loading charts: ${loaded}/${total}`);
      });
      setCityCharts(clusters);
      console.log(`🌍 Loaded ${clusters.length} region charts with real data`);
    } catch (error) {
      console.error('Failed to load city charts:', error);
    } finally {
      setIsLoadingCities(false);
    }
  }, [cityCharts.length]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setResetTrigger(prev => prev + 1);

    // Close any examine mode when switching views
    setExamineMode(null);
    setCityExamineMode(null);
    setSelectedSong(null);
    setSelectedCitySong(null);

    if (mode === 'discover') {
      loadCityCharts();
    }
  }, [loadCityCharts]);

  const handleHomeClick = () => {
    window.location.href = '/'; // Navigate back to main portfolio
  };

  const handleResetView = () => {
    setResetTrigger(prev => prev + 1);
  };

  const handleExamine = (emotion: string, color: string, emotionSongs: Song[]) => {
    setExamineMode({ emotion, color, songs: emotionSongs });
  };

  const handleCloseExamine = () => {
    setExamineMode(null);
    setCityExamineMode(null);
    setResetTrigger(prev => prev + 1);
  };

  // City examine mode handlers
  const handleCityExamine = (cluster: CityCluster) => {
    setCityExamineMode({ city: cluster, songs: cluster.songs });
  };

  const handleCitySongSelect = (song: CityChartSong | null) => {
    setSelectedCitySong(song);
  };

  // Determine the current examine mode for header display
  const activeExamineMode = examineMode || (cityExamineMode ? {
    emotion: cityExamineMode.city.city.name,
    color: cityExamineMode.city.color,
  } : null);

  return (
    <div className="min-h-screen text-white overflow-hidden">
      <Header
        onHomeClick={handleHomeClick}
        onResetView={handleResetView}
        examineMode={activeExamineMode}
        onCloseExamine={handleCloseExamine}
        hidButtons={(!!examineMode && !!selectedSong) || (!!cityExamineMode && !!selectedCitySong)}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        isLoadingCities={isLoadingCities}
      />

      <main className="h-screen">
        <MoodAtlasScene
          songs={songs}
          onSongHover={setHoveredSong}
          resetTrigger={resetTrigger}
          examineMode={examineMode}
          onExamine={handleExamine}
          selectedSong={selectedSong}
          onSongSelect={setSelectedSong}
          // City Galaxies props
          viewMode={viewMode}
          cityCharts={cityCharts}
          cityExamineMode={cityExamineMode}
          onCityExamine={handleCityExamine}
          selectedCitySong={selectedCitySong}
          onCitySongSelect={handleCitySongSelect}
        />
      </main>
    </div>
  );
};

export default MoodAtlas;
