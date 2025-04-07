import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Enemy } from './Enemy';
import { useGalaxyHopping } from '../lib/stores/useGalaxyHopping';
import { useAudio } from '../lib/stores/useAudio';

interface MonsterSpawnerProps {
  radius: number;
  playerRef: React.RefObject<THREE.Group>;
  onMonsterKilled?: (points: number) => void;
}

interface Monster {
  id: number;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  type: 'chaser' | 'shooter';
  health: number;
  spawned: number; // timestamp
  active: boolean;
}

export function MonsterSpawner({ radius, playerRef, onMonsterKilled }: MonsterSpawnerProps) {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [lastSpawnTime, setLastSpawnTime] = useState(Date.now());
  const { currentGalaxy, gameState } = useGalaxyHopping();
  const { playSound } = useAudio();
  
  // Refs for event listeners
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up spawn parameters based on current galaxy level
  const spawnRate = 1000 * (15 - Math.min(10, currentGalaxy)); // Faster spawns in higher galaxies
  const maxMonsters = 5 + (currentGalaxy * 2); // More monsters in higher galaxies
  
  // Initialize monster spawning
  useEffect(() => {
    // Register bullet hit event listener
    window.addEventListener('bullet-hit', handleBulletHit as EventListener);
    
    const startSpawning = () => {
      // Check if we need to spawn more monsters
      if (monsters.length < maxMonsters && gameState === 'playing') {
        spawnMonster();
      }
      
      // Set up next spawn check
      spawnTimerRef.current = setTimeout(startSpawning, spawnRate);
    };
    
    // Start the spawning cycle
    startSpawning();
    
    return () => {
      // Clean up
      window.removeEventListener('bullet-hit', handleBulletHit as EventListener);
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
      }
    };
  }, [monsters.length, maxMonsters, currentGalaxy, gameState]);
  
  // Spawn a new monster
  const spawnMonster = () => {
    // Get the effective player reference (prefer direct playerRef, fallback to global)
    const effectivePlayerRef = playerRef?.current ? playerRef : window.playerRefGlobal ? { current: window.playerRefGlobal } : null;
    
    // Safety check for playerRef - cannot spawn without player position reference
    if (!effectivePlayerRef || !effectivePlayerRef.current) {
      console.log("Cannot spawn monster - no valid player reference available");
      return;
    }
    
    const now = Date.now();
    setLastSpawnTime(now);
    
    // Determine spawn position - at least 50 units away from player but within radius
    let spawnPosition = new THREE.Vector3();
    let validPosition = false;
    let safetyCounter = 0; // Prevent infinite loops
    const MAX_TRIES = 20;
    
    while (!validPosition && safetyCounter < MAX_TRIES) {
      safetyCounter++;
      
      // Random angle and distance within bounds
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (radius * 0.8) + (radius * 0.2);
      
      // Calculate position
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // Add some randomness to Y coordinate
      const y = (Math.random() * 10) - 5;
      
      // Set the spawn position
      spawnPosition.set(x, y, z);
      
      try {
        // Check if position is valid (far enough from player)
        const distanceToPlayer = spawnPosition.distanceTo(effectivePlayerRef.current.position);
        if (distanceToPlayer > 50) {
          validPosition = true;
        }
      } catch (error) {
        console.warn("Error calculating distance to player, using fallback spawn position", error);
        // Use fallback position
        spawnPosition.set(
          (Math.random() - 0.5) * radius * 1.5,
          (Math.random() * 10) - 5,
          (Math.random() - 0.5) * radius * 1.5
        );
        validPosition = true;
      }
    }
    
    // If we couldn't find a valid position, use a default one
    if (!validPosition) {
      console.log("Using fallback monster spawn position after too many attempts");
      spawnPosition.set(100, 0, 100);
    }
    
    // Calculate rotation to face toward the center of the galaxy
    const direction = new THREE.Vector3(0, 0, 0).sub(spawnPosition).normalize();
    const rotation = new THREE.Euler(0, Math.atan2(direction.x, direction.z), 0);
    
    // Determine monster type
    const types: ('chaser' | 'shooter')[] = ['chaser', 'shooter'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Create the monster
    const newMonster: Monster = {
      id: now + Math.random(),
      position: spawnPosition,
      rotation,
      type,
      health: type === 'chaser' ? 3 : 2,
      spawned: now,
      active: true
    };
    
    // Add monster to the list
    setMonsters(prev => [...prev, newMonster]);
    console.log(`Spawned ${type} monster at ${spawnPosition.x.toFixed(1)}, ${spawnPosition.y.toFixed(1)}, ${spawnPosition.z.toFixed(1)}`);
  };
  
  // Handle bullet hit events
  const handleBulletHit = (event: CustomEvent) => {
    const { target, fromPlayer } = event.detail;
    
    if (fromPlayer && target === 'monster') {
      const monsterId = event.detail.monsterId;
      
      // Find the monster that was hit and reduce its health
      setMonsters(prev => 
        prev.map(monster => {
          if (monster.id === monsterId) {
            // Play hit sound
            playSound('hit', 0.5, false);
            
            // Calculate new health
            const newHealth = monster.health - 1;
            
            if (newHealth <= 0) {
              // Monster killed
              playSound('explosion', 0.7, false);
              
              // Award points for kill
              if (onMonsterKilled) {
                const points = monster.type === 'chaser' ? 100 : 150;
                onMonsterKilled(points);
              }
              
              // Remove this monster
              return { ...monster, active: false, health: 0 };
            }
            
            // Monster still alive, just damaged
            return { ...monster, health: newHealth };
          }
          return monster;
        })
      );
    }
  };
  
  // Remove inactive monsters periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setMonsters(prev => prev.filter(monster => monster.active));
    }, 5000);
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
  // Get the effective player reference (prefer direct playerRef, fallback to global)
  const effectivePlayerRef = playerRef?.current ? playerRef : window.playerRefGlobal ? { current: window.playerRefGlobal } : null;
  
  // Don't render anything if the player is not available or isn't properly initialized
  if (!effectivePlayerRef || !effectivePlayerRef.current) {
    console.log("MonsterSpawner: No valid player reference available, skipping render");
    return null;
  }
  
  // Filter monsters to include only active ones
  const activeMonsters = monsters.filter(monster => monster.active);
  
  // Additional safety check - only render enemies if we have a valid player reference
  if (activeMonsters.length > 0) {
    console.log(`Rendering ${activeMonsters.length} active monsters`);
  }
  
  return (
    <>
      {activeMonsters.map((monster) => (
        <Enemy
          key={`monster-${monster.id}`}
          position={monster.position}
          rotation={monster.rotation}
          type={monster.type}
          monsterId={monster.id}
          playerRef={playerRef}
        />
      ))}
    </>
  );
}