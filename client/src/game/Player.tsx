import { forwardRef, useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { keepInBounds } from './utils';
import { CONFIG, VehicleType } from './types';
import { vehicleProperties } from './utils/vehicles';
import { useAudio } from '../lib/stores/useAudio';
import { useGalaxyHopping } from '../lib/stores/useGalaxyHopping';
import { ShipModel } from './models/ShipModel';

interface PlayerProps {
  health: number;
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  vehicleType?: VehicleType; // Optional vehicle type, defaults to standard
}

// Define ship geometries outside to prevent recreation on each render
const shipGeometries = {
  fuselageGeometry: new THREE.CylinderGeometry(0.8, 0.8, 3, 16),
  wingGeometry: new THREE.BoxGeometry(0.2, 1.5, 1.5),
  finGeometry: new THREE.BoxGeometry(0.1, 1, 0.5),
  cockpitGeometry: new THREE.SphereGeometry(0.7, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
  turretBaseGeometry: new THREE.CylinderGeometry(0.2, 0.2, 0.2, 8),
  turretBarrelGeometry: new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8),
  antennaGeometry: new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8),
  antennaTopGeometry: new THREE.SphereGeometry(0.03, 8, 8),
  engineBaseGeometry: new THREE.CylinderGeometry(0.3, 0.3, 0.4, 16),
  engineNozzleGeometry: new THREE.CylinderGeometry(0.3, 0.4, 0.2, 16),
  engineIntakeGeometry: new THREE.TorusGeometry(0.3, 0.1, 16, 32)
};

// Create thruster particle positions
const particleCount = 200;
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 0.5;     // x
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 0.5; // y
  particlePositions[i * 3 + 2] = Math.random() * 2 + 1;       // z (behind the ship)
}

