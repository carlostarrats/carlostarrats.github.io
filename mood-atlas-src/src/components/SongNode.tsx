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
}

const SongNode: React.FC<SongNodeProps> = ({ 
  song, 
  position, 
  onClick, 
  onHover,
  isHighlighted = false,
  highlightIntensity = 0
}) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const size = getNodeSize(song.energy);
  const color = emotionColors[song.primaryEmotion] || '#ffffff';
  const emissiveIntensity = 1.5; // Static - no change on hover

  // Animate the node - NO animation, just static with optional highlight
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Keep position static - no floating
    meshRef.current.position.set(position.x, position.y, position.z);
    
    // Only scale for highlight, not for hover
    const scale = isHighlighted ? 1 + highlightIntensity * 0.2 : 1;
    meshRef.current.scale.set(scale, scale, scale);
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
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={hovered ? 0.9 : 0.7}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>
      
      {/* Invisible hitbox overlay - larger */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[size * 3, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Outer glow ring - DISABLED */}

      {/* Hover tooltip - DISABLED FOR TESTING */}

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
    </group>
  );
};

export default SongNode;

