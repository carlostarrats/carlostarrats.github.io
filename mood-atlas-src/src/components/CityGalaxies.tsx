import React, { useState } from 'react';
import { Text, Billboard } from '@react-three/drei';
import { CityCluster, CityChartSong } from '@/data/cityChartData';
import CityGalaxy from './CityGalaxy';

interface CityGalaxiesProps {
  clusters: CityCluster[];
  onCityClick?: (cluster: CityCluster) => void;
  onCityHover?: (cluster: CityCluster | null) => void;
  onSongClick?: (song: CityChartSong) => void;
  onSongHover?: (song: CityChartSong | null) => void;
  selectedSongId?: string;
  selectedCityId?: string;
}

const CityGalaxies: React.FC<CityGalaxiesProps> = ({
  clusters,
  onCityClick,
  onCityHover,
  onSongClick,
  onSongHover,
  selectedSongId,
  selectedCityId,
}) => {
  const [hoveredCityId, setHoveredCityId] = useState<string | null>(null);

  const handleCityHover = (cluster: CityCluster | null) => {
    setHoveredCityId(cluster?.city.id || null);
    onCityHover?.(cluster);
  };

  return (
    <group>
      {clusters.map((cluster) => (
        <CityGalaxy
          key={cluster.city.id}
          cluster={cluster}
          onCityClick={onCityClick}
          onCityHover={handleCityHover}
          onSongClick={onSongClick}
          onSongHover={onSongHover}
          selectedSongId={selectedSongId}
          isSelected={cluster.city.id === selectedCityId || cluster.city.id === hoveredCityId}
        />
      ))}

      {/* Thayer quadrant labels - positioned at corners */}
      <ThayerLabels />
    </group>
  );
};

// Thayer model quadrant labels
const ThayerLabels: React.FC = () => {
  const labelDistance = 50;

  const quadrants = [
    { position: [-labelDistance, labelDistance, 0], label: 'FRANTIC', sublabel: 'High Energy / Negative Valence', color: '#ff0000' },
    { position: [labelDistance, labelDistance, 0], label: 'HAPPY', sublabel: 'High Energy / Positive Valence', color: '#ffff00' },
    { position: [-labelDistance, -labelDistance, 0], label: 'SAD', sublabel: 'Low Energy / Negative Valence', color: '#448aff' },
    { position: [labelDistance, -labelDistance, 0], label: 'CALM', sublabel: 'Low Energy / Positive Valence', color: '#00ffff' },
  ];

  return (
    <group>
      {quadrants.map((q, i) => (
        <Billboard key={i} position={q.position as [number, number, number]}>
          {/* Quadrant label */}
          <Text
            fontSize={3}
            color={q.color}
            anchorX="center"
            anchorY="middle"
            font="/fonts/JetBrainsMono-Regular.ttf"
          >
            {q.label}
          </Text>
          <Text
            position={[0, -2.5, 0]}
            fontSize={0.8}
            color={q.color}
            anchorX="center"
            anchorY="middle"
            font="/fonts/JetBrainsMono-Regular.ttf"
            fillOpacity={0.5}
          >
            {q.sublabel}
          </Text>
        </Billboard>
      ))}

      {/* Axis lines */}
      {/* Horizontal axis (valence) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-60, 0, 0, 60, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </line>

      {/* Vertical axis (energy) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -60, 0, 0, 60, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </line>
    </group>
  );
};

export default CityGalaxies;
