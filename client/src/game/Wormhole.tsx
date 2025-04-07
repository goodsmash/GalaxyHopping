import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

interface WormholeProps {
  position: THREE.Vector3;
  connectsTo: number | undefined;
  radius?: number;
  intensity?: number;
  onEnter?: (targetGalaxy: number) => void;
}

export function Wormhole({ 
  position, 
  connectsTo, 
  radius = 10, 
  intensity = 1.5,
  onEnter 
}: WormholeProps) {
  const group = useRef<THREE.Group>(null);
  const torus = useRef<THREE.Mesh>(null);
  const innerSphere = useRef<THREE.Mesh>(null);
  const outerSphere = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  const [active, setActive] = useState(false);
  const [time, setTime] = useState(0);
  
  // Materials
  const wormholeMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.2, 0.0, 0.5),
    emissive: new THREE.Color(0.4, 0.0, 1.0),
    emissiveIntensity: intensity,
    metalness: 1.0,
    roughness: 0.3,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });
  
  const innerMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.0, 0.0, 0.0),
    emissive: new THREE.Color(0.2, 0.0, 0.5),
    emissiveIntensity: intensity * 2,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  
  const outerMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.1, 0.0, 0.3),
    emissive: new THREE.Color(0.3, 0.0, 0.7),
    emissiveIntensity: intensity,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  
  // Create particle system for the wormhole effect
  useEffect(() => {
    if (!particlesRef.current) return;
    
    const particleCount = 2000;
    const particles = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Position particles in a spiral shape
      const angle = Math.random() * Math.PI * 2;
      const radiusVariance = Math.random() * radius * 0.5;
      const distance = (radius * 0.3) + radiusVariance;
      
      // Spiral shape
      const t = i / particleCount;
      const spiralRadius = distance * (1 - t * 0.5); // Radius decreases toward center
      const spiralZ = (t * 2 - 1) * radius * 0.5; // Z ranges from -radius/2 to radius/2
      
      particles[i * 3] = Math.cos(angle * (1 + t * 5)) * spiralRadius;
      particles[i * 3 + 1] = Math.sin(angle * (1 + t * 5)) * spiralRadius;
      particles[i * 3 + 2] = spiralZ;
      
      // Purple-blue gradient color with random variation
      const hue = 0.7 + Math.random() * 0.1; // Purple-blue range
      const saturation = 0.8 + Math.random() * 0.2;
      const lightness = 0.6 + Math.random() * 0.4;
      
      const color = new THREE.Color().setHSL(hue, saturation, lightness);
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
      
      // Size varies with distance from center
      sizes[i] = 0.5 + Math.random() * 2.0;
    }
    
    if (particlesRef.current.geometry instanceof THREE.BufferGeometry) {
      particlesRef.current.geometry.setAttribute(
        'position', 
        new THREE.BufferAttribute(particles, 3)
      );
      particlesRef.current.geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(particleColors, 3)
      );
      particlesRef.current.geometry.setAttribute(
        'size',
        new THREE.BufferAttribute(sizes, 1)
      );
    }
  }, [radius]);
  
  // Animation for the wormhole
  useFrame((state, delta) => {
    if (!group.current || !torus.current || !innerSphere.current || !outerSphere.current || !particlesRef.current) return;
    
    // Update time
    setTime(prevTime => prevTime + delta);
    
    // Rotate the entire wormhole
    group.current.rotation.z += delta * 0.2;
    group.current.rotation.y += delta * 0.1;
    
    // Pulsate the torus and spheres
    const pulse = Math.sin(time * 2) * 0.1 + 1.0;
    torus.current.scale.set(pulse, pulse, pulse);
    innerSphere.current.scale.set(pulse * 0.8, pulse * 0.8, pulse * 0.8);
    outerSphere.current.scale.set(pulse * 1.2, pulse * 1.2, pulse * 1.2);
    
    // Spin the particles
    if (particlesRef.current.geometry instanceof THREE.BufferGeometry) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Get current position
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        // Calculate distance from center (on xy plane)
        const dist = Math.sqrt(x * x + y * y);
        
        // Rotate particles at different speeds based on distance from center
        const angle = Math.atan2(y, x) + delta * (1.0 / (dist * 0.1 + 0.1));
        
        // Update position
        positions[i] = Math.cos(angle) * dist;
        positions[i + 1] = Math.sin(angle) * dist;
        
        // Pull particles toward center over time and reset
        positions[i + 2] = z - delta * 2.0;
        
        // Reset particles that go too far in
        if (positions[i + 2] < -radius * 0.5) {
          positions[i + 2] = radius * 0.5;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Check for player proximity to trigger wormhole
    if (connectsTo !== undefined && onEnter) {
      const player = state.scene.getObjectByName('player');
      if (player) {
        const playerWorldPos = new THREE.Vector3();
        player.getWorldPosition(playerWorldPos);
        
        const distance = playerWorldPos.distanceTo(position);
        
        // Activate wormhole when player is nearby
        setActive(distance < radius * 1.5);
        
        // Trigger wormhole when player is very close
        if (distance < radius * 0.8) {
          onEnter(connectsTo);
        }
      }
    }
  });
  
  return (
    <group ref={group} position={[position.x, position.y, position.z]}>
      {/* Torus ring */}
      <mesh ref={torus}>
        <torusGeometry args={[radius, radius * 0.2, 32, 100]} />
        <primitive object={wormholeMaterial} />
      </mesh>
      
      {/* Inner sphere */}
      <mesh ref={innerSphere}>
        <sphereGeometry args={[radius * 0.6, 32, 32]} />
        <primitive object={innerMaterial} />
      </mesh>
      
      {/* Outer sphere */}
      <mesh ref={outerSphere}>
        <sphereGeometry args={[radius * 1.3, 32, 32]} />
        <primitive object={outerMaterial} />
      </mesh>
      
      {/* Particle system */}
      <points ref={particlesRef}>
        <bufferGeometry />
        <pointsMaterial
          size={2}
          sizeAttenuation={true}
          vertexColors={true}
          transparent={true}
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Directional light from inside the wormhole */}
      <pointLight
        color={new THREE.Color(0.5, 0.2, 1.0)}
        intensity={active ? 50 : 20}
        distance={radius * 10}
        decay={2}
      />
      
      {/* Connection indicator */}
      {connectsTo !== undefined && (
        <mesh position={[0, radius * 1.5, 0]}>
          <sphereGeometry args={[radius * 0.1, 16, 16]} />
          <meshStandardMaterial 
            color={new THREE.Color(0.2, 1.0, 0.5)} 
            emissive={new THREE.Color(0.2, 1.0, 0.5)} 
            emissiveIntensity={2} 
          />
        </mesh>
      )}
      
      {/* Text indicating the destination galaxy */}
      {connectsTo !== undefined && (
        <group position={[0, radius * 1.8, 0]}>
          <mesh>
            <boxGeometry args={[radius * 0.8, radius * 0.3, 0.1]} />
            <meshStandardMaterial 
              color={new THREE.Color(0.1, 0.1, 0.2)} 
              emissive={new THREE.Color(0.1, 0.1, 0.2)}
              transparent={true}
              opacity={0.7}  
            />
          </mesh>
          
          {/* We're using a simple 3D text label here */}
          <mesh position={[0, 0, 0.06]}>
            <boxGeometry args={[radius * 0.6, radius * 0.1, 0.01]} />
            <meshStandardMaterial 
              color={new THREE.Color(1.0, 1.0, 1.0)} 
              emissive={new THREE.Color(0.5, 0.5, 1.0)}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}