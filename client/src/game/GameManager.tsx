import { useEffect, useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGalaxyHopping } from '../lib/stores/useGalaxyHopping';
import { useAudio } from '../lib/stores/useAudio';
import { MonsterSpawner } from './MonsterSpawner';
import { GalaxyMap } from './GalaxyMap';
import { BossBattle } from './BossBattle';
import { Collectible } from './Collectible';

// Declare global functions for TypeScript
declare global {
  interface Window {
    playerRefGlobal?: THREE.Group | null;
    setPlayerRef?: (ref: THREE.Group) => void;
  }
}

export function GameManager() {
  const { camera, scene } = useThree();
  const { 
    gameState, 
    currentGalaxy, 
    incrementGalaxy, 
    incrementScore, 
    setPlayerHealth,
    playerHealth
  } = useGalaxyHopping();
  const { backgroundMusic, toggleMute, isMuted, playSound } = useAudio();
  
  // Game state references
  const [initialized, setInitialized] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [bossBattleActive, setBossBattleActive] = useState(false);
  const [galaxyExplored, setGalaxyExplored] = useState(0); // percentage explored
  const [collectiblesSpawned, setCollectiblesSpawned] = useState<THREE.Vector3[]>([]);
  
  // Player reference (will be set from Player component)
  // Use MutableRefObject to allow assigning to current
  const playerRef = useRef<THREE.Group>(null) as React.MutableRefObject<THREE.Group | null>;
  
  // Store player reference for other components to access
  // This is a mutable ref so other components can use it
  useEffect(() => {
    // Make playerRef available globally for other components
    window.setPlayerRef = (ref: THREE.Group) => {
      if (ref) {
        console.log("GameManager: Setting player reference globally");
        window.playerRefGlobal = ref;
        playerRef.current = ref;
      }
    };
    
    // Sync from the global variable to our local ref every frame
    const checkInterval = setInterval(() => {
      if (window.playerRefGlobal && !playerRef.current) {
        playerRef.current = window.playerRefGlobal;
      }
    }, 100);
    
    return () => {
      // Clean up the global references when component unmounts
      window.setPlayerRef = undefined;
      window.playerRefGlobal = null;
      clearInterval(checkInterval);
    };
  }, []);
  
  // Initial game setup - run once when component mounts
  useEffect(() => {
    if (!initialized) {
      console.log("GameManager: Initializing game environment");
      
      try {
        // Ensure the camera is properly configured
        if (camera && 'aspect' in camera) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        }
        
        // Ensure audio is ready
        if (backgroundMusic && !isMuted) {
          backgroundMusic.volume = 0.5;
          backgroundMusic.loop = true;
          backgroundMusic.load();
        }
        
        // Initialize game controls
        setupKeyboardControls();
        
        // Mark initialization as complete
        setInitialized(true);
        console.log("GameManager: Game environment initialized successfully");
      } catch (error) {
        console.error("GameManager: Error during initialization:", error);
      }
    }
  }, [camera, backgroundMusic, isMuted, initialized]);
  
  // Set up camera and scene when game starts
  useEffect(() => {
    console.log("GameManager: Game state changed to", gameState);
    
    if (gameState === 'playing') {
      // Position camera for gameplay - higher and farther back for better view
      camera.position.set(0, 35, 80);
      camera.lookAt(0, 0, -20);
      
      // Reset galaxy exploration
      setGalaxyExplored(0);
      
      // Start background music when game starts
      if (backgroundMusic && !isMuted) {
        console.log("Starting background music");
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(error => {
          console.log("Background music play prevented:", error);
        });
      }
      
      // Spawn initial collectibles
      spawnCollectibles();
      
      console.log("GameManager: Camera positioned for gameplay");
    }
  }, [camera, gameState, backgroundMusic, isMuted]);
  
  // Handle galaxy changes
  useEffect(() => {
    if (gameState === 'playing') {
      console.log(`GameManager: Entering galaxy ${currentGalaxy}`);
      
      // Reset exploration for new galaxy
      setGalaxyExplored(0);
      
      // Reset boss battle flag
      setBossBattleActive(false);
      
      // Clear collectibles
      setCollectiblesSpawned([]);
      
      // Spawn new collectibles
      spawnCollectibles();
      
      // Play galaxy transition sound
      playSound('galaxy_transition', 0.7, false);
    }
  }, [currentGalaxy, gameState]);
  
  // Set up keyboard controls
  const setupKeyboardControls = () => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      switch (event.code) {
        case 'KeyM':
          // Toggle map
          setMapOpen(prev => !prev);
          playSound('ui_click', 0.5, false);
          break;
          
        case 'KeyB':
          // For testing - trigger boss battle
          if (!bossBattleActive) {
            console.log("Triggering boss battle (test)");
            setBossBattleActive(true);
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  };
  
  // Handle window resize events
  useEffect(() => {
    const handleResize = () => {
      // Only update aspect ratio for perspective cameras
      if ('aspect' in camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [camera]);
  
  // Spawn collectibles throughout the galaxy
  const spawnCollectibles = () => {
    const galaxyRadius = 500;
    const collectibleCount = 10 + (currentGalaxy * 3);
    const newPositions: THREE.Vector3[] = [];
    
    // Types of collectibles to spawn
    const collectibleTypes: Array<'health' | 'shield' | 'weapon' | 'speed' | 'crystal' | 'data'> = [
      'health', 'shield', 'weapon', 'speed', 'crystal', 'data'
    ];
    
    // Spawn in random positions
    for (let i = 0; i < collectibleCount; i++) {
      // Random angle and distance
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * galaxyRadius * 0.8;
      
      // Calculate position
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // Add some randomness to Y coordinate
      const y = (Math.random() * 10) - 5;
      
      // Add to positions
      newPositions.push(new THREE.Vector3(x, y, z));
    }
    
    // Update state
    setCollectiblesSpawned(newPositions);
    console.log(`Spawned ${collectibleCount} collectibles in galaxy ${currentGalaxy}`);
  };
  
  // Handle collectible pickup
  const handleCollectibleCollected = (type: string, value: number) => {
    console.log(`Collected ${type} with value ${value}`);
    
    // Handle different collectible types
    switch (type) {
      case 'health':
        // Restore player health
        setPlayerHealth(Math.min(100, playerHealth + value));
        break;
        
      case 'shield':
        // Add shield (future enhancement)
        break;
        
      case 'weapon':
        // Upgrade weapon (future enhancement)
        break;
        
      case 'speed':
        // Increase speed (future enhancement)
        break;
        
      case 'crystal':
      case 'data':
        // Add points
        incrementScore(value);
        
        // Update exploration progress
        setGalaxyExplored(prev => {
          const newValue = Math.min(100, prev + 5);
          
          // Trigger boss battle when galaxy is sufficiently explored
          if (newValue >= 75 && !bossBattleActive) {
            console.log("Galaxy sufficiently explored - triggering boss battle");
            setBossBattleActive(true);
          }
          
          return newValue;
        });
        break;
    }
  };
  
  // Handle monster killed
  const handleMonsterKilled = (points: number) => {
    // Award points
    incrementScore(points);
    
    // Update exploration progress
    setGalaxyExplored(prev => {
      const newValue = Math.min(100, prev + 2);
      
      // Trigger boss battle when galaxy is sufficiently explored
      if (newValue >= 75 && !bossBattleActive) {
        console.log("Galaxy sufficiently explored - triggering boss battle");
        setBossBattleActive(true);
      }
      
      return newValue;
    });
  };
  
  // Handle boss defeated
  const handleBossDefeated = () => {
    console.log("Boss defeated - advancing to next galaxy");
    
    // Award bonus points
    incrementScore(currentGalaxy * 500);
    
    // Progress to next galaxy
    incrementGalaxy();
    
    // Reset boss battle flag
    setBossBattleActive(false);
  };
  
  // Check if we should render game components
  if (gameState !== 'playing') return null;
  
  return (
    <>
      {/* Monster spawner */}
      <MonsterSpawner 
        radius={500} 
        playerRef={playerRef} 
        onMonsterKilled={handleMonsterKilled} 
      />
      
      {/* Collectibles */}
      {collectiblesSpawned.map((position, index) => {
        // Determine type based on index
        const types: Array<'health' | 'shield' | 'weapon' | 'speed' | 'crystal' | 'data'> = [
          'health', 'shield', 'weapon', 'speed', 'crystal', 'data'
        ];
        const typeIndex = index % types.length;
        
        return (
          <Collectible
            key={`collectible-${currentGalaxy}-${index}`}
            type={types[typeIndex]}
            position={position}
            playerRef={playerRef}
            onCollect={handleCollectibleCollected}
          />
        );
      })}
      
      {/* Galaxy map */}
      <GalaxyMap 
        playerRef={playerRef}
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        galaxyRadius={500}
      />
      
      {/* Boss battle */}
      <BossBattle
        playerRef={playerRef}
        active={bossBattleActive}
        onBossDefeated={handleBossDefeated}
      />
    </>
  );
}
