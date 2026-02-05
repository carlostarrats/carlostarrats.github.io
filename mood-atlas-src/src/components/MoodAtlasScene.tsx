import React, { useState, useRef, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import MoodLayers from './MoodLayers';
import CityGalaxies from './CityGalaxies';
import SongDetailPanel from './SongDetailPanel';
import { Song, generateMoodLayers } from '@/data/mockSongs';
import { CityCluster, CityChartSong } from '@/data/cityChartData';
import { ViewMode } from './Header';
import { SecurityManager } from '@/utils/security';
import * as THREE from 'three';

// Error boundary for Canvas/Three.js errors
interface CanvasErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<CanvasErrorBoundaryProps, CanvasErrorBoundaryState> {
  constructor(props: CanvasErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): CanvasErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Errors are already logged by React in development
    // In production, could send to error tracking service here
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="text-center p-8">
            <h2 className="text-white font-mono text-xl mb-4">3D Visualization Error</h2>
            <p className="text-gray-400 font-mono text-sm mb-4">
              Unable to render the 3D scene. This may be due to WebGL compatibility issues.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-black font-mono text-sm rounded hover:bg-gray-200 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Grid orb for examine mode - with hover and selection effects
const GridOrb: React.FC<{
  song: Song;
  x: number;
  y: number;
  isSelected: boolean;
  onSongClick?: (song: Song) => void;
  onSongHover?: (song: Song | null) => void;
}> = ({ song, x, y, isSelected, onSongClick, onSongHover }) => {
  const [hovered, setHovered] = useState(false);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    // Skip animation logic entirely when not selected (performance optimization)
    if (!isSelected) return;

    // Animate pulse for selected orb
    if (pulseRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5;
      const pulseScale = 1.5 + pulse * 1.5;
      pulseRef.current.scale.set(pulseScale, pulseScale, pulseScale);
      const material = pulseRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 - pulse * 0.25;
    }
  });

  const handlePointerOver = () => {
    setHovered(true);
    onSongHover?.(song);
  };

  const handlePointerOut = () => {
    setHovered(false);
    onSongHover?.(null);
  };

  return (
    <group position={[x, y, 0]}>
      <mesh
        onClick={() => onSongClick?.(song)}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? '#ffffff' : '#000000'}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Hover ring outline */}
      {hovered && !isSelected && (
        <mesh>
          <ringGeometry args={[0.64, 0.72, 32]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.6}
            side={2}
          />
        </mesh>
      )}

      {/* Selected pulse effect - radiating sphere */}
      {isSelected && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
};

// Examine grid - songs arranged in a flat grid
const ExamineGrid: React.FC<{
  songs: Song[];
  onSongClick?: (song: Song) => void;
  onSongHover?: (song: Song | null) => void;
  selectedSongId?: string;
}> = ({ songs, onSongClick, onSongHover, selectedSongId }) => {
  const cols = Math.ceil(Math.sqrt(songs.length));
  const spacing = 1.5;
  const offsetX = (cols * spacing) / 2;
  const offsetY = (Math.ceil(songs.length / cols) * spacing) / 2;

  return (
    <group>
      {songs.map((song, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = col * spacing - offsetX + spacing / 2;
        const y = -row * spacing + offsetY - spacing / 2;
        const isSelected = song.id === selectedSongId;

        return (
          <GridOrb
            key={song.id}
            song={song}
            x={x}
            y={y}
            isSelected={isSelected}
            onSongClick={onSongClick}
            onSongHover={onSongHover}
          />
        );
      })}
    </group>
  );
};

// Fade group for smooth transitions with tilt
const FadeGroup: React.FC<{
  visible: boolean;
  children: React.ReactNode;
  tilt?: boolean;
  fadeOutSpeed?: number;
}> = ({ visible, children, tilt = false, fadeOutSpeed = 0.2 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [shouldRender, setShouldRender] = useState(visible);
  const targetOpacity = visible ? 1 : 0;
  const targetRotation = visible ? 0 : (tilt ? 0.3 : 0);

  useEffect(() => {
    if (visible) setShouldRender(true);
  }, [visible]);

  useFrame(() => {
    if (!groupRef.current) return;

    // Tilt animation
    if (tilt) {
      groupRef.current.rotation.x += (targetRotation - groupRef.current.rotation.x) * 0.1;
    }

    let allFaded = true;
    // Faster fade out, normal fade in
    const fadeSpeed = visible ? 0.1 : fadeOutSpeed;

    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).material) {
        const material = (child as THREE.Mesh).material as THREE.Material;
        if ('opacity' in material) {
          const currentOpacity = material.opacity;
          const newOpacity = currentOpacity + (targetOpacity - currentOpacity) * fadeSpeed;
          material.opacity = newOpacity;
          material.transparent = true;

          if (Math.abs(newOpacity - targetOpacity) > 0.01) {
            allFaded = false;
          }
        }
      }
    });

    if (!visible && allFaded) {
      setShouldRender(false);
    }
  });

  if (!shouldRender) return null;

  return <group ref={groupRef} rotation={[tilt && !visible ? 0.3 : 0, 0, 0]}>{children}</group>;
};

