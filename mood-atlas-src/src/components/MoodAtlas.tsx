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
  const [resetTrigger, setResetTrigger] = useState(0);
  const [examineMode, setExamineMode] = useState<ExamineMode | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // City Galaxies state
  const [viewMode, setViewMode] = useState<ViewMode>('personal');
  const [cityCharts, setCityCharts] = useState<CityCluster[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [cityLoadError, setCityLoadError] = useState<string | null>(null);
  const [cityExamineMode, setCityExamineMode] = useState<CityExamineMode | null>(null);
  const [selectedCitySong, setSelectedCitySong] = useState<CityChartSong | null>(null);

  useEffect(() => {
    // Load Apple Music data directly
    if (appleMusicData && appleMusicData.length > 0) {
      setSongs(appleMusicData as Song[]);
    } else {
      setSongs(mockSongs);
    }
  }, []);

  // Load city charts when switching to discover mode
  const loadCityCharts = useCallback(async () => {
    if (cityCharts.length > 0) return; // Already loaded

    setIsLoadingCities(true);
    setCityLoadError(null);
    try {
      // Fetch real chart data from Deezer API (free, no auth)
      const clusters = await fetchAllRegionCharts();
      setCityCharts(clusters);

      // Check if we got any data
      if (clusters.length === 0) {
        setCityLoadError('Unable to load music charts. Please try again later.');
      }
    } catch {
      setCityLoadError('Failed to load music charts. Check your connection and try again.');
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

        {/* Error display for Discover mode */}
        {viewMode === 'discover' && cityLoadError && !isLoadingCities && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/80 backdrop-blur-md rounded-lg p-6 max-w-md text-center pointer-events-auto">
              <p className="text-white font-mono mb-4">{cityLoadError}</p>
              <button
                onClick={() => {
                  setCityCharts([]);
                  setCityLoadError(null);
                  loadCityCharts();
                }}
                className="px-4 py-2 bg-white text-black font-mono text-sm rounded hover:bg-gray-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MoodAtlas;
