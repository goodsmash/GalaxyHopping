import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CONFIG } from './types';

interface TerrainProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  segments?: number;
  amplitude?: number;
  seed?: number;
  color?: THREE.Color;
  wireframe?: boolean;
  animate?: boolean;
}

export function Terrain({
  position = [0, -50, 0],
  rotation = [Math.PI / 2, 0, 0],
  width = 500,
  height = 500,
  segments = 100,
  amplitude = 15,
  seed = 123,
  color = new THREE.Color(0.3, 0.4, 0.7),
  wireframe = false,
  animate = false
}: TerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Generate height data
  const heightData = useMemo(() => {
    // Seeded random function to ensure consistent terrain
    const seededRandom = (x: number, y: number) => {
      const dot = x * 12.9898 + y * 78.233 + seed;
      return Math.sin(dot) * 43758.5453 % 1;
    };
    
    // Create a heightmap using multiple layers of noise (like octaves)
    const generateHeight = (x: number, y: number) => {
      const size = segments;
      // Normalize x and y to 0-1 range
      const nx = x / size;
      const ny = y / size;
      
      // Multi-octave noise for more natural looking terrain
      let val = 0;
      let freq = 1;
      let amp = 1;
      const octaves = 8; // Increased octaves for more detail
      
      for (let o = 0; o < octaves; o++) {
        // Perlin-like noise approximation
        const px = nx * freq;
        const py = ny * freq;
        const ix = Math.floor(px);
        const iy = Math.floor(py);
        const fx = px - ix;
        const fy = py - iy;
        
        // Smoothed noise at 4 corners
        const n00 = seededRandom(ix, iy);
        const n10 = seededRandom(ix + 1, iy);
        const n01 = seededRandom(ix, iy + 1);
        const n11 = seededRandom(ix + 1, iy + 1);
        
        // Bilinear interpolation with improved smoothing
        const nx0 = THREE.MathUtils.lerp(n00, n10, smoothStep(fx));
        const nx1 = THREE.MathUtils.lerp(n01, n11, smoothStep(fx));
        const nxy = THREE.MathUtils.lerp(nx0, nx1, smoothStep(fy));
        
        val += nxy * amp;
        
        // Adjust for next octave
        freq *= 2.1; // Slightly higher frequency increase for more variation
        amp *= 0.55; // Slower amplitude falloff for more dramatic terrain
      }
      
      // Apply crater/mountain formations
      const craterEffect = addCraters(nx, ny, 15, 0.4); // More craters with stronger effect
      
      // Ridge formation - creates sharper mountain ridges
      const ridge = Math.abs(val * 2 - 1);
      const ridged = Math.pow(1 - ridge, 2); // Square for sharper ridges
      
      // Mountain ranges along specific directions
      const mountainRange = Math.abs(Math.sin(nx * 6 + seed * 0.01) * Math.cos(ny * 6 + seed * 0.02)) * 0.5;
      
      // Add plateau formations
      const plateau = smoothStep(val) * (1 - smoothStep(Math.abs(val - 0.6) * 5)) * 0.3;
      
      // Create occasional very tall peaks
      const peaks = Math.pow(val, 8) * 2;
      
      // Combine all effects
      return (val * 0.5 + ridged * 0.25 + craterEffect + plateau + peaks + mountainRange * 0.5) * amplitude;
    };
    
    // Add crater-like features and mountains
    const addCraters = (nx: number, ny: number, count: number, strength: number) => {
      let val = 0;
      
      for (let i = 0; i < count; i++) {
        // Create crater centers based on seed
        const craterX = seededRandom(i, seed * 0.1) * 2 - 1;
        const craterY = seededRandom(i + 100, seed * 0.1) * 2 - 1;
        
        // Distance from point to crater center
        const dx = nx * 2 - 1 - craterX;
        const dy = ny * 2 - 1 - craterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Crater/mountain feature type and size based on seed
        const featureType = seededRandom(i + 300, seed);
        const size = 0.05 + seededRandom(i + 200, seed) * 0.2;
        
        // If point is within feature radius
        if (dist < size) {
          if (featureType < 0.6) {
            // Create crater shape (depression with raised rim)
            const rimWidth = 0.2 + seededRandom(i + 400, seed) * 0.2;
            const rimHeight = 0.3 + seededRandom(i + 500, seed) * 0.7;
            const normalizedDist = dist / size;
            
            // Create more detailed crater with multiple rims and texturing
            if (normalizedDist < 0.7) {
              // Inner crater depression
              val -= (0.7 - normalizedDist) * strength * 1.5;
            } else if (normalizedDist < 0.7 + rimWidth) {
              // Crater rim - higher for larger craters
              const rimFactor = (normalizedDist - 0.7) / rimWidth;
              val += Math.sin(rimFactor * Math.PI) * rimHeight * strength;
            } else {
              // Outer ejecta - subtle texture radiating from crater
              val += Math.sin((normalizedDist - 0.7 - rimWidth) * 10) * 0.05 * strength * 
                    (1 - ((normalizedDist - 0.7 - rimWidth) / (0.3 - rimWidth)));
            }
          } else if (featureType < 0.85) {
            // Create mountain peaks
            const peakHeight = 1.0 + seededRandom(i + 600, seed) * 2.0;
            // Gaussian-like function for smooth mountains
            val += peakHeight * strength * Math.exp(-Math.pow(dist / (size * 0.5), 2));
          } else {
            // Create ridge lines
            const direction = seededRandom(i + 700, seed) * Math.PI;
            const dx2 = Math.cos(direction) * (nx * 2 - 1) + Math.sin(direction) * (ny * 2 - 1);
            const ridgeWidth = 0.1 + seededRandom(i + 800, seed) * 0.2;
            val += strength * Math.exp(-Math.pow(dx2 / ridgeWidth, 2)) * (1 - dist / size);
          }
        }
      }
      
      return val;
    };
    
    // Smooth step function for better interpolation
    function smoothStep(x: number): number {
      return x * x * (3 - 2 * x);
    }
    
    // Generate the terrain height data
    const data = new Float32Array((segments + 1) * (segments + 1));
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const index = i * (segments + 1) + j;
        data[index] = generateHeight(j, i);
      }
    }
    
    return data;
  }, [segments, amplitude, seed]);
  
  // Create the terrain geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, segments, segments);
    
    // Apply height data to vertices
    const positionAttr = geo.attributes.position;
    for (let i = 0; i < positionAttr.count; i++) {
      positionAttr.setY(i, heightData[i]);
    }
    
    // Update normals for proper lighting
    geo.computeVertexNormals();
    
    return geo;
  }, [width, height, segments, heightData]);
  
  // Create color gradients for the terrain
  const colorMap = useMemo(() => {
    // Base color map with more zones for smoother transitions
    const baseColors = [
      { height: -amplitude, color: new THREE.Color(0.05, 0.1, 0.4) }, // Deep ocean
      { height: -amplitude * 0.7, color: new THREE.Color(0.1, 0.2, 0.5) }, // Ocean
      { height: -amplitude * 0.3, color: new THREE.Color(0.2, 0.3, 0.6) }, // Shallow water
      { height: -amplitude * 0.1, color: new THREE.Color(0.3, 0.4, 0.6) }, // Shoreline
      { height: -amplitude * 0.05, color: new THREE.Color(0.6, 0.6, 0.4) }, // Beach/sand
      { height: 0, color }, // Base ground
      { height: amplitude * 0.1, color: color.clone().multiplyScalar(1.1) }, // Low hills
      { height: amplitude * 0.3, color: color.clone().multiplyScalar(1.2) }, // Mid-altitude
      { height: amplitude * 0.5, color: new THREE.Color(0.6, 0.6, 0.6) }, // High altitude
      { height: amplitude * 0.7, color: new THREE.Color(0.8, 0.8, 0.8) }, // Mountain
      { height: amplitude * 0.85, color: new THREE.Color(0.9, 0.9, 0.9) }, // Snow line
      { height: amplitude * 1.0, color: new THREE.Color(1.0, 1.0, 1.0) }   // Peak snow
    ];
    
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    const positionAttr = geometry.attributes.position;
    const normalAttr = geometry.attributes.normal;
    
    // Seeded random function for consistent noise
    const seededRandom = (x: number, y: number) => {
      const dot = x * 12.9898 + y * 78.233 + seed * 43758.5453;
      return Math.sin(dot) * 43758.5453 % 1;
    };
    
    for (let i = 0; i < positionAttr.count; i++) {
      const y = positionAttr.getY(i);
      const x = positionAttr.getX(i);
      const z = positionAttr.getZ(i);
      
      // Get surface normal for slope calculations
      const nx = normalAttr.getX(i);
      const ny = normalAttr.getY(i);
      const nz = normalAttr.getZ(i);
      
      // Calculate slope (0 = flat, 1 = vertical)
      const slope = 1 - Math.abs(ny);
      
      // Find the color stops for this height
      let lowerStop = baseColors[0];
      let upperStop = baseColors[baseColors.length - 1];
      
      for (let j = 0; j < baseColors.length - 1; j++) {
        if (y >= baseColors[j].height && y < baseColors[j + 1].height) {
          lowerStop = baseColors[j];
          upperStop = baseColors[j + 1];
          break;
        }
      }
      
      // Interpolate between the two color stops
      const t = (y - lowerStop.height) / (upperStop.height - lowerStop.height);
      let interpolatedColor = new THREE.Color().copy(lowerStop.color).lerp(upperStop.color, t);
      
      // Add variation based on multiple factors
      
      // 1. Slope-based coloring - steeper slopes are more rocky
      if (y > 0 && slope > 0.3) {
        // Rock color for steep slopes
        const rockColor = new THREE.Color(0.6, 0.6, 0.6);
        // Blend based on steepness
        interpolatedColor.lerp(rockColor, Math.min(1, slope * 1.5));
      }
      
      // 2. Add noise-based variation for natural looking terrain
      const posNoise1 = seededRandom(x * 0.01, z * 0.01);
      const posNoise2 = seededRandom(x * 0.1, z * 0.1);
      
      // Small-scale color variation
      interpolatedColor.offsetHSL(
        (posNoise1 - 0.5) * 0.05,  // Slight hue shift
        (posNoise2 - 0.5) * 0.1,   // Saturation variation
        (posNoise1 * posNoise2 - 0.25) * 0.1  // Lightness variation
      );
      
      // 3. Special case for snowy peaks - add sparkle effect to highest elevations
      if (y > amplitude * 0.8) {
        const snowiness = (y - amplitude * 0.8) / (amplitude * 0.2);
        const sparkle = Math.pow(posNoise2, 8) * snowiness;
        interpolatedColor.lerp(new THREE.Color(1, 1, 1), sparkle * 0.5);
      }
      
      // 4. Add erosion patterns on steep slopes
      if (slope > 0.4 && y > 0) {
        const erosionPattern = Math.sin(y * 5 + posNoise1 * 10) * 0.5 + 0.5;
        interpolatedColor.offsetHSL(0, 0, -erosionPattern * slope * 0.2);
      }
      
      colors[i * 3] = interpolatedColor.r;
      colors[i * 3 + 1] = interpolatedColor.g;
      colors[i * 3 + 2] = interpolatedColor.b;
    }
    
    return colors;
  }, [geometry, amplitude, color, seed]);

  // Apply vertex colors to the geometry
  useMemo(() => {
    geometry.setAttribute('color', new THREE.BufferAttribute(colorMap, 3));
  }, [geometry, colorMap]);
  
  // Create subtle animation
  useFrame((_state, delta) => {
    if (animate && meshRef.current) {
      const time = Date.now() * 0.0005;
      
      // Apply gentle wave motion to terrain
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const ix = positions[i] / width + 0.5;
        const iz = positions[i + 2] / height + 0.5;
        
        // Only animate the higher parts slightly
        if (positions[i + 1] > 0) {
          positions[i + 1] += Math.sin(time + ix * 5 + iz * 10) * 0.05 * delta * Math.min(positions[i + 1], 10);
        }
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
    }
  });
  
  return (
    <mesh 
      ref={meshRef}
      geometry={geometry}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      receiveShadow
    >
      <meshStandardMaterial
        vertexColors
        side={THREE.DoubleSide}
        wireframe={wireframe}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}