import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { Text } from '@react-three/drei';
import { Song } from '@/data/mockSongs';
import SongNode from './SongNode';

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
}

const MoodLayers: React.FC<MoodLayersProps> = ({ 
  layers, 
  onLayerClick, 
  onLayerHover,
  onSongClick,
  onSongHover,
  hoveredEmotion
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
            opacity={opacity}
            scale={scale}
            onHover={() => {
              setHoveredLayer(isHovered ? null : layer.id);
              onLayerHover?.(isHovered ? null : layer);
            }}
            onClick={() => handleLayerClick(layer)}
            onSongClick={onSongClick}
            onSongHover={onSongHover}
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
  opacity: number;
  scale: number;
  onHover: () => void;
  onClick: () => void;
  onSongClick?: (song: Song) => void;
  onSongHover?: (song: Song | null) => void;
}> = ({ layer, opacity, scale, onHover: _onHover, onClick: _onClick, selectedEmotion, hoveredEmotion, onSongClick, onSongHover }) => {
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
        font="/fonts/JetBrainsMono-Regular.ttf"
      >
        {layer.name}
      </Text>
      <Text
        position={[layer.radius + 2 + layer.name.length * 0.5, 0, 0]}
        fontSize={0.3}
        color={layer.color}
        anchorX="left"
        anchorY="middle"
        font="/fonts/JetBrainsMono-Regular.ttf"
      >
        ({layer.songs.length})
      </Text>

      {/* Song points inside container */}
      {layer.songs.map((song: Song, index: number) => {
        // Distribute songs in a circular pattern inside the cylinder
        const angle = (index / layer.songs.length) * Math.PI * 2;
        const distanceFromCenter = (layer.radius * 0.7) * Math.random();
        const x = Math.cos(angle) * distanceFromCenter;
        const z = Math.sin(angle) * distanceFromCenter;
        const y = (Math.random() - 0.5) * 0.8; // Random height within cylinder

        // Calculate if this song should be highlighted based on hovered emotion
        const emotionToCheck = hoveredEmotion || selectedEmotion;
        const isHighlighted = emotionToCheck ? (song.emotionScores[emotionToCheck] || 0) > 0.3 : false;
        const highlightIntensity = emotionToCheck ? (song.emotionScores[emotionToCheck] || 0) : 0;

        return (
          <SongNode
            key={song.id}
            song={song}
            position={new Vector3(x, y, z)}
            onClick={onSongClick}
            onHover={onSongHover}
            isHighlighted={isHighlighted}
            highlightIntensity={highlightIntensity}
          />
        );
      })}
    </group>
  );
};

export default MoodLayers;
