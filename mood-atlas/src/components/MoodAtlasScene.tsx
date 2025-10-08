import React, { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import GridPlane from './GridPlane';
import MoodLayers from './MoodLayers';
import { Song, generateMoodLayers } from '@/data/mockSongs';
import * as THREE from 'three';

// Camera animation helper
const CameraAnimator: React.FC<{
  targetPosition: THREE.Vector3 | null;
  targetLookAt: THREE.Vector3 | null;
  controlsRef: React.MutableRefObject<any>;
}> = ({ targetPosition, targetLookAt, controlsRef }) => {
  useFrame(({ camera }) => {
    if (targetPosition && targetLookAt) {
      // Smoothly interpolate camera position
      camera.position.lerp(targetPosition, 0.1);
      
      // Smoothly interpolate controls target
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt, 0.1);
        controlsRef.current.update();
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
  onSongHover,
  resetTrigger
}) => {
  const [hoveredLayer, setHoveredLayer] = useState<any>(null);
  const [selectedLayer, setSelectedLayer] = useState<any>(null);
  const [targetCameraPos, setTargetCameraPos] = useState<THREE.Vector3 | null>(null);
  const [targetLookAt, setTargetLookAt] = useState<THREE.Vector3 | null>(null);
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  const moodLayers = generateMoodLayers(songs);

  const handleLayerClick = (layer: any) => {
    const isDeselecting = selectedLayer?.id === layer.id;
    setSelectedLayer(isDeselecting ? null : layer);
    
    // Zoom to the layer or reset view
    if (!isDeselecting) {
      const distance = layer.radius * 3; // Position camera relative to layer size
      setTargetCameraPos(new THREE.Vector3(0, layer.height + 5, distance));
      setTargetLookAt(new THREE.Vector3(0, layer.height, 0));
    } else {
      resetCamera();
    }
  };

  const handleLayerHover = (layer: any) => {
    setHoveredLayer(layer);
    onSongHover?.(layer);
  };

  const resetCamera = useCallback(() => {
    setTargetCameraPos(new THREE.Vector3(0, 25, 80));
    setTargetLookAt(new THREE.Vector3(0, 15, 0));
    setSelectedLayer(null);
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
        />

        {/* Controls */}
        <OrbitControls
          ref={controlsRef}
          target={[0, 15, 0]}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={200}
          maxPolarAngle={Math.PI}
          panSpeed={1.5}
          zoomSpeed={1.2}
          rotateSpeed={1.0}
          mouseButtons={{
            LEFT: 0, // Rotate
            MIDDLE: null, // Disable middle mouse
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
        />

        {/* Central light source */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-4 font-mono text-xs text-gray-300">
          <div className="text-white font-bold mb-2">Mood Atlas</div>
          <div>Layers: {moodLayers.length} | Songs: {songs.length}</div>
          {hoveredLayer && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="text-white font-bold">{hoveredLayer.name}</div>
              <div>{hoveredLayer.totalSongs} songs</div>
              <div className="text-gray-400">Energy: {Math.round(hoveredLayer.avgEnergy * 100)}%</div>
            </div>
          )}
          {selectedLayer && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="text-white font-bold">Selected: {selectedLayer.name}</div>
              <div>Click to explore songs</div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-16 left-4 z-10">
        <div className="bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-4 font-mono text-xs text-gray-300 max-w-xs">
          <div className="text-white font-bold mb-2">Controls</div>
          <div>• Click layers to explore</div>
          <div>• Hover for mood details</div>
          <div className="mt-2 text-white font-bold">Trackpad:</div>
          <div>• One finger drag: rotate</div>
          <div>• Ctrl + drag: pan</div>
          <div>• Pinch/spread: zoom</div>
          <div className="mt-2 text-white font-bold">Reset:</div>
          <div>• Click "Reset View" button</div>
        </div>
      </div>
    </div>
  );
};

export default MoodAtlasScene;