// Camera animation helper with smooth easing
const CameraAnimator: React.FC<{
  targetPosition: THREE.Vector3 | null;
  targetLookAt: THREE.Vector3 | null;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  onComplete: () => void;
}> = ({ targetPosition, targetLookAt, controlsRef, onComplete }) => {
  useFrame(({ camera }) => {
    if (targetPosition && targetLookAt) {
      const positionDistance = camera.position.distanceTo(targetPosition);

      // Fast, smooth lerp
      camera.position.lerp(targetPosition, 0.08);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt, 0.08);
        controlsRef.current.update();
      }

      // Check completion
      const targetDistance = controlsRef.current
        ? controlsRef.current.target.distanceTo(targetLookAt)
        : Infinity;

      if (positionDistance < 0.5 && targetDistance < 0.5) {
        camera.position.copy(targetPosition);
        if (controlsRef.current) {
          controlsRef.current.target.copy(targetLookAt);
          controlsRef.current.update();
        }
        onComplete();
      }
    }
  });

  return null;
};

interface ExamineMode {
  emotion: string;
  color: string;
  songs: Song[];
}

interface CityExamineMode {
  city: CityCluster;
  songs: CityChartSong[];
}

// Helper to convert CityChartSong to Song for components that expect Song type
const cityChartSongToSong = (cityChartSong: CityChartSong): Song => ({
  id: cityChartSong.id,
  title: cityChartSong.title,
  artist: cityChartSong.artist,
  album: cityChartSong.album,
  energy: cityChartSong.energy,
  primaryEmotion: cityChartSong.primaryEmotion,
  emotionScores: cityChartSong.emotionScores,
  previewUrl: cityChartSong.previewUrl,
  duration: cityChartSong.duration,
  genre: cityChartSong.genre,
  year: cityChartSong.year,
});

interface MoodAtlasSceneProps {
  songs: Song[];
  resetTrigger?: number;
  examineMode?: ExamineMode | null;
  onExamine?: (emotion: string, color: string, songs: Song[]) => void;
  selectedSong?: Song | null;
  onSongSelect?: (song: Song | null) => void;
  // City Galaxies props
  viewMode?: ViewMode;
  cityCharts?: CityCluster[];
  cityExamineMode?: CityExamineMode | null;
  onCityExamine?: (cluster: CityCluster) => void;
  selectedCitySong?: CityChartSong | null;
  onCitySongSelect?: (song: CityChartSong | null) => void;
}

