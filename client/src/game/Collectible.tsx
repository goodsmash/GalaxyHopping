import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAudio } from "../lib/stores/useAudio";

type CollectibleType = 'health' | 'shield' | 'weapon' | 'speed' | 'crystal' | 'data';

interface CollectibleProps {
  type: CollectibleType;
  position: THREE.Vector3;
  playerRef: React.RefObject<THREE.Group>;
  onCollect?: (type: CollectibleType, value: number) => void;
}

// Helper function to calculate distance between two Vector3s
const distanceBetween = (a: THREE.Vector3, b: THREE.Vector3): number => {
  return a.distanceTo(b);
};

export function Collectible({ type, position, playerRef, onCollect }: CollectibleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [collected, setCollected] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const { playSound } = useAudio();
  
  // Set up materials for different collectible types
  const materials = {
    health: new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(0.9, 0.2, 0.2), 
      emissive: new THREE.Color(0.8, 0.1, 0.1),
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.2
    }),
    shield: new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(0.2, 0.2, 0.9), 
      emissive: new THREE.Color(0.1, 0.1, 0.8),
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.2
    }),
    weapon: new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(0.9, 0.6, 0.1), 
      emissive: new THREE.Color(0.8, 0.5, 0.0),
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.1
    }),
    speed: new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(0.2, 0.9, 0.2), 
      emissive: new THREE.Color(0.1, 0.8, 0.1),
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.3
    }),
    crystal: new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(0.7, 0.2, 0.9), 
      emissive: new THREE.Color(0.6, 0.1, 0.8),
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.1
    }),
    data: new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(0.2, 0.8, 0.9), 
      emissive: new THREE.Color(0.1, 0.7, 0.8),
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    }),
  };
  
  // Set up geometries for different collectible types
  const geometries = {
    health: new THREE.TorusGeometry(1, 0.4, 16, 32),
    shield: new THREE.SphereGeometry(1, 16, 16),
    weapon: new THREE.TetrahedronGeometry(1, 2),
    speed: new THREE.ConeGeometry(0.8, 2, 16),
    crystal: new THREE.OctahedronGeometry(1, 0),
    data: new THREE.BoxGeometry(1, 1, 1),
  };
  
  // Define collectible values
  const values = {
    health: 25,
    shield: 30,
    weapon: 1,
    speed: 1,
    crystal: 50,
    data: 100,
  };
  
  // Animation for the collectible
  useFrame((_, delta) => {
    if (collected || !meshRef.current) return;
    
    // Floating animation
    meshRef.current.position.y = position.y + Math.sin(Date.now() * 0.001) * 0.5;
    
    // Rotation animation
    meshRef.current.rotation.y += delta * 0.5;
    meshRef.current.rotation.x += delta * 0.2;
    
    // Animation phase for hover effect
    setAnimationPhase((prev) => (prev + delta) % (Math.PI * 2));
    
    // Hover effect
    if (hovered && meshRef.current.scale.x < 1.2) {
      meshRef.current.scale.set(
        THREE.MathUtils.lerp(meshRef.current.scale.x, 1.2, delta * 3),
        THREE.MathUtils.lerp(meshRef.current.scale.y, 1.2, delta * 3),
        THREE.MathUtils.lerp(meshRef.current.scale.z, 1.2, delta * 3)
      );
    } else if (!hovered && meshRef.current.scale.x > 1.0) {
      meshRef.current.scale.set(
        THREE.MathUtils.lerp(meshRef.current.scale.x, 1.0, delta * 3),
        THREE.MathUtils.lerp(meshRef.current.scale.y, 1.0, delta * 3),
        THREE.MathUtils.lerp(meshRef.current.scale.z, 1.0, delta * 3)
      );
    }
    
    // Check for collection
    if (playerRef.current && !collected) {
      const distance = distanceBetween(playerRef.current.position, meshRef.current.position);
      
      // If player is close enough, collect the item
      if (distance < 5) {
        setCollected(true);
        playSound(`pickup_${type}`, 0.7, false);
        if (onCollect) {
          onCollect(type, values[type]);
        }
        
        // Trigger collection animation
        if (meshRef.current) {
          // Scale up quickly then disappear
          const scale = { value: 1 };
          const targetScale = { value: 2 };
          
          // Animate scale up
          const duration = 0.5;
          const startTime = Date.now();
          
          const animate = () => {
            const now = Date.now();
            const elapsed = (now - startTime) / 1000;
            
            if (elapsed < duration && meshRef.current) {
              // Scale up
              const progress = elapsed / duration;
              const newScale = scale.value + (targetScale.value - scale.value) * progress;
              meshRef.current.scale.set(newScale, newScale, newScale);
              
              // Also fade out
              if (meshRef.current.material instanceof THREE.Material) {
                meshRef.current.material.opacity = 1 - progress;
              }
              
              requestAnimationFrame(animate);
            } else if (meshRef.current) {
              // Finished animation, make invisible
              meshRef.current.visible = false;
            }
          };
          
          animate();
        }
      }
    }
  });
  
  // Don't render if already collected
  if (collected) return null;
  
  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={geometries[type]} />
      <primitive object={materials[type]} />
      
      {/* Add a point light to make the collectible glow */}
      <pointLight
        distance={5}
        intensity={hovered ? 10 : 5}
        color={materials[type].color}
      />
    </mesh>
  );
}