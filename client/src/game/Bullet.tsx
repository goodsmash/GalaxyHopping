import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BulletProps {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  fromPlayer: boolean;
}

export function Bullet({ position, rotation, fromPlayer }: BulletProps) {
  // References for animation
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  
  // Different colors and properties based on who fired the bullet
  const bulletProperties = useMemo(() => {
    if (fromPlayer) {
      return {
        coreColor: new THREE.Color(0x00ffff),
        glowColor: new THREE.Color(0x88ffff),
        trailColor: new THREE.Color(0x00aaff),
        size: 0.25,
        trailLength: 2.5,
        intensity: 6
      };
    } else {
      return {
        coreColor: new THREE.Color(0xff3300),
        glowColor: new THREE.Color(0xff8866),
        trailColor: new THREE.Color(0xff2200),
        size: 0.35,
        trailLength: 2.0,
        intensity: 5
      };
    }
  }, [fromPlayer]);
  
  // Create bullet trail particles
  const trailParticles = useMemo(() => {
    const particleCount = 20;
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Trail extends behind the bullet
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = i * 0.1 * bulletProperties.trailLength;
      
      // Particles get smaller as they extend back
      scales[i] = 1.0 - (i / particleCount) * 0.9;
    }
    
    return { positions, scales, particleCount };
  }, [bulletProperties.trailLength]);
  
  // Custom bullet geometry for a more interesting shape
  const bulletGeometry = useMemo(() => {
    if (fromPlayer) {
      // Player bullets: sleek, energy-projectile look
      return new THREE.ConeGeometry(bulletProperties.size * 0.7, bulletProperties.size * 2, 8);
    } else {
      // Enemy bullets: more chaotic, plasma-ball look
      return new THREE.DodecahedronGeometry(bulletProperties.size, 0);
    }
  }, [fromPlayer, bulletProperties.size]);
  
  // Animation for bullet trail and rotation
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // Rotate bullet core for visual interest
    if (coreRef.current) {
      if (fromPlayer) {
        // Player bullets spin quickly forward
        coreRef.current.rotation.z += delta * 15;
      } else {
        // Enemy bullets tumble more chaotically
        coreRef.current.rotation.x += delta * 8;
        coreRef.current.rotation.y += delta * 7;
      }
    }
    
    // Animate trail particles
    if (trailRef.current && trailRef.current.geometry.attributes.position) {
      const positions = trailRef.current.geometry.attributes.position.array as Float32Array;
      
      // Simple pulsing/undulation effect for the trail
      for (let i = 0; i < trailParticles.particleCount; i++) {
        const offset = Math.sin(Date.now() * 0.01 + i * 0.5) * 0.05;
        positions[i * 3] = offset;
        positions[i * 3 + 1] = -offset;
      }
      
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <group ref={groupRef} position={position.toArray()} rotation={[rotation.x, rotation.y, rotation.z]}>
      {/* Bullet core */}
      <mesh ref={coreRef}>
        <primitive object={bulletGeometry} />
        <meshStandardMaterial 
          color={bulletProperties.coreColor} 
          emissive={bulletProperties.coreColor} 
          emissiveIntensity={2} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[bulletProperties.size * 1.5, 16, 16]} />
        <meshBasicMaterial 
          color={bulletProperties.glowColor} 
          transparent={true}
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Bullet trail */}
      <points ref={trailRef} position={[0, 0, bulletProperties.size]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={trailParticles.particleCount}
            array={trailParticles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-scale"
            count={trailParticles.particleCount}
            array={trailParticles.scales}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={bulletProperties.size * 0.5}
          color={bulletProperties.trailColor}
          transparent={true}
          opacity={0.7}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Light for dynamic lighting effects */}
      <pointLight 
        color={bulletProperties.coreColor} 
        intensity={bulletProperties.intensity} 
        distance={3} 
      />
    </group>
  );
}
