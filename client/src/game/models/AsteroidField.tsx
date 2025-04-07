import * as THREE from 'three';
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Props for a single asteroid
 */
interface AsteroidProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  rotationSpeed: [number, number, number];
  color?: number | string;
  seed: number;
}

/**
 * Props for the asteroid field
 */
interface AsteroidFieldProps {
  count?: number;
  radius?: number;
  centerPosition?: [number, number, number];
  minSize?: number;
  maxSize?: number;
  seed?: number;
}

/**
 * A single asteroid with procedurally generated geometry
 */
function Asteroid({ position, rotation, scale, rotationSpeed, color = 0x888888, seed }: AsteroidProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Generate a distorted geometry for a realistic asteroid look
  const geometry = useMemo(() => {
    // Start with an icosahedron as base shape
    const baseGeometry = new THREE.IcosahedronGeometry(1, 1);
    
    // Create a deterministic random function based on the seed
    const seededRandom = (min: number, max: number, offset = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      const rand = x - Math.floor(x); // 0-1 range
      return min + rand * (max - min);
    };
    
    // Distort vertices to create a more irregular, rocky shape
    const positionAttribute = baseGeometry.getAttribute('position');
    const positions = positionAttribute.array;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      
      // Calculate normalized direction
      const length = Math.sqrt(x * x + y * y + z * z);
      const nx = x / length;
      const ny = y / length;
      const nz = z / length;
      
      // Create multiple frequencies of noise for natural-looking bumps
      const noise = 
        0.2 * seededRandom(-1, 1, i) + 
        0.1 * seededRandom(-1, 1, i + 100) + 
        0.05 * seededRandom(-1, 1, i + 200);
      
      // Apply displacement along normal direction
      positions[i] = nx * (1 + noise);
      positions[i + 1] = ny * (1 + noise);
      positions[i + 2] = nz * (1 + noise);
    }
    
    baseGeometry.computeVertexNormals();
    return baseGeometry;
  }, [seed]);
  
  // Animate rotation for a realistic floating effect
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed[0] * delta;
      meshRef.current.rotation.y += rotationSpeed[1] * delta;
      meshRef.current.rotation.z += rotationSpeed[2] * delta;
    }
  });
  
  return (
    <mesh 
      ref={meshRef}
      geometry={geometry}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={[scale, scale, scale]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial 
        color={color} 
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

/**
 * A field of asteroids with configurable size and density
 */
export function AsteroidField({ 
  count = 50, 
  radius = 100,
  centerPosition = [0, 0, 0],
  minSize = 1,
  maxSize = 5,
  seed = 12345
}: AsteroidFieldProps) {
  // Generate asteroid configurations
  const asteroids = useMemo(() => {
    const asteroidConfigs: AsteroidProps[] = [];
    
    // Create a deterministic random function based on the seed
    const seededRandom = (min: number, max: number, offset = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      const rand = x - Math.floor(x); // 0-1 range
      return min + rand * (max - min);
    };
    
    for (let i = 0; i < count; i++) {
      // Generate position within spherical volume
      const theta = seededRandom(0, Math.PI * 2, i * 10);
      const phi = Math.acos(2 * seededRandom(0, 1, i * 20) - 1);
      // Use cube root for more uniform distribution of asteroids in 3D space
      const r = radius * Math.cbrt(seededRandom(0, 1, i * 30)); 
      
      const x = r * Math.sin(phi) * Math.cos(theta) + centerPosition[0];
      const y = r * Math.sin(phi) * Math.sin(theta) + centerPosition[1];
      const z = r * Math.cos(phi) + centerPosition[2];
      
      // Generate size - use power distribution to have more small asteroids than large ones
      const sizeFactor = Math.pow(seededRandom(0, 1, i * 40), 2);
      const size = minSize + sizeFactor * (maxSize - minSize);
      
      // Generate random initial rotation
      const rotX = seededRandom(0, Math.PI * 2, i * 50);
      const rotY = seededRandom(0, Math.PI * 2, i * 60);
      const rotZ = seededRandom(0, Math.PI * 2, i * 70);
      
      // Generate rotation speeds - smaller asteroids rotate faster
      const speedFactor = 1 / size; // Inverse relationship with size
      const rotSpeedX = seededRandom(-0.2, 0.2, i * 80) * speedFactor;
      const rotSpeedY = seededRandom(-0.2, 0.2, i * 90) * speedFactor;
      const rotSpeedZ = seededRandom(-0.2, 0.2, i * 100) * speedFactor;
      
      // Generate color variations (gray with slight tint)
      const r = seededRandom(0.4, 0.6, i * 110);
      const g = seededRandom(0.4, 0.6, i * 120);
      const b = seededRandom(0.4, 0.6, i * 130);
      const color = new THREE.Color(r, g, b);
      
      asteroidConfigs.push({
        position: [x, y, z],
        rotation: [rotX, rotY, rotZ],
        scale: size,
        rotationSpeed: [rotSpeedX, rotSpeedY, rotSpeedZ],
        color,
        seed: seed + i * 1000 // Different seed for each asteroid
      });
    }
    
    return asteroidConfigs;
  }, [count, radius, centerPosition, minSize, maxSize, seed]);
  
  return (
    <group>
      {asteroids.map((props, index) => (
        <Asteroid key={`asteroid-${index}`} {...props} />
      ))}
    </group>
  );
}