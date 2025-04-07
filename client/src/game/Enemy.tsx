import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAudio } from '../lib/stores/useAudio';

interface EnemyProps {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  type: 'chaser' | 'shooter';
  monsterId: number;
  playerRef: React.RefObject<THREE.Group>;
}

export function Enemy({ position, rotation, type, monsterId, playerRef }: EnemyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const lastFireTime = useRef<number>(0);
  const [active, setActive] = useState(true);
  const { playSound } = useAudio();

  // Set up enemy properties based on type
  const properties = {
    chaser: {
      speed: 15,
      color: new THREE.Color(0.8, 0.2, 0.2),
      size: 1.2,
      fireRate: 0, // chasers don't shoot
      detectionRange: 100,
    },
    shooter: {
      speed: 8,
      color: new THREE.Color(0.2, 0.8, 0.8),
      size: 1.0,
      fireRate: 1500, // milliseconds between shots
      detectionRange: 150,
    }
  };

  // Get the correct properties based on enemy type
  const enemyProps = properties[type];

  // AI behavior for the enemy
  useFrame((_, delta) => {
    // Safety check - make sure the groupRef is valid and component is active  
    if (!groupRef.current || !active) return;

    // Get effective player reference, first trying direct ref then global
    const effectivePlayerRef = playerRef?.current ? playerRef : window.playerRefGlobal ? { current: window.playerRefGlobal } : null;
    if (!effectivePlayerRef?.current) {
      // If no player reference, maintain current position/rotation
      if (groupRef.current) {
        groupRef.current.position.add(velocityRef.current.clone().multiplyScalar(delta));
        velocityRef.current.multiplyScalar(0.98); // Add some drag
      }
      return;
    }

    // Calculate distance to player
    const distanceToPlayer = groupRef.current.position.distanceTo(effectivePlayerRef.current.position);

    // If player is within detection range, chase or engage
    if (distanceToPlayer < enemyProps.detectionRange) {
      // Direction to player
      const directionToPlayer = new THREE.Vector3()
        .subVectors(effectivePlayerRef.current.position, groupRef.current.position)
        .normalize();

      // Calculate new rotation to face player
      const targetRotation = Math.atan2(directionToPlayer.x, directionToPlayer.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        delta * 3
      );

      if (type === 'chaser') {
        // Chasers move directly toward the player
        velocityRef.current.add(
          directionToPlayer.clone().multiplyScalar(enemyProps.speed * delta)
        );
      } else if (type === 'shooter') {
        // Shooters maintain some distance
        if (distanceToPlayer < 50) {
          // Back away if too close
          velocityRef.current.add(
            directionToPlayer.clone().multiplyScalar(-enemyProps.speed * delta)
          );
        } else if (distanceToPlayer > 100) {
          // Move closer if too far
          velocityRef.current.add(
            directionToPlayer.clone().multiplyScalar(enemyProps.speed * 0.5 * delta)
          );
        }

        // Fire at player if it's time
        const now = Date.now();
        if (now - lastFireTime.current > enemyProps.fireRate) {
          fireAtPlayer();
          lastFireTime.current = now;
        }
      }
    } else {
      // Random movement when player is not detected
      if (Math.random() < 0.01) {
        const randomDir = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          0,
          (Math.random() - 0.5) * 2
        ).normalize();

        velocityRef.current.add(
          randomDir.multiplyScalar(enemyProps.speed * 0.2 * delta)
        );
      }
    }

    // Apply drag to slow down gradually
    velocityRef.current.multiplyScalar(0.95);

    // Update position
    groupRef.current.position.add(
      velocityRef.current.clone().multiplyScalar(delta)
    );

    // Bobbing animation
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.2;
      bodyRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.1;
    }
  });

  // Fire a bullet at the player
  const fireAtPlayer = () => {
    // Get the effective player reference (prefer direct playerRef, fallback to global)
    const effectivePlayerRef = playerRef?.current ? playerRef : window.playerRefGlobal ? { current: window.playerRefGlobal } : null;

    // Double check all refs are valid
    if (!groupRef?.current || !effectivePlayerRef?.current) {
      console.log("Skipping enemy fire - missing player or group reference");
      return;
    }

    // Create a bullet element
    const bullet = document.createElement('div');

    // Get current position and rotation
    const position = groupRef.current.position.clone();

    // Create direction vector to player, or fallback to forward direction if player reference is lost
    let direction: THREE.Vector3;
    try {
      direction = new THREE.Vector3()
        .subVectors(effectivePlayerRef.current.position, position)
        .normalize();
    } catch (error) {
      // Fallback: fire forward relative to enemy's current rotation
      direction = new THREE.Vector3(0, 0, -1).applyEuler(groupRef.current.rotation);
      console.log("Using fallback direction for enemy fire");
    }

    // Create a custom event with bullet data
    const bulletEvent = new CustomEvent('enemy-fire', {
      detail: {
        position,
        direction,
        enemyId: monsterId,
        fromPlayer: false
      }
    });

    // Dispatch the event
    window.dispatchEvent(bulletEvent);

    // Play sound
    playSound('fire', 0.3, false);
  };

  // Handle collision events
  useEffect(() => {
    const handleCollision = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (
        customEvent.detail &&
        customEvent.detail.targetId === monsterId &&
        customEvent.detail.targetType === 'enemy'
      ) {
        setActive(false);
      }
    };

    window.addEventListener('collision', handleCollision);

    return () => {
      window.removeEventListener('collision', handleCollision);
    };
  }, [monsterId]);

  // First check if we have a direct playerRef, otherwise try to use the global one
  const effectivePlayerRef = playerRef?.current ? playerRef : window.playerRefGlobal ? { current: window.playerRefGlobal } : null;

  // Don't render this enemy if inactive or if there's no player reference available
  if (!active || !effectivePlayerRef || !effectivePlayerRef.current) {
    console.log(`Enemy ${monsterId} has no valid player reference, skipping render`);
    return null;
  }

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      rotation={rotation}
      userData={{ type: 'enemy', id: monsterId }}
    >
      {/* Main enemy body */}
      <mesh ref={bodyRef}>
        {type === 'chaser' ? (
          // Chaser enemy - more aggressive, spiky look
          <tetrahedronGeometry args={[enemyProps.size, 1]} />
        ) : (
          // Shooter enemy - geometric shape
          <octahedronGeometry args={[enemyProps.size, 0]} />
        )}
        <meshStandardMaterial
          color={enemyProps.color}
          emissive={enemyProps.color}
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Enemy glow effect */}
      <pointLight
        color={enemyProps.color}
        intensity={5}
        distance={10}
        decay={2}
      />

      {/* Eyes (only for shooter type) */}
      {type === 'shooter' && (
        <>
          <mesh position={[0.4, 0.3, -0.6]} scale={[0.2, 0.2, 0.2]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={1} />
          </mesh>
          <mesh position={[-0.4, 0.3, -0.6]} scale={[0.2, 0.2, 0.2]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={1} />
          </mesh>
        </>
      )}

      {/* Additional details for chaser type */}
      {type === 'chaser' && (
        <>
          <mesh position={[0, 0, -0.7]} rotation={[0, 0, Math.PI / 4]} scale={[0.8, 0.8, 0.8]}>
            <coneGeometry args={[0.5, 1, 4]} />
            <meshStandardMaterial
              color={new THREE.Color(0.9, 0.3, 0.3)}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </>
      )}
    </group>
  );
}