import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useKeyboardControls } from "@react-three/drei";
import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { Bullet } from "./Bullet";
import { Galaxy } from "./Galaxy";
import { GameManager } from "./GameManager";
import { AnimatedEnvironment } from "./AnimatedEnvironment";
import { useGalaxyHopping } from "../lib/stores/useGalaxyHopping";
import { useAudio } from "../lib/stores/useAudio";
import { Controls, EnemyObject, BulletObject, CONFIG } from "./types";
import * as THREE from "three";

// Preload essential models
useLoader.preload(GLTFLoader, '/models/standard_ship.glb');

// Function to generate random star positions
function generateStars(count: number, spread: number): THREE.Vector3[] {
  const stars: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * spread;
    const y = (Math.random() - 0.5) * spread;
    const z = (Math.random() - 0.5) * spread;
    stars.push(new THREE.Vector3(x, y, z));
  }
  return stars;
}

export function GameScene() {
  // Get access to Three.js scene
  const { scene } = useThree();

  // Get game state from store
  const { 
    gameState, 
    currentGalaxy, 
    playerHealth,
    selectedShipType
  } = useGalaxyHopping();

  // Use refs for state updates to avoid React warnings
  const decrementPlayerHealthRef = useRef((amount: number) => {
    useGalaxyHopping.getState().decrementPlayerHealth(amount);
  });

  const incrementScoreRef = useRef((amount: number) => {
    useGalaxyHopping.getState().incrementScore(amount);
  });

  const incrementGalaxyRef = useRef(() => {
    useGalaxyHopping.getState().incrementGalaxy();
  });

  const setGameStateRef = useRef((state: 'playing' | 'paused' | 'gameOver' | 'mainMenu' | 'options' | 'highScores' | 'loading') => {
    useGalaxyHopping.getState().setGameState(state);
  });

  // Get audio context
  const { 
    backgroundMusic, 
    playHit, 
    playSuccess 
  } = useAudio();

  // Game state refs
  const playerRef = useRef<THREE.Group>(null);
  const playerPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const playerRotationRef = useRef(new THREE.Euler(0, 0, 0));
  const lastFireTimeRef = useRef(0);

  // Game objects state
  const [enemies, setEnemies] = useState<EnemyObject[]>([]);
  const [playerBullets, setPlayerBullets] = useState<BulletObject[]>([]);
  const [enemyBullets, setEnemyBullets] = useState<BulletObject[]>([]);
  const [enemiesKilled, setEnemiesKilled] = useState(0);

  // Generate random stars for background
  const stars = useMemo(() => {
    return generateStars(1000, 500);
  }, []);

  // Control inputs
  const forward = useKeyboardControls<Controls>(state => state.forward);
  const backward = useKeyboardControls<Controls>(state => state.backward);
  const left = useKeyboardControls<Controls>(state => state.left);
  const right = useKeyboardControls<Controls>(state => state.right);
  const fire = useKeyboardControls<Controls>(state => state.fire);
  const pause = useKeyboardControls<Controls>(state => state.pause);

  // Handle pause key
  useEffect(() => {
    if (pause && gameState === 'playing') {
      setGameStateRef.current('paused');
    }
  }, [pause, gameState]);

  // Set up galaxy and reset state when galaxy changes
  useEffect(() => {
    // Reset enemies and bullets when the galaxy changes
    setEnemies([]);
    setPlayerBullets([]);
    setEnemyBullets([]);
    setEnemiesKilled(0);

    // Play background music if it exists
    if (backgroundMusic && gameState === 'playing') {
      backgroundMusic.play().catch((error: Error) => {
        console.log("Background music play prevented:", error);
      });
    }

    return () => {
      // Pause background music when component unmounts
      if (backgroundMusic) {
        backgroundMusic.pause();
      }
    };
  }, [currentGalaxy, gameState, backgroundMusic]);

  // Fire player bullets
  const firePlayerBullet = () => {
    if (!playerRef.current) return;

    const now = performance.now() / 1000;
    if (now - lastFireTimeRef.current < CONFIG.PLAYER.FIRE_RATE) return;

    // Set the last fire time
    lastFireTimeRef.current = now;

    // Get position and forward direction from player
    const position = new THREE.Vector3();
    playerRef.current.getWorldPosition(position);

    // Calculate direction from player's rotation
    const direction = new THREE.Vector3(0, 0, -1)
      .applyEuler(playerRotationRef.current)
      .normalize();

    // Create bullet velocity
    const velocity = direction.clone().multiplyScalar(CONFIG.BULLET.SPEED);

    // Add new bullet
    setPlayerBullets(prevBullets => [
      ...prevBullets,
      {
        position: position.clone().add(direction.clone().multiplyScalar(2)),
        velocity,
        rotation: playerRotationRef.current.clone(),
        hitRadius: CONFIG.BULLET.HIT_RADIUS,
        isAlive: true,
        fromPlayer: true,
        spawnTime: now
      }
    ]);

    // Play shoot sound
    playHit();
  };

  // Spawn enemies
  const spawnEnemy = () => {
    // Don't spawn if we already have max enemies
    const maxEnemies = Math.floor(
      CONFIG.ENEMY.MAX_COUNT * 
      Math.pow(CONFIG.GALAXY.ENEMY_COUNT_MULTIPLIER, currentGalaxy - 1)
    );
    if (enemies.length >= maxEnemies) return;

    // Get player position
    const playerPos = playerPositionRef.current;

    // Randomly choose enemy type
    const type = Math.random() > 0.3 ? 'chaser' : 'shooter';

    // Spawn enemy at random position (at least 50 units away from player)
    const position = new THREE.Vector3(
      playerPos.x + (Math.random() * 100 - 50),
      0,
      playerPos.z + (Math.random() * 100 - 50)
    );

    // Make sure enemy is at least 40 units away from player
    if (position.distanceTo(playerPos) < 40) {
      position.sub(playerPos).normalize().multiplyScalar(40).add(playerPos);
    }

    // Calculate enemy health based on galaxy
    const health = Math.ceil(
      CONFIG.ENEMY.HEALTH * 
      Math.pow(CONFIG.GALAXY.ENEMY_HEALTH_MULTIPLIER, currentGalaxy - 1)
    );

    // Add new enemy
    setEnemies(prevEnemies => [
      ...prevEnemies,
      {
        position,
        velocity: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
        hitRadius: CONFIG.ENEMY.HIT_RADIUS,
        isAlive: true,
        health,
        type,
        lastFireTime: performance.now() / 1000
      }
    ]);
  };

  // Fire enemy bullets
  const fireEnemyBullet = (enemyPosition: THREE.Vector3, enemyRotation: THREE.Euler) => {
    // Calculate direction from enemy's rotation
    const direction = new THREE.Vector3(0, 0, -1)
      .applyEuler(enemyRotation)
      .normalize();

    // Create bullet velocity
    const velocity = direction.clone().multiplyScalar(CONFIG.ENEMY.BULLET_SPEED);

    // Add new bullet
    setEnemyBullets(prevBullets => [
      ...prevBullets,
      {
        position: enemyPosition.clone().add(direction.clone().multiplyScalar(2)),
        velocity,
        rotation: enemyRotation.clone(),
        hitRadius: CONFIG.BULLET.HIT_RADIUS,
        isAlive: true,
        fromPlayer: false,
        spawnTime: performance.now() / 1000
      }
    ]);
  };

  // Game loop
  useFrame((_, delta) => {
    if (gameState !== 'playing') return;

    // Player actions
    if (fire) {
      firePlayerBullet();
    }

    // Randomly spawn enemies
    if (Math.random() < delta / CONFIG.ENEMY.SPAWN_RATE) {
      spawnEnemy();
    }

    // Update player position ref for other components to use
    if (playerRef.current) {
      playerRef.current.getWorldPosition(playerPositionRef.current);
      playerRotationRef.current.copy(playerRef.current.rotation);
    }

    // Update enemies
    setEnemies(prevEnemies => 
      prevEnemies.map(enemy => {
        if (!enemy.isAlive) return enemy;

        // Update position
        const newPosition = enemy.position.clone().add(
          enemy.velocity.clone().multiplyScalar(delta)
        );

        // Calculate enemy speed based on galaxy
        const enemySpeed = CONFIG.ENEMY.SPEED * 
          Math.pow(CONFIG.GALAXY.ENEMY_SPEED_MULTIPLIER, currentGalaxy - 1);

        // Calculate direction to player
        const toPlayer = new THREE.Vector3()
          .subVectors(playerPositionRef.current, enemy.position)
          .normalize();

        // Calculate new rotation to face player
        const newRotation = new THREE.Euler();
        newRotation.y = Math.atan2(toPlayer.x, -toPlayer.z);

        // Different behavior based on enemy type
        let newVelocity = enemy.velocity.clone();

        if (enemy.type === 'chaser') {
          // Chasers move directly towards the player
          newVelocity = toPlayer.clone().multiplyScalar(enemySpeed);
        } else if (enemy.type === 'shooter') {
          // Shooters maintain distance and shoot
          const distanceToPlayer = enemy.position.distanceTo(playerPositionRef.current);

          if (distanceToPlayer < 30) {
            // Too close, back away
            newVelocity = toPlayer.clone().multiplyScalar(-enemySpeed * 0.5);
          } else if (distanceToPlayer > 60) {
            // Too far, get closer
            newVelocity = toPlayer.clone().multiplyScalar(enemySpeed * 0.5);
          } else {
            // Good distance, slow down
            newVelocity.multiplyScalar(0.9);
          }

          // Fire at player if enough time has passed
          const now = performance.now() / 1000;
          if (now - enemy.lastFireTime > CONFIG.ENEMY.FIRE_RATE) {
            fireEnemyBullet(enemy.position, newRotation);
            enemy.lastFireTime = now;
          }
        }

        return {
          ...enemy,
          position: newPosition,
          velocity: newVelocity,
          rotation: newRotation
        };
      })
    );

    // Update player bullets
    setPlayerBullets(prevBullets => 
      prevBullets
        .filter(bullet => {
          // Remove bullets that have been alive too long
          const now = performance.now() / 1000;
          return now - bullet.spawnTime < CONFIG.BULLET.LIFETIME && bullet.isAlive;
        })
        .map(bullet => {
          // Update position
          const newPosition = bullet.position.clone().add(
            bullet.velocity.clone().multiplyScalar(delta)
          );

          return {
            ...bullet,
            position: newPosition
          };
        })
    );

    // Update enemy bullets
    setEnemyBullets(prevBullets => 
      prevBullets
        .filter(bullet => {
          // Remove bullets that have been alive too long
          const now = performance.now() / 1000;
          return now - bullet.spawnTime < CONFIG.BULLET.LIFETIME && bullet.isAlive;
        })
        .map(bullet => {
          // Update position
          const newPosition = bullet.position.clone().add(
            bullet.velocity.clone().multiplyScalar(delta)
          );

          return {
            ...bullet,
            position: newPosition
          };
        })
    );

    // Check player bullets hitting enemies
    setPlayerBullets(prevBullets => 
      prevBullets.map(bullet => {
        if (!bullet.isAlive) return bullet;

        // Check collisions with enemies
        for (const enemy of enemies) {
          if (!enemy.isAlive) continue;

          const distance = bullet.position.distanceTo(enemy.position);
          if (distance < bullet.hitRadius + enemy.hitRadius) {
            // Mark bullet as not alive
            bullet.isAlive = false;

            // Reduce enemy health
            enemy.health -= 1;
            if (enemy.health <= 0) {
              enemy.isAlive = false;

              // Increment score and enemies killed
              incrementScoreRef.current(CONFIG.ENEMY.POINTS);
              setEnemiesKilled(prev => prev + 1);

              // Play explosion sound
              playSuccess();
            }

            break;
          }
        }

        return bullet;
      })
    );

    // Check enemy bullets hitting player
    setEnemyBullets(prevBullets => 
      prevBullets.map(bullet => {
        if (!bullet.isAlive) return bullet;

        // Check collision with player
        const distance = bullet.position.distanceTo(playerPositionRef.current);
        if (distance < bullet.hitRadius + CONFIG.PLAYER.HIT_RADIUS) {
          // Mark bullet as not alive
          bullet.isAlive = false;

          // Damage player
          decrementPlayerHealthRef.current(10);

          // Play hit sound
          playHit();
        }

        return bullet;
      })
    );

    // Check enemies hitting player
    setEnemies(prevEnemies => 
      prevEnemies.map(enemy => {
        if (!enemy.isAlive) return enemy;

        // Check collision with player
        const distance = enemy.position.distanceTo(playerPositionRef.current);
        if (distance < enemy.hitRadius + CONFIG.PLAYER.HIT_RADIUS) {
          // Mark enemy as not alive
          enemy.isAlive = false;

          // Damage player
          decrementPlayerHealthRef.current(20);

          // Increment score
          incrementScoreRef.current(CONFIG.ENEMY.POINTS / 2);

          // Increment enemies killed
          setEnemiesKilled(prev => prev + 1);

          // Play explosion sound
          playSuccess();
        }

        return enemy;
      })
    );

    // Filter out dead enemies
    setEnemies(prevEnemies => prevEnemies.filter(enemy => enemy.isAlive));

    // Check if enough enemies have been killed to advance to next galaxy
    if (enemiesKilled >= CONFIG.GALAXY.ENEMY_COUNT_TO_ADVANCE) {
      incrementGalaxyRef.current();
      setEnemiesKilled(0);
    }
  });

  return (
    <>
      {/* Game manager - handles global aspects like scene setup */}
      <GameManager />

      {/* Galaxy background */}
      <Galaxy currentGalaxy={currentGalaxy} />

      {/* Animated environment objects */}
      <AnimatedEnvironment />

      {/* Player spacecraft with user-selected ship type */}
      <Player 
        ref={playerRef}
        health={playerHealth}
        forward={forward}
        backward={backward}
        left={left}
        right={right}
        vehicleType={selectedShipType}
      />

      {/* Enemy ships */}
      {enemies.map((enemy, index) => (
        <Enemy 
          key={`enemy-${index}`}
          position={enemy.position}
          rotation={enemy.rotation}
          type={enemy.type}
        />
      ))}

      {/* Player bullets */}
      {playerBullets
        .filter(bullet => bullet.isAlive)
        .map((bullet, index) => (
          <Bullet 
            key={`player-bullet-${index}`}
            position={bullet.position}
            rotation={bullet.rotation}
            fromPlayer={true}
          />
        ))
      }

      {/* Enemy bullets */}
      {enemyBullets
        .filter(bullet => bullet.isAlive)
        .map((bullet, index) => (
          <Bullet 
            key={`enemy-bullet-${index}`}
            position={bullet.position}
            rotation={bullet.rotation}
            fromPlayer={false}
          />
        ))
      }

      {/* Stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={stars.length}
            array={new Float32Array(stars.flatMap((v: THREE.Vector3) => [v.x, v.y, v.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={1.5}
          color="#ffffff"
          sizeAttenuation={true}
        />
      </points>
    </>
  );
}