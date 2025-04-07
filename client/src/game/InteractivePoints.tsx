import { useRef, useMemo, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface Point {
  position: [number, number, number];
  name?: string;
  color?: THREE.Color | string;
  size?: number;
  data?: any;
}

interface InteractivePointsProps {
  points: Point[];
  onPointHover?: (point: Point | null) => void;
  onPointClick?: (point: Point) => void;
  maxDistance?: number;
  pointSize?: number;
  hoverScale?: number;
}

export function InteractivePoints({
  points,
  onPointHover,
  onPointClick,
  maxDistance = 100,
  pointSize = 2,
  hoverScale = 1.8
}: InteractivePointsProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const { camera, raycaster, mouse, viewport, gl } = useThree();

  // Generate point attributes
  const { positions, colors, sizes, originalSizes } = useMemo(() => {
    const positionsArray = new Float32Array(points.length * 3);
    const colorsArray = new Float32Array(points.length * 3);
    const sizesArray = new Float32Array(points.length);
    const originalSizesArray = new Float32Array(points.length);

    points.forEach((point, i) => {
      // Position
      positionsArray[i * 3] = point.position[0];
      positionsArray[i * 3 + 1] = point.position[1];
      positionsArray[i * 3 + 2] = point.position[2];

      // Color (default to white if not specified)
      const color = point.color ? new THREE.Color(point.color) : new THREE.Color(1, 1, 1);
      colorsArray[i * 3] = color.r;
      colorsArray[i * 3 + 1] = color.g;
      colorsArray[i * 3 + 2] = color.b;

      // Size (default to pointSize if not specified)
      const size = point.size || pointSize;
      sizesArray[i] = size;
      originalSizesArray[i] = size; // Store original sizes for hover animations
    });

    return {
      positions: positionsArray,
      colors: colorsArray,
      sizes: sizesArray,
      originalSizes: originalSizesArray
    };
  }, [points, pointSize]);

  // Create point material
  const pointsMaterial = useMemo(() => {
    // Create glowing point texture
    const texture = new THREE.CanvasTexture((() => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext('2d')!;
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);
      return canvas;
    })());

    const material = new THREE.PointsMaterial({
      size: 1,
      map: texture,
      sizeAttenuation: true,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    return material;
  }, []);

  // Handle hover detection
  const handleHover = useCallback(() => {
    if (!pointsRef.current) return;

    // Set up raycaster
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(pointsRef.current, false);

    // Update hovered point
    if (intersects.length > 0 && typeof intersects[0].index === 'number') {
      const index = intersects[0].index as number;
      
      // Check if point is within max distance and index is valid
      if (index >= 0 && index < points.length) {
        const point = new THREE.Vector3(
          positions[index * 3],
          positions[index * 3 + 1], 
          positions[index * 3 + 2]
        );
        const distance = camera.position.distanceTo(point);
        
        if (distance <= maxDistance) {
          if (hovered !== index) {
            setHovered(index);
            onPointHover && onPointHover(points[index]);
            gl.domElement.style.cursor = 'pointer';
          }
        } else {
          if (hovered !== null) {
            setHovered(null);
            onPointHover && onPointHover(null);
            gl.domElement.style.cursor = 'auto';
          }
        }
      }
    } else {
      if (hovered !== null) {
        setHovered(null);
        onPointHover && onPointHover(null);
        gl.domElement.style.cursor = 'auto';
      }
    }
  }, [hovered, maxDistance, mouse, camera, raycaster, onPointHover, points, positions, gl.domElement.style]);

  // Handle click
  const handleClick = useCallback(() => {
    if (hovered !== null && onPointClick) {
      onPointClick(points[hovered]);
    }
  }, [hovered, onPointClick, points]);

  // Add event listeners
  useFrame(() => {
    // Run hover detection on each frame
    handleHover();

    // Animate hovered point
    if (pointsRef.current) {
      const sizes = pointsRef.current.geometry.attributes.size.array as Float32Array;
      
      // Animate all point sizes
      for (let i = 0; i < sizes.length; i++) {
        // Reset non-hovered points to original size
        if (i !== hovered) {
          const originalSize = originalSizes[i];
          sizes[i] = THREE.MathUtils.lerp(sizes[i], originalSize, 0.1);
        } else {
          // Scale up hovered point
          const targetSize = originalSizes[i] * hoverScale;
          sizes[i] = THREE.MathUtils.lerp(sizes[i], targetSize, 0.1);
        }
      }
      
      pointsRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });

  // Render the points
  return (
    <points 
      ref={pointsRef} 
      onClick={handleClick}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <primitive object={pointsMaterial} attach="material" />
    </points>
  );
}