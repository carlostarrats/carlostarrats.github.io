import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from "@react-three/postprocessing";
import * as anime from "animejs";
import * as Tone from "tone";
import * as THREE from "three";
import "./App.css";

// ---- Types
type DONKIFlare = {
  flrID: string;
  classType: string; // A,B,C,M,X
  beginTime: string;
  peakTime?: string;
  endTime?: string;
  sourceLocation?: string;
  activeRegionNum?: string;
};

// ---- Constants
const CLASS_INTENSITY: Record<string, number> = { A: 0.1, B: 0.5, C: 1, M: 3.5, X: 8 };
const CLASS_COLOR: Record<string, string> = {
  A: "#cfefff",
  B: "#9ad8ff", 
  C: "#ffdca8",
  M: "#ffb36b",
  X: "#ff6b3a",
};

const NASA_KEY = import.meta.env.VITE_NASA_API_KEY || "DEMO_KEY";

// ---- Flare Group Component (stable positions)
function FlareGroup({ flares, onBurstClick }: { 
  flares: DONKIFlare[], 
  onBurstClick: (id: string, event: any) => void 
}) {
  // Create stable positions that don't change on re-renders
  const flarePositions = useMemo(() => {
    return flares.map((flare, index) => {
      // Use a seeded random based on the flare ID for consistent positioning
      const seed = flare.flrID.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      
      const angle = (index / flares.length) * Math.PI * 2;
      const radius = 8 + seededRandom(seed + 1) * 4;
      const height = (seededRandom(seed + 2) - 0.5) * 6;
      
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ] as [number, number, number];
    });
  }, [flares.length]); // Only recalculate if number of flares changes

  return (
    <>
      {flares.map((flare, index) => {
        const intensity = CLASS_INTENSITY[flare.classType] || 1;
        const color = CLASS_COLOR[flare.classType] || "#ffffff";
        const position = flarePositions[index];
        
        return (
          <FlareBurst
            key={flare.flrID}
            position={position}
            intensity={intensity}
            color={color}
            id={flare.flrID}
            onClick={onBurstClick}
          />
        );
      })}
    </>
  );
}

// ---- Simple Flare Component
function FlareBurst({ position, intensity, color, id, onClick }: {
  position: [number, number, number];
  intensity: number;
  color: string;
  id: string;
  onClick: (id: string, event: any) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      onClick={(event) => onClick(id, event)}
    >
      <sphereGeometry args={[0.8 + intensity * 0.4, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={Math.min(4, intensity * 1.2)}
        transparent
        opacity={0.8}
        roughness={0.1}
        metalness={0.0}
      />
    </mesh>
  );
}

// ---- Simple Audio Hook
function useSolarSynth() {
  const [started, setStarted] = useState(false);
  const synthRef = useRef<any>(null);
  
  useEffect(() => {
    try {
      const reverb = new Tone.Reverb({ decay: 8, wet: 0.6 }).toDestination();
      const filter = new Tone.Filter(600, "lowpass").connect(reverb);
      const synth = new Tone.PolySynth({
        voice: Tone.Synth,
        options: { 
          oscillator: { type: "sine" }, 
          envelope: { attack: 2, release: 6 } 
        }
      }).connect(filter);
      
      synthRef.current = { synth, filter, reverb };
      
      return () => {
        synth.dispose();
        filter.dispose();
        reverb.dispose();
      };
    } catch (error) {
      console.log("Audio not available:", error);
    }
  }, []);

  const start = async () => {
    if (!started) {
      await Tone.start();
      setStarted(true);
      Tone.Transport.start();
      
      // Gentle ambient drone
      const synth = synthRef.current?.synth;
      if (synth) {
        synth.triggerAttackRelease(["C2", "G2", "E3"], "8n");
      }
    }
  };

  const triggerFlare = (intensity: number) => {
    const s = synthRef.current;
    if (!s) return;
    
    // Map intensity to frequency modulation and chord voicing
    const cutoff = 400 + intensity * 1200;
    s.filter.frequency.rampTo(cutoff, 1.5);
    
    const note = 220 * Math.pow(2, (Math.random() * 12 - 6) / 12);
    s.synth.triggerAttackRelease(note, `${0.2 + intensity * 0.3}s`);
  };

  return { start, triggerFlare, started };
}

// ---- Main App
function App() {
  const [flares, setFlares] = useState<DONKIFlare[]>([]);
  const [selectedFlare, setSelectedFlare] = useState<DONKIFlare | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const synth = useSolarSynth();

  // Load solar flare data
  const loadFlares = async (days: number = 7) => {
    setIsLoading(true);
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);
      
      const formatDate = (d: Date) => d.toISOString().slice(0, 10);
      
      const response = await fetch(
        `https://api.nasa.gov/DONKI/FLR?startDate=${formatDate(start)}&endDate=${formatDate(end)}&api_key=${NASA_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch solar flare data');
      }
      
      const data = await response.json();
      setFlares(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading solar flares:', error);
      // Demo data
      setFlares([
        {
          flrID: "demo-1",
          classType: "M",
          beginTime: new Date(Date.now() - 86400000).toISOString(),
          peakTime: new Date(Date.now() - 86350000).toISOString(),
          sourceLocation: "Demo Region",
          activeRegionNum: "1234"
        },
        {
          flrID: "demo-2", 
          classType: "X",
          beginTime: new Date(Date.now() - 172800000).toISOString(),
          peakTime: new Date(Date.now() - 172750000).toISOString(),
          sourceLocation: "Demo Region",
          activeRegionNum: "5678"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFlares();
  }, []);

  const handleBurstClick = (id: string, event: any) => {
    // Stop the event from bubbling to OrbitControls
    event.stopPropagation();
    
    const flare = flares.find(f => f.flrID === id);
    if (flare) {
      setSelectedFlare(flare);
      if (soundEnabled) {
        const intensity = CLASS_INTENSITY[flare.classType] || 1;
        synth.triggerFlare(intensity);
      }
    }
  };

  const toggleSound = async () => {
    if (!soundEnabled) {
      await synth.start();
    }
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000000', 
      color: 'white',
      fontFamily: 'Courier New, monospace'
    }}>
      {/* Header */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50, 
        backgroundColor: 'rgba(0, 0, 0, 0.9)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 24px'
      }}>
        <div style={{ 
          maxWidth: '80rem', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
            Solar Flare Synth
          </div>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            NASA DONKI Data Visualization
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ paddingTop: '80px', height: '100vh' }}>
        <Canvas camera={{ position: [0, 3, 12], fov: 50 }}>
          <color attach="background" args={["#000000"]} />
          
          {/* Lighting */}
          <ambientLight intensity={0.1} />
          <directionalLight position={[5, 10, 7]} intensity={0.8} color={"#ffdfb0"} />
          
          {/* Stars */}
          <Stars 
            radius={100} 
            depth={50} 
            count={2000} 
            factor={4} 
            saturation={0} 
            fade 
            speed={0.5}
          />
          
          {/* Orbit Controls */}
          <OrbitControls 
            enablePan={true} 
            maxDistance={60} 
            minDistance={4}
            enableDamping
            dampingFactor={0.05}
          />
          
          {/* Solar Flares */}
          <Suspense fallback={null}>
            <FlareGroup 
              flares={flares} 
              onBurstClick={handleBurstClick}
            />
          </Suspense>
          
          {/* Post-processing */}
          <EffectComposer>
            <Bloom intensity={0.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
            <DepthOfField focusDistance={0.1} focalLength={0.02} bokehScale={2} />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={0.5} />
          </EffectComposer>
        </Canvas>
      </div>
      
      {/* Control Panel */}
      <div style={{ 
        position: 'absolute', 
        top: '100px', 
        right: '24px', 
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <div style={{ marginBottom: '12px', fontSize: '0.875rem', fontWeight: 'bold' }}>
          Solar Flare Synth
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '8px',
          fontSize: '0.75rem' 
        }}>
          <span>Sound</span>
          <button
            onClick={toggleSound}
            style={{
              padding: '4px 12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            {soundEnabled ? "ON" : "OFF"}
          </button>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '8px',
          fontSize: '0.75rem' 
        }}>
          <span>Flares: {flares.length}</span>
          <button
            onClick={() => loadFlares()}
            disabled={isLoading}
            style={{
              padding: '4px 12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.75rem',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            {isLoading ? "..." : "Sync"}
          </button>
        </div>
        
        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
          Click flares to explore
        </div>
      </div>
      
      {/* Detail Panel */}
      {selectedFlare && (
        <div style={{ 
          position: 'absolute', 
          top: '100px', 
          left: '24px', 
          zIndex: 10,
          width: '320px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
              Class {selectedFlare.classType}
            </div>
            <button
              onClick={() => setSelectedFlare(null)}
              style={{
                padding: '4px',
                backgroundColor: 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              ×
        </button>
          </div>
          <div style={{ fontSize: '0.75rem' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#9ca3af' }}>ID:</span> {selectedFlare.flrID}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#9ca3af' }}>Begin:</span>{" "}
              {new Date(selectedFlare.beginTime).toLocaleString()}
            </div>
            {selectedFlare.peakTime && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Peak:</span>{" "}
                {new Date(selectedFlare.peakTime).toLocaleString()}
              </div>
            )}
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#9ca3af' }}>Intensity:</span>{" "}
              {CLASS_INTENSITY[selectedFlare.classType] || 1}x
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50,
        backgroundColor: 'transparent',
        padding: '16px 24px'
      }}>
        <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
          © Carlos Tarrats {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

export default App;