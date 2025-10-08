import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Text } from '@react-three/drei';
import { Song } from '@/data/mockSongs';

interface MoodLayer {
  id: string;
  name: string;
  songs: any[];
  totalSongs: number;
  avgEnergy: number;
  radius: number;
  height: number;
  color: string;
}

interface MoodLayersProps {
  layers: MoodLayer[];
  onLayerClick?: (layer: MoodLayer) => void;
  onLayerHover?: (layer: MoodLayer | null) => void;
}

const MoodLayers: React.FC<MoodLayersProps> = ({ 
  layers, 
  onLayerClick, 
  onLayerHover 
}) => {
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const handleLayerClick = (layer: MoodLayer) => {
    // Toggle selection
    setSelectedEmotion(selectedEmotion === layer.id ? null : layer.id);
    onLayerClick?.(layer);
  };

  return (
    <group>
      {layers.map((layer) => {
        const isHovered = hoveredLayer === layer.id;
        const isSelected = selectedEmotion === layer.id;
        const opacity = isSelected ? 0.9 : (isHovered ? 0.8 : 0.4);
        const scale = isSelected ? 1.15 : (isHovered ? 1.1 : 1);

        return (
          <LayerSurface
            key={layer.id}
            layer={layer}
            isHovered={isHovered}
            isSelected={isSelected}
            selectedEmotion={selectedEmotion}
            opacity={opacity}
            scale={scale}
            onHover={() => {
              setHoveredLayer(isHovered ? null : layer.id);
              onLayerHover?.(isHovered ? null : layer);
            }}
            onClick={() => handleLayerClick(layer)}
          />
        );
      })}
    </group>
  );
};

// Individual layer surface component
const LayerSurface: React.FC<{
  layer: MoodLayer;
  isHovered: boolean;
  isSelected: boolean;
  selectedEmotion: string | null;
  opacity: number;
  scale: number;
  onHover: () => void;
  onClick: () => void;
}> = ({ layer, opacity, scale, onHover, onClick, selectedEmotion }) => {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<any>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = layer.height + Math.sin(state.clock.elapsedTime + layer.height) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Emotion container cylinder */}
      <mesh
        ref={meshRef}
        scale={[scale, scale, scale]}
        onClick={onClick}
        onPointerOver={onHover}
        onPointerOut={onHover}
      >
        {/* 3D Cylinder shape instead of flat plane */}
        <cylinderGeometry args={[layer.radius, layer.radius, 1.5, 32, 1, true]} />
        <meshStandardMaterial
          color={layer.color}
          wireframe
          transparent
          opacity={opacity}
          emissive={layer.color}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* 3D Text label next to container */}
      <Text
        position={[layer.radius + 2, 0, 0]}
        fontSize={0.8}
        color={layer.color}
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
        font="/fonts/JetBrainsMono-Regular.ttf"
      >
        {layer.name}
      </Text>

      {/* Song points inside container */}
      {layer.songs.map((song: Song, index: number) => {
        // Distribute songs in a circular pattern inside the cylinder
        const angle = (index / layer.songs.length) * Math.PI * 2;
        const distanceFromCenter = (layer.radius * 0.7) * Math.random();
        const x = Math.cos(angle) * distanceFromCenter;
        const z = Math.sin(angle) * distanceFromCenter;
        const y = (Math.random() - 0.5) * 0.8; // Random height within cylinder

        return (
          <SongPoint
            key={song.id}
            song={song}
            position={[x, y, z]}
            color={layer.color}
            selectedEmotion={selectedEmotion}
          />
        );
      })}
    </group>
  );
};

// Individual song point component
const SongPoint: React.FC<{
  song: Song;
  position: [number, number, number];
  color: string;
  selectedEmotion: string | null;
}> = ({ song, position, color, selectedEmotion }) => {
  const [hovered, setHovered] = useState(false);

  // Check if this song aligns with the selected emotion (threshold: 0.5 or higher)
  const alignsWithSelected = selectedEmotion 
    ? (song.emotionScores[selectedEmotion] || 0) >= 0.5 
    : false;

  // Determine visual properties based on selection state
  const isHighlighted = selectedEmotion ? alignsWithSelected : true;
  const pointOpacity = hovered ? 1 : (isHighlighted ? 0.9 : 0.2);
  const pointScale = alignsWithSelected ? 1.3 : 1;
  const emissiveIntensity = hovered ? 1 : (alignsWithSelected ? 0.7 : 0.3);

  return (
    <group position={position} scale={pointScale}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={pointOpacity}
        />
      </mesh>
      {hovered && (
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="#000000"
          font="/fonts/JetBrainsMono-Regular.ttf"
        >
          {song.title}
          {selectedEmotion && (
            <>
              {'\n'}
              {selectedEmotion}: {Math.round((song.emotionScores[selectedEmotion] || 0) * 100)}%
            </>
          )}
        </Text>
      )}
    </group>
  );
};

export default MoodLayers;