const MoodAtlasScene: React.FC<MoodAtlasSceneProps> = ({
  songs,
  resetTrigger,
  examineMode,
  onExamine,
  selectedSong,
  onSongSelect,
  // City Galaxies props
  viewMode = 'personal',
  cityCharts = [],
  cityExamineMode,
  onCityExamine,
  selectedCitySong,
  onCitySongSelect,
}) => {
  const [targetCameraPos, setTargetCameraPos] = useState<THREE.Vector3 | null>(null);
  const [targetLookAt, setTargetLookAt] = useState<THREE.Vector3 | null>(null);
  const [controlsExpanded, setControlsExpanded] = useState<boolean>(true);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const hoveredSongRef = useRef<Song | null>(null);
  const hoverInfoRef = useRef<HTMLDivElement>(null);

  const moodLayers = generateMoodLayers(songs);

  const handleExamine = (emotion: string, color: string, emotionSongs: Song[]) => {
    onExamine?.(emotion, color, emotionSongs);
    // Reset camera for grid view
    setTargetCameraPos(new THREE.Vector3(0, 0, 50));
    setTargetLookAt(new THREE.Vector3(0, 0, 0));
  };

  const handleSongClick = (song: Song) => {
    onSongSelect?.(song);
  };

  const handleSongHover = (song: Song | null) => {
    hoveredSongRef.current = song;
    // Update DOM directly without React re-render
    if (hoverInfoRef.current) {
      const isExamining = examineMode || cityExamineMode;
      if (song) {
        const titleColor = isExamining ? 'text-black' : 'text-white';
        const artistColor = isExamining ? 'text-black/60' : 'text-gray-400';
        const hintColor = isExamining ? 'text-black/80' : 'text-purple-400';
        // Sanitize external data to prevent XSS
        const safeTitle = SecurityManager.sanitizeInput(song.title);
        const safeArtist = SecurityManager.sanitizeInput(song.artist);
        hoverInfoRef.current.innerHTML = `
          <div class="${titleColor} font-bold">${safeTitle}</div>
          <div class="${artistColor}">${safeArtist}</div>
          <div class="${hintColor}">Click to view details</div>
        `;
      } else {
        const placeholderColor = isExamining ? 'text-black italic' : 'text-gray-500 italic';
        hoverInfoRef.current.innerHTML = `<div class="${placeholderColor}">Hover over a dot for info</div>`;
      }
    }
  };

  // City handlers
  const handleCityClick = (cluster: CityCluster) => {
    onCityExamine?.(cluster);
    // Set camera for city examine view
    setTargetCameraPos(new THREE.Vector3(0, 0, 50));
    setTargetLookAt(new THREE.Vector3(0, 0, 0));
  };

  const handleCityHover = (cluster: CityCluster | null) => {
    // Update DOM directly for city hover info
    if (hoverInfoRef.current) {
      if (cluster) {
        // Sanitize data from Deezer API to prevent XSS
        const safeName = SecurityManager.sanitizeInput(cluster.city.name);
        const safeCountry = SecurityManager.sanitizeInput(cluster.city.country);
        const safeEmotion = SecurityManager.sanitizeInput(cluster.primaryEmotion);
        hoverInfoRef.current.innerHTML = `
          <div class="text-white font-bold">${safeName}</div>
          <div class="text-gray-400">${safeCountry}</div>
          <div class="text-purple-400">${cluster.songs.length} songs • ${safeEmotion}</div>
        `;
      } else {
        hoverInfoRef.current.innerHTML = `<div class="text-gray-500 italic">Hover over a city for info</div>`;
      }
    }
  };

  const handleCitySongClick = (song: CityChartSong) => {
    onCitySongSelect?.(song);
  };

  const handleCitySongHover = (song: CityChartSong | null) => {
    // Update DOM directly for city song hover info
    if (hoverInfoRef.current) {
      const isExamining = cityExamineMode;
      if (song) {
        const titleColor = isExamining ? 'text-black' : 'text-white';
        const artistColor = isExamining ? 'text-black/60' : 'text-gray-400';
        const hintColor = isExamining ? 'text-black/80' : 'text-purple-400';
        // Sanitize data from Deezer API to prevent XSS
        const safeTitle = SecurityManager.sanitizeInput(song.title);
        const safeArtist = SecurityManager.sanitizeInput(song.artist);
        hoverInfoRef.current.innerHTML = `
          <div class="${titleColor} font-bold">${safeTitle}</div>
          <div class="${artistColor}">${safeArtist}</div>
          <div class="${hintColor}">Click to view details</div>
        `;
      } else {
        const placeholderColor = isExamining ? 'text-black italic' : 'text-gray-500 italic';
        hoverInfoRef.current.innerHTML = `<div class="${placeholderColor}">Hover over a dot for info</div>`;
      }
    }
  };

  const handleCloseSongDetail = () => {
    onSongSelect?.(null);
  };

  const resetCamera = useCallback(() => {
    if (viewMode === 'discover') {
      // Wider view for city galaxies
      setTargetCameraPos(new THREE.Vector3(0, 0, 150));
      setTargetLookAt(new THREE.Vector3(0, 0, 0));
    } else {
      setTargetCameraPos(new THREE.Vector3(0, -15, 0));
      setTargetLookAt(new THREE.Vector3(0, 30, 0));
    }
  }, [viewMode]);

  const clearCameraTargets = useCallback(() => {
    setTargetCameraPos(null);
    setTargetLookAt(null);
  }, []);

  // Effect to reset camera when resetTrigger changes
  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      resetCamera();
    }
  }, [resetTrigger, resetCamera]);

  // Effect to set camera for examine mode - zoom based on grid size
  useEffect(() => {
    if (examineMode) {
      // Calculate grid dimensions
      const songCount = examineMode.songs.length;
      const cols = Math.ceil(Math.sqrt(songCount));
      const rows = Math.ceil(songCount / cols);
      const spacing = 1.5;
      const gridWidth = cols * spacing;
      const gridHeight = rows * spacing;

      // Calculate camera distance to fit grid (fov = 60 degrees)
      const maxDimension = Math.max(gridWidth, gridHeight);
      const fov = 60 * (Math.PI / 180);
      const cameraZ = (maxDimension / 2) / Math.tan(fov / 2) * 1.3 + 10; // 1.3x + padding

      // Snap lookAt to center immediately for consistent animation
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }

      setTargetCameraPos(new THREE.Vector3(0, 0, Math.max(cameraZ, 25)));
      setTargetLookAt(new THREE.Vector3(0, 0, 0));
    } else {
      // Clear targets after animation completes
      const timeout = setTimeout(() => {
        setTargetCameraPos(null);
        setTargetLookAt(null);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [examineMode]);

  // Effect to set camera for city examine mode
  useEffect(() => {
    if (cityExamineMode) {
      // Calculate grid dimensions for city songs
      const songCount = cityExamineMode.songs.length;
      const cols = Math.ceil(Math.sqrt(songCount));
      const rows = Math.ceil(songCount / cols);
      const spacing = 1.5;
      const gridWidth = cols * spacing;
      const gridHeight = rows * spacing;

      // Calculate camera distance to fit grid
      const maxDimension = Math.max(gridWidth, gridHeight);
      const fov = 60 * (Math.PI / 180);
      const cameraZ = (maxDimension / 2) / Math.tan(fov / 2) * 1.3 + 10;

      // Snap lookAt to center
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }

      setTargetCameraPos(new THREE.Vector3(0, 0, Math.max(cameraZ, 25)));
      setTargetLookAt(new THREE.Vector3(0, 0, 0));
    }
  }, [cityExamineMode]);

  const backgroundColor = examineMode
    ? examineMode.color
    : cityExamineMode
      ? cityExamineMode.city.color
      : '#1a1a1a';

  const isExamining = examineMode || cityExamineMode;
  const isDiscoverMode = viewMode === 'discover';

  return (
    <div
      className="w-full h-full relative transition-colors duration-500 ease-out"
      style={{ backgroundColor }}
    >
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, -15, 0], fov: 60 }}
          style={{ background: 'transparent' }}
        >
        <PerspectiveCamera ref={cameraRef} makeDefault position={[0, -15, 0]} />
        
        {/* Lighting setup */}
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ff00ff" />
        <pointLight position={[10, -10, 5]} intensity={0.5} color="#00ffff" />

        {/* Environment */}
        <Environment preset="night" />

        {/* Camera animation */}
        <CameraAnimator 
          targetPosition={targetCameraPos} 
          targetLookAt={targetLookAt}
          controlsRef={controlsRef}
          onComplete={clearCameraTargets}
        />

        {/* Controls */}
        <OrbitControls
          ref={controlsRef}
          target={[0, 30, 0]}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={0.1}
          maxDistance={200}
          panSpeed={1.5}
          zoomSpeed={1.2}
          rotateSpeed={1.0}
          mouseButtons={{
            LEFT: 0,
            RIGHT: 2,
          }}
        />

        {/* Personal view - Mood layers */}
        <FadeGroup visible={viewMode === 'personal' && !examineMode} fadeOutSpeed={0.25}>
          {/* Mood layers */}
          <MoodLayers
            layers={moodLayers}
            onSongClick={handleSongClick}
            onSongHover={handleSongHover}
            selectedSongId={selectedSong?.id}
            onExamine={handleExamine}
          />

          {/* Central light source */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#ffffff" transparent />
          </mesh>
        </FadeGroup>

        {/* Personal examine mode - grid of songs */}
        {examineMode && (
          <ExamineGrid
            songs={examineMode.songs}
            onSongClick={handleSongClick}
            onSongHover={handleSongHover}
            selectedSongId={selectedSong?.id}
          />
        )}

        {/* Discover view - City Galaxies */}
        <FadeGroup visible={viewMode === 'discover' && !cityExamineMode} fadeOutSpeed={0.25}>
          <CityGalaxies
            clusters={cityCharts}
            onCityClick={handleCityClick}
            onCityHover={handleCityHover}
            onSongClick={handleCitySongClick}
            onSongHover={handleCitySongHover}
            selectedSongId={selectedCitySong?.id}
          />
        </FadeGroup>

        {/* City examine mode - grid of city songs */}
        {cityExamineMode && (
          <ExamineGrid
            songs={cityExamineMode.songs.map(cityChartSongToSong)}
            onSongClick={(song: Song) => {
              // Find the original CityChartSong by id
              const citySong = cityExamineMode.songs.find(s => s.id === song.id);
              if (citySong) handleCitySongClick(citySong);
            }}
            onSongHover={(song: Song | null) => {
              if (song) {
                const citySong = cityExamineMode.songs.find(s => s.id === song.id);
                handleCitySongHover(citySong ?? null);
              } else {
                handleCitySongHover(null);
              }
            }}
            selectedSongId={selectedCitySong?.id}
          />
        )}
        </Canvas>
      </CanvasErrorBoundary>

      {/* UI Overlay - No React state to prevent jumping */}
      <div className="absolute top-20 left-4 z-10 w-80 pointer-events-none">
        <div className={`backdrop-blur-md rounded-lg p-4 font-mono text-xs transition-colors duration-500 ease-out ${
          isExamining
            ? 'bg-black/10 border border-black text-black'
            : 'bg-transparent border border-white/20 text-gray-300'
        }`}>
          <div className={`font-bold mb-2 ${isExamining ? 'text-black' : 'text-white'}`}>
            {examineMode
              ? examineMode.emotion
              : cityExamineMode
                ? cityExamineMode.city.city.name
                : isDiscoverMode
                  ? 'City Galaxies'
                  : 'Mood Atlas'}
          </div>
          <div>
            {examineMode
              ? `Songs: ${examineMode.songs.length}`
              : cityExamineMode
                ? `${cityExamineMode.city.city.country} • ${cityExamineMode.songs.length} songs`
                : isDiscoverMode
                  ? `Cities: ${cityCharts.length}`
                  : `Layers: ${moodLayers.length} | Songs: ${songs.length}`}
          </div>
          {/* Show primary emotion for city examine mode */}
          {cityExamineMode && (
            <div className="mt-1">
              Mood: {cityExamineMode.city.primaryEmotion}
            </div>
          )}
          <div ref={hoverInfoRef} className={`mt-2 pt-2 h-20 ${isExamining ? 'border-t border-black/30' : 'border-t border-gray-600'}`}>
            <div className={isExamining ? 'text-black italic' : 'text-gray-500 italic'}>
              {isDiscoverMode ? 'Hover over a city for info' : 'Hover over a dot for info'}
            </div>
          </div>
        </div>
      </div>

      {/* Song Detail Panel - for personal view */}
      <SongDetailPanel
        song={selectedSong ?? null}
        onClose={handleCloseSongDetail}
        examineMode={!!examineMode}
      />

      {/* Song Detail Panel - for city view (convert CityChartSong to Song) */}
      {selectedCitySong && (
        <SongDetailPanel
          song={{
            id: selectedCitySong.id,
            title: selectedCitySong.title,
            artist: selectedCitySong.artist,
            album: selectedCitySong.album,
            energy: selectedCitySong.energy,
            primaryEmotion: selectedCitySong.primaryEmotion,
            emotionScores: selectedCitySong.emotionScores,
            previewUrl: selectedCitySong.previewUrl,
            duration: selectedCitySong.duration,
            genre: selectedCitySong.genre,
            year: selectedCitySong.year,
          }}
          onClose={() => onCitySongSelect?.(null)}
          examineMode={!!cityExamineMode}
        />
      )}

      {/* Instructions - positioned at bottom */}
      <div className="absolute bottom-4 left-4 z-10 w-80">
        <div className={`backdrop-blur-md rounded-lg p-4 font-mono text-xs transition-colors duration-500 ease-out ${
          isExamining
            ? 'bg-black/10 border border-black text-black'
            : 'bg-transparent border border-white/20 text-gray-300'
        }`}>
          <div
            className={`font-bold mb-2 cursor-pointer flex items-center justify-between ${
              isExamining ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-300'
            }`}
            onClick={() => setControlsExpanded(!controlsExpanded)}
          >
            <span>Controls</span>
            <span className="text-xs">{controlsExpanded ? '−' : '+'}</span>
          </div>
          {controlsExpanded && (
            <>
              <div>• Click {isDiscoverMode ? 'cities' : 'orbs'} to {isDiscoverMode ? 'examine' : 'view details'}</div>
              <div>• Hover {isDiscoverMode ? 'cities' : 'orbs'} for info</div>
              <div className={`mt-2 font-bold ${isExamining ? 'text-black' : 'text-white'}`}>Mouse:</div>
              <div>• Click + drag: rotate</div>
              <div>• Right-click + drag: pan</div>
              <div>• Scroll: zoom</div>
              <div className={`mt-2 font-bold ${isExamining ? 'text-black' : 'text-white'}`}>Trackpad:</div>
              <div>• Drag: rotate</div>
              <div>• Two-finger drag: pan</div>
              <div>• Pinch/spread: zoom</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodAtlasScene;
