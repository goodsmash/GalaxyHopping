import * as THREE from 'three';
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Types of space stations
 */
export type SpaceStationType = 
  'orbital' | 'research' | 'military' | 'trading' | 'wormhole_gate';

/**
 * Props for the space station component
 */
interface SpaceStationProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  type?: SpaceStationType;
  animate?: boolean;
  seed?: number;
}

/**
 * A detailed 3D space station model created procedurally with Three.js geometry
 */
export function SpaceStation({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  type = 'orbital',
  animate = true,
  seed = 12345
}: SpaceStationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const satelliteRefs = useRef<THREE.Group[]>([]);
  
  // Create a deterministic random function based on the seed
  const seededRandom = (min: number, max: number, offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    const rand = x - Math.floor(x); // 0-1 range
    return min + rand * (max - min);
  };
  
  // Animate the space station
  useFrame((_, delta) => {
    if (animate) {
      // Rotate the main ring
      if (ringRef.current) {
        ringRef.current.rotation.z += delta * 0.05;
      }
      
      // Rotate each satellite around the station
      satelliteRefs.current.forEach((satellite, index) => {
        if (satellite) {
          // Create different orbits for each satellite
          const orbitSpeed = 0.1 + index * 0.05;
          const orbitRadius = 3 + index * 0.5;
          const time = Date.now() * 0.001;
          
          // Update satellite position
          satellite.position.x = Math.cos(time * orbitSpeed) * orbitRadius;
          satellite.position.z = Math.sin(time * orbitSpeed) * orbitRadius;
          
          // Make the satellite face its direction of movement
          satellite.rotation.y = Math.atan2(
            -Math.sin(time * orbitSpeed),
            -Math.cos(time * orbitSpeed)
          );
        }
      });
      
      // Add a subtle wobble to the entire station
      if (groupRef.current) {
        groupRef.current.rotation.x = Math.sin(Date.now() * 0.0001) * 0.01;
        groupRef.current.rotation.z = Math.cos(Date.now() * 0.0001) * 0.01;
      }
    }
  });
  
  // Generate the space station based on its type
  const stationElements = useMemo(() => {
    if (type === 'orbital') {
      return createOrbitalStation(seededRandom);
    } else if (type === 'research') {
      return createResearchStation(seededRandom);
    } else if (type === 'military') {
      return createMilitaryStation(seededRandom);
    } else if (type === 'trading') {
      return createTradingStation(seededRandom);
    } else if (type === 'wormhole_gate') {
      return createWormholeGate(seededRandom);
    }
    
    // Default to orbital station
    return createOrbitalStation(seededRandom);
  }, [type, seed]);
  
  return (
    <group 
      ref={groupRef}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={[scale, scale, scale]}
    >
      {stationElements}
    </group>
  );
}

/**
 * Creates a classic orbital station with a rotating ring
 */
