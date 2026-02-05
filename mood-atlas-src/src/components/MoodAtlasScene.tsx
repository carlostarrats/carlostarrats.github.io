import React, { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import GridPlane from './GridPlane';
import MoodLayers from './MoodLayers';
import SongDetailPanel from './SongDetailPanel';
import { Song, generateMoodLayers } from '@/data/mockSongs';
import * as THREE from 'three';

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
          <mesh
            key={song.id}
            position={[x, y, 0]}
            onClick={() => onSongClick?.(song)}
            onPointerOver={() => onSongHover?.(song)}
            onPointerOut={() => onSongHover?.(null)}
          >
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshBasicMaterial
              color={isSelected ? '#ffffff' : '#000000'}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Camera animation helper
const CameraAnimator: React.FC<{
  targetPosition: THREE.Vector3 | null;
  targetLookAt: THREE.Vector3 | null;
  controlsRef: React.MutableRefObject<any>;
  onComplete: () => void;
}> = ({ targetPosition, targetLookAt, controlsRef, onComplete }) => {
  useFrame(({ camera }) => {
    if (targetPosition && targetLookAt) {
      // Smoothly interpolate camera position
      camera.position.lerp(targetPosition, 0.15);

      // Smoothly interpolate controls target
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt, 0.15);
        controlsRef.current.update();
      }

      // Check if we've reached the target (within threshold)
      const positionDistance = camera.position.distanceTo(targetPosition);
      const targetDistance = controlsRef.current
        ? controlsRef.current.target.distanceTo(targetLookAt)
        : Infinity;

      // If close enough, snap to position and complete
      if (positionDistance < 1 && targetDistance < 1) {
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

interface MoodAtlasSceneProps {
  songs: Song[];
  onSongHover?: (song: Song | null) => void;
  resetTrigger?: number;
  musicKit?: any;
  examineMode?: ExamineMode | null;
  onExamine?: (emotion: string, color: string, songs: Song[]) => void;
}

const MoodAtlasScene: React.FC<MoodAtlasSceneProps> = ({
  songs,
  resetTrigger,
  musicKit,
  examineMode,
  onExamine
}) => {
  const [hoveredLayer] = useState<any>(null);
  const [, setSelectedLayer] = useState<any>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [targetCameraPos, setTargetCameraPos] = useState<THREE.Vector3 | null>(null);
  const [targetLookAt, setTargetLookAt] = useState<THREE.Vector3 | null>(null);
  const [controlsExpanded, setControlsExpanded] = useState<boolean>(true);
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const hoveredSongRef = useRef<Song | null>(null);
  const hoverInfoRef = useRef<HTMLDivElement>(null);

  const moodLayers = generateMoodLayers(songs);

  const handleExamine = (emotion: string, color: string, emotionSongs: Song[]) => {
    onExamine?.(emotion, color, emotionSongs);
    // Reset camera for grid view
    setTargetCameraPos(new THREE.Vector3(0, 0, 50));
    setTargetLookAt(new THREE.Vector3(0, 0, 0));
  };

  const handleLayerClick = (_layer: any) => {
    // Disabled - layers are not clickable
  };

  const handleLayerHover = (_layer: any) => {
    // Disabled - layers don't show hover info
  };

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
  };

  const handleSongHover = (song: Song | null) => {
    hoveredSongRef.current = song;
    // Update DOM directly without React re-render
    if (hoverInfoRef.current) {
      if (song) {
        const titleColor = examineMode ? 'text-black' : 'text-white';
        const artistColor = examineMode ? 'text-black/60' : 'text-gray-400';
        const hintColor = examineMode ? 'text-black/80' : 'text-purple-400';
        // Using textContent would be safer, but we need multiple styled divs
        // Data comes from user's own Apple Music library, not external input
        hoverInfoRef.current.innerHTML = `
          <div class="${titleColor} font-bold">${song.title}</div>
          <div class="${artistColor}">${song.artist}</div>
          <div class="${hintColor}">Click to view details</div>
        `;
      } else {
        const placeholderColor = examineMode ? 'text-black italic' : 'text-gray-500 italic';
        hoverInfoRef.current.innerHTML = `<div class="${placeholderColor}">Hover over a dot for info</div>`;
      }
    }
  };

  const handleCloseSongDetail = () => {
    setSelectedSong(null);
  };

  const resetCamera = useCallback(() => {
    setTargetCameraPos(new THREE.Vector3(0, 25, 80));
    setTargetLookAt(new THREE.Vector3(0, 15, 0));
    setSelectedLayer(null);
  }, []);

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

  // Effect to set camera for examine mode
  useEffect(() => {
    if (examineMode) {
      setTargetCameraPos(new THREE.Vector3(0, 0, 50));
      setTargetLookAt(new THREE.Vector3(0, 0, 0));
    } else {
      // Clear targets after a short delay when exiting examine mode
      // This allows the reset animation to complete before releasing control
      const timeout = setTimeout(() => {
        setTargetCameraPos(null);
        setTargetLookAt(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [examineMode]);


  const backgroundColor = examineMode ? examineMode.color : '#1a1a1a';

  return (
    <div
      className="w-full h-full relative transition-colors duration-500"
      style={{ backgroundColor }}
    >
          <Canvas
            camera={{ position: [0, 25, 80], fov: 60 }}
            style={{ background: 'transparent' }}
          >
        <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 25, 80]} />
        
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
          target={[0, 15, 0]}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.1}
          maxDistance={200}
          maxPolarAngle={Math.PI}
          panSpeed={1.5}
          zoomSpeed={1.2}
          rotateSpeed={1.0}
          mouseButtons={{
            LEFT: 0, // Rotate
            RIGHT: 2, // Pan
          }}
          touches={{
            ONE: 1, // Rotate
            TWO: 2, // Pan and zoom
          }}
        />

        {/* Normal view */}
        {!examineMode && (
          <>
            {/* Grid */}
            <Suspense fallback={null}>
              <GridPlane />
            </Suspense>

            {/* Mood layers */}
            <MoodLayers
              layers={moodLayers}
              onLayerClick={handleLayerClick}
              onLayerHover={handleLayerHover}
              onSongClick={handleSongClick}
              onSongHover={handleSongHover}
              hoveredEmotion={hoveredLayer?.id}
              selectedSongId={selectedSong?.id}
              onExamine={handleExamine}
            />

            {/* Central light source */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </>
        )}

        {/* Examine mode - grid of songs */}
        {examineMode && (
          <ExamineGrid
            songs={examineMode.songs}
            onSongClick={handleSongClick}
            onSongHover={handleSongHover}
            selectedSongId={selectedSong?.id}
          />
        )}
      </Canvas>

      {/* UI Overlay - No React state to prevent jumping */}
      <div className="absolute top-20 left-4 z-10 w-80 pointer-events-none">
        <div className={`backdrop-blur-md rounded-lg p-4 font-mono text-xs transition-colors ${
          examineMode
            ? 'bg-black/10 border border-black text-black'
            : 'bg-transparent border border-white/20 text-gray-300'
        }`}>
          <div className={`font-bold mb-2 ${examineMode ? 'text-black' : 'text-white'}`}>
            {examineMode ? examineMode.emotion : 'Mood Atlas'}
          </div>
          <div>{examineMode ? `Songs: ${examineMode.songs.length}` : `Layers: ${moodLayers.length} | Songs: ${songs.length}`}</div>
          <div ref={hoverInfoRef} className={`mt-2 pt-2 h-20 ${examineMode ? 'border-t border-black/30' : 'border-t border-gray-600'}`}>
            <div className={examineMode ? 'text-black italic' : 'text-gray-500 italic'}>Hover over a dot for info</div>
          </div>
        </div>
      </div>

      {/* Song Detail Panel */}
      <SongDetailPanel
        song={selectedSong}
        onClose={handleCloseSongDetail}
        examineMode={!!examineMode}
      />

      {/* Instructions - positioned at bottom */}
      <div className="absolute bottom-4 left-4 z-10 w-80">
        <div className={`backdrop-blur-md rounded-lg p-4 font-mono text-xs transition-colors ${
          examineMode
            ? 'bg-black/10 border border-black text-black'
            : 'bg-transparent border border-white/20 text-gray-300'
        }`}>
          <div
            className={`font-bold mb-2 cursor-pointer flex items-center justify-between ${
              examineMode ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-300'
            }`}
            onClick={() => setControlsExpanded(!controlsExpanded)}
          >
            <span>Controls</span>
            <span className="text-xs">{controlsExpanded ? '−' : '+'}</span>
          </div>
          {controlsExpanded && (
            <>
              <div>• Click orbs to view details</div>
              <div>• Hover orbs for song info</div>
              <div className={`mt-2 font-bold ${examineMode ? 'text-black' : 'text-white'}`}>Mouse:</div>
              <div>• Click + drag: rotate</div>
              <div>• Right-click + drag: pan</div>
              <div>• Scroll: zoom</div>
              <div className={`mt-2 font-bold ${examineMode ? 'text-black' : 'text-white'}`}>Trackpad:</div>
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
