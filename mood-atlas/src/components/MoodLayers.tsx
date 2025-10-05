import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

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


  return (
    <group>
      {layers.map((layer) => {
        const isHovered = hoveredLayer === layer.id;
        const opacity = isHovered ? 0.8 : 0.4;
        const scale = isHovered ? 1.1 : 1;

        return (
          <LayerSurface
            key={layer.id}
            layer={layer}
            isHovered={isHovered}
            opacity={opacity}
            scale={scale}
            onHover={() => {
              setHoveredLayer(isHovered ? null : layer.id);
              onLayerHover?.(isHovered ? null : layer);
            }}
            onClick={() => onLayerClick?.(layer)}
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
  opacity: number;
  scale: number;
  onHover: () => void;
  onClick: () => void;
}> = ({ layer, opacity, scale, onHover, onClick }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = layer.height + Math.sin(state.clock.elapsedTime + layer.height) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      scale={[scale, scale, scale]}
      onClick={onClick}
      onPointerOver={onHover}
      onPointerOut={onHover}
    >
      <planeGeometry args={[layer.radius * 2, layer.radius * 2, 32, 32]} />
      <meshBasicMaterial
        color={layer.color}
        wireframe
        transparent
        opacity={opacity}
      />
    </mesh>
  );
};

export default MoodLayers;
