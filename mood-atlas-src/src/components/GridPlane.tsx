import React from 'react';

interface GridPlaneProps {
  size?: number;
  divisions?: number;
  color?: string;
}

const GridPlane: React.FC<GridPlaneProps> = ({ 
  size = 50, 
  divisions = 50, 
  color = "#ffffff" 
}) => {

  // Create multiple layered grids
  const createGrid = (height: number, opacity: number, scale: number = 1) => (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, height, 0]}
    >
      <planeGeometry args={[size * scale, size * scale, divisions, divisions]} />
      <meshBasicMaterial
        color={color}
        wireframe
        transparent
        opacity={opacity}
      />
    </mesh>
  );

  return (
    <group>
      {/* Multiple layered grids creating depth */}
      {createGrid(-8, 0.1, 1.5)}  {/* Background layer */}
      {createGrid(-6, 0.2, 1.2)}  {/* Mid background */}
      {createGrid(-4, 0.3, 1.0)}  {/* Main base grid */}
      {createGrid(-2, 0.4, 0.8)}  {/* Foreground grid */}
      {createGrid(0, 0.5, 0.6)}   {/* Top grid */}
      
      {/* Corner alignment markers */}
      {[
        [size/2, 2, size/2],
        [-size/2, 2, size/2],
        [size/2, 2, -size/2],
        [-size/2, 2, -size/2]
      ].map((pos, index) => (
        <group key={index} position={[pos[0], pos[1], pos[2]]}>
          {/* Plus sign markers */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2, 0.1, 0.1]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.1, 0.1, 2]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default GridPlane;
