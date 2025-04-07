import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF, Text } from '@react-three/drei';
import { useGalaxyHopping } from '../lib/stores/useGalaxyHopping';
import { useAudio } from '../lib/stores/useAudio';

interface BossBattleProps {
  playerRef: React.RefObject<THREE.Group>;
  active: boolean;
  onBossDefeated: () => void;
}

export function BossBattle({ playerRef, active, onBossDefeated }: BossBattleProps) {
  const { scene } = useThree();
  const bossRef = useRef<THREE.Group>(null);
  const healthBarRef = useRef<THREE.Mesh>(null);
  const [bossHealth, setBossHealth] = useState(100);
  const [bossActive, setBossActive] = useState(false);
  const [battleStarted, setBattleStarted] = useState(false);
  const [phase, setPhase] = useState(1);
  const [attackCooldown, setAttackCooldown] = useState(0);
  const [attackPattern, setAttackPattern] = useState<'circle' | 'beam' | 'missiles'>('circle');
  const attackTimer = useRef(0);
  
  // Get the current galaxy and other game state
  const currentGalaxy = useGalaxyHopping(state => state.currentGalaxy);
  const difficulty = useGalaxyHopping(state => state.difficulty);
  const playerHealth = useGalaxyHopping(state => state.playerHealth);
  const decrementPlayerHealth = useGalaxyHopping(state => state.decrementPlayerHealth);
  
  // Calculate boss difficulty based on galaxy number
  const baseBossHealth = 75 + (currentGalaxy * 25);
  const bossMaxHealth = difficulty === 'easy' ? baseBossHealth : 
                        difficulty === 'normal' ? baseBossHealth * 1.5 :
                        baseBossHealth * 2;
  
  // Calculate boss damage
  const bossDamage = difficulty === 'easy' ? 5 : 
                     difficulty === 'normal' ? 10 :
                     15;
  
  // Load boss model
  const { scene: bossModel } = useGLTF('/models/alien_mothership.glb');
  
  // Sound effects
  const { playSound } = useAudio();
  
  // Initialize boss battle
  useEffect(() => {
    if (active && !bossActive) {
      console.log(`Starting boss battle for galaxy ${currentGalaxy}`);
      setBossHealth(bossMaxHealth);
      setBossActive(true);
      
      // Play boss music
      playSound('boss_music', 0.7, true);
      
      // Reset attack pattern
      setAttackPattern('circle');
      setPhase(1);
      attackTimer.current = 0;
      
      // Delay battle start to let player prepare
      setTimeout(() => {
        setBattleStarted(true);
      }, 3000);
    }
  }, [active, bossActive, currentGalaxy, bossMaxHealth]);
  
  // Battle phases and attack patterns
  useFrame((state, delta) => {
    if (!bossActive || !battleStarted || !bossRef.current || !playerRef.current) return;
    
    // Position boss to face player
    const playerPos = new THREE.Vector3();
    playerRef.current.getWorldPosition(playerPos);
    
    // Boss should maintain a fixed distance from player
    const idealDistance = 50;
    const bossPos = bossRef.current.position.clone();
    const dirToPlayer = new THREE.Vector3().subVectors(playerPos, bossPos).normalize();
    
    // Calculate current distance
    const currentDistance = bossPos.distanceTo(playerPos);
    
    // Move boss toward or away from player to maintain distance
    if (Math.abs(currentDistance - idealDistance) > 5) {
      const moveSpeed = delta * 10;
      if (currentDistance > idealDistance) {
        // Move closer
        bossRef.current.position.add(dirToPlayer.multiplyScalar(moveSpeed));
      } else {
        // Move away
        bossRef.current.position.sub(dirToPlayer.normalize().multiplyScalar(moveSpeed));
      }
    }
    
    // Boss always looks at player
    const lookAtPos = playerPos.clone();
    bossRef.current.lookAt(lookAtPos);
    
    // Decrease cooldown
    if (attackCooldown > 0) {
      setAttackCooldown(prev => Math.max(0, prev - delta));
    }
    
    // Handle attack patterns based on current phase
    if (attackCooldown <= 0) {
      // Update attack timer
      attackTimer.current += delta;
      
      // Phase changes based on health
      const healthPercent = bossHealth / bossMaxHealth * 100;
      if (healthPercent < 30 && phase < 3) {
        setPhase(3);
        playSound('boss_phase_change', 1, false);
        console.log("Boss entering rage phase!");
      } else if (healthPercent < 60 && phase < 2) {
        setPhase(2);
        playSound('boss_phase_change', 0.8, false);
        console.log("Boss entering aggressive phase!");
      }
      
      // Execute attacks
      if (attackTimer.current > (4 - phase)) {
        // Reset timer and choose next attack
        attackTimer.current = 0;
        
        // Choose attack pattern
        const patterns: Array<'circle' | 'beam' | 'missiles'> = ['circle', 'beam', 'missiles'];
        const nextPattern = patterns[Math.floor(Math.random() * patterns.length)];
        setAttackPattern(nextPattern);
        
        // Execute the attack
        executeAttack(nextPattern);
        
        // Set cooldown based on phase
        setAttackCooldown(4 - phase * 0.5);
      }
    }
    
    // Show phase effects
    if (bossRef.current) {
      // Boss gets more red as health decreases
      const healthRatio = bossHealth / bossMaxHealth;
      const intensity = (1 - healthRatio) * 2;
      
      // Modify emissive materials to show damage
      bossRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.5 + intensity;
          
          if (phase >= 3) {
            // Rage phase - red glow
            mat.emissive = new THREE.Color(1, 0.2, 0.2);
          } else if (phase >= 2) {
            // Aggressive phase - orange glow
            mat.emissive = new THREE.Color(1, 0.5, 0.2);
          }
        }
      });
    }
    
    // Update health bar
    if (healthBarRef.current) {
      const healthRatio = bossHealth / bossMaxHealth;
      healthBarRef.current.scale.x = healthRatio;
    }
  });
  
  // Execute different attack patterns
  const executeAttack = (attackType: 'circle' | 'beam' | 'missiles') => {
    if (!playerRef.current || !bossRef.current) return;
    
    const playerPos = new THREE.Vector3();
    playerRef.current.getWorldPosition(playerPos);
    
    const bossPos = new THREE.Vector3();
    bossRef.current.getWorldPosition(bossPos);
    
    console.log(`Boss executing ${attackType} attack in phase ${phase}`);
    
    switch (attackType) {
      case 'circle':
        // Circle attack - creates projectiles in a circle pattern
        playSound('boss_attack_circle', 0.6, false);
        
        // Create projectiles in a circle
        const projectileCount = 8 + phase * 4; // More projectiles in higher phases
        
        for (let i = 0; i < projectileCount; i++) {
          const angle = (i / projectileCount) * Math.PI * 2;
          const direction = new THREE.Vector3(
            Math.cos(angle),
            0,
            Math.sin(angle)
          );
          
          // Create projectile
          setTimeout(() => {
            createBossProjectile(bossPos, direction, 'circle');
          }, i * 50); // Stagger the shots
        }
        break;
        
      case 'beam':
        // Beam attack - concentrated damage in player's direction
        playSound('boss_attack_beam', 0.7, false);
        
        // Calculate direction to player
        const dirToPlayer = new THREE.Vector3().subVectors(playerPos, bossPos).normalize();
        
        // Create multiple beam segments
        const beamCount = 5 + phase * 2;
        
        for (let i = 0; i < beamCount; i++) {
          setTimeout(() => {
            // Add slight random variation to make it more challenging
            const variance = phase === 1 ? 0.3 : phase === 2 ? 0.2 : 0.1;
            const randomDir = dirToPlayer.clone().add(
              new THREE.Vector3(
                (Math.random() - 0.5) * variance,
                0,
                (Math.random() - 0.5) * variance
              )
            ).normalize();
            
            createBossProjectile(bossPos, randomDir, 'beam');
          }, i * 100);
        }
        break;
        
      case 'missiles':
        // Missile attack - homing projectiles that follow the player
        playSound('boss_attack_missiles', 0.5, false);
        
        // Launch several missiles
        const missileCount = 2 + phase;
        
        for (let i = 0; i < missileCount; i++) {
          setTimeout(() => {
            // Random initial direction
            const randomDir = new THREE.Vector3(
              Math.random() * 2 - 1,
              0,
              Math.random() * 2 - 1
            ).normalize();
            
            createBossProjectile(bossPos, randomDir, 'missile');
          }, i * 300);
        }
        break;
    }
  };
  
  // Create a boss projectile
  const createBossProjectile = (
    startPos: THREE.Vector3, 
    direction: THREE.Vector3, 
    type: 'circle' | 'beam' | 'missile'
  ) => {
    // Create projectile mesh
    const projectileSize = type === 'beam' ? [0.5, 0.5, 5] : 
                          type === 'missile' ? [0.7, 0.7, 2] : 
                          [0.8, 0.8, 0.8];
                          
    const projectileGeo = type === 'beam' ? new THREE.CylinderGeometry(0.5, 0.5, 5) :
                         type === 'missile' ? new THREE.ConeGeometry(0.7, 2) :
                         new THREE.SphereGeometry(0.8);
                         
    const projectileColor = type === 'beam' ? new THREE.Color(1, 0.2, 0.2) :
                           type === 'missile' ? new THREE.Color(1, 0.5, 0) :
                           new THREE.Color(0.5, 0, 1);
                           
    const projectileMat = new THREE.MeshStandardMaterial({
      color: projectileColor,
      emissive: projectileColor,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.8
    });
    
    const projectile = new THREE.Mesh(projectileGeo, projectileMat);
    
    // Set position, rotation and add to scene
    projectile.position.copy(startPos);
    
    // Orient projectile along its direction
    if (type === 'beam' || type === 'missile') {
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0), 
        direction.clone().normalize()
      );
      projectile.quaternion.copy(quat);
    }
    
    // Add to scene
    scene.add(projectile);
    
    // Add light to the projectile
    const light = new THREE.PointLight(projectileColor, type === 'beam' ? 5 : 2, 10);
    projectile.add(light);
    
    // Set projectile data
    projectile.userData = { 
      type: 'bossProjectile', 
      projectileType: type, 
      direction: direction.clone(),
      speed: type === 'beam' ? 60 : type === 'missile' ? 25 : 40,
      damage: bossDamage * (type === 'beam' ? 1.5 : 1),
      created: Date.now(),
      lifetime: type === 'missile' ? 5000 : 3000 // milliseconds until removed
    };
    
    // Animation loop for this projectile
    let isActive = true;
    const homing = type === 'missile';
    
    const updateProjectile = (time: number) => {
      if (!isActive || !projectile.parent) return;
      
      // Calculate elapsed time
      const elapsed = Date.now() - projectile.userData.created;
      
      // Check lifetime
      if (elapsed > projectile.userData.lifetime) {
        // Remove projectile
        scene.remove(projectile);
        isActive = false;
        return;
      }
      
      // Update missile direction to home in on player
      if (homing && playerRef.current) {
        const playerPos = new THREE.Vector3();
        playerRef.current.getWorldPosition(playerPos);
        
        // Calculate direction to player
        const dirToPlayer = new THREE.Vector3()
          .subVectors(playerPos, projectile.position)
          .normalize();
        
        // Gradually adjust direction toward player
        const homingStrength = 0.1; // 0-1, how quickly missiles turn
        projectile.userData.direction.lerp(dirToPlayer, homingStrength);
        
        // Update rotation to match direction
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0), 
          projectile.userData.direction.clone().normalize()
        );
        projectile.quaternion.copy(quat);
      }
      
      // Move projectile
      const moveDistance = projectile.userData.speed * time;
      const movement = projectile.userData.direction.clone().multiplyScalar(moveDistance);
      projectile.position.add(movement);
      
      // Check for collision with player
      if (playerRef.current) {
        const playerPos = new THREE.Vector3();
        playerRef.current.getWorldPosition(playerPos);
        
        const distance = projectile.position.distanceTo(playerPos);
        const collisionThreshold = 2; // Adjust based on player model size
        
        if (distance < collisionThreshold) {
          console.log(`Player hit by boss ${projectile.userData.projectileType} attack!`);
          
          // Apply damage to player
          decrementPlayerHealth(projectile.userData.damage);
          
          // Play hit sound
          playSound('player_hit', 0.6, false);
          
          // Remove projectile
          scene.remove(projectile);
          isActive = false;
          return;
        }
      }
      
      // Continue animation
      if (isActive) {
        requestAnimationFrame((time) => updateProjectile(time/1000));
      }
    };
    
    // Start animation
    requestAnimationFrame((time) => updateProjectile(time/1000));
  };
  
  // Handle player shots hitting the boss
  useEffect(() => {
    // Custom event handler for bullet hits
    const handleBulletHit = (event: CustomEvent) => {
      const { bossHit } = event.detail;
      
      if (bossHit && bossActive && battleStarted) {
        // Calculate damage based on player weapon
        const damage = event.detail.damage || 5;
        
        // Update boss health
        setBossHealth(prevHealth => {
          const newHealth = Math.max(0, prevHealth - damage);
          
          // Check if boss is defeated
          if (newHealth <= 0 && prevHealth > 0) {
            handleBossDefeated();
          }
          
          return newHealth;
        });
        
        // Play hit sound
        playSound('boss_hit', 0.4, false);
      }
    };
    
    // Register event listener
    window.addEventListener('bullet-hit-boss', handleBulletHit as EventListener);
    
    return () => {
      window.removeEventListener('bullet-hit-boss', handleBulletHit as EventListener);
    };
  }, [bossActive, battleStarted]);
  
  // Handle boss defeated
  const handleBossDefeated = () => {
    console.log("Boss defeated!");
    
    // Play victory sound
    playSound('boss_defeated', 0.8, false);
    
    // Stop boss music
    playSound('boss_music', 0, false);
    
    // Reset boss state
    setBossActive(false);
    setBattleStarted(false);
    
    // Grant bonus points and handle level completion
    onBossDefeated();
  };
  
  if (!active) return null;
  
  return (
    <group>
      {/* Boss model */}
      <group 
        ref={bossRef} 
        position={[0, 20, -100]} // Start position
        scale={[5, 5, 5]} // Scale up the boss
        name="boss"
        userData={{ type: 'boss', health: bossHealth }}
      >
        <primitive object={bossModel.clone()} castShadow />
        
        {/* Effects based on phase */}
        {phase >= 2 && (
          <pointLight 
            color={phase >= 3 ? 'red' : 'orange'} 
            intensity={10} 
            distance={20}
          />
        )}
      </group>
      
      {/* Health bar */}
      <group position={[0, 35, -100]} rotation={[0, 0, 0]}>
        {/* Background */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[30, 2, 0.5]} />
          <meshBasicMaterial color="darkred" transparent opacity={0.7} />
        </mesh>
        
        {/* Health indicator */}
        <mesh position={[0, 0, 0.1]} ref={healthBarRef}>
          <boxGeometry args={[30, 2, 0.5]} />
          <meshBasicMaterial color="red" />
        </mesh>
        
        {/* Boss name */}
        <Text
          position={[0, 4, 0]}
          fontSize={3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {`Galaxy ${currentGalaxy} Boss`}
        </Text>
      </group>
      
      {/* Battle start announcement */}
      {!battleStarted && (
        <Text
          position={[0, 0, 0]}
          fontSize={5}
          color="red"
          anchorX="center"
          anchorY="middle"
        >
          BOSS BATTLE IMMINENT
        </Text>
      )}
    </group>
  );
}