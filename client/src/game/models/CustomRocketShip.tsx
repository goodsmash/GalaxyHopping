import * as THREE from 'three';
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * A detailed 3D rocket ship model created procedurally with Three.js geometry
 */
export function CustomRocketShip({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = 0x3366cc,
  engineActive = true
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: number | string;
  engineActive?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const engineGlowRef = useRef<THREE.Mesh>(null);
  const engineLightRef = useRef<THREE.PointLight>(null);
  
  // Animate the engine glow and thruster effects when active
  useFrame((_, delta) => {
    if (engineActive && engineGlowRef.current) {
      // Pulse the engine glow opacity for a more realistic effect
      engineGlowRef.current.material.opacity = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
      
      // Vary the engine light intensity slightly
      if (engineLightRef.current) {
        engineLightRef.current.intensity = 2 + Math.sin(Date.now() * 0.01) * 0.5;
      }
    } else if (engineGlowRef.current) {
      // When engines are off, reduce opacity
      engineGlowRef.current.material.opacity = 0.1;
      
      if (engineLightRef.current) {
        engineLightRef.current.intensity = 0.2;
      }
    }
    
    // Optional: Add slight hover movement when idle
    if (groupRef.current) {
      groupRef.current.position.y += Math.sin(Date.now() * 0.002) * 0.001;
    }
  });
  
  // Convert color prop to THREE.Color
  const shipColor = new THREE.Color(color);
  
  return (
    <group 
      ref={groupRef}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={[scale, scale, scale]}
    >
      {/* Main rocket body - cylindrical hull */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.7, 2.5, 16]} />
        <meshStandardMaterial 
          color={shipColor} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* Nose cone */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.5, 1, 16]} />
        <meshStandardMaterial 
          color={shipColor} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* Cockpit window */}
      <mesh position={[0, 0.8, 0.4]} rotation={[0.3, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color={0x88ccff} 
          transparent={true} 
          opacity={0.9}
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>
      
      {/* Engine housing */}
      <mesh position={[0, -1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.8, 0.5, 16]} />
        <meshStandardMaterial 
          color={0x333333} 
          metalness={0.9} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Engine nozzle */}
      <mesh position={[0, -1.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.4, 0.6, 16]} />
        <meshStandardMaterial 
          color={0x666666} 
          metalness={0.9} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Fins - 3 stabilizing fins around the body */}
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <mesh 
            key={`fin-${i}`}
            position={[
              Math.cos(angle) * 0.7,
              -1.0, 
              Math.sin(angle) * 0.7
            ]} 
            rotation={[0, -angle, 0]}
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[0.1, 1.2, 0.6]} />
            <meshStandardMaterial 
              color={shipColor} 
              metalness={0.8} 
              roughness={0.2}
            />
          </mesh>
        );
      })}
      
      {/* Side thrusters */}
      {[-1, 1].map((side) => (
        <group key={`thruster-${side}`} position={[side * 0.6, -0.2, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.6, 8]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial 
              color={0x444444} 
              metalness={0.9} 
              roughness={0.3}
            />
          </mesh>
          <mesh position={[side * 0.3, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.08, 0.2, 8]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial 
              color={0x222222} 
              metalness={0.9} 
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}
      
      {/* Fuel tanks */}
      {[-1, 1].map((side) => (
        <mesh
          key={`tank-${side}`}
          position={[side * 0.4, 0, -0.3]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.2, 0.2, 1.8, 12]} />
          <meshStandardMaterial 
            color={0x999999} 
            metalness={0.8} 
            roughness={0.3}
          />
        </mesh>
      ))}
      
      {/* Engine glow effect */}
      <mesh 
        ref={engineGlowRef}
        position={[0, -2.2, 0]}
      >
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial 
          color={0x00aaff} 
          transparent={true} 
          opacity={engineActive ? 0.7 : 0.1}
        />
      </mesh>
      
      {/* Engine light */}
      <pointLight
        ref={engineLightRef}
        position={[0, -2.2, 0]}
        color={0x00aaff}
        intensity={engineActive ? 2 : 0.2}
        distance={10}
        decay={2}
      />
      
      {/* Small details: antennas, sensors, etc. */}
      <mesh position={[0.3, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
        <meshStandardMaterial color={0x888888} />
      </mesh>
      
      <mesh position={[-0.3, 1.0, 0.2]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color={0x222222} />
      </mesh>
      
      <mesh position={[0, 0.2, 0.7]} castShadow>
        <boxGeometry args={[0.3, 0.06, 0.06]} />
        <meshStandardMaterial color={0xbb0000} />
      </mesh>
      
      {/* Animated engine thrust (visible only when engine is active) */}
      {engineActive && (
        <>
          <mesh position={[0, -2.4, 0]}>
            <coneGeometry args={[0.3, 1.5, 16, 1, true]} />
            <meshBasicMaterial 
              color={0x00aaff} 
              transparent={true} 
              opacity={0.3}
            />
          </mesh>
          
          {/* Smaller side thrusters */}
          {[-1, 1].map((side) => (
            <mesh 
              key={`side-thrust-${side}`} 
              position={[side * 0.6, -0.2, side * 0.2]}
              rotation={[0, 0, side * 0.4]}
            >
              <coneGeometry args={[0.08, 0.5, 8, 1, true]} />
              <meshBasicMaterial 
                color={0x00aaff} 
                transparent={true} 
                opacity={0.2}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}