import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { Html } from '@react-three/drei';
import { Song, moodColors, getNodeSize } from '@/data/mockSongs';

interface SongNodeProps {
  song: Song;
  position: Vector3;
  onClick?: (song: Song) => void;
  onHover?: (song: Song | null) => void;
}

const SongNode: React.FC<SongNodeProps> = ({ 
  song, 
  position, 
  onClick, 
  onHover 
}) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const size = getNodeSize(song.energy);
  const color = moodColors[song.mood] || '#ffffff';
  const emissiveIntensity = hovered ? 3 : 1.5;

  // Animate the node
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime + song.energy * 10) * 0.2;
      
      // Rotation based on energy
      meshRef.current.rotation.y += song.energy * 0.01;
      
      // Scale pulsing effect
      const scale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new Vector3(scale, scale, scale), 0.1);
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
      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[size, 32, 32]} />
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

      {/* Outer glow ring */}
      <mesh
        position={[0, 0, 0]}
        scale={[1.5, 1.5, 1.5]}
      >
        <ringGeometry args={[size * 0.8, size * 1.2, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.6 : 0.3}
          side={2} // DoubleSide
        />
      </mesh>

      {/* Energy indicator lines */}
      {Array.from({ length: Math.ceil(song.energy * 5) }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0, 0]}
          rotation={[0, (i / 5) * Math.PI * 2, 0]}
        >
          <cylinderGeometry args={[0.02, 0.02, size * 2]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Hover tooltip */}
      {hovered && (
        <Html
          center
          distanceFactor={10}
          position={[0, size + 0.5, 0]}
        >
          <div className="tooltip bg-synthwave-dark/95 border border-neon-cyan text-neon-cyan px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm min-w-max">
            <div className="font-mono text-sm font-bold">{song.title}</div>
            <div className="font-mono text-xs opacity-80">{song.artist}</div>
            {song.album && (
              <div className="font-mono text-xs opacity-60">{song.album}</div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs">
                Energy: {Math.round(song.energy * 100)}%
              </span>
              <span className="font-mono text-xs">
                Mood: {song.mood}
              </span>
            </div>
          </div>
        </Html>
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
    </group>
  );
};

export default SongNode;