export const Player = forwardRef<THREE.Group, PlayerProps>(
  ({ health, forward, backward, left, right, vehicleType = 'standard' }, ref) => {
    const velocityRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
    const engineRef1 = useRef<THREE.Mesh>(null);
    const engineRef2 = useRef<THREE.Mesh>(null);
    const thrusterParticlesRef = useRef<THREE.Points>(null);
    
    // Make a local ref that our component code can modify directly
    const localRef = useRef<THREE.Group>(null);
    
    // Load thruster particle texture
    const thrusterTexture = useTexture('/textures/particle.svg');
    
    // Get vehicle properties based on type
    const vehicleProps = vehicleProperties[vehicleType];
    
    // Model loading state
    const [modelLoaded, setModelLoaded] = useState(false);
    
    // Sync our ref with the forwarded ref and global ref when component mounts
    useEffect(() => {
      // When our ref is available, update the forwarded ref
      if (localRef.current && ref) {
        // Handle both function and object refs
        if (typeof ref === 'function') {
          ref(localRef.current);
        } else {
          // Safely cast to mutable ref to avoid TypeScript readonly warnings
          (ref as React.MutableRefObject<THREE.Group>).current = localRef.current;
        }
        
        // Set the global reference for other components to access
        if (window.setPlayerRef && localRef.current) {
          window.setPlayerRef(localRef.current);
          console.log("Player component ref synchronized globally");
        }
        
        console.log("Player component ref synchronized");
      }
    }, [ref, localRef.current]);
    
    // Load engine sounds on mount or when vehicle type changes
    useEffect(() => {
      // Log which vehicle type we're loading
      console.log(`Loading ${vehicleType} vehicle model`);
      
      // Get audio store for engine sounds
      const { startEngine, stopEngine, setEngineSound } = useAudio.getState();
      
      // Create and set up engine sound based on vehicle type
      const engineSound = new Audio('/sounds/engine_' + vehicleType + '.mp3');
      // Fallback to standard engine sound if specific one not found
      engineSound.onerror = () => {
        engineSound.src = '/sounds/engine_standard.mp3';
        console.log(`Using standard engine sound for ${vehicleType}`);
      };
      
      // Configure engine sound based on vehicle properties
      engineSound.loop = true;
      engineSound.volume = 0;
      
      // Initialize engine sound
      setEngineSound(engineSound);
      
      // Start the engine when the vehicle is loaded
      startEngine();
      setModelLoaded(true);
      
      // Cleanup function
      return () => {
        // Stop engine sound
        stopEngine();
      };
    }, [vehicleType]);
    
    // Load textures - using wood texture as a substitute for metal
    const metalTexture = useTexture('/textures/wood.jpg');
    
    // Calculate health-based color
    const healthColor = useMemo(() => {
      // Smoothly transition from green (healthy) to red (critical)
      const g = Math.max(0, health / 100);
      const r = Math.min(1, 2 - (health / 50));
      return new THREE.Color(r, g, 0.2);
    }, [health]);
    
    useFrame((_, delta) => {
      // Use our direct local ref for physics calculations
      if (!localRef.current) return;
      
      // Apply forces based on vehicle type and input
      const speed = vehicleProps.speed;
      const rotationSpeed = CONFIG.PLAYER.ROTATION_SPEED * (vehicleType === 'scout' ? 1.3 : vehicleType === 'heavy' ? 0.7 : 1.0);
      
      // Handle rotation (yaw)
      if (left) {
        localRef.current.rotation.y += rotationSpeed * delta;
      }
      if (right) {
        localRef.current.rotation.y -= rotationSpeed * delta;
      }
      
      // Calculate forward vector based on rotation
      const forwardVec = new THREE.Vector3(0, 0, -1).applyEuler(localRef.current.rotation);
      
      // Apply thrust based on input
      const acceleration = new THREE.Vector3(0, 0, 0);
      
      // Calculate throttle level for engine effects and sounds
      let throttleLevel = 0;
      
      if (forward) {
        throttleLevel = 1.0;
        acceleration.add(forwardVec.clone().multiplyScalar(speed));
        
        // Engine effect when moving forward
        if (engineRef1.current && engineRef2.current) {
          engineRef1.current.scale.z = 1 + Math.sin(Date.now() * 0.01) * 0.2;
          engineRef2.current.scale.z = 1 + Math.sin(Date.now() * 0.01 + 0.5) * 0.2;
        }
        
        // Update thruster particles
        if (thrusterParticlesRef.current) {
          const positions = thrusterParticlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 2] -= (Math.random() * 0.2 + 0.1) * speed * delta;
            if (positions[i * 3 + 2] < 0) {
              positions[i * 3] = (Math.random() - 0.5) * 0.5;
              positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
              positions[i * 3 + 2] = Math.random() * 0.5 + 2;
            }
          }
          thrusterParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
      } else {
        // Reset engine scale when not moving forward
        if (engineRef1.current && engineRef2.current) {
          engineRef1.current.scale.z = THREE.MathUtils.lerp(engineRef1.current.scale.z, 1, delta * 5);
          engineRef2.current.scale.z = THREE.MathUtils.lerp(engineRef2.current.scale.z, 1, delta * 5);
        }
      }
      
      if (backward) {
        throttleLevel = 0.6; // Less throttle when moving backward
        acceleration.add(forwardVec.clone().multiplyScalar(-speed * 0.6)); // Slower backward
      }
      
      // Update engine sound based on throttle level
      useAudio.getState().adjustEngineVolume(throttleLevel);
      
      // Update velocity
      velocityRef.current.add(acceleration.clone().multiplyScalar(delta));
      
      // Apply drag (slow down gradually)
      velocityRef.current.multiplyScalar(0.95);
      
      // Update position based on velocity
      localRef.current.position.add(velocityRef.current.clone().multiplyScalar(delta));
      
      // Keep ship within bounds
      keepInBounds(localRef.current.position);
      
      // Tilt based on movement (bank turn effect)
      const targetTiltZ = (left ? 0.3 : (right ? -0.3 : 0));
      localRef.current.rotation.z = THREE.MathUtils.lerp(
        localRef.current.rotation.z,
        targetTiltZ,
        5 * delta
      );
      
      // Tilt forward/backward based on acceleration
      const forwardSpeed = forwardVec.dot(velocityRef.current);
      const targetTiltX = THREE.MathUtils.clamp(
        -forwardSpeed * 0.01, 
        -0.2, 
        0.2
      );
      localRef.current.rotation.x = THREE.MathUtils.lerp(
        localRef.current.rotation.x,
        targetTiltX,
        3 * delta
      );
    });
    
    // Additional refs for animation
    const leftWingRef = useRef<THREE.Mesh>(null);
    const rightWingRef = useRef<THREE.Mesh>(null);
    const turret1Ref = useRef<THREE.Group>(null);
    const turret2Ref = useRef<THREE.Group>(null);
    const cockpitRef = useRef<THREE.Mesh>(null);
    
    // Animation for wing flaps and turret rotation
    useFrame((_, delta) => {
      if (leftWingRef.current && rightWingRef.current) {
        // Subtle wing tilting during turns
        if (left) {
          leftWingRef.current.rotation.z = THREE.MathUtils.lerp(leftWingRef.current.rotation.z, -0.1, delta * 3);
          rightWingRef.current.rotation.z = THREE.MathUtils.lerp(rightWingRef.current.rotation.z, 0.2, delta * 3);
        } else if (right) {
          leftWingRef.current.rotation.z = THREE.MathUtils.lerp(leftWingRef.current.rotation.z, 0.2, delta * 3);
          rightWingRef.current.rotation.z = THREE.MathUtils.lerp(rightWingRef.current.rotation.z, -0.1, delta * 3);
        } else {
          // Return to neutral position
          leftWingRef.current.rotation.z = THREE.MathUtils.lerp(leftWingRef.current.rotation.z, 0, delta * 3);
          rightWingRef.current.rotation.z = THREE.MathUtils.lerp(rightWingRef.current.rotation.z, 0, delta * 3);
        }
      }
      
      // Animated turret rotation (scanning for targets)
      if (turret1Ref.current && turret2Ref.current) {
        turret1Ref.current.rotation.y += delta * 0.5;
        turret2Ref.current.rotation.y -= delta * 0.6;
      }
      
      // Cockpit glass pulsing effect
      if (cockpitRef.current && cockpitRef.current.material) {
        const material = cockpitRef.current.material as THREE.MeshPhysicalMaterial;
        material.transmission = 0.8 + Math.sin(Date.now() * 0.001) * 0.1;
      }
    });
    
    // Function to render the standard ship model when custom model is not available
    const renderStandardShip = () => (
      <>
        {/* Main Fuselage */}
        <mesh scale={[0.8, 0.8, 0.8]} rotation={[0, Math.PI, 0]}>
          <primitive object={shipGeometries.fuselageGeometry} />
          <meshStandardMaterial 
            color={healthColor} 
            metalness={0.7} 
            roughness={0.2}
            map={metalTexture}
          />
        </mesh>
        
        {/* Left Wing */}
        <mesh 
          ref={leftWingRef}
          position={[-1.0, -0.1, 0]} 
          rotation={[0, Math.PI * 0.5, 0]} 
          scale={[0.7, 0.7, 0.7]}
        >
          <primitive object={shipGeometries.wingGeometry} />
          <meshStandardMaterial 
            color={new THREE.Color(0.2, 0.3, 0.8)} 
            metalness={0.6} 
            roughness={0.3}
            map={metalTexture}
          />
        </mesh>
        
        {/* Right Wing */}
        <mesh 
          ref={rightWingRef}
          position={[1.0, -0.1, 0]} 
          rotation={[0, -Math.PI * 0.5, 0]} 
          scale={[0.7, 0.7, 0.7]}
        >
          <primitive object={shipGeometries.wingGeometry} />
          <meshStandardMaterial 
            color={new THREE.Color(0.2, 0.3, 0.8)} 
            metalness={0.6} 
            roughness={0.3}
            map={metalTexture}
          />
        </mesh>
        
        {/* Vertical Stabilizer/Fin */}
        <mesh position={[0, 0.5, 1.2]} rotation={[Math.PI * 0.5, 0, 0]} scale={[1, 1, 1]}>
          <primitive object={shipGeometries.finGeometry} />
          <meshStandardMaterial 
            color={new THREE.Color(0.3, 0.4, 0.7)} 
            metalness={0.7} 
            roughness={0.3}
          />
        </mesh>
        
        {/* Left Fin */}
        <mesh position={[-0.8, -0.3, 0.8]} rotation={[0, 0, Math.PI * 0.4]} scale={[0.6, 0.6, 0.6]}>
          <primitive object={shipGeometries.finGeometry} />
          <meshStandardMaterial 
            color={new THREE.Color(0.3, 0.4, 0.7)} 
            metalness={0.7} 
            roughness={0.3}
          />
        </mesh>
        
        {/* Right Fin */}
        <mesh position={[0.8, -0.3, 0.8]} rotation={[0, 0, -Math.PI * 0.4]} scale={[0.6, 0.6, 0.6]}>
          <primitive object={shipGeometries.finGeometry} />
          <meshStandardMaterial 
            color={new THREE.Color(0.3, 0.4, 0.7)} 
            metalness={0.7} 
            roughness={0.3}
          />
        </mesh>
        
        {/* Cockpit */}
        <mesh ref={cockpitRef} position={[0, 0.45, -1.2]} rotation={[Math.PI * 0.1, 0, 0]}>
          <primitive object={shipGeometries.cockpitGeometry} />
          <meshPhysicalMaterial 
            color={new THREE.Color(0.5, 0.9, 1)} 
            metalness={0.1}
            roughness={0.1}
            transmission={0.9} // Glass-like
            thickness={0.5}    // Glass thickness
            envMapIntensity={1}
          />
        </mesh>
        
        {/* Left Weapon Turret */}
        <group ref={turret1Ref} position={[-0.7, 0.1, -0.5]}>
          <mesh>
            <primitive object={shipGeometries.turretBaseGeometry} />
            <meshStandardMaterial 
              color={new THREE.Color(0.2, 0.2, 0.3)} 
              metalness={0.9} 
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0, -0.25]} rotation={[Math.PI * 0.5, 0, 0]}>
            <primitive object={shipGeometries.turretBarrelGeometry} />
            <meshStandardMaterial 
              color={new THREE.Color(0.15, 0.15, 0.2)} 
              metalness={0.9} 
              roughness={0.3}
            />
          </mesh>
          <pointLight 
            position={[0, 0, -0.6]} 
            color={new THREE.Color(1, 0.2, 0.1)} 
            intensity={2} 
            distance={2}
          />
        </group>
        
        {/* Right Weapon Turret */}
        <group ref={turret2Ref} position={[0.7, 0.1, -0.5]}>
          <mesh>
            <primitive object={shipGeometries.turretBaseGeometry} />
            <meshStandardMaterial 
              color={new THREE.Color(0.2, 0.2, 0.3)} 
              metalness={0.9} 
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0, -0.25]} rotation={[Math.PI * 0.5, 0, 0]}>
            <primitive object={shipGeometries.turretBarrelGeometry} />
            <meshStandardMaterial 
              color={new THREE.Color(0.15, 0.15, 0.2)} 
              metalness={0.9} 
              roughness={0.3}
            />
          </mesh>
          <pointLight 
            position={[0, 0, -0.6]} 
            color={new THREE.Color(1, 0.2, 0.1)} 
            intensity={2} 
            distance={2}
          />
        </group>
        
        {/* Communication Antennas */}
        <mesh position={[0.3, 0.7, 0.2]} rotation={[0.2, 0, 0.1]}>
          <primitive object={shipGeometries.antennaGeometry} />
          <meshStandardMaterial color={new THREE.Color(0.2, 0.2, 0.2)} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.3, 0.95, 0.2]} rotation={[0.2, 0, 0.1]}>
          <primitive object={shipGeometries.antennaTopGeometry} />
          <meshStandardMaterial color={new THREE.Color(1, 0.2, 0.2)} emissive={new THREE.Color(1, 0.2, 0.2)} emissiveIntensity={0.5} />
        </mesh>
        
        <mesh position={[-0.2, 0.8, 0.3]} rotation={[-0.1, 0, -0.2]}>
          <primitive object={shipGeometries.antennaGeometry} />
          <meshStandardMaterial color={new THREE.Color(0.2, 0.2, 0.2)} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.2, 1.05, 0.3]} rotation={[-0.1, 0, -0.2]}>
          <primitive object={shipGeometries.antennaTopGeometry} />
          <meshStandardMaterial color={new THREE.Color(0.2, 0.5, 1)} emissive={new THREE.Color(0.2, 0.5, 1)} emissiveIntensity={0.5} />
        </mesh>
        
        {/* Left Engine */}
        <group position={[-0.8, -0.2, 1.5]}>
          <mesh ref={engineRef1} rotation={[Math.PI * 0.5, 0, 0]}>
            <primitive object={shipGeometries.engineBaseGeometry} />
            <meshStandardMaterial 
              color={new THREE.Color(0.3, 0.3, 0.5)} 
              metalness={0.8} 
              roughness={0.2} 
            />
          </mesh>
          
          <mesh position={[0, 0, 0.4]} rotation={[Math.PI * 0.5, 0, 0]}>
            <primitive object={shipGeometries.engineNozzleGeometry} />
            <meshStandardMaterial 
              color={new THREE.Color(0.2, 0.2, 0.3)} 
              metalness={0.9} 
              roughness={0.1}
            />
          </mesh>
          
          <mesh position={[0, 0, -0.2]} rotation={[0, 0, 0]}>
            <primitive object={shipGeometries.engineIntakeGeometry} />
            <meshStandardMaterial 
              color={new THREE.Color(0.3, 0.5, 0.8)} 
              metalness={0.7} 
              roughness={0.2}
              emissive={new THREE.Color(0.1, 0.3, 0.8)}
              emissiveIntensity={forward ? 0.8 : 0.2}
            />
          </mesh>
          
          <pointLight 
            position={[0, 0, 0.6]} 
            color={new THREE.Color(0.1, 0.5, 1)} 
            intensity={forward ? 25 : 5} 
            distance={10} 
          />
        </group>
        
        {/* Right Engine */}
        <group position={[0.8, -0.2, 1.5]}>
          <mesh ref={engineRef2} rotation={[Math.PI * 0.5, 0, 0]}>
            <primitive object={shipGeometries.engineBaseGeometry} />
            <meshStandardMaterial 
              color={new THREE.Color(0.3, 0.3, 0.5)} 
              metalness={0.8} 
              roughness={0.2} 
            />
          </mesh>
          
          <mesh position={[0, 0, 0.4]} rotation={[Math.PI * 0.5, 0, 0]}>
            <primitive object={shipGeometries.engineNozzleGeometry} />
            <meshStandardMaterial 
              color={new THREE.Color(0.2, 0.2, 0.3)} 
              metalness={0.9} 
              roughness={0.1}
            />
          </mesh>
          
          <mesh position={[0, 0, -0.2]} rotation={[0, 0, 0]}>
            <primitive object={shipGeometries.engineIntakeGeometry} />
            <meshStandardMaterial 
              color={new THREE.Color(0.3, 0.5, 0.8)} 
              metalness={0.7} 
              roughness={0.2}
              emissive={new THREE.Color(0.1, 0.3, 0.8)}
              emissiveIntensity={forward ? 0.8 : 0.2}
            />
          </mesh>
          
          <pointLight 
            position={[0, 0, 0.6]} 
            color={new THREE.Color(0.1, 0.5, 1)} 
            intensity={forward ? 25 : 5} 
            distance={10} 
          />
        </group>
        
        {/* Enhanced Thruster particles for better visuals */}
        <points ref={thrusterParticlesRef} visible={forward} position={[0, 0, 2]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={particlePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial 
            size={0.2}
            color={new THREE.Color(0.1, 0.5, 1)}
            transparent
            opacity={0.9}
            sizeAttenuation={true}
            blending={THREE.AdditiveBlending}
            map={thrusterTexture}
            alphaTest={0.01}
            depthWrite={false}
          />
        </points>
        
        {/* Health indicator lights - pulsing based on health level */}
        <pointLight 
          position={[0, 0.3, -1.3]} 
          color={healthColor} 
          intensity={5 + Math.sin(Date.now() * 0.005) * (1 - health / 100) * 3} 
          distance={5} 
        />
        
        {/* Additional light for better visibility in first person view */}
        <spotLight
          position={[0, 0.6, -1.8]}
          angle={0.6}
          penumbra={0.5}
          intensity={10}
          color={new THREE.Color(1, 1, 1)}
          distance={50}
          castShadow
        />
      </>
    );
    
    return (
      <group ref={localRef} position={[0, 0, 0]} scale={[0.5, 0.5, 0.5]} name="player">
        {modelLoaded ? (
          <ShipModel 
            vehicleType={vehicleType} 
            rotation={[0, Math.PI, 0]} // Rotate to face forward
          />
        ) : (
          renderStandardShip()
        )}
      </group>
    );
  }
);