function createOrbitalStation(seededRandom: (min: number, max: number, offset?: number) => number) {
  // Space station colors
  const colors = {
    hull: 0x888899,
    panels: 0x3366cc,
    details: 0x444455,
    windows: 0x88ccff,
    energy: 0x00ffaa
  };
  
  const satelliteCount = Math.floor(seededRandom(2, 5, 100));
  const satellites = [];
  
  return (
    <>
      {/* Central hub */}
      <group>
        {/* Main cylindrical core */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1, 1, 4, 16]} />
          <meshStandardMaterial 
            color={colors.hull} 
            metalness={0.8} 
            roughness={0.3}
          />
        </mesh>
        
        {/* End caps */}
        {[-2, 2].map((y, i) => (
          <mesh key={`cap-${i}`} position={[0, y, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.2, 1.2, 0.5, 16]} />
            <meshStandardMaterial 
              color={colors.hull} 
              metalness={0.7} 
              roughness={0.4}
            />
          </mesh>
        ))}
        
        {/* Windows along the central hub */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const x = Math.cos(angle) * 1.01;
          const z = Math.sin(angle) * 1.01;
          
          return (
            <group key={`window-row-${i}`}>
              {[-1.5, -0.5, 0.5, 1.5].map((y, j) => (
                <mesh key={`window-${i}-${j}`} position={[x, y, z]} rotation={[0, Math.PI/2 - angle, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.05, 0.2, 0.4]} />
                  <meshStandardMaterial 
                    color={colors.windows} 
                    emissive={colors.windows}
                    emissiveIntensity={0.5}
                    transparent={true}
                    opacity={0.9}
                  />
                </mesh>
              ))}
            </group>
          );
        })}
        
        {/* Solar panel arrays */}
        {[-1.5, 1.5].map((y, i) => (
          <group key={`panels-${i}`} position={[0, y, 0]} rotation={[0, i * Math.PI/2, 0]}>
            {[-1, 1].map((side, j) => (
              <group key={`panel-arm-${i}-${j}`} position={[side * 1.5, 0, 0]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[0.1, 0.1, 1.5]} />
                  <meshStandardMaterial color={colors.details} />
                </mesh>
                
                <mesh position={[0, 0, 1]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
                  <boxGeometry args={[1.5, 0.05, 3]} />
                  <meshStandardMaterial 
                    color={colors.panels} 
                    metalness={0.3}
                    roughness={0.4}
                  />
                </mesh>
              </group>
            ))}
          </group>
        ))}
        
        {/* Communication dishes */}
        <mesh position={[0, 2.3, 0]} rotation={[0, 0, Math.PI/4]} castShadow receiveShadow>
          <sphereGeometry args={[0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI/2]} />
          <meshStandardMaterial 
            color={colors.details} 
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>
      
      {/* Rotating ring section */}
      <group ref={ringRef}>
        {/* Main ring */}
        <mesh castShadow receiveShadow>
          <torusGeometry args={[5, 0.8, 16, 48]} />
          <meshStandardMaterial 
            color={colors.hull} 
            metalness={0.7} 
            roughness={0.3}
          />
        </mesh>
        
        {/* Ring windows/sections */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const x = Math.cos(angle) * 5;
          const z = Math.sin(angle) * 5;
          
          return (
            <mesh 
              key={`ring-section-${i}`} 
              position={[x, 0, z]} 
              rotation={[Math.PI/2, 0, angle]}
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[1.2, 0.2, 0.9]} />
              <meshStandardMaterial 
                color={i % 4 === 0 ? colors.details : colors.hull} 
                metalness={0.7} 
                roughness={0.4}
              />
            </mesh>
          );
        })}
        
        {/* Ring support struts */}
        {Array.from({ length: 4 }).map((_, i) => {
          const angle = (i / 4) * Math.PI * 2;
          
          return (
            <mesh 
              key={`strut-${i}`} 
              rotation={[0, angle, 0]}
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[0.3, 0.2, 4]} />
              <meshStandardMaterial 
                color={colors.details} 
                metalness={0.8} 
                roughness={0.2}
              />
            </mesh>
          );
        })}
      </group>
      
      {/* Orbiting satellites */}
      {Array.from({ length: satelliteCount }).map((_, i) => {
        // Initialize with a position that will be animated
        const initialAngle = seededRandom(0, Math.PI * 2, 200 + i);
        const orbitRadius = 3 + i * 0.5;
        const initialX = Math.cos(initialAngle) * orbitRadius;
        const initialZ = Math.sin(initialAngle) * orbitRadius;
        
        return (
          <group 
            key={`satellite-${i}`}
            position={[initialX, seededRandom(-1, 1, 300 + i), initialZ]}
            ref={(el) => {
              if (el) satelliteRefs.current[i] = el;
            }}
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.5, 0.2, 0.3]} />
              <meshStandardMaterial color={colors.hull} />
            </mesh>
            
            <mesh position={[0, 0, -0.3]} castShadow receiveShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} rotation={[Math.PI/2, 0, 0]} />
              <meshStandardMaterial color={colors.details} />
            </mesh>
            
            <mesh position={[0.2, 0.3, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.4, 0.05, 0.4]} />
              <meshStandardMaterial color={colors.panels} />
            </mesh>
            
            <pointLight 
              position={[0, 0, 0.2]} 
              color={colors.energy} 
              intensity={0.5} 
              distance={1} 
            />
          </group>
        );
      })}
      
      {/* Station lights */}
      <pointLight position={[0, 0, 0]} color={colors.windows} intensity={2} distance={10} />
    </>
  );
}

/**
 * Creates a research space station with science equipment
 */
function createResearchStation(seededRandom: (min: number, max: number, offset?: number) => number) {
  const colors = {
    hull: 0xaabbcc,
    panels: 0x44aaff,
    details: 0x556677,
    windows: 0xccddff,
    energy: 0x00ffaa,
    science: 0x33ccaa
  };
  
  const satelliteCount = Math.floor(seededRandom(1, 4, 400));
  const satellites = [];
  
  return (
    <>
      {/* Central research module - spherical central hub */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial 
          color={colors.hull} 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>
      
      {/* Observatory dome */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1, 24, 24, 0, Math.PI * 2, 0, Math.PI/2]} />
        <meshStandardMaterial 
          color={colors.windows} 
          transparent={true}
          opacity={0.7}
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>
      
      {/* Research modules - arranged in a circle */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 3;
        const z = Math.sin(angle) * 3;
        
        return (
          <group key={`module-${i}`} position={[x, 0, z]} rotation={[0, -angle + Math.PI/2, 0]}>
            {/* Module body */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.8, 0.8, 2.5, 16]} rotation={[Math.PI/2, 0, 0]} />
              <meshStandardMaterial 
                color={colors.hull} 
                metalness={0.7} 
                roughness={0.3}
              />
            </mesh>
            
            {/* Module end cap */}
            <mesh position={[1.25, 0, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.8, 16, 16, 0, Math.PI/2, 0, Math.PI * 2]} rotation={[0, 0, Math.PI/2]} />
              <meshStandardMaterial 
                color={colors.hull} 
                metalness={0.7} 
                roughness={0.3}
              />
            </mesh>
            
            {/* Windows */}
            {Array.from({ length: 3 }).map((_, j) => (
              <mesh key={`module-window-${i}-${j}`} position={[0, 0.5 - j * 0.5, -0.81]} castShadow receiveShadow>
                <boxGeometry args={[0.4, 0.2, 0.05]} />
                <meshStandardMaterial 
                  color={colors.windows} 
                  emissive={colors.windows}
                  emissiveIntensity={0.5}
                  transparent={true}
                  opacity={0.9}
                />
              </mesh>
            ))}
            
            {/* Research equipment */}
            <mesh position={[0, 0.7, 0.6]} castShadow receiveShadow>
              <boxGeometry args={[0.5, 0.1, 0.5]} />
              <meshStandardMaterial color={colors.details} />
            </mesh>
            
            <mesh position={[0, 0.85, 0.6]} castShadow receiveShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
              <meshStandardMaterial color={colors.science} />
            </mesh>
          </group>
        );
      })}
      
      {/* Central connecting structure */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x1 = Math.cos(angle) * 2;
        const z1 = Math.sin(angle) * 2;
        const x2 = Math.cos(angle) * 3;
        const z2 = Math.sin(angle) * 3;
        
        return (
          <mesh 
            key={`connector-${i}`} 
            position={[(x1 + x2) / 2, 0, (z1 + z2) / 2]} 
            rotation={[0, -angle + Math.PI/2, 0]}
            castShadow 
            receiveShadow
          >
            <cylinderGeometry args={[0.2, 0.2, 1, 8]} rotation={[Math.PI/2, 0, 0]} />
            <meshStandardMaterial 
              color={colors.details} 
              metalness={0.7} 
              roughness={0.4}
            />
          </mesh>
        );
      })}
      
      {/* Large research dish */}
      <group position={[0, -2.5, 0]} rotation={[0, 0, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.2, 1.5, 8]} />
          <meshStandardMaterial color={colors.details} />
        </mesh>
        
        <mesh position={[0, 1, 0]} rotation={[Math.PI/4, 0, 0]} castShadow receiveShadow>
          <sphereGeometry args={[1.2, 24, 24, 0, Math.PI * 2, 0, Math.PI/2]} />
          <meshStandardMaterial 
            color={colors.science} 
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
      </group>
      
      {/* Solar panel arrays */}
      {Array.from({ length: 3 }).map((_, i) => {
        const angle = (i / 3) * Math.PI * 2;
        const x = Math.cos(angle) * 4;
        const z = Math.sin(angle) * 4;
        
        return (
          <group key={`panel-array-${i}`} position={[x, 0, z]} rotation={[0, -angle, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.1, 0.1, 2]} />
              <meshStandardMaterial color={colors.details} />
            </mesh>
            
            <mesh position={[0, 0, 2]} rotation={[0, Math.PI/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[3, 0.05, 1.5]} />
              <meshStandardMaterial 
                color={colors.panels} 
                metalness={0.4}
                roughness={0.3}
              />
            </mesh>
          </group>
        );
      })}
      
      {/* Research satellites */}
      {Array.from({ length: satelliteCount }).map((_, i) => {
        // Initialize with a position that will be animated
        const initialAngle = seededRandom(0, Math.PI * 2, 500 + i);
        const orbitRadius = 4 + i * 0.7;
        const initialX = Math.cos(initialAngle) * orbitRadius;
        const initialZ = Math.sin(initialAngle) * orbitRadius;
        
        return (
          <group 
            key={`satellite-${i}`}
            position={[initialX, seededRandom(-1, 1, 600 + i), initialZ]}
            ref={(el) => {
              if (el) satelliteRefs.current[i] = el;
            }}
          >
            {/* Scientific satellite with sensors */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.6, 0.3, 0.6]} />
              <meshStandardMaterial color={colors.hull} />
            </mesh>
            
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.4, 8]} />
              <meshStandardMaterial color={colors.details} />
            </mesh>
            
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color={colors.science} />
            </mesh>
            
            <mesh position={[0, 0, 0.5]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.1, 0.3, 8]} />
              <meshStandardMaterial color={colors.details} />
            </mesh>
            
            <mesh position={[0.3, -0.1, 0]} rotation={[0, 0, Math.PI/4]} castShadow receiveShadow>
              <boxGeometry args={[0.6, 0.05, 0.3]} />
              <meshStandardMaterial color={colors.panels} />
            </mesh>
            
            <pointLight 
              position={[0, 0.5, 0]} 
              color={colors.science} 
              intensity={0.5} 
              distance={1} 
            />
          </group>
        );
      })}
      
      {/* Station lights */}
      <pointLight position={[0, 0, 0]} color={colors.windows} intensity={2} distance={15} />
    </>
  );
}

