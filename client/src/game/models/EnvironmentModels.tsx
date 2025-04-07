import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

// Preload all models for better performance
useGLTF.preload('/models/space_station.glb');
useGLTF.preload('/models/gas_giant_planet.glb');
useGLTF.preload('/models/asteroid_cluster.glb');
useGLTF.preload('/models/wormhole_portal.glb');
useGLTF.preload('/models/weapon_powerup.glb');
useGLTF.preload('/models/alien_enemy_ship.glb');

interface ModelWrapperProps {
  modelPath: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  animate?: boolean;
  animationSpeed?: number;
  onClick?: () => void;
}

export function ModelWrapper({
  modelPath,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  animate = false,
  animationSpeed = 0.005,
  onClick
}: ModelWrapperProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Load the 3D model
  const { scene: model } = useGLTF(modelPath) as GLTF & {
    scene: THREE.Group
  };
  
  useEffect(() => {
    if (model) {
      // Clone the model to avoid any issues with reusing models
      const clonedModel = model.clone(true);
      
      // Apply shadows to all meshes
      clonedModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Handle any model-specific adjustments or animations here
      
      // Replace any existing model
      if (groupRef.current) {
        // Remove existing children
        while (groupRef.current.children.length > 0) {
          groupRef.current.remove(groupRef.current.children[0]);
        }
        
        // Add the new model
        groupRef.current.add(clonedModel);
        setModelLoaded(true);
      }
    }
  }, [model, modelPath]);
  
  // Apply animations if needed
  useFrame((_, delta) => {
    if (groupRef.current && animate) {
      groupRef.current.rotation.y += animationSpeed;
      
      // You can add more complex animations here
      if (modelPath.includes('wormhole_portal')) {
        // Special animation for wormhole
        groupRef.current.children.forEach(child => {
          if (child instanceof THREE.Mesh) {
            child.rotation.z += animationSpeed * 0.5;
          }
        });
      }
      
      if (modelPath.includes('weapon_powerup')) {
        // Make the powerup float up and down
        const time = Date.now() * 0.001;
        groupRef.current.position.y = position[1] + Math.sin(time * 2) * 0.1;
      }
    }
  });
  
  const scaleValue = Array.isArray(scale) ? scale : [scale, scale, scale];
  
  return (
    <group 
      ref={groupRef}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={new THREE.Vector3(...scaleValue)}
      onClick={onClick}
    >
      {!modelLoaded && (
        // Fallback while loading
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#AAAAAA" wireframe />
        </mesh>
      )}
    </group>
  );
}

// Specialized components for specific models
export function SpaceStation(props: Omit<ModelWrapperProps, 'modelPath'>) {
  return <ModelWrapper modelPath="/models/space_station.glb" animate {...props} />;
}

export function GasGiantPlanet(props: Omit<ModelWrapperProps, 'modelPath'>) {
  return <ModelWrapper modelPath="/models/gas_giant_planet.glb" animate animationSpeed={0.001} {...props} />;
}

export function AsteroidCluster(props: Omit<ModelWrapperProps, 'modelPath'>) {
  return <ModelWrapper modelPath="/models/asteroid_cluster.glb" animate animationSpeed={0.002} {...props} />;
}

export function WormholePortal(props: Omit<ModelWrapperProps, 'modelPath'>) {
  return <ModelWrapper modelPath="/models/wormhole_portal.glb" animate animationSpeed={0.01} {...props} />;
}

export function WeaponPowerup(props: Omit<ModelWrapperProps, 'modelPath'>) {
  return <ModelWrapper modelPath="/models/weapon_powerup.glb" animate animationSpeed={0.015} {...props} />;
}

export function AlienEnemyShip(props: Omit<ModelWrapperProps, 'modelPath'>) {
  return <ModelWrapper modelPath="/models/alien_enemy_ship.glb" animate animationSpeed={0.003} {...props} />;
}