import { useEffect, useRef, useState, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { VehicleType } from "../types";

// Preload all models
useGLTF.preload('/models/standard_ship.glb');
useGLTF.preload('/models/scout_ship.glb');
useGLTF.preload('/models/heavy_ship.glb');
useGLTF.preload('/models/explorer_ship.glb');
useGLTF.preload('/models/stealth_ship.glb');

interface ShipModelProps {
  vehicleType: VehicleType;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function ShipModel({ 
  vehicleType = 'standard', 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = 2.5
}: ShipModelProps) {
  const modelRef = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Map vehicle type to model path
  const modelPath = `/models/${vehicleType}_ship.glb`;
  
  // Load the model
  const { scene: model } = useGLTF(modelPath) as GLTF & {
    scene: THREE.Group
  };
  
  // Update loading state
  useEffect(() => {
    if (model) {
      console.log(`Loaded ${vehicleType} ship model from ${modelPath}`);
      setModelLoaded(true);
      
      // Apply materials and setup
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Enable shadows
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Ensure materials are properly configured
          if (child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            material.needsUpdate = true;
          }
        }
      });
    }
  }, [model, vehicleType, modelPath]);
  
  // Add engine effects and animations
  useFrame((state, delta) => {
    if (modelRef.current) {
      // Apply gentle floating animation
      modelRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.005;
      
      // Apply gentle rotation for showcase
      if (rotation[1] === 0) {
        modelRef.current.rotation.y += delta * 0.2;
      }
    }
  });
  
  return (
    <group 
      ref={modelRef} 
      position={new THREE.Vector3(...position)} 
      rotation={new THREE.Euler(...rotation)} 
      scale={[scale, scale, scale]}
    >
      {modelLoaded ? (
        <Suspense fallback={
          <mesh castShadow>
            <boxGeometry args={[1, 0.5, 2]} />
            <meshStandardMaterial color="#AAAAAA" />
          </mesh>
        }>
          <primitive object={model.clone()} />
        </Suspense>
      ) : (
        <mesh castShadow>
          <boxGeometry args={[1, 0.5, 2]} />
          <meshStandardMaterial color="#AAAAAA" />
        </mesh>
      )}
    </group>
  );
}