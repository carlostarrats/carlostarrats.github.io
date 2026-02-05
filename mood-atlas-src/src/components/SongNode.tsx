import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { Song, emotionColors, getNodeSize } from '@/data/mockSongs';

interface SongNodeProps {
  song: Song;
  position: Vector3;
  onClick?: (song: Song) => void;
  onHover?: (song: Song | null) => void;
  isHighlighted?: boolean;
  highlightIntensity?: number;
  isSelected?: boolean;
}

const SongNode: React.FC<SongNodeProps> = ({
  song,
  position,
  onClick,
  onHover,
  isHighlighted = false,
  highlightIntensity = 0,
  isSelected = false
}) => {
  const meshRef = useRef<Mesh>(null);
  const pulseRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const size = getNodeSize(song.energy);
  const baseColor = emotionColors[song.primaryEmotion] || '#ffffff';
  const color = isSelected ? '#ffffff' : baseColor;
  const emissiveIntensity = isSelected ? 2.5 : 1.5;

  // Animate the node and pulse effect
  useFrame((state) => {
    if (!meshRef.current) return;

    // Only scale for highlight, not for hover
    const scale = isHighlighted ? 1 + highlightIntensity * 0.2 : 1;
    meshRef.current.scale.set(scale, scale, scale);

    // Animate pulse for selected node
    if (pulseRef.current && isSelected) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5;
      const pulseScale = 1.5 + pulse * 1.5;
      pulseRef.current.scale.set(pulseScale, pulseScale, pulseScale);
      (pulseRef.current.material as any).opacity = 0.3 - pulse * 0.25;
    }
  });

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 200);
    onClick?.(song);
  };

  const handlePointerOver = () => {
    setHovered(true);
    onHover?.(song);
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover?.(null);
  };

  return (
    <group position={position}>
      {/* Main sphere with larger hit area */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? emissiveIntensity + 0.5 : emissiveIntensity}
          transparent
          opacity={0.8}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>
      
      {/* Invisible hitbox overlay - much larger to prevent flicker */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[size * 5, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Outer glow ring - DISABLED */}

      {/* Hover tooltip - DISABLED FOR TESTING */}

      {/* Hover ring outline */}
      {hovered && !isSelected && (
        <mesh>
          <ringGeometry args={[size * 1.9, size * 2.1, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.6}
            side={2}
          />
        </mesh>
      )}

      {/* Click effect */}
      {clicked && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[size * 2, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Selected pulse effect - radiating sphere */}
      {isSelected && (
        <mesh ref={pulseRef} position={[0, 0, 0]}>
          <sphereGeometry args={[size, 16, 16]} />
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

export default SongNode;