/**
 * Creates a military space station with defensive features
 */
function createMilitaryStation(seededRandom: (min: number, max: number, offset?: number) => number) {
  const colors = {
    hull: 0x445566,
    armor: 0x333344,
    details: 0x222233,
    windows: 0x88aadd,
    energy: 0xff3333,
    weapon: 0xdd3322
  };
  
  const satelliteCount = Math.floor(seededRandom(3, 6, 700));
  
  return (
    <>
      {/* Central command module - angular and armored */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 2, 4]} />
        <meshStandardMaterial 
          color={colors.hull} 
          metalness={0.8} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Armor plating */}
      {Array.from({ length: 6 }).map((_, i) => {
        // Position armor plates around the central module
        let position: [number, number, number];
        let rotation: [number, number, number] = [0, 0, 0];
        let dimensions: [number, number, number];
        
        if (i === 0) {
          position = [0, 1.5, 0]; // Top
          dimensions = [4.5, 0.5, 4.5];
        } else if (i === 1) {
          position = [0, -1.5, 0]; // Bottom
          dimensions = [4.5, 0.5, 4.5];
        } else if (i === 2) {
          position = [2.5, 0, 0]; // Right
          dimensions = [0.5, 2.5, 4.5];
        } else if (i === 3) {
          position = [-2.5, 0, 0]; // Left
          dimensions = [0.5, 2.5, 4.5];
        } else if (i === 4) {
          position = [0, 0, 2.5]; // Front
          dimensions = [4.5, 2.5, 0.5];
        } else {
          position = [0, 0, -2.5]; // Back
          dimensions = [4.5, 2.5, 0.5];
        }
        
        return (
          <mesh 
            key={`armor-${i}`} 
            position={position} 
            rotation={new THREE.Euler(...rotation)}
            castShadow 
            receiveShadow
          >
            <boxGeometry args={dimensions} />
            <meshStandardMaterial 
              color={colors.armor} 
              metalness={0.9} 
              roughness={0.4}
            />
          </mesh>
        );
      })}
      
      {/* Command center windows - armored viewing ports */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 2;
        const z = Math.sin(angle) * 2;
        
        return (
          <mesh 
            key={`window-${i}`} 
            position={[x, 0.7, z]} 
            rotation={[0, -angle, 0]}
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[0.5, 0.3, 0.1]} />
            <meshStandardMaterial 
              color={colors.windows} 
              emissive={colors.windows}
              emissiveIntensity={0.3}
              transparent={true}
              opacity={0.8}
            />
          </mesh>
        );
      })}
      
      {/* Defense turrets */}
      {Array.from({ length: 4 }).map((_, i) => {
        // Position turrets at the corners
        const x = i % 2 === 0 ? 2 : -2;
        const z = i < 2 ? 2 : -2;
        
        return (
          <group key={`turret-${i}`} position={[x, 1.5, z]}>
            {/* Turret base */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.4, 0.5, 0.3, 8]} />
              <meshStandardMaterial 
                color={colors.details} 
                metalness={0.9} 
                roughness={0.2}
              />
            </mesh>
            
            {/* Turret body */}
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial 
                color={colors.details} 
                metalness={0.8} 
                roughness={0.3}
              />
            </mesh>
            
            {/* Turret guns */}
            {[-0.15, 0.15].map((offset, j) => (
              <mesh 
                key={`gun-${i}-${j}`} 
                position={[offset, 0.3, 0.4]} 
                castShadow 
                receiveShadow
              >
                <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} rotation={[Math.PI/2, 0, 0]} />
                <meshStandardMaterial 
                  color={colors.weapon} 
                  metalness={0.9} 
                  roughness={0.1}
                />
              </mesh>
            ))}
            
            {/* Muzzle glow */}
            <pointLight 
              position={[0, 0.3, 0.7]} 
              color={colors.energy} 
              intensity={0.3} 
              distance={1} 
            />
          </group>
        );
      })}
      
      {/* Defensive arrays/sensors */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * 3;
        const z = Math.sin(angle) * 3;
        
        return (
          <group key={`array-${i}`} position={[x, -1, z]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.3, 1.5, 8]} />
              <meshStandardMaterial color={colors.details} />
            </mesh>
            
            <mesh position={[0, 1, 0]} rotation={[Math.PI/4, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1, 0.1, 1]} />
              <meshStandardMaterial 
                color={colors.details} 
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            
            <mesh position={[0, 1.2, 0.2]} castShadow receiveShadow>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial 
                color={colors.weapon}
                emissive={colors.energy}
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        );
      })}
      
      {/* Patrol fighters */}
      {Array.from({ length: satelliteCount }).map((_, i) => {
        // Initialize with a position that will be animated
        const initialAngle = seededRandom(0, Math.PI * 2, 800 + i);
        const orbitRadius = 5 + i * 0.5;
        const initialX = Math.cos(initialAngle) * orbitRadius;
        const initialZ = Math.sin(initialAngle) * orbitRadius;
        
        return (
          <group 
            key={`fighter-${i}`}
            position={[initialX, seededRandom(-2, 2, 900 + i), initialZ]}
            ref={(el) => {
              if (el) satelliteRefs.current[i] = el;
            }}
          >
            {/* Fighter body */}
            <mesh castShadow receiveShadow>
              <coneGeometry args={[0.2, 0.7, 4]} rotation={[Math.PI / 2, 0, Math.PI / 4]} />
              <meshStandardMaterial color={colors.armor} />
            </mesh>
            
            {/* Fighter wings */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]} castShadow receiveShadow>
              <boxGeometry args={[0.05, 0.8, 0.3]} />
              <meshStandardMaterial color={colors.hull} />
            </mesh>
            
            {/* Engine glow */}
            <pointLight 
              position={[0, 0, -0.4]} 
              color={colors.energy} 
              intensity={0.7} 
              distance={1} 
            />
          </group>
        );
      })}
      
      {/* Station lights */}
      <pointLight position={[0, 0, 0]} color={colors.windows} intensity={1.5} distance={10} />
    </>
  );
}

