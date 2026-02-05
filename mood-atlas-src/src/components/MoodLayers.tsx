import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { Text, Line } from '@react-three/drei';
import { Song } from '@/data/mockSongs';
import SongNode from './SongNode';

// Deterministic pseudo-random based on seed
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

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
  onSongClick?: (song: Song) => void;
  onSongHover?: (song: Song | null) => void;
  hoveredEmotion?: string | null;
  selectedSongId?: string;
  onExamine?: (emotion: string, color: string, songs: Song[]) => void;
}

const MoodLayers: React.FC<MoodLayersProps> = ({
  layers,
  onLayerClick,
  onLayerHover,
  onSongClick,
  onSongHover,
  hoveredEmotion,
  selectedSongId,
  onExamine
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
            hoveredEmotion={hoveredEmotion}
            selectedSongId={selectedSongId}
            opacity={opacity}
            scale={scale}
            onHover={() => {
              setHoveredLayer(isHovered ? null : layer.id);
              onLayerHover?.(isHovered ? null : layer);
            }}
            onClick={() => handleLayerClick(layer)}
            onSongClick={onSongClick}
            onSongHover={onSongHover}
            onExamine={onExamine}
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
  hoveredEmotion?: string | null;
  selectedSongId?: string;
  opacity: number;
  scale: number;
  onHover: () => void;
  onClick: () => void;
  onSongClick?: (song: Song) => void;
  onSongHover?: (song: Song | null) => void;
  onExamine?: (emotion: string, color: string, songs: Song[]) => void;
}> = ({ layer, opacity, scale, onHover: _onHover, onClick: _onClick, selectedEmotion, hoveredEmotion, selectedSongId, onSongClick, onSongHover, onExamine }) => {
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
      {/* Emotion container cylinder - NOT INTERACTIVE */}
      <mesh
        ref={meshRef}
        scale={[scale, scale, scale]}
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
        font="./fonts/JetBrainsMono-Regular.ttf"
      >
        {layer.name}
      </Text>
      <Text
        position={[layer.radius + 2 + layer.name.length * 0.5, 0, 0]}
        fontSize={0.3}
        color={layer.color}
        anchorX="left"
        anchorY="middle"
        font="./fonts/JetBrainsMono-Regular.ttf"
      >
        ({layer.songs.length})
      </Text>

      {/* Examine button */}
      <ExamineButton layer={layer} onExamine={onExamine} />

      {/* Song points inside container */}
      <SongNodes
        songs={layer.songs}
        layerRadius={layer.radius}
        hoveredEmotion={hoveredEmotion}
        selectedEmotion={selectedEmotion}
        selectedSongId={selectedSongId}
        onSongClick={onSongClick}
        onSongHover={onSongHover}
      />
    </group>
  );
};

// Separate component for song nodes with memoized positions
const SongNodes: React.FC<{
  songs: Song[];
  layerRadius: number;
  hoveredEmotion?: string | null;
  selectedEmotion: string | null;
  selectedSongId?: string;
  onSongClick?: (song: Song) => void;
  onSongHover?: (song: Song | null) => void;
}> = ({ songs, layerRadius, hoveredEmotion, selectedEmotion, selectedSongId, onSongClick, onSongHover }) => {
  // Memoize positions so they don't change on re-render
  const songPositions = useMemo(() => {
    return songs.map((song, index) => {
      const seed = parseInt(song.id, 10) || index;
      const angle = (index / songs.length) * Math.PI * 2;
      const distanceFromCenter = (layerRadius * 0.7) * seededRandom(seed);
      const x = Math.cos(angle) * distanceFromCenter;
      const z = Math.sin(angle) * distanceFromCenter;
      const y = (seededRandom(seed + 1) - 0.5) * 0.8;
      return new Vector3(x, y, z);
    });
  }, [songs, layerRadius]);

  return (
    <>
      {songs.map((song: Song, index: number) => {
        const emotionToCheck = hoveredEmotion || selectedEmotion;
        const isHighlighted = emotionToCheck ? (song.emotionScores[emotionToCheck] || 0) > 0.3 : false;
        const highlightIntensity = emotionToCheck ? (song.emotionScores[emotionToCheck] || 0) : 0;
        const isSelected = song.id === selectedSongId;

        return (
          <SongNode
            key={song.id}
            song={song}
            position={songPositions[index]}
            onClick={onSongClick}
            onHover={onSongHover}
            isHighlighted={isHighlighted}
            highlightIntensity={highlightIntensity}
            isSelected={isSelected}
          />
        );
      })}
    </>
  );
};

// Examine button with hover effect
const ExamineButton: React.FC<{
  layer: MoodLayer;
  onExamine?: (emotion: string, color: string, songs: Song[]) => void;
}> = ({ layer, onExamine }) => {
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    onExamine?.(layer.name, layer.color, layer.songs);
  };

  // Convert hex color to rgba with 10% opacity
  const hexToRgba = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  };

  return (
    <group
      position={[layer.radius + 2, -0.8, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Background - 10% opacity on hover only */}
      {hovered && (
        <mesh position={[0.8, 0, -0.05]}>
          <planeGeometry args={[1.6, 0.4]} />
          <meshStandardMaterial
            color={layer.color}
            transparent={true}
            opacity={0.1}
            toneMapped={false}
          />
        </mesh>
      )}
      {/* Outline */}
      <Line
        points={[
          [0, -0.2, 0],
          [1.6, -0.2, 0],
          [1.6, 0.2, 0],
          [0, 0.2, 0],
          [0, -0.2, 0],
        ]}
        color={layer.color}
        lineWidth={1}
      />
      {/* Text */}
      <Text
        position={[0.8, 0, 0.01]}
        fontSize={0.25}
        color={layer.color}
        anchorX="center"
        anchorY="middle"
        font="./fonts/JetBrainsMono-Regular.ttf"
      >
        Examine
      </Text>
      {/* Invisible hitbox for better hover/click detection */}
      <mesh
        position={[0.8, 0, 0]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[1.6, 0.4]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
};

export default MoodLayers;
