import { useRef, Suspense } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Stars } from "@react-three/drei";
import { ModelAnimator } from "./utils/ModelAnimator";
import { SpaceStation, GasGiantPlanet, AsteroidCluster, WormholePortal, WeaponPowerup, AlienEnemyShip } from "./models/EnvironmentModels";

/**
 * Creates a dynamic environment with animated 3D models
 * This can be added to the main GameScene to create a more immersive and lively game world
 */
export function AnimatedEnvironment() {
  // References for animated objects
  const spaceStationRef = useRef<THREE.Group>(null);
  const wormholeRef = useRef<THREE.Group>(null);
  const alienShipRef = useRef<THREE.Group>(null);
  const asteroidRef1 = useRef<THREE.Group>(null);
  const asteroidRef2 = useRef<THREE.Group>(null);
  const powerupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Group>(null);
  
  // Main render
  return (
    <group>
      {/* Environment lighting and background */}
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.2} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.5} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#6688ff" />
      
      {/* Space station with rotation */}
      <group ref={spaceStationRef}>
        <ModelAnimator 
          target={spaceStationRef} 
          rotationSpeed={[0, 0.02, 0]}
        >
          <Suspense fallback={null}>
            <SpaceStation position={[-30, 5, -40]} scale={3} />
          </Suspense>
        </ModelAnimator>
      </group>
      
      {/* Wormhole portal with pulsation and rotation */}
      <group ref={wormholeRef}>
        <ModelAnimator 
          target={wormholeRef} 
          rotationSpeed={[0, 0, 0.1]}
          pulsate={{ speed: 1.5, min: 3.8, max: 4.2 }}
        >
          <Suspense fallback={null}>
            <WormholePortal position={[50, 0, -20]} scale={4} />
          </Suspense>
        </ModelAnimator>
      </group>
      
      {/* Alien ship following a patrol path */}
      <group ref={alienShipRef}>
        <ModelAnimator 
          target={alienShipRef}
          path={{
            points: [
              [20, 5, 30],
              [40, 8, 10],
              [30, 3, -20],
              [0, 5, -30],
              [-20, 8, -10],
              [-10, 3, 20]
            ],
            speed: 0.1,
            loop: true
          }}
        >
          <Suspense fallback={null}>
            <AlienEnemyShip position={[0, 0, 0]} scale={1.8} />
          </Suspense>
        </ModelAnimator>
      </group>
      
      {/* Asteroids in orbit */}
      <group ref={asteroidRef1}>
        <ModelAnimator 
          target={asteroidRef1}
          orbit={{
            center: [0, 0, 0],
            speed: 0.05,
            radius: 70,
            axis: 'xz'
          }}
          rotationSpeed={[0.01, 0.02, 0.005]}
        >
          <Suspense fallback={null}>
            <AsteroidCluster position={[0, 0, 0]} scale={1.5} />
          </Suspense>
        </ModelAnimator>
      </group>
      
      <group ref={asteroidRef2}>
        <ModelAnimator 
          target={asteroidRef2}
          orbit={{
            center: [0, 0, 0],
            speed: -0.03,
            radius: 90,
            axis: 'xz'
          }}
          rotationSpeed={[-0.005, 0.01, -0.02]}
        >
          <Suspense fallback={null}>
            <AsteroidCluster position={[0, 0, 0]} scale={2} />
          </Suspense>
        </ModelAnimator>
      </group>
      
      {/* Weapon powerup with oscillation and rotation */}
      <group ref={powerupRef}>
        <ModelAnimator 
          target={powerupRef}
          oscillation={{
            axis: 'y',
            speed: 1,
            amplitude: 0.5
          }}
          rotationSpeed={[0, 0.5, 0]}
        >
          <Suspense fallback={null}>
            <WeaponPowerup position={[15, 5, 10]} scale={2} />
          </Suspense>
        </ModelAnimator>
      </group>
      
      {/* Planet with slow rotation */}
      <group ref={planetRef}>
        <ModelAnimator 
          target={planetRef}
          rotationSpeed={[0, 0.01, 0.001]}
        >
          <Suspense fallback={null}>
            <GasGiantPlanet position={[-80, -20, -100]} scale={25} />
          </Suspense>
        </ModelAnimator>
      </group>
    </group>
  );
}