/**
 * Creates a trading hub space station with docking bays
 */
function createTradingStation(seededRandom: (min: number, max: number, offset?: number) => number) {
  const colors = {
    hull: 0xaaaaaa,
    accent: 0x55aaff,
    details: 0x666666,
    windows: 0xffddaa,
    energy: 0xffaa33,
    landing: 0x22cc44
  };
  
  const satelliteCount = Math.floor(seededRandom(4, 8, 1000));
  const dockerSection = Math.floor(seededRandom(0, 4, 1100));
  
  return (
    <>
      {/* Central hub - larger commercial center */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[3, 3, 2, 8]} />
        <meshStandardMaterial 
          color={colors.hull} 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>
      
      {/* Upper and lower caps */}
      {[-1.2, 1.2].map((y, i) => (
        <mesh key={`cap-${i}`} position={[0, y, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.2, 3.2, 0.4, 8]} />
          <meshStandardMaterial 
            color={colors.details} 
            metalness={0.7} 
            roughness={0.3}
          />
        </mesh>
      ))}
      
      {/* Windows around the central hub - storefronts */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const x = Math.cos(angle) * 3;
        const z = Math.sin(angle) * 3;
        
        return (
          <mesh 
            key={`window-${i}`} 
            position={[x, 0, z]} 
            rotation={[0, -angle, 0]}
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[0.1, 1, 0.8]} />
            <meshStandardMaterial 
              color={colors.windows} 
              emissive={colors.windows}
              emissiveIntensity={0.3}
              transparent={true}
              opacity={0.9}
            />
          </mesh>
        );
      })}
      
      {/* Docking arms extending from center - 4 main arms */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        const armX = Math.cos(angle) * 5;
        const armZ = Math.sin(angle) * 5;
        
        return (
          <group key={`arm-${i}`}>
            {/* Connection arm */}
            <mesh 
              position={[armX / 2, 0, armZ / 2]} 
              rotation={[0, -angle, 0]}
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[4, 0.8, 1]} />
              <meshStandardMaterial 
                color={colors.hull} 
                metalness={0.7} 
                roughness={0.3}
              />
            </mesh>
            
            {/* Docking section at end of arm */}
            <group position={[armX, 0, armZ]}>
              <mesh castShadow receiveShadow>
                <cylinderGeometry args={[1.5, 1.5, 1.5, 8]} />
                <meshStandardMaterial 
                  color={i === dockerSection ? colors.accent : colors.hull} 
                  metalness={0.6} 
                  roughness={0.4}
                />
              </mesh>
              
              {/* Docking bay entrance */}
              <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, -angle]} castShadow receiveShadow>
                <cylinderGeometry args={[0.8, 0.8, 1.5, 16]} />
                <meshStandardMaterial 
                  color={0x000000}
                  transparent={true}
                  opacity={0.8}
                />
              </mesh>
              
              {/* Bay indicator lights */}
              {Array.from({ length: 8 }).map((_, j) => {
                const lightAngle = (j / 8) * Math.PI * 2;
                const lightX = Math.cos(lightAngle) * 1.2;
                const lightZ = Math.sin(lightAngle) * 1.2;
                
                return (
                  <mesh 
                    key={`light-${i}-${j}`} 
                    position={[lightX, 0, lightZ]} 
                    rotation={[0, -lightAngle, 0]}
                    castShadow 
                    receiveShadow
                  >
                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                    <meshStandardMaterial 
                      color={i === dockerSection ? colors.landing : colors.energy} 
                      emissive={i === dockerSection ? colors.landing : colors.energy}
                      emissiveIntensity={0.8}
                    />
                  </mesh>
                );
              })}
              
              {/* Landing guidance lights */}
              <pointLight 
                position={[0, 0, 0]} 
                color={i === dockerSection ? colors.landing : colors.energy} 
                intensity={1} 
                distance={3} 
              />
            </group>
          </group>
        );
      })}
      
      {/* Trading vessels/freighters */}
      {Array.from({ length: satelliteCount }).map((_, i) => {
        // Initialize with a position that will be animated
        const initialAngle = seededRandom(0, Math.PI * 2, 1200 + i);
        const orbitRadius = 7 + i * 0.6;
        const initialX = Math.cos(initialAngle) * orbitRadius;
        const initialZ = Math.sin(initialAngle) * orbitRadius;
        
        // Different types of trading vessels
        const shipType = Math.floor(seededRandom(0, 3, 1300 + i));
        
        return (
          <group 
            key={`ship-${i}`}
            position={[initialX, seededRandom(-1, 1, 1400 + i), initialZ]}
            ref={(el) => {
              if (el) satelliteRefs.current[i] = el;
            }}
          >
            {/* Ship variations */}
            {shipType === 0 ? (
              // Cargo freighter
              <>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[1, 0.4, 0.6]} />
                  <meshStandardMaterial color={colors.hull} />
                </mesh>
                
                <mesh position={[0.6, 0, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.2, 0.3, 0.4]} />
                  <meshStandardMaterial color={colors.details} />
                </mesh>
                
                <mesh position={[-0.3, 0.3, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.4, 0.2, 0.4]} />
                  <meshStandardMaterial color={colors.accent} />
                </mesh>
              </>
            ) : shipType === 1 ? (
              // Passenger liner
              <>
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[0.2, 0.2, 1.2, 8]} rotation={[Math.PI/2, 0, 0]} />
                  <meshStandardMaterial color={colors.hull} />
                </mesh>
                
                <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.8, 0.1, 0.3]} />
                  <meshStandardMaterial color={colors.accent} />
                </mesh>
                
                <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI/2]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.1, 0.05, 0.3, 8]} />
                  <meshStandardMaterial color={colors.details} />
                </mesh>
              </>
            ) : (
              // Mining vessel
              <>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[0.6, 0.4, 0.5]} />
                  <meshStandardMaterial color={colors.hull} />
                </mesh>
                
                <mesh position={[0.4, -0.1, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.1, 0.2, 0.4, 8]} rotation={[0, 0, Math.PI/2]} />
                  <meshStandardMaterial color={colors.details} />
                </mesh>
                
                <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.3, 0.2, 0.3]} />
                  <meshStandardMaterial color={colors.accent} />
                </mesh>
              </>
            )}
            
            {/* Engine glow */}
            <pointLight 
              position={[-0.6, 0, 0]} 
              color={colors.energy} 
              intensity={0.5} 
              distance={1} 
            />
          </group>
        );
      })}
      
      {/* Station lights */}
      <pointLight position={[0, 0, 0]} color={colors.windows} intensity={2} distance={15} />
    </>
  );
}

