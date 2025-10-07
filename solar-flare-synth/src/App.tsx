import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from "@react-three/postprocessing";
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

// type Asteroid = { // Removed - unused
//   id: string;
//   name: string;
//   estimatedDiameter: number;
//   velocity: number;
//   closeApproachDate: string;
//   missDistance: number;
// };

type Satellite = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
};

type SolarWindData = {
  speed: number;
  density: number;
  temperature: number;
  timestamp: string;
};

type CMEData = {
  id: string;
  startTime: string;
  sourceLocation: string;
  activityID: string;
  linkedEvents?: string[];
};

type SunspotData = {
  id: string;
  latitude: number;
  longitude: number;
  area: number;
  magneticField: number;
  timestamp: string;
};

type AuroraData = {
  latitude: number;
  longitude: number;
  intensity: number;
  timestamp: string;
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

// ---- Concentric Circle Layout Constants
// Concentric rings configuration (commented out unused)
// const CONCENTRIC_RINGS = {
//   SOLAR_FLARES: { min: 0, max: 2, color: "#ff6b3a" },
//   SATELLITES: { min: 2, max: 4, color: "#00ff88" },
//   ASTEROIDS: { min: 4, max: 8, color: "#8b4513" },
//   SOLAR_WIND: { min: 8, max: 12, color: "#4169e1" },
//   CME: { min: 12, max: 16, color: "#ff1493" },
//   SUNSPOTS: { min: 16, max: 20, color: "#2f2f2f" },
//   AURORA: { min: 20, max: 25, color: "#00ff7f" }
// };

// ---- Flare Group Component (stable positions)
function FlareGroup({ flares, onBurstClick }: { 
  flares: DONKIFlare[], 
  onBurstClick: (id: string, event: any) => void 
}) {
  // Use ref to store positions that never change
  const positionsRef = useRef<Map<string, [number, number, number]>>(new Map());
  
  // Generate positions once and store them permanently
  if (positionsRef.current.size === 0) {
    flares.forEach((flare, index) => {
      // Use a seeded random based on the flare ID for consistent positioning
      const seed = flare.flrID.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      
      // Keep original nice spread-out positioning
      const angle = (index / flares.length) * Math.PI * 2;
      const radius = 8 + seededRandom(seed + 1) * 4;
      const height = (seededRandom(seed + 2) - 0.5) * 6;
      
      positionsRef.current.set(flare.flrID, [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ]);
    });
  }

  return (
    <group frustumCulled={false}>
      {flares.map((flare) => {
        const intensity = CLASS_INTENSITY[flare.classType] || 1;
        const color = CLASS_COLOR[flare.classType] || "#ffffff";
        const position = positionsRef.current.get(flare.flrID) || [0, 0, 0];
        
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
    </group>
  );
}

// ---- Satellite Group Component (stable positions)
function SatelliteGroup({ satellites, onSatelliteClick }: { 
  satellites: Satellite[], 
  onSatelliteClick: (id: string, event: any) => void 
}) {
  // Use ref to store positions that never change
  const positionsRef = useRef<Map<string, [number, number, number]>>(new Map());
  
  // Generate positions once and store them permanently
  if (positionsRef.current.size === 0) {
    satellites.forEach((sat, index) => {
      // Use a seeded random based on the satellite ID for consistent positioning
      const seed = sat.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      
      // Keep original nice spread-out positioning
      const angle = (index / satellites.length) * Math.PI * 2;
      const radius = 4; // Fixed radius for satellite ring
      const height = (seededRandom(seed + 1) - 0.5) * 2;
      
      positionsRef.current.set(sat.id, [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ]);
    });
  }

  return (
    <>
      {satellites.map((sat) => {
        const position = positionsRef.current.get(sat.id) || [4, 0, 0];
        
        return (
          <SatelliteMesh
            key={sat.id}
            position={position}
            velocity={sat.velocity}
            id={sat.id}
            onClick={onSatelliteClick}
          />
        );
      })}
    </>
  );
}

// ---- Asteroid Component (Triangular Meshes)
// AsteroidMesh function removed (unused)

// ---- Satellite Component (Glowing Cubes with Flare Colors)
function SatelliteMesh({ position, velocity, id, onClick }: {
  position: [number, number, number];
  velocity: number;
  id: string;
  onClick: (id: string, event: any) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Use same colors as solar flares
  const flareColors = ["#cfefff", "#9ad8ff", "#ffdca8", "#ffb36b", "#ff6b3a"];
  const color = flareColors[Math.floor(Math.random() * flareColors.length)];

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * velocity * 0.2;
      meshRef.current.rotation.y += delta * velocity * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh 
        ref={meshRef} 
        onPointerEnter={(event) => {
          event.stopPropagation();
          onClick(id, event);
        }}
        frustumCulled={false}
      >
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      {/* Larger invisible clickable area */}
      <mesh
        onPointerEnter={(event) => {
          event.stopPropagation();
          onClick(id, event);
        }}
        frustumCulled={false}
      >
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

// ---- Simple Solar Wind Particles (With Safe Animation)
function SolarWindParticles({ onWindClick }: { onWindClick: (id: string, type: string, event: any) => void }) {
  const particleCount = 50;
  
  const windColors = [
    "#00ffff", "#40e0d0", "#87ceeb", "#b0e0e6", 
    "#e0ffff", "#f0f8ff", "#ffffff", "#e6f3ff"
  ];

  // Store particle data in ref to avoid re-creation
  const particlesRef = useRef<any[]>([]);
  
  if (particlesRef.current.length === 0) {
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => {
      const angle = (i / particleCount) * Math.PI * 2;
      const baseRadius = 15 + Math.random() * 3;
      
      return {
        id: `wind-particle-${i}`,
        baseAngle: angle,
        baseRadius: baseRadius,
        baseHeight: (Math.random() - 0.5) * 4,
        color: windColors[Math.floor(Math.random() * windColors.length)],
        speed: 0.1 + Math.random() * 0.2,
        time: Math.random() * Math.PI * 2, // Random start time
      };
    });
  }

  return (
    <>
      {particlesRef.current.map((particle) => (
        <AnimatedWindParticle
          key={particle.id}
          particle={particle}
          onWindClick={onWindClick}
        />
      ))}
    </>
  );
}

// ---- Sun Component (Spinning Polygonal Center)
function Sun({ onSunClick, onSunLeave }: { 
  onSunClick: (id: string, type: string, event: any) => void;
  onSunLeave: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      // Slow rotation
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      onPointerEnter={(event) => {
        event.stopPropagation();
        console.log('Sun hover detected');
        onSunClick('sun-center', 'sun', event);
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        console.log('Sun hover ended');
        onSunLeave();
      }}
      frustumCulled={false}
    >
      <dodecahedronGeometry args={[1.5, 0]} />
      <meshStandardMaterial
        color="#ffb347"
        emissive="#ffa500"
        emissiveIntensity={0.8}
        roughness={0.3}
        metalness={0.7}
      />
    </mesh>
  );
}

// Individual animated particle component
function AnimatedWindParticle({ particle, onWindClick }: { 
  particle: any, 
  onWindClick: (id: string, type: string, event: any) => void 
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      // Simple outward movement with wave
      particle.time += delta * particle.speed;
      
      const radius = particle.baseRadius + particle.time * 5; // Faster outward movement
      const height = particle.baseHeight + Math.sin(particle.time * 3) * 1; // More visible wave motion
      
      meshRef.current.position.x = Math.cos(particle.baseAngle) * radius;
      meshRef.current.position.y = height;
      meshRef.current.position.z = Math.sin(particle.baseAngle) * radius;
      
      // Gentle rotation
      meshRef.current.rotation.z += delta * 0.5;
      
      // Fade out as it gets further
      const maxDistance = 25;
      const fadeStart = 20;
      if (radius > fadeStart) {
        const opacity = Math.max(0, 0.4 - (radius - fadeStart) / (maxDistance - fadeStart) * 0.4);
        if (meshRef.current.material && 'opacity' in meshRef.current.material) {
          (meshRef.current.material as any).opacity = opacity;
        }
      }
      
      // Reset when too far
      if (radius > maxDistance) {
        particle.time = 0; // Reset time, keep other properties
      }
    }
  });

  return (
      <mesh
        ref={meshRef}
        onPointerEnter={(event) => {
          event.stopPropagation();
          onWindClick(particle.id, 'solarwind', event);
        }}
        frustumCulled={false}
      >
      <sphereGeometry args={[0.12, 8, 8]} />
      <meshStandardMaterial
        color={particle.color}
        emissive={particle.color}
        emissiveIntensity={0.4}
        transparent
        opacity={0.7}
        roughness={0.1}
        metalness={0.0}
      />
    </mesh>
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
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={(event) => onClick(id, event)}
        frustumCulled={false}
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
      {/* Larger invisible clickable area */}
      <mesh
        onPointerEnter={(event) => onClick(id, event)}
        frustumCulled={false}
      >
        <sphereGeometry args={[4, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

// ---- Simple Audio Hook
function useSolarSynth() {
  const [started, setStarted] = useState(false);
  const synthRef = useRef<any>(null);
  const sunBeatRef = useRef<any>(null);
  
  useEffect(() => {
    // Auto-start audio immediately with ambient background
    const initializeAudio = async () => {
      try {
        await Tone.start();
        setStarted(true);
        
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
        
        // Start gentle ambient drone immediately
        Tone.Transport.start();
        synth.triggerAttackRelease(["C2", "G2", "E3"], "8n");
        
        console.log('Audio auto-started with ambient background');
      } catch (error) {
        console.log("Audio not available:", error);
      }
    };

    initializeAudio();
    
    return () => {
      if (synthRef.current) {
        synthRef.current.synth.dispose();
        synthRef.current.filter.dispose();
        synthRef.current.reverb.dispose();
      }
    };
  }, []);

  const start = async () => {
    // Audio is already auto-started, no action needed
    return;
  };

  const triggerFlare = async (intensity: number) => {
    // Start audio context on first interaction
    if (!started) {
      try {
        await Tone.start();
        setStarted(true);
        Tone.Transport.start();
      } catch (error) {
        console.log('Failed to start audio:', error);
        return;
      }
    }
    
    const s = synthRef.current;
    if (!s) return;
    
    // Map intensity to frequency modulation and chord voicing
    const cutoff = 400 + intensity * 1200;
    s.filter.frequency.rampTo(cutoff, 1.5);
    
    const note = 220 * Math.pow(2, (Math.random() * 12 - 6) / 12);
    s.synth.triggerAttackRelease(note, `${0.2 + intensity * 0.3}s`);
  };

  const triggerSatellite = async (velocity: number) => {
    // Start audio context on first interaction
    if (!started) {
      try {
        await Tone.start();
        setStarted(true);
        Tone.Transport.start();
      } catch (error) {
        console.log('Failed to start audio:', error);
        return;
      }
    }
    
    const s = synthRef.current;
    if (!s) return;
    
    // Higher frequency range for satellites (electronic/space sounds)
    const baseFreq = 440 + velocity * 50; // 440Hz to 880Hz range
    const note = baseFreq * Math.pow(2, (Math.random() * 8 - 4) / 12); // Smaller range
    
    // Electronic beep sound
    s.filter.frequency.rampTo(800 + velocity * 200, 0.5);
    s.synth.triggerAttackRelease(note, `${0.1 + velocity * 0.05}s`);
  };

  const triggerSolarWind = async (speed: number, density: number) => {
    console.log('triggerSolarWind called with speed:', speed, 'density:', density);
    
    // Start audio context on first interaction
    if (!started) {
      try {
        await Tone.start();
        setStarted(true);
        Tone.Transport.start();
        console.log('Audio started on first interaction');
      } catch (error) {
        console.log('Failed to start audio:', error);
        return;
      }
    }
    
    const s = synthRef.current;
    if (!s) {
      console.log('No synth available for solar wind');
      return;
    }
    console.log('Triggering solar wind sound');
    
    // Wind-like whooshing sound
    const baseFreq = 110 + speed * 0.5; // Lower frequency for wind
    const note = baseFreq * Math.pow(2, (Math.random() * 6 - 3) / 12);
    
    // Atmospheric filter sweep
    s.filter.frequency.rampTo(200 + density * 100, 2.0);
    s.synth.triggerAttackRelease(note, `${0.5 + density * 0.3}s`);
  };

  const triggerSun = async () => {
    console.log('triggerSun called');
    
    // Start audio context on first interaction
    if (!started) {
      try {
        await Tone.start();
        setStarted(true);
        Tone.Transport.start();
        console.log('Audio started on first interaction');
      } catch (error) {
        console.log('Failed to start audio:', error);
        return;
      }
    }
    
    const s = synthRef.current;
    if (!s) {
      console.log('No synth available for sun');
      return;
    }
    console.log('Triggering sun sound');
    
    // Deep bass/drum sound for the sun - more like a kick drum
    // Deep bass/drum sound for the sun (frequencies removed - unused)
    
    // Create a deep, punchy bass sound with envelope
    const kickSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: {
        type: "triangle"
      },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 1.4,
        attackCurve: "exponential"
      }
    }).toDestination();
    
    kickSynth.triggerAttackRelease("C1", "8n");
  };

  const startSunBeat = async () => {
    console.log('Starting sun beat');
    
    // Start audio context on first interaction
    if (!started) {
      try {
        await Tone.start();
        setStarted(true);
        Tone.Transport.start();
        console.log('Audio started on first interaction');
      } catch (error) {
        console.log('Failed to start audio:', error);
        return;
      }
    }
    
    if (sunBeatRef.current) {
      sunBeatRef.current.dispose();
    }
    
    // Create a continuous drum beat with simple oscillator
    const kickSynth = new Tone.Oscillator(32.7, "triangle").toDestination(); // C1 = 32.7Hz
    kickSynth.start();
    
    // Create a repeating pattern using Transport
    const beatPattern = new Tone.Pattern((time) => {
      // Create a quick envelope for the beat
      const gainNode = new Tone.Gain(1).toDestination();
      kickSynth.connect(gainNode);
      
      // Quick volume envelope for beat effect
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(1, time + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    }, ["beat", null, "beat", null], "8n" as any);
    
    beatPattern.start(0);
    sunBeatRef.current = { kickSynth, beatPattern };
  };

  const stopSunBeat = () => {
    console.log('Stopping sun beat');
    if (sunBeatRef.current) {
      sunBeatRef.current.beatPattern.stop();
      sunBeatRef.current.beatPattern.dispose();
      sunBeatRef.current.kickSynth.stop();
      sunBeatRef.current.kickSynth.dispose();
      sunBeatRef.current = null;
    }
  };

  return { start, triggerFlare, triggerSatellite, triggerSolarWind, triggerSun, startSunBeat, stopSunBeat, started };
}

// ---- Main App
function App() {
  const [flares, setFlares] = useState<DONKIFlare[]>([]);
  // const [asteroids, setAsteroids] = useState<Asteroid[]>([]); // Removed - unused
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [solarWind, setSolarWind] = useState<SolarWindData[]>([]);
  const [cmeData, setCmeData] = useState<CMEData[]>([]);
  const [sunspots, setSunspots] = useState<SunspotData[]>([]);
  const [auroraData, setAuroraData] = useState<AuroraData[]>([]);
  
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  // const [isLoading, setIsLoading] = useState(false); // Removed - unused
  const [soundEnabled, setSoundEnabled] = useState(false);
  const synth = useSolarSynth();
  
  const handleSunLeave = useCallback(() => {
    synth.stopSunBeat();
  }, [synth]);

  // Load solar flare data - accumulate over time instead of refreshing
  const loadFlares = async (days: number = 7) => {
    // setIsLoading(true); // Removed - unused
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
      
      const newData = await response.json();
      
      // Get existing flares from localStorage
      const existingFlares = JSON.parse(localStorage.getItem('solar-flares') || '[]');
      
      // Merge new data with existing, avoiding duplicates
      const existingIds = new Set(existingFlares.map((f: any) => f.flrID));
      const uniqueNewFlares = Array.isArray(newData) ? newData.filter(f => !existingIds.has(f.flrID)) : [];
      
      // Combine and save
      const allFlares = [...existingFlares, ...uniqueNewFlares];
      localStorage.setItem('solar-flares', JSON.stringify(allFlares));
      setFlares(allFlares);
      
      console.log(`Added ${uniqueNewFlares.length} new flares, total: ${allFlares.length}`);
    } catch (error) {
      console.error('Error loading solar flares:', error);
      
      // Load from localStorage if API fails
      const storedFlares = JSON.parse(localStorage.getItem('solar-flares') || '[]');
      if (storedFlares.length > 0) {
        setFlares(storedFlares);
        console.log(`Loaded ${storedFlares.length} flares from storage`);
      } else {
        // Demo data only if no stored data
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
      }
    } finally {
      // setIsLoading(false); // Removed - unused
    }
  };

  // Load all space data
  const loadAllData = async () => {
    await loadFlares();
    await loadAsteroids();
    await loadSatellites();
    await loadSolarWind();
    await loadCMEData();
    await loadSunspots();
    await loadAuroraData();
  };

  // Load asteroid data (demo for now)
  const loadAsteroids = async () => {
    try {
      // Demo asteroid data
      // setAsteroids removed - unused
    } catch (error) {
      console.log("Error loading asteroids:", error);
    }
  };

  // Load satellite data (demo for now)
  const loadSatellites = async () => {
    try {
      // Demo satellite data
      setSatellites([
        {
          id: "sat-1",
          name: "ISS",
          latitude: 51.5074,
          longitude: -0.1278,
          altitude: 408,
          velocity: 7.66
        },
        {
          id: "sat-2",
          name: "Hubble",
          latitude: 28.5,
          longitude: -80.6,
          altitude: 547,
          velocity: 7.5
        },
        {
          id: "sat-3",
          name: "GPS",
          latitude: 0,
          longitude: 0,
          altitude: 20200,
          velocity: 3.87
        }
      ]);
    } catch (error) {
      console.log("Error loading satellites:", error);
    }
  };

  // Load solar wind data (demo for now)
  const loadSolarWind = async () => {
    try {
      // Demo solar wind data
      setSolarWind([
        {
          speed: 450,
          density: 5.2,
          temperature: 100000,
          timestamp: new Date().toISOString()
        },
        {
          speed: 380,
          density: 3.8,
          temperature: 95000,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    } catch (error) {
      console.log("Error loading solar wind:", error);
    }
  };

  // Load CME data (demo for now)
  const loadCMEData = async () => {
    try {
      // Demo CME data
      setCmeData([
        {
          id: "cme-1",
          startTime: new Date(Date.now() - 86400000).toISOString(),
          sourceLocation: "Active Region 1234",
          activityID: "CME-2024-001"
        }
      ]);
    } catch (error) {
      console.log("Error loading CME data:", error);
    }
  };

  // Load sunspot data (demo for now)
  const loadSunspots = async () => {
    try {
      // Demo sunspot data
      setSunspots([
        {
          id: "sunspot-1",
          latitude: 15.2,
          longitude: 45.8,
          area: 1250,
          magneticField: 2800,
          timestamp: new Date().toISOString()
        },
        {
          id: "sunspot-2",
          latitude: -8.5,
          longitude: 120.3,
          area: 890,
          magneticField: 2100,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    } catch (error) {
      console.log("Error loading sunspots:", error);
    }
  };

  // Load aurora data (demo for now)
  const loadAuroraData = async () => {
    try {
      // Demo aurora data
      setAuroraData([
        {
          latitude: 65.5,
          longitude: -147.5,
          intensity: 0.8,
          timestamp: new Date().toISOString()
        },
        {
          latitude: 68.2,
          longitude: 16.0,
          intensity: 0.6,
          timestamp: new Date(Date.now() - 1800000).toISOString()
        }
      ]);
    } catch (error) {
      console.log("Error loading aurora data:", error);
    }
  };

  useEffect(() => {
    // Load existing data from localStorage first
    const storedFlares = JSON.parse(localStorage.getItem('solar-flares') || '[]');
    if (storedFlares.length > 0) {
      setFlares(storedFlares);
      console.log(`Loaded ${storedFlares.length} flares from storage on startup`);
    }
    
    // Then fetch new data
    loadAllData();
  }, []);

  const handleObjectClick = useCallback((id: string, type: string, event: any) => {
    console.log('Object clicked:', { id, type, event });
    // Stop the event from bubbling to OrbitControls
    event.stopPropagation();
    
    // Start audio on first click
    if (!audioStarted) {
      setAudioStarted(true);
    }
    
    let selectedObj = null;
    
    switch (type) {
      case 'flare':
        selectedObj = flares.find(f => f.flrID === id);
        break;
      case 'satellite':
        selectedObj = satellites.find(s => s.id === id);
        break;
      case 'solarwind':
        selectedObj = solarWind.find(sw => sw.timestamp === id);
        break;
      case 'cme':
        selectedObj = cmeData.find(c => c.id === id);
        break;
      case 'sunspot':
        selectedObj = sunspots.find(ss => ss.id === id);
        break;
      case 'aurora':
        selectedObj = auroraData.find(a => a.timestamp === id);
        break;
      case 'sun':
        selectedObj = { 
          id: 'sun-center', 
          type: 'sun', 
          name: 'Sun',
          position: [0, 0, 0],
          velocity: 0, // Sun is stationary at center
          temperature: '5,778 K',
          radius: '696,340 km',
          mass: '1.989 × 10³⁰ kg'
        };
        break;
    }
    
    if (selectedObj) {
      setSelectedObject({ ...selectedObj, type });
      
      // Sun always plays its beat regardless of sound toggle
      if (type === 'sun') {
        synth.startSunBeat();
      } else if (soundEnabled) {
        switch (type) {
          case 'flare':
            const flareObj = selectedObj as DONKIFlare;
            const intensity = CLASS_INTENSITY[flareObj.classType] || 1;
            synth.triggerFlare(intensity);
            break;
          case 'satellite':
            const satObj = selectedObj as Satellite;
            synth.triggerSatellite(satObj.velocity);
            break;
          case 'solarwind':
            const windObj = selectedObj as SolarWindData;
            synth.triggerSolarWind(windObj.speed, windObj.density);
            break;
          default:
            synth.triggerFlare(1);
        }
      }
    }
  }, [flares, satellites, solarWind, cmeData, sunspots, auroraData, soundEnabled, synth]);

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
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: 'normal',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
          }}>
            Solar Flare Synth
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              NASA DONKI Data Visualization
            </div>
            <button
              onClick={toggleSound}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                backgroundColor: soundEnabled ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 'normal',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              {soundEnabled ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ paddingTop: '80px', height: '100vh' }}>
        <Canvas 
          camera={{ position: [0, 3, 12], fov: 50, near: 0.1, far: 1000 }}
          gl={{ antialias: true, alpha: false }}
          onPointerMissed={() => setSelectedObject(null)}
        >
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
            maxDistance={1000} 
            minDistance={1}
            enableDamping
            dampingFactor={0.05}
          />
          
          {/* Concentric Space Data Layers */}
          <Suspense fallback={null}>
            {/* Sun - Center */}
            <Sun onSunClick={handleObjectClick} onSunLeave={handleSunLeave} />
            
            {/* Solar Flares - Center (0-2 units) */}
            <FlareGroup 
              flares={flares} 
              onBurstClick={(id, event) => handleObjectClick(id, 'flare', event)}
            />
            
            {/* Satellites - Inner Ring (3-5 units) */}
            <SatelliteGroup 
              satellites={satellites} 
              onSatelliteClick={(id, event) => handleObjectClick(id, 'satellite', event)}
            />
            
            
            {/* Solar Wind Particles (slowly animated) */}
            <SolarWindParticles 
              onWindClick={handleObjectClick}
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
      
        {/* Detail Panel */}
        {selectedObject && (
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
            <div style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>
              {selectedObject.type === 'flare' && `Class ${selectedObject.classType}`}
              {selectedObject.type === 'satellite' && selectedObject.name}
              {selectedObject.type === 'solarwind' && `Solar Wind Stream`}
              {selectedObject.type === 'sun' && selectedObject.name}
            </div>
          </div>
          <div style={{ fontSize: '0.75rem' }}>
            {selectedObject.type === 'flare' && (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>ID:</span> {selectedObject.flrID}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Begin:</span>{" "}
                  {new Date(selectedObject.beginTime).toLocaleString()}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Intensity:</span>{" "}
                  {CLASS_INTENSITY[selectedObject.classType] || 1}x
                </div>
              </>
            )}
            
            
            {selectedObject.type === 'satellite' && (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Altitude:</span> {selectedObject.altitude} km
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Velocity:</span> {selectedObject.velocity} km/s
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Position:</span> {selectedObject.latitude.toFixed(2)}°, {selectedObject.longitude.toFixed(2)}°
                </div>
              </>
            )}
            
            {selectedObject.type === 'solarwind' && (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Speed:</span> {selectedObject.speed} km/s
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Density:</span> {selectedObject.density} particles/cm³
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Temperature:</span> {selectedObject.temperature.toLocaleString()}K
      </div>
              </>
            )}
            
            {selectedObject.type === 'sun' && (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Position:</span> Center (0, 0, 0)
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Velocity:</span> 0 km/s (Stationary)
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Temperature:</span> {selectedObject.temperature}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Radius:</span> {selectedObject.radius}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Mass:</span> {selectedObject.mass}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}

export default App;