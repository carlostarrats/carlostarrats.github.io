import React, { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import GridPlane from './GridPlane';
import MoodLayers from './MoodLayers';
import SongDetailPanel from './SongDetailPanel';
import { Song, generateMoodLayers } from '@/data/mockSongs';
import * as THREE from 'three';

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
      camera.position.lerp(targetPosition, 0.1);
      
      // Smoothly interpolate controls target
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt, 0.1);
        controlsRef.current.update();
      }

      // Check if we've reached the target (within a small threshold)
      const positionDistance = camera.position.distanceTo(targetPosition);
      const targetDistance = controlsRef.current 
        ? controlsRef.current.target.distanceTo(targetLookAt)
        : Infinity;
      
      // If close enough, complete the animation
      if (positionDistance < 0.1 && targetDistance < 0.1) {
        onComplete();
      }
    }
  });
  
  return null;
};

interface MoodAtlasSceneProps {
  songs: Song[];
  onSongHover?: (song: Song | null) => void;
  resetTrigger?: number;
  musicKit?: any;
}

const MoodAtlasScene: React.FC<MoodAtlasSceneProps> = ({ 
  songs, 
  resetTrigger,
  musicKit
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
        hoverInfoRef.current.innerHTML = `
          <div class="text-white font-bold">${song.title}</div>
          <div class="text-gray-400">${song.artist}</div>
          <div class="text-purple-400">Click to view details</div>
        `;
      } else {
        hoverInfoRef.current.innerHTML = `<div class="text-gray-500 italic">Hover over a dot for info</div>`;
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


  return (
    <div className="w-full h-full relative">
          <Canvas
            camera={{ position: [0, 25, 80], fov: 60 }}
            style={{ background: '#1a1a1a' }}
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
        />

        {/* Central light source */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </Canvas>

      {/* UI Overlay - No React state to prevent jumping */}
      <div className="absolute top-20 left-4 z-10 w-80 pointer-events-none">
        <div className="bg-transparent backdrop-blur-md border border-white/20 rounded-lg p-4 font-mono text-xs text-gray-300">
          <div className="text-white font-bold mb-2">Mood Atlas</div>
          <div>Layers: {moodLayers.length} | Songs: {songs.length}</div>
          <div ref={hoverInfoRef} className="mt-2 pt-2 border-t border-gray-600 h-20">
            <div className="text-gray-500 italic">Hover over a dot for info</div>
          </div>
        </div>
      </div>

      {/* Song Detail Panel */}
      <SongDetailPanel
        song={selectedSong}
        onClose={handleCloseSongDetail}
      />

      {/* Instructions - positioned at bottom */}
      <div className="absolute bottom-4 left-4 z-10 w-80">
        <div className="bg-transparent backdrop-blur-md border border-white/20 rounded-lg p-4 font-mono text-xs text-gray-300">
          <div 
            className="text-white font-bold mb-2 cursor-pointer hover:text-gray-300 flex items-center justify-between"
            onClick={() => setControlsExpanded(!controlsExpanded)}
          >
            <span>Controls</span>
            <span className="text-xs">{controlsExpanded ? '−' : '+'}</span>
          </div>
          {controlsExpanded && (
            <>
              <div>• Click orbs to view details</div>
              <div>• Hover orbs for song info</div>
              <div className="mt-2 text-white font-bold">Mouse:</div>
              <div>• Click + drag: rotate</div>
              <div>• Right-click + drag: pan</div>
              <div>• Scroll: zoom</div>
              <div className="mt-2 text-white font-bold">Trackpad:</div>
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
