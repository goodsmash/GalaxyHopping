import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ModelAnimatorProps {
  target: React.RefObject<THREE.Object3D>;
  rotationSpeed?: [number, number, number];
  oscillation?: {
    axis: 'x' | 'y' | 'z';
    speed: number;
    amplitude: number;
  };
  pulsate?: {
    speed: number;
    min: number;
    max: number;
  };
  orbit?: {
    center: [number, number, number];
    speed: number;
    radius: number;
    axis?: 'xz' | 'xy' | 'yz';
  };
  path?: {
    points: [number, number, number][];
    speed: number;
    loop?: boolean;
  };
  children?: React.ReactNode;
}

/**
 * A utility component that animates any 3D object with various motion effects
 */
export function ModelAnimator({
  target,
  rotationSpeed = [0, 0, 0],
  oscillation,
  pulsate,
  orbit,
  path,
  children
}: ModelAnimatorProps) {
  // Reference to the original position if needed for oscillation
  const originalPosition = useRef<THREE.Vector3 | null>(null);
  // For path following
  const pathIndex = useRef(0);
  const pathProgress = useRef(0);
  
  // Store original position on first render
  useEffect(() => {
    if (target.current) {
      originalPosition.current = target.current.position.clone();
    }
  }, [target]);
  
  // Animation frame logic
  useFrame((_, delta) => {
    if (!target.current || !originalPosition.current) return;
    
    // Simple rotation animation
    if (rotationSpeed[0] !== 0) target.current.rotation.x += rotationSpeed[0] * delta;
    if (rotationSpeed[1] !== 0) target.current.rotation.y += rotationSpeed[1] * delta;
    if (rotationSpeed[2] !== 0) target.current.rotation.z += rotationSpeed[2] * delta;
    
    // Oscillation animation (move back and forth on an axis)
    if (oscillation) {
      const time = Date.now() * 0.001;
      const movement = Math.sin(time * oscillation.speed) * oscillation.amplitude;
      
      switch (oscillation.axis) {
        case 'x':
          target.current.position.x = originalPosition.current.x + movement;
          break;
        case 'y':
          target.current.position.y = originalPosition.current.y + movement;
          break;
        case 'z':
          target.current.position.z = originalPosition.current.z + movement;
          break;
      }
    }
    
    // Pulsate animation (scale up and down)
    if (pulsate) {
      const time = Date.now() * 0.001;
      const scale = pulsate.min + (Math.sin(time * pulsate.speed) * 0.5 + 0.5) * (pulsate.max - pulsate.min);
      target.current.scale.set(scale, scale, scale);
    }
    
    // Orbit animation (circle around a point)
    if (orbit) {
      const time = Date.now() * 0.001 * orbit.speed;
      const center = new THREE.Vector3(...orbit.center);
      
      switch (orbit.axis || 'xz') {
        case 'xz':
          target.current.position.x = center.x + Math.cos(time) * orbit.radius;
          target.current.position.z = center.z + Math.sin(time) * orbit.radius;
          break;
        case 'xy':
          target.current.position.x = center.x + Math.cos(time) * orbit.radius;
          target.current.position.y = center.y + Math.sin(time) * orbit.radius;
          break;
        case 'yz':
          target.current.position.y = center.y + Math.cos(time) * orbit.radius;
          target.current.position.z = center.z + Math.sin(time) * orbit.radius;
          break;
      }
      
      // Make the object face the direction of movement
      const lookAt = center.clone();
      target.current.lookAt(lookAt);
    }
    
    // Path following animation
    if (path && path.points.length > 1) {
      pathProgress.current += delta * path.speed;
      
      // Find the current segment
      while (pathProgress.current > 1) {
        pathProgress.current--;
        pathIndex.current = (pathIndex.current + 1) % path.points.length;
        
        // If not looping and we reached the end, stop at the last point
        if (!path.loop && pathIndex.current === 0) {
          pathIndex.current = path.points.length - 1;
          pathProgress.current = 0;
          break;
        }
      }
      
      const currentPoint = path.points[pathIndex.current];
      const nextPoint = path.points[(pathIndex.current + 1) % path.points.length];
      
      // Interpolate between current and next point
      const x = THREE.MathUtils.lerp(currentPoint[0], nextPoint[0], pathProgress.current);
      const y = THREE.MathUtils.lerp(currentPoint[1], nextPoint[1], pathProgress.current);
      const z = THREE.MathUtils.lerp(currentPoint[2], nextPoint[2], pathProgress.current);
      
      target.current.position.set(x, y, z);
      
      // Make the object face the direction of movement
      const currentPos = new THREE.Vector3(x, y, z);
      const nextPos = new THREE.Vector3(
        THREE.MathUtils.lerp(currentPoint[0], nextPoint[0], Math.min(pathProgress.current + 0.1, 1)),
        THREE.MathUtils.lerp(currentPoint[1], nextPoint[1], Math.min(pathProgress.current + 0.1, 1)),
        THREE.MathUtils.lerp(currentPoint[2], nextPoint[2], Math.min(pathProgress.current + 0.1, 1))
      );
      
      // Only update rotation if the positions are different enough
      if (nextPos.distanceTo(currentPos) > 0.001) {
        target.current.lookAt(nextPos);
      }
    }
  });
  
  return <>{children}</>;
}