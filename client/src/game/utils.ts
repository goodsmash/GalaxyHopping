import * as THREE from 'three';
import { GameObject, CollisionResult, CONFIG } from './types';

// Check if two game objects are colliding
export function checkCollision(obj1: GameObject, obj2: GameObject): CollisionResult {
  const distance = obj1.position.distanceTo(obj2.position);
  const collisionDistance = obj1.hitRadius + obj2.hitRadius;
  
  return {
    hit: distance < collisionDistance,
    distance
  };
}

// Keep an object within the galaxy bounds
export function keepInBounds(position: THREE.Vector3): THREE.Vector3 {
  const bounds = CONFIG.GALAXY.BOUNDS;
  
  position.x = Math.max(-bounds, Math.min(bounds, position.x));
  position.z = Math.max(-bounds, Math.min(bounds, position.z));
  
  return position;
}

// Generate a random position within the galaxy bounds
export function randomPosition(minDistance: number = 0, fromPosition?: THREE.Vector3): THREE.Vector3 {
  const bounds = CONFIG.GALAXY.BOUNDS * 0.8; // 80% of bounds to keep away from edges
  let position: THREE.Vector3;
  
  // Keep generating positions until we get one that's far enough from fromPosition
  do {
    position = new THREE.Vector3(
      (Math.random() * 2 - 1) * bounds,
      0, // Keep y at 0 for now
      (Math.random() * 2 - 1) * bounds
    );
  } while (fromPosition && position.distanceTo(fromPosition) < minDistance);
  
  return position;
}

// Generate a random color for enemies based on type
export function getEnemyColor(type: 'chaser' | 'shooter'): THREE.Color {
  return type === 'chaser' 
    ? new THREE.Color(0xff5500) // Orange for chasers
    : new THREE.Color(0x00aaff); // Blue for shooters
}

// Generate a random vector direction
export function randomDirection(): THREE.Vector3 {
  return new THREE.Vector3(
    Math.random() * 2 - 1,
    0, // Keep y at 0 for now
    Math.random() * 2 - 1
  ).normalize();
}

// Get a direction vector from one position to another
export function getDirectionTo(from: THREE.Vector3, to: THREE.Vector3): THREE.Vector3 {
  return new THREE.Vector3()
    .subVectors(to, from)
    .normalize();
}

// Calculate a score multiplier based on the current galaxy
export function getScoreMultiplier(galaxy: number): number {
  return 1 + (galaxy - 1) * 0.5; // 1.0, 1.5, 2.0, etc.
}

// Format a number with commas
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Generate stars for the background
export function generateStars(count: number, spread: number): THREE.Vector3[] {
  const stars: THREE.Vector3[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate stars in a sphere around the origin
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const radius = Math.random() * spread;
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    stars.push(new THREE.Vector3(x, y, z));
  }
  
  return stars;
}