/**
 * Creates a wormhole gate structure
 */
function createWormholeGate(seededRandom: (min: number, max: number, offset?: number) => number) {
  const colors = {
    hull: 0x444455,
    energy: 0x8800ff,
    details: 0x333344,
    windows: 0xaaddff,
    wormhole: 0x6600ff,
    stabilizer: 0x00ddff
  };
  
  const satelliteCount = Math.floor(seededRandom(2, 4, 1500));
  
  return (
    <>
      {/* Gate ring structure */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[6, 1, 24, 36]} />
        <meshStandardMaterial 
          color={colors.hull} 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Wormhole event horizon effect */}
      <mesh>
        <ringGeometry args={[1, 5, 36]} />
        <meshBasicMaterial 
          color={colors.wormhole}
          transparent={true}
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Energy conduits around the ring */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * 6;
        const y = Math.sin(angle) * 6;
        
        return (
          <mesh 
            key={`conduit-${i}`} 
            position={[x, y, 0]} 
            rotation={[0, 0, angle + Math.PI/2]}
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[1, 0.3, 0.5]} />
            <meshStandardMaterial 
              color={colors.details} 
              metalness={0.9} 
              roughness={0.1}
            />
          </mesh>
        );
      })}
      
      {/* Energy emitters pointing at the wormhole */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 6;
        const y = Math.sin(angle) * 6;
        
        return (
          <group key={`emitter-${i}`} position={[x, y, 0]} rotation={[0, 0, angle + Math.PI/2]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.4, 0.8, 8]} rotation={[Math.PI/2, 0, 0]} />
              <meshStandardMaterial 
                color={colors.details} 
                metalness={0.8} 
                roughness={0.2}
              />
            </mesh>
            
            <mesh position={[0, 0, 0.5]} castShadow receiveShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.3, 8]} rotation={[Math.PI/2, 0, 0]} />
              <meshStandardMaterial 
                color={colors.stabilizer} 
                emissive={colors.stabilizer}
                emissiveIntensity={0.5}
              />
            </mesh>
            
            {/* Energy beam pointing at wormhole center */}
            <mesh position={[0, 0, -2.5]} castShadow>
              <cylinderGeometry args={[0.1, 0.05, 5, 8]} rotation={[Math.PI/2, 0, 0]} />
              <meshBasicMaterial 
                color={colors.stabilizer}
                transparent={true}
                opacity={0.7}
              />
            </mesh>
            
            <pointLight 
              position={[0, 0, 0.5]} 
              color={colors.stabilizer} 
              intensity={1} 
              distance={3} 
            />
          </group>
        );
      })}
      
      {/* Control stations at cardinal points */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * 8;
        const y = Math.sin(angle) * 8;
        
        return (
          <group key={`station-${i}`} position={[x, y, 0]} rotation={[0, 0, angle + Math.PI/2]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2, 1, 1.5]} />
              <meshStandardMaterial 
                color={colors.hull} 
                metalness={0.7} 
                roughness={0.3}
              />
            </mesh>
            
            <mesh position={[0, 0, 0.8]} castShadow receiveShadow>
              <boxGeometry args={[1.5, 0.7, 0.1]} />
              <meshStandardMaterial 
                color={colors.windows} 
                emissive={colors.windows}
                emissiveIntensity={0.3}
                transparent={true}
                opacity={0.7}
              />
            </mesh>
            
            <mesh position={[-1.2, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.2, 2, 8]} rotation={[0, 0, Math.PI/2]} />
              <meshStandardMaterial color={colors.details} />
            </mesh>
            
            <mesh position={[-2.2, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.4, 0.8, 1.2]} />
              <meshStandardMaterial color={colors.details} />
            </mesh>
            
            <pointLight 
              position={[0, 0, 1]} 
              color={colors.windows} 
              intensity={0.5} 
              distance={2} 
            />
          </group>
        );
      })}
      
      {/* Central wormhole light */}
      <pointLight 
        position={[0, 0, 0]} 
        color={colors.wormhole} 
        intensity={3} 
        distance={20} 
      />
      
      {/* Monitoring satellites */}
      {Array.from({ length: satelliteCount }).map((_, i) => {
        // Initialize with a position that will be animated
        const initialAngle = seededRandom(0, Math.PI * 2, 1600 + i);
        const orbitRadius = 10 + i * 0.5;
        const initialX = Math.cos(initialAngle) * orbitRadius;
        const initialY = Math.sin(initialAngle) * orbitRadius;
        
        return (
          <group 
            key={`satellite-${i}`}
            position={[initialX, initialY, seededRandom(-1, 1, 1700 + i)]}
            ref={(el) => {
              if (el) satelliteRefs.current[i] = el;
            }}
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.7, 0.3, 0.4]} />
              <meshStandardMaterial color={colors.hull} />
            </mesh>
            
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
              <meshStandardMaterial color={colors.details} />
            </mesh>
            
            <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial 
                color={colors.stabilizer}
                emissive={colors.stabilizer}
                emissiveIntensity={0.5}
              />
            </mesh>
            
            <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI/4]} castShadow receiveShadow>
              <boxGeometry args={[0.5, 0.05, 0.4]} />
              <meshStandardMaterial color={colors.details} />
            </mesh>
            
            <pointLight 
              position={[0, 0.6, 0]} 
              color={colors.stabilizer} 
              intensity={0.5} 
              distance={1} 
            />
          </group>
        );
      })}
    </>
  );
}