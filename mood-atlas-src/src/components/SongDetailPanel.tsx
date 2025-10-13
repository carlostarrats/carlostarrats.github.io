import React, { useState, useEffect } from 'react';
import { X, Play, Pause } from 'lucide-react';
import { Song, emotionColors } from '@/data/mockSongs';

interface SongDetailPanelProps {
  song: Song | null;
  onClose: () => void;
  musicKit?: any;
}

const SongDetailPanel: React.FC<SongDetailPanelProps> = ({ song, onClose, musicKit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [musicKitAuthorized, setMusicKitAuthorized] = useState(false);

  useEffect(() => {
    // Check if MusicKit is authorized
    if (musicKit) {
      setMusicKitAuthorized(musicKit.isAuthorized || false);
    }
  }, [musicKit]);

  useEffect(() => {
    // Cleanup audio on unmount or song change
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio, song]);

  if (!song) return null;

  const handlePlayPreview = async () => {
    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // Try to play preview if available
    if (song.previewUrl) {
      const newAudio = new Audio(song.previewUrl);
      newAudio.play().then(() => {
        setIsPlaying(true);
        setAudio(newAudio);
        newAudio.onended = () => setIsPlaying(false);
      }).catch(err => {
        console.error('Failed to play preview:', err);
      });
    } else if (musicKitAuthorized && song.trackId && musicKit) {
      // Try to fetch and play via MusicKit
      try {
        const songData = await musicKit.api.song(song.trackId);
        if (songData.attributes?.previews?.[0]?.url) {
          const newAudio = new Audio(songData.attributes.previews[0].url);
          newAudio.play().then(() => {
            setIsPlaying(true);
            setAudio(newAudio);
            newAudio.onended = () => setIsPlaying(false);
          }).catch(err => {
            console.error('Failed to play preview:', err);
          });
        }
      } catch (err) {
        console.error('Failed to fetch song preview:', err);
      }
    }
  };

  const handleAuthorizeMusicKit = async () => {
    if (musicKit && !musicKitAuthorized) {
      try {
        await musicKit.authorize();
        setMusicKitAuthorized(true);
      } catch (err) {
        console.error('Failed to authorize MusicKit:', err);
      }
    }
  };

  // Calculate emotion bar widths
  const emotionEntries = Object.entries(song.emotionScores || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-transparent backdrop-blur-md border-l border-white/20 z-50 overflow-y-auto animate-slide-in">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl text-white font-mono">{song.title}</h2>
              <p className="text-sm text-gray-400 font-mono">{song.artist}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Album info if available */}
        {song.album && (
          <div className="mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-mono">Album</p>
            <p className="text-white font-mono">{song.album}</p>
          </div>
        )}

        {/* Play Statistics */}
        {song.dataSource === 'apple' && (
          <div className="mb-6 p-4 bg-transparent backdrop-blur-md border border-white/20 rounded-lg">
            <h3 className="text-sm text-white mb-3 font-mono">Your Listening Stats</h3>
            <div className="space-y-2">
              {song.playCount !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-mono">Play Count</span>
                  <span className="text-sm text-white font-mono">{song.playCount}</span>
                </div>
              )}
              {song.skipCount !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-mono">Skip Count</span>
                  <span className="text-sm text-white font-mono">{song.skipCount}</span>
                </div>
              )}
              {song.completionRate !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-mono">Completion Rate</span>
                  <span className="text-sm text-white font-mono">{song.completionRate}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Primary Emotion */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-mono">Primary Emotion</p>
          <div 
            className="inline-block px-4 py-2 rounded-lg border"
            style={{ 
              backgroundColor: `${emotionColors[song.primaryEmotion] || '#666'}20`,
              borderColor: `${emotionColors[song.primaryEmotion] || '#666'}50`
            }}
          >
            <p 
              className="font-mono"
              style={{ color: emotionColors[song.primaryEmotion] || '#fff' }}
            >
              {song.primaryEmotion}
            </p>
          </div>
        </div>

        {/* Thayer's Engagement Level */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-400 tracking-wide font-mono">Thayer's Engagement Level</p>
            <p className="text-sm text-white font-mono">{Math.round(song.energy * 100)}%</p>
          </div>
          <div className="w-full h-1 bg-white/10 overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{ 
                width: `${song.energy * 100}%`,
                backgroundColor: '#ffffff'
              }}
            />
          </div>
        </div>

        {/* Emotion Breakdown */}
        <div className="mb-6">
          <h3 className="text-sm text-white mb-3 font-mono">Emotion Breakdown</h3>
          <div className="space-y-2">
            {emotionEntries.map(([emotion, score]) => (
              <div key={emotion} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-mono">{emotion}</span>
                  <span className="text-xs text-white font-mono">{Math.round(score * 100)}%</span>
                </div>
                <div className="w-full h-1 bg-white/10 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${score * 100}%`,
                      backgroundColor: emotionColors[emotion] || '#fff'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Button */}
        {musicKitAuthorized || song.previewUrl ? (
          <div className="mt-6">
            <button
              onClick={handlePlayPreview}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-200 border border-white/20 flex items-center justify-center gap-2 font-mono"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  Stop Preview
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Play Preview
                </>
              )}
            </button>
          </div>
        ) : null}

        {/* Additional Info */}
        {(song.genre || song.year) && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4">
              {song.genre && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-mono">Genre</p>
                  <p className="text-sm text-white font-mono">{song.genre}</p>
                </div>
              )}
              {song.year && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-mono">Year</p>
                  <p className="text-sm text-white font-mono">{song.year}</p>
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


