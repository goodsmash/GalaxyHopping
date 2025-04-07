import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { LensFlare } from './LensFlare';

interface GalaxyProps {
  currentGalaxy: number;
}

export function SimpleGalaxy({ currentGalaxy }: GalaxyProps) {
  console.log("SimpleGalaxy component rendering for galaxy:", currentGalaxy);
  
  // References for animated elements
  const galaxyGroupRef = useRef<THREE.Group>(null);
  
  // Clean up animation frame on unmount
  useEffect(() => {
    console.log("SimpleGalaxy initialized");
    return () => {
      console.log("SimpleGalaxy component unmounting");
    };
  }, []);

  // Simple rotation animation
  useFrame((_, delta) => {
    if (galaxyGroupRef.current) {
      galaxyGroupRef.current.rotation.y += delta * 0.05;
    }
  });

  // Generate stars procedurally
  const starCount = 1000;
  const stars: THREE.Vector3[] = [];
  const starColors: THREE.Color[] = [];
  
  for (let i = 0; i < starCount; i++) {
    // Create stars in a disk shape for the galaxy
    const radius = Math.random() * 100;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = (Math.random() - 0.5) * 20; // Thin disk
    const z = Math.sin(angle) * radius;
    
    stars.push(new THREE.Vector3(x, y, z));
    
    // Make stars different colors
    const hue = Math.random();
    const saturation = 0.5 + Math.random() * 0.5;
    const lightness = 0.5 + Math.random() * 0.5;
    starColors.push(new THREE.Color().setHSL(hue, saturation, lightness));
  }

  // Return a simple galaxy scene for better performance
  return (
    <group ref={galaxyGroupRef}>
      {/* Central light source */}
      <LensFlare 
        position={[0, 0, 0]}
        color={new THREE.Color(1, 0.8, 0.5)}
        size={40}
        intensity={2}
      />
      
      {/* Star particles */}
      {stars.map((position, i) => (
        <mesh key={`star-${i}`} position={position}>
          <sphereGeometry args={[0.2 + Math.random() * 0.3, 8, 8]} />
          <meshBasicMaterial color={starColors[i]} />
        </mesh>
      ))}
      
      {/* Ambient light */}
      <ambientLight intensity={0.2} />
      
      {/* Galaxy ID text */}
      <group position={[0, 30, 0]}>
        <mesh>
          <boxGeometry args={[20, 5, 1]} />
          <meshStandardMaterial color="blue" />
        </mesh>
        <pointLight position={[0, 10, 10]} intensity={1} />
      </group>
    </group>
  );
}