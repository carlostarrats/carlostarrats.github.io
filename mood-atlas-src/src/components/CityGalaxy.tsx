import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { CityCluster, CityChartSong } from '@/data/cityChartData';

interface CitySongNodeProps {
  song: CityChartSong;
  position: THREE.Vector3;
  color: string;
  onClick?: (song: CityChartSong) => void;
  onHover?: (song: CityChartSong | null) => void;
  isSelected?: boolean;
}

// Individual song node within a city cluster
// City song node size - much larger than personal view since we're viewing from far away
const getCitySongNodeSize = (energy: number): number => {
  return 0.15 + (energy * 0.15); // Range from 0.15 to 0.30 units
};

const CitySongNode: React.FC<CitySongNodeProps> = ({
  song,
  position,
  color,
  onClick,
  onHover,
  isSelected = false,
}) => {
  const pulseRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const size = getCitySongNodeSize(song.energy);
  const displayColor = isSelected ? '#ffffff' : color;
  const emissiveIntensity = isSelected ? 2.5 : 1.5;

  useFrame((state) => {
    // Skip animation logic entirely when not selected (performance optimization)
    if (!isSelected) return;

    // Animate pulse for selected node
    if (pulseRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5;
      const pulseScale = 1.5 + pulse * 1.5;
      pulseRef.current.scale.set(pulseScale, pulseScale, pulseScale);
      const material = pulseRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 - pulse * 0.25;
    }
  });

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
        onClick={() => onClick?.(song)}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={displayColor}
          emissive={displayColor}
          emissiveIntensity={hovered ? emissiveIntensity + 0.5 : emissiveIntensity}
          transparent
          opacity={0.8}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>

      {/* Invisible hitbox overlay */}
      <mesh
        onClick={() => onClick?.(song)}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[size * 5, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Hover ring outline */}
      {hovered && !isSelected && (
        <mesh>
          <ringGeometry args={[size * 1.9, size * 2.1, 32]} />
          <meshBasicMaterial
            color={displayColor}
            transparent
            opacity={0.6}
            side={2}
          />
        </mesh>
      )}

      {/* Selected pulse effect */}
      {isSelected && (
        <mesh ref={pulseRef}>
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

// Generate fibonacci sphere points for even distribution
function fibonacciSphere(numPoints: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const angleIncrement = Math.PI * 2 * goldenRatio;

  for (let i = 0; i < numPoints; i++) {
    const t = i / numPoints;
    const inclination = Math.acos(1 - 2 * t);
    const azimuth = angleIncrement * i;

    const x = Math.sin(inclination) * Math.cos(azimuth) * radius;
    const y = Math.sin(inclination) * Math.sin(azimuth) * radius;
    const z = Math.cos(inclination) * radius;

    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
}

interface CityGalaxyProps {
  cluster: CityCluster;
  onCityClick?: (cluster: CityCluster) => void;
  onCityHover?: (cluster: CityCluster | null) => void;
  onSongClick?: (song: CityChartSong) => void;
  onSongHover?: (song: CityChartSong | null) => void;
  selectedSongId?: string;
  isSelected?: boolean;
}

const CityGalaxy: React.FC<CityGalaxyProps> = ({
  cluster,
  onCityClick,
  onCityHover,
  onSongClick,
  onSongHover,
  selectedSongId,
  isSelected = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Memoize song positions using fibonacci sphere
  const songPositions = useMemo(() => {
    return fibonacciSphere(cluster.songs.length, 4);
  }, [cluster.songs.length]);

  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = cluster.position.y + Math.sin(state.clock.elapsedTime * 0.5 + cluster.position.x) * 0.5;
    }
  });

  const handlePointerOver = () => {
    setHovered(true);
    onCityHover?.(cluster);
  };

  const handlePointerOut = () => {
    setHovered(false);
    onCityHover?.(null);
  };

  return (
    <group
      ref={groupRef}
      position={[cluster.position.x, cluster.position.y, cluster.position.z]}
    >
      {/* City label - floating above the cluster */}
      <Billboard position={[0, 7, 0]}>
        <group
          onClick={() => onCityClick?.(cluster)}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {/* City name */}
          <Text
            position={[0, 0, 0]}
            fontSize={1.5}
            color={cluster.color}
            anchorX="center"
            anchorY="middle"
            font="./fonts/JetBrainsMono-Regular.ttf"
          >
            {cluster.city.name}
          </Text>
          {/* Country */}
          <Text
            position={[0, -1.2, 0]}
            fontSize={0.6}
            color={cluster.color}
            anchorX="center"
            anchorY="middle"
            font="./fonts/JetBrainsMono-Regular.ttf"
            fillOpacity={0.6}
          >
            {cluster.city.country}
          </Text>
          {/* Song count */}
          <Text
            position={[0, -2.0, 0]}
            fontSize={0.5}
            color={cluster.color}
            anchorX="center"
            anchorY="middle"
            font="./fonts/JetBrainsMono-Regular.ttf"
            fillOpacity={0.4}
          >
            {cluster.songs.length} songs
          </Text>

          {/* Examine button - visible on hover */}
          {hovered && (
            <group position={[0, -3.2, 0]}>
              <mesh position={[0, 0, -0.05]}>
                <planeGeometry args={[3, 0.8]} />
                <meshStandardMaterial
                  color={cluster.color}
                  transparent
                  opacity={0.15}
                  toneMapped={false}
                />
              </mesh>
              <Text
                position={[0, 0, 0]}
                fontSize={0.4}
                color={cluster.color}
                anchorX="center"
                anchorY="middle"
                font="./fonts/JetBrainsMono-Regular.ttf"
              >
                Click to Examine
              </Text>
            </group>
          )}

          {/* Invisible hitbox for label */}
          <mesh
            onClick={() => onCityClick?.(cluster)}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <planeGeometry args={[8, 6]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        </group>
      </Billboard>

      {/* Song nodes in fibonacci sphere distribution */}
      {cluster.songs.map((song, index) => (
        <CitySongNode
          key={song.id}
          song={song}
          position={songPositions[index]}
          color={cluster.color}
          onClick={onSongClick}
          onHover={onSongHover}
          isSelected={song.id === selectedSongId}
        />
      ))}

      {/* Cluster boundary sphere (wireframe) */}
      <mesh>
        <sphereGeometry args={[5, 24, 24]} />
        <meshBasicMaterial
          color={cluster.color}
          wireframe
          transparent
          opacity={hovered || isSelected ? 0.15 : 0.05}
        />
      </mesh>

      {/* Center point glow */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={cluster.color}
          emissive={cluster.color}
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

export default CityGalaxy;
