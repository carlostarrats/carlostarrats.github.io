import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, ExternalLink } from 'lucide-react';
import { Song, emotionColors } from '@/data/mockSongs';

interface SongDetailPanelProps {
  song: Song | null;
  onClose: () => void;
  examineMode?: boolean;
}

const SongDetailPanel: React.FC<SongDetailPanelProps> = ({ song, onClose, examineMode = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get preview URL - either from song directly (Deezer) or fetch from iTunes API
  useEffect(() => {
    // If song already has a preview URL (e.g., from Deezer), use it directly
    if (song?.previewUrl) {
      setPreviewUrl(song.previewUrl);
      setIsLoadingPreview(false);
      return;
    }

    // Otherwise, fetch from iTunes API using trackId (Apple Music songs)
    if (song?.trackId) {
      setIsLoadingPreview(true);
      setPreviewUrl(null);

      fetch(`https://itunes.apple.com/lookup?id=${song.trackId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`iTunes API error: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (data.results?.[0]?.previewUrl) {
            setPreviewUrl(data.results[0].previewUrl);
          }
        })
        .catch(() => {
          // Silently fail - user will see "No Preview" button
        })
        .finally(() => setIsLoadingPreview(false));
    } else {
      setPreviewUrl(null);
      setIsLoadingPreview(false);
    }
  }, [song?.trackId, song?.previewUrl]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Stop audio when song changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackError(null);
  }, [song?.id]);

  if (!song) return null;

  const handlePlayPreview = async () => {
    setPlaybackError(null);

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (previewUrl) {
      // Clean up existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      const newAudio = new Audio(previewUrl);
      audioRef.current = newAudio;

      newAudio.onended = () => setIsPlaying(false);
      newAudio.onerror = () => {
        setPlaybackError('Preview unavailable');
        setIsPlaying(false);
      };

      try {
        await newAudio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Failed to play preview:', err);
        setPlaybackError('Unable to play preview');
        setIsPlaying(false);
      }
    }
  };

  const handleOpenInAppleMusic = () => {
    // Validate trackId is numeric to prevent URL injection
    if (song.trackId && /^\d+$/.test(String(song.trackId))) {
      window.open(`https://music.apple.com/us/song/${song.trackId}`, '_blank');
    }
  };

  const handleOpenInDeezer = () => {
    // Deezer song IDs are prefixed with 'dz-'
    if (song.id.startsWith('dz-')) {
      const deezerId = song.id.replace('dz-', '');
      // Validate deezerId is numeric to prevent URL injection
      if (/^\d+$/.test(deezerId)) {
        window.open(`https://www.deezer.com/track/${deezerId}`, '_blank');
      }
    }
  };

  const isDeezerSong = song.id.startsWith('dz-');


  // Calculate emotion bar widths
  const emotionEntries = Object.entries(song.emotionScores || {}).sort((a, b) => b[1] - a[1]);

  // Dynamic colors based on examine mode
  const textPrimary = examineMode ? 'text-black' : 'text-white';
  const textSecondary = examineMode ? 'text-black/60' : 'text-gray-400';
  const textMuted = examineMode ? 'text-black/40' : 'text-gray-500';
  const borderColor = examineMode ? 'border-black' : 'border-white/20';
  const bgBar = examineMode ? 'bg-black/10' : 'bg-white/10';

  return (
    <div className={`fixed right-0 top-0 h-full w-96 backdrop-blur-md border-l z-50 overflow-y-auto animate-slide-in transition-colors ${
      examineMode ? 'bg-black/10 border-black' : 'bg-transparent border-white/20'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className={`text-xl font-mono ${examineMode ? 'text-black' : 'text-white'}`}>{song.title}</h2>
              <p className={`text-sm font-mono ${examineMode ? 'text-black/70' : 'text-white/70'}`}>{song.artist}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${examineMode ? 'hover:bg-white/20' : 'hover:bg-white/10'}`}
          >
            <X className={`w-5 h-5 ${examineMode ? 'text-black' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Album info if available */}
        {song.album && (
          <div className="mb-6">
            <p className={`text-xs uppercase tracking-wide mb-1 font-mono ${textMuted}`}>Album</p>
            <p className={`font-mono ${textPrimary}`}>{song.album}</p>
          </div>
        )}

        {/* Music Controls - Side by side */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-2">
            {/* Preview Button */}
            <button
              onClick={handlePlayPreview}
              disabled={isLoadingPreview || !previewUrl}
              className="py-2 px-3 rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 font-mono text-xs disabled:opacity-50 disabled:cursor-not-allowed text-black"
              style={{ backgroundColor: '#ffffff' }}
            >
              {isLoadingPreview ? (
                '...'
              ) : !previewUrl ? null : isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              {isLoadingPreview ? '' : !previewUrl ? 'No Preview' : isPlaying ? 'Stop' : 'Preview'}
            </button>

            {/* Open in Apple Music Button */}
            {song.trackId && (
              <button
                onClick={handleOpenInAppleMusic}
                className={`py-2 px-3 rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 font-mono text-xs ${
                  examineMode
                    ? 'bg-white/70 hover:bg-white text-black'
                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                }`}
              >
                <ExternalLink className="w-3 h-3" />
                Apple Music
              </button>
            )}

            {/* Open in Deezer Button */}
            {isDeezerSong && (
              <button
                onClick={handleOpenInDeezer}
                className={`py-2 px-3 rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 font-mono text-xs ${
                  examineMode
                    ? 'bg-white/70 hover:bg-white text-black'
                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                }`}
              >
                <ExternalLink className="w-3 h-3" />
                Deezer
              </button>
            )}
          </div>
          {/* Playback error message */}
          {playbackError && (
            <p className={`mt-2 text-xs font-mono ${examineMode ? 'text-red-600' : 'text-red-400'}`}>
              {playbackError}
            </p>
          )}
        </div>

        {/* Play Statistics */}
        {song.dataSource === 'apple' && (
          <div className={`mb-6 p-4 backdrop-blur-md border rounded-lg ${borderColor}`}>
            <h3 className={`text-sm mb-3 font-mono ${textPrimary}`}>Your Listening Stats</h3>
            <div className="space-y-2">
              {song.playCount !== undefined && (
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-mono ${textSecondary}`}>Play Count</span>
                  <span className={`text-sm font-mono ${textPrimary}`}>{song.playCount}</span>
                </div>
              )}
              {song.skipCount !== undefined && (
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-mono ${textSecondary}`}>Skip Count</span>
                  <span className={`text-sm font-mono ${textPrimary}`}>{song.skipCount}</span>
                </div>
              )}
              {song.completionRate !== undefined && (
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-mono ${textSecondary}`}>Completion Rate</span>
                  <span className={`text-sm font-mono ${textPrimary}`}>{song.completionRate}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Primary Emotion */}
        <div className="mb-6">
          <p className={`text-xs uppercase tracking-wide mb-2 font-mono ${textMuted}`}>Primary Emotion</p>
          <div
            className="inline-block px-4 py-2 rounded-lg border"
            style={{
              backgroundColor: examineMode ? 'rgba(0,0,0,0.1)' : `${emotionColors[song.primaryEmotion] || '#666'}20`,
              borderColor: examineMode ? 'black' : `${emotionColors[song.primaryEmotion] || '#666'}50`
            }}
          >
            <p
              className="font-mono"
              style={{ color: examineMode ? 'black' : (emotionColors[song.primaryEmotion] || '#fff') }}
            >
              {song.primaryEmotion}
            </p>
          </div>
        </div>

        {/* Thayer's Engagement Level */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className={`text-xs tracking-wide font-mono ${textSecondary}`}>Thayer's Engagement Level</p>
            <p className={`text-sm font-mono ${textPrimary}`}>{Math.round(song.energy * 100)}%</p>
          </div>
          <div className={`w-full h-1 overflow-hidden ${bgBar}`}>
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${song.energy * 100}%`,
                backgroundColor: examineMode ? '#000000' : '#ffffff'
              }}
            />
          </div>
        </div>

        {/* Emotion Breakdown */}
        <div className="mb-6">
          <h3 className={`text-sm mb-3 font-mono ${textPrimary}`}>Emotion Breakdown</h3>
          <div className="space-y-2">
            {emotionEntries.map(([emotion, score]) => (
              <div key={emotion} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-mono ${textSecondary}`}>{emotion}</span>
                  <span className={`text-xs font-mono ${textPrimary}`}>{Math.round(score * 100)}%</span>
                </div>
                <div className={`w-full h-1 overflow-hidden ${bgBar}`}>
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${score * 100}%`,
                      backgroundColor: examineMode ? '#000000' : (emotionColors[emotion] || '#fff')
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        {(song.genre || song.year) && (
          <div className={`mt-6 pt-6 border-t ${examineMode ? 'border-black/20' : 'border-white/10'}`}>
            <div className="grid grid-cols-2 gap-4">
              {song.genre && (
                <div>
                  <p className={`text-xs uppercase tracking-wide mb-1 font-mono ${textMuted}`}>Genre</p>
                  <p className={`text-sm font-mono ${textPrimary}`}>{song.genre}</p>
                </div>
              )}
              {song.year && (
                <div>
                  <p className={`text-xs uppercase tracking-wide mb-1 font-mono ${textMuted}`}>Year</p>
                  <p className={`text-sm font-mono ${textPrimary}`}>{song.year}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SongDetailPanel;


