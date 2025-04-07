import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import { CONFIG, GalaxyType, Star, GalaxyData } from './types';
import { Terrain } from './Terrain';
import { LensFlare } from './LensFlare';
import { InteractivePoints } from './InteractivePoints';
import { Wormhole } from './Wormhole';
import { generateGalaxyData, generateStars } from './utils/webbData';
import { ThemedObjectCluster, GalaxyTheme, RandomSpaceObjects, GalaxyObject } from './models/GalaxyObjectFactory';

interface GalaxyProps {
  currentGalaxy: number;
}

export function Galaxy({ currentGalaxy }: GalaxyProps) {
  console.log("Galaxy component rendering for galaxy:", currentGalaxy);
  
  // References for animated elements
  const galaxyGroupRef = useRef<THREE.Group>(null);
  const nebulaRef = useRef<THREE.Mesh>(null);
  const diskRef = useRef<THREE.Mesh>(null);
  const blackHoleRef = useRef<THREE.Mesh>(null);
  
  // Create a basic fallback texture for particles
  const fallbackTexture = useMemo(() => {
    console.log("Creating fallback star texture");
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create a radial gradient for a smoother particle
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    console.log("Fallback star texture created successfully");
    return texture;
  }, []);
  
  // We've removed the separate starTexture state and now just use the fallbackTexture directly
  // This keeps our code simpler and more reliable
  
  // State for interactive stars
  interface Point {
    position: [number, number, number];
    name?: string;
    color?: THREE.Color | string;
    size?: number;
    data?: any;
  }
  const [hoveredStar, setHoveredStar] = useState<Point | null>(null);
  
  // Webb telescope inspired data - with optimized generation
  const galaxyData = useMemo(() => {
    console.log(`Generating galaxy data for galaxy ${currentGalaxy}`);
    try {
      return generateGalaxyData(currentGalaxy);
    } catch (error) {
      console.error("Error generating galaxy data:", error);
      // Return basic fallback data to prevent crashes
      return {
        type: 'spiral' as GalaxyType,
        radius: 50,
        starCount: 200,
        age: 10,
        redshift: 0.1,
        hasActiveCenter: false,
        hasSupernovae: false,
        hasBlackHole: false,
        hasWormhole: false,
        stellarDensity: 1,
        darkMatterRatio: 5,
        interstellarMedium: {
          density: 1e6,
          temperature: 10000,
          metalicity: 0.02,
        },
        specialFeatures: [],
      };
    }
  }, [currentGalaxy]);
  
  // Generate star data with more efficient approach
  const stellarData = useMemo(() => {
    if (!galaxyData) return [];
    
    console.log(`Generating stellar data for galaxy ${currentGalaxy}`);
    try {
      // Limit stars to a reasonable number for performance
      const optimizedStarCount = Math.min(100, Math.floor(galaxyData.starCount));
      console.log(`Generating ${optimizedStarCount} stars`);
      
      return generateStars(
        optimizedStarCount, 
        galaxyData.type, 
        galaxyData.radius, 
        currentGalaxy * 1000
      );
    } catch (error) {
      console.error("Error generating stellar data:", error);
      return [];
    }
  }, [galaxyData, currentGalaxy]);
  
  // Animation for galaxy rotation
  useFrame((_, delta) => {
    if (galaxyGroupRef.current) {
      // Rotate the entire galaxy group slowly
      galaxyGroupRef.current.rotation.y += delta * 0.02 * galaxyProps.rotationSpeed;
      
      // Animate the nebula if it exists
      if (nebulaRef.current) {
        nebulaRef.current.rotation.z += delta * 0.01;
      }
      
      // Animate the black hole if it exists
      if (blackHoleRef.current && galaxyProps.hasBlackHole) {
        blackHoleRef.current.rotation.z -= delta * 0.2;
      }
    }
  });
  
  // Procedurally generate galaxy properties based on galaxy number (seed)
  const galaxyProps = useMemo(() => {
    // Generate completely different properties for each galaxy
    // Use the galaxy number as a seed for all random properties
    const seed = currentGalaxy * 1327;
    const seededRandom = (min: number, max: number, offset = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      const rand = x - Math.floor(x); // 0-1 range
      return min + rand * (max - min);
    };
    
    // Different color scheme for each galaxy
    const primaryHue = (currentGalaxy * 73) % 360; // Primary galaxy color
    const secondaryHue = (primaryHue + seededRandom(60, 180, 1)) % 360; // Complementary color
    
    // Galaxy structure variations
    const armCount = Math.floor(seededRandom(2, 6, 2)); // Different number of spiral arms
    const armTightness = seededRandom(0.05, 0.2, 3); // How tightly the arms spiral
    const diskThickness = seededRandom(0.05, 0.15, 4); // How thick/flat the galaxy disk is
    const turbulence = seededRandom(0.2, 0.8, 5); // How chaotic/ordered the stars are
    
    // Environmental properties
    const nebulaSize = seededRandom(1, 2, 6); // Scale of nebula clouds
    const nebulaDensity = seededRandom(0.5, 1.2, 7); // Density of nebula effects
    const starDensity = seededRandom(0.8, 1.5, 8); // Relative number of stars
    
    // Special features for higher galaxies
    const hasBlackHole = currentGalaxy > 3;
    const hasRings = seededRandom(0, 1, 9) > 0.5;
    const hasSupernovae = currentGalaxy > 5 && seededRandom(0, 1, 10) > 0.7;
    
    // Create a unique name for this galaxy
    const galaxyNames = [
      "Alpha", "Beta", "Gamma", "Delta", "Epsilon", 
      "Zeta", "Eta", "Theta", "Iota", "Kappa",
      "Lambda", "Mu", "Nu", "Xi", "Omicron",
      "Pi", "Rho", "Sigma", "Tau", "Upsilon",
      "Phi", "Chi", "Psi", "Omega"
    ];
    const nameIndex = (currentGalaxy - 1) % galaxyNames.length;
    const designation = 
      galaxyNames[nameIndex] + 
      "-" + 
      Math.floor(seededRandom(100, 999, 11));
    
    return {
      primaryColor: new THREE.Color().setHSL(primaryHue / 360, 0.7, 0.5),
      secondaryColor: new THREE.Color().setHSL(secondaryHue / 360, 0.7, 0.5),
      armCount,
      armTightness,
      diskThickness,
      turbulence,
      nebulaSize,
      nebulaDensity,
      starDensity,
      rotationSpeed: seededRandom(0.01, 0.08, 12),
      coreSize: seededRandom(3, 8, 13),
      coreIntensity: seededRandom(8, 15, 14),
      ambientIntensity: seededRandom(0.1, 0.3, 15),
      name: designation,
      hasBlackHole,
      hasRings,
      hasSupernovae,
    };
  }, [currentGalaxy]);
  
  // Generate interactive points and lens flare data
  const interactivePoints = useMemo(() => {
    // Generate a set of interesting points in the galaxy
    const points: Point[] = [];
    
    // Use the galaxy's seed for consistent generation
    const seed = currentGalaxy * 1327;
    const seededRandom = (min: number, max: number, offset = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      const rand = x - Math.floor(x); // 0-1 range
      return min + rand * (max - min);
    };
    
    // Add points for major stars
    const starCount = 5 + Math.floor(seededRandom(1, 5, 100));
    for (let i = 0; i < starCount; i++) {
      const angle = seededRandom(0, Math.PI * 2, i * 100);
      const distance = seededRandom(CONFIG.GALAXY.BOUNDS * 0.3, CONFIG.GALAXY.BOUNDS * 0.8, i * 200);
      const x = Math.cos(angle) * distance;
      const y = seededRandom(-20, 20, i * 300);
      const z = Math.sin(angle) * distance;
      
      // Create a name for this star
      const starTypes = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta"];
      const starType = starTypes[Math.floor(seededRandom(0, starTypes.length, i * 400))];
      const starNumber = Math.floor(seededRandom(1, 999, i * 500));
      const name = `${starType} ${starNumber}`;
      
      // Generate color based on star type (use temperature/color relationship)
      const temp = seededRandom(3000, 30000, i * 600); // Star temperature in Kelvin
      let color: THREE.Color;
      
      if (temp < 3700) {
        // Red stars (M class)
        color = new THREE.Color(1, 0.5, 0.2);
      } else if (temp < 5200) {
        // Orange/Yellow stars (K class)
        color = new THREE.Color(1, 0.8, 0.4);
      } else if (temp < 6000) {
        // Yellow stars (G class, like our sun)
        color = new THREE.Color(1, 1, 0.8);
      } else if (temp < 7500) {
        // Yellow/White stars (F class)
        color = new THREE.Color(1, 1, 0.95);
      } else if (temp < 10000) {
        // White stars (A class)
        color = new THREE.Color(1, 1, 1);
      } else if (temp < 30000) {
        // Blue/White stars (B class)
        color = new THREE.Color(0.8, 0.8, 1);
      } else {
        // Blue stars (O class)
        color = new THREE.Color(0.6, 0.6, 1);
      }
      
      points.push({
        position: [x, y, z],
        name,
        color,
        size: seededRandom(1.5, 5, i * 700),
        data: {
          type: 'star',
          temperature: Math.floor(temp),
          description: `A ${temp < 5000 ? 'cool' : temp > 10000 ? 'hot' : 'moderate'} star in the ${galaxyProps.name} galaxy.`
        }
      });
    }
    
    // Add special points for supernova remnants, etc.
    if (currentGalaxy > 3) {
      const specialCount = Math.floor(seededRandom(1, 3, 800));
      for (let i = 0; i < specialCount; i++) {
        const angle = seededRandom(0, Math.PI * 2, i * 900 + 800);
        const distance = seededRandom(CONFIG.GALAXY.BOUNDS * 0.4, CONFIG.GALAXY.BOUNDS * 0.9, i * 1000 + 800);
        const x = Math.cos(angle) * distance;
        const y = seededRandom(-15, 15, i * 1100 + 800);
        const z = Math.sin(angle) * distance;
        
        // Choose between different types of special objects
        const objectType = Math.floor(seededRandom(0, 3, i * 1200 + 800));
        let name, color, size, data;
        
        if (objectType === 0) {
          // Nebula
          name = `${galaxyProps.name} Nebula ${Math.floor(seededRandom(1, 100, i * 1300 + 800))}`;
          color = new THREE.Color().setHSL(seededRandom(0, 1, i * 1400 + 800), 0.8, 0.6);
          size = seededRandom(3, 6, i * 1500 + 800);
          data = {
            type: 'nebula',
            description: 'A colorful cloud of gas and dust in interstellar space.'
          };
        } else if (objectType === 1) {
          // Supernova remnant
          name = `SN-${galaxyProps.name}-${Math.floor(seededRandom(100, 999, i * 1600 + 800))}`;
          color = new THREE.Color(1, 0.7, 0.3);
          size = seededRandom(3, 7, i * 1700 + 800);
          data = {
            type: 'supernova',
            description: 'The remnants of a massive stellar explosion.'
          };
        } else {
          // Black hole
          name = `BH-${galaxyProps.name}-${Math.floor(seededRandom(100, 999, i * 1800 + 800))}`;
          color = new THREE.Color(0.2, 0, 0.3);
          size = seededRandom(2, 4, i * 1900 + 800);
          data = {
            type: 'blackhole',
            description: 'A region of spacetime where gravity is so strong that nothing can escape from it.'
          };
        }
        
        points.push({
          position: [x, y, z],
          name,
          color,
          size,
          data
        });
      }
    }
    
    return points;
  }, [currentGalaxy, galaxyProps.name]);
  
  // Generate lens flare positions and colors
  const lensFlares = useMemo(() => {
    // Use the galaxy's seed for consistent generation
    const seed = currentGalaxy * 1327;
    const seededRandom = (min: number, max: number, offset = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      const rand = x - Math.floor(x); // 0-1 range
      return min + rand * (max - min);
    };
    
    const flares: {
      position: [number, number, number];
      color: THREE.Color;
      size: number;
      intensity: number;
    }[] = [];
    
    // Add main sun/star at the center of the galaxy
    flares.push({
      position: [0, 0, 0],
      color: galaxyProps.primaryColor,
      size: 1000,
      intensity: 2
    });
    
    // Add distant stars with lens flares
    const flareCount = Math.floor(seededRandom(2, 5, 2000));
    for (let i = 0; i < flareCount; i++) {
      const distance = seededRandom(CONFIG.GALAXY.BOUNDS * 1.2, CONFIG.GALAXY.BOUNDS * 3, i * 100 + 2000);
      const angle = seededRandom(0, Math.PI * 2, i * 200 + 2000);
      const height = seededRandom(-200, 200, i * 300 + 2000);
      
      const x = Math.cos(angle) * distance;
      const y = height;
      const z = Math.sin(angle) * distance;
      
      // Generate color based on star type
      const hue = seededRandom(0, 1, i * 400 + 2000);
      const saturation = seededRandom(0.5, 0.8, i * 500 + 2000);
      const lightness = seededRandom(0.5, 0.9, i * 600 + 2000);
      const color = new THREE.Color().setHSL(hue, saturation, lightness);
      
      flares.push({
        position: [x, y, z] as [number, number, number],
        color,
        size: seededRandom(400, 1200, i * 700 + 2000),
        intensity: seededRandom(0.8, 1.7, i * 800 + 2000)
      });
    }
    
    return flares;
  }, [currentGalaxy, galaxyProps.primaryColor]);

  // Generate star particles for the galaxy using the sprite points technique
  const { stars, nebulaParticles, supernovae } = useMemo(() => {
    // Get galaxy size
    const galaxyRadius = CONFIG.GALAXY.BOUNDS * 2;
    
    // Calculate number of stars based on galaxy properties (reduced for better performance)
    const starCount = Math.floor(4000 * galaxyProps.starDensity); // Reduced from 12000 to 4000
    console.log(`Generating ${starCount} star particles for galaxy ${currentGalaxy}`);
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    
    // Create deterministic star distribution based on galaxy properties
    // Use the galaxy number as a seed for all random properties
    const seed = currentGalaxy * 1327;
    const seededRandom = (min: number, max: number, offset = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      const rand = x - Math.floor(x); // 0-1 range
      return min + rand * (max - min);
    };
    
    // Create star distribution
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      
      // Choose which arm this star belongs to
      const armIndex = Math.floor(seededRandom(0, galaxyProps.armCount, i * 13));
      
      // Calculate spiral pattern
      // Distance from center follows a power distribution (more stars in the center)
      const radius = Math.pow(seededRandom(0, 1, i * 17), 0.5) * galaxyRadius;
      
      // Spiral arm angle calculation
      const spinAngle = radius * galaxyProps.armTightness;
      const branchAngle = (armIndex / galaxyProps.armCount) * Math.PI * 2;
      
      // Add some randomness to the position (turbulence)
      const randomX = Math.pow(seededRandom(0, 1, i * 23), 3) * (seededRandom(0, 1, i * 29) < 0.5 ? 1 : -1) * galaxyProps.turbulence;
      const randomY = Math.pow(seededRandom(0, 1, i * 31), 3) * (seededRandom(0, 1, i * 37) < 0.5 ? 1 : -1) * galaxyProps.turbulence;
      const randomZ = Math.pow(seededRandom(0, 1, i * 41), 3) * (seededRandom(0, 1, i * 43) < 0.5 ? 1 : -1) * galaxyProps.turbulence;
      
      // Calculate final position
      starPositions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX * radius;
      starPositions[i3 + 1] = randomY * radius * galaxyProps.diskThickness; // Height above/below disk
      starPositions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ * radius;
      
      // Star color - varies with distance from center and random variation
      // Stars near the center use the primary color, stars at the outer edges use the secondary color
      const distanceFactor = Math.min(1, radius / (galaxyRadius * 0.5));
      const mixColor = new THREE.Color()
        .copy(galaxyProps.primaryColor)
        .lerp(galaxyProps.secondaryColor, distanceFactor)
        .offsetHSL(
          (seededRandom(0, 0.1, i * 47) - 0.05), // Slight hue variation
          (seededRandom(0, 0.2, i * 53) - 0.1),  // Saturation variation
          (seededRandom(0, 0.2, i * 59))         // Lightness variation (mostly brighter)
        );
      
      starColors[i3] = mixColor.r;
      starColors[i3 + 1] = mixColor.g;
      starColors[i3 + 2] = mixColor.b;
      
      // Star size variation - most are small, some are larger
      starSizes[i] = seededRandom(0, 1, i * 61) < 0.95 
        ? 0.5 + seededRandom(0, 1, i * 67) * 1  // 95% are normal stars
        : 1.5 + seededRandom(0, 1, i * 71) * 2; // 5% are larger stars
    }
    
    // Generate nebula particles (reduced for better performance)
    const nebulaCount = Math.floor(150 * galaxyProps.nebulaDensity); // Reduced from 400 to 150
    console.log(`Generating ${nebulaCount} nebula particles for galaxy ${currentGalaxy}`);
    const nebulaPositions = new Float32Array(nebulaCount * 3);
    const nebulaColors = new Float32Array(nebulaCount * 3);
    const nebulaSizes = new Float32Array(nebulaCount);
    
    // Create nebula clusters in specific areas rather than everywhere
    const clusterCount = Math.floor(galaxyProps.armCount * 1.5);
    const clusterCenters = [];
    
    // Create cluster centers along spiral arms
    for (let i = 0; i < clusterCount; i++) {
      const armIndex = i % galaxyProps.armCount;
      const distanceAlongArm = (i / clusterCount) * 0.7 + 0.2; // Distribute from 20% to 90% along radius
      
      const radius = distanceAlongArm * galaxyRadius;
      const spinAngle = radius * galaxyProps.armTightness;
      const branchAngle = (armIndex / galaxyProps.armCount) * Math.PI * 2;
      
      const x = Math.cos(branchAngle + spinAngle) * radius;
      const y = (Math.random() - 0.5) * galaxyProps.diskThickness * radius * 0.5;
      const z = Math.sin(branchAngle + spinAngle) * radius;
      
      clusterCenters.push({ 
        position: new THREE.Vector3(x, y, z),
        color: new THREE.Color()
          .copy(i % 2 === 0 ? galaxyProps.primaryColor : galaxyProps.secondaryColor)
          .offsetHSL(Math.random() * 0.1 - 0.05, 0, 0),
        size: 20 + Math.random() * 20
      });
    }
    
    // Distribute nebula particles around cluster centers
    for (let i = 0; i < nebulaCount; i++) {
      const i3 = i * 3;
      
      // Select a cluster randomly, weighted toward earlier clusters (inner galaxy)
      const clusterIndex = Math.floor(Math.pow(Math.random(), 1.5) * clusterCount);
      const cluster = clusterCenters[clusterIndex % clusterCenters.length];
      
      // Calculate distance from cluster center (gaussian-like distribution)
      const distance = Math.pow(Math.random(), 0.5) * cluster.size * galaxyProps.nebulaSize;
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI * 2;
      
      // Calculate position with a 3D offset from cluster center
      nebulaPositions[i3] = cluster.position.x + Math.cos(angle1) * Math.cos(angle2) * distance;
      nebulaPositions[i3 + 1] = cluster.position.y + Math.sin(angle2) * distance * 0.3; // Flatter in y
      nebulaPositions[i3 + 2] = cluster.position.z + Math.sin(angle1) * Math.cos(angle2) * distance;
      
      // Color based on cluster with variation
      const nebulaColor = new THREE.Color().copy(cluster.color)
        .offsetHSL(
          Math.random() * 0.05 - 0.025, // Very slight hue shift
          Math.random() * 0.2 - 0.1,    // Saturation variation
          Math.random() * 0.2 - 0.1     // Lightness variation
        );
      
      nebulaColors[i3] = nebulaColor.r;
      nebulaColors[i3 + 1] = nebulaColor.g;
      nebulaColors[i3 + 2] = nebulaColor.b;
      
      // Nebula particle sizes
      nebulaSizes[i] = 2 + Math.random() * 4;
    }
    
    // Generate supernovae if this galaxy has them
    const supernovaeData: {
      position: [number, number, number];
      color: THREE.Color;
      size: number;
      pulseSpeed: number;
      pulseOffset: number;
    }[] = [];
    
    if (galaxyProps.hasSupernovae) {
      const supernovaeCount = Math.floor(1 + Math.random() * 3); // 1-3 supernovae
      
      for (let i = 0; i < supernovaeCount; i++) {
        // Position somewhere in the outer arms
        const armIndex = Math.floor(Math.random() * galaxyProps.armCount);
        const radius = (0.5 + Math.random() * 0.4) * galaxyRadius; // 50-90% of galaxy radius
        
        const spinAngle = radius * galaxyProps.armTightness;
        const branchAngle = (armIndex / galaxyProps.armCount) * Math.PI * 2;
        
        const x = Math.cos(branchAngle + spinAngle) * radius;
        const y = (Math.random() - 0.5) * galaxyProps.diskThickness * radius;
        const z = Math.sin(branchAngle + spinAngle) * radius;
        
        // Create a bright star-like object
        supernovaeData.push({
          position: [x, y, z] as [number, number, number],
          color: new THREE.Color(1, 0.7, 0.4), // Bright yellow-orange
          size: 4 + Math.random() * 3,
          pulseSpeed: 0.5 + Math.random() * 2,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    }
    
    return { 
      stars: { positions: starPositions, colors: starColors, sizes: starSizes, count: starCount },
      nebulaParticles: { positions: nebulaPositions, colors: nebulaColors, sizes: nebulaSizes, count: nebulaCount },
      supernovae: supernovaeData
    };
  }, [galaxyProps]);
  
  // Animation for the galaxy
  useFrame((_, delta) => {
    // Rotate the entire galaxy
    if (galaxyGroupRef.current) {
      galaxyGroupRef.current.rotation.y += delta * galaxyProps.rotationSpeed;
    }
    
    // Animate the galactic core/black hole
    if (blackHoleRef.current) {
      blackHoleRef.current.rotation.z += delta * 0.2;
      blackHoleRef.current.rotation.y += delta * 0.3;
    }
    
    // Animate nebula - subtle pulsing
    if (nebulaRef.current && nebulaRef.current.material) {
      const material = nebulaRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms?.uTime) {
        material.uniforms.uTime.value += delta;
      }
    }
    
    // Animate the galaxy disk
    if (diskRef.current) {
      diskRef.current.rotation.z += delta * 0.03;
    }
  });
  
  // Shader for nebula effect
  const nebulaShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color().copy(galaxyProps.primaryColor) },
        uColor2: { value: new THREE.Color().copy(galaxyProps.secondaryColor) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec2 vUv;
        
        // Simpler noise function that's more efficient
        float simpleNoise(vec3 p) {
          // Use a simple hash function instead of the complex simplex noise
          float d = dot(p, vec3(12.9898, 78.233, 45.543));
          float n = sin(d) * 43758.5453;
          return fract(n);
        }
        
        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float d = length(p);
          
          // Create a nebula-like effect using a simpler approach
          // Use fewer noise layers and simpler calculations
          float n1 = simpleNoise(vec3(p * 1.2, uTime * 0.03));
          float n2 = simpleNoise(vec3(p * 2.0, uTime * 0.04 + 100.0));
          
          // Combine noise layers - using just 2 instead of 3
          float nebula = n1 * 0.6 + n2 * 0.4;
          
          // Simplified vortex effect
          float angle = atan(p.y, p.x);
          float vortex = sin(angle * 4.0 + d * 2.0 - uTime * 0.1) * 0.5 + 0.5;
          
          // Combine effects with simplified calculations
          float alpha = smoothstep(0.4, 0.0, d) * (nebula * 0.7 + vortex * 0.3) * 0.7;
          
          // Mix colors based on noise
          vec3 color = mix(uColor1, uColor2, n1 * 0.5 + 0.5);
          
          gl_FragColor = vec4(color, alpha);
        }
      `
    };
  }, [galaxyProps.primaryColor, galaxyProps.secondaryColor]);
  
  // Shader for creating glowing disk around black hole
  const diskShader = useMemo(() => {
    return {
      uniforms: {
        uColor: { value: new THREE.Color().copy(galaxyProps.primaryColor) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec2 vUv;
        
        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float d = length(p);
          
          // Create a simpler ring effect
          float ring = smoothstep(0.5, 0.4, abs(d - 0.7) * 1.5);
          
          // Simplified variation calculation
          float angle = atan(p.y, p.x);
          float variation = sin(angle * 10.0) * 0.1 + 0.9; // Reduced frequency
          
          // Final color and opacity
          vec3 color = uColor * variation;
          float alpha = ring * (1.0 - d * 0.5) * 0.8;
          
          gl_FragColor = vec4(color, alpha);
        }
      `
    };
  }, [galaxyProps.primaryColor]);
  
  return (
    <group ref={galaxyGroupRef} rotation={[0.1, 0, 0]}>
      {/* Add themed object clusters and space objects to make the galaxy more diverse */}
      {currentGalaxy >= 1 && (
        <>
          {/* Create a mining operation in galaxy level 1 and higher */}
          <ThemedObjectCluster 
            theme="mining_operation" 
            position={[
              CONFIG.GALAXY.BOUNDS * 0.5, 
              CONFIG.GALAXY.BOUNDS * 0.1, 
              CONFIG.GALAXY.BOUNDS * -0.4
            ]} 
            radius={15}
            objectCount={5 + currentGalaxy}
          />
          
          {/* Add random space objects scattered throughout the galaxy */}
          <RandomSpaceObjects 
            count={10 + (currentGalaxy * 3)} 
            radius={CONFIG.GALAXY.BOUNDS * 0.8}
            galaxyLevel={currentGalaxy}
          />
        </>
      )}
      
      {/* Add more themed clusters in higher galaxies */}
      {currentGalaxy >= 2 && (
        <ThemedObjectCluster 
          theme="trade_route" 
          position={[
            CONFIG.GALAXY.BOUNDS * -0.6, 
            CONFIG.GALAXY.BOUNDS * 0.05, 
            CONFIG.GALAXY.BOUNDS * 0.3
          ]} 
          radius={20}
          objectCount={7 + currentGalaxy}
        />
      )}
      
      {currentGalaxy >= 3 && (
        <ThemedObjectCluster 
          theme="scientific_outpost" 
          position={[
            CONFIG.GALAXY.BOUNDS * 0.3, 
            CONFIG.GALAXY.BOUNDS * 0.15, 
            CONFIG.GALAXY.BOUNDS * 0.7
          ]} 
          radius={18}
          objectCount={6 + currentGalaxy}
        />
      )}
      
      {currentGalaxy >= 4 && (
        <ThemedObjectCluster 
          theme="battle_aftermath" 
          position={[
            CONFIG.GALAXY.BOUNDS * -0.4, 
            CONFIG.GALAXY.BOUNDS * -0.1, 
            CONFIG.GALAXY.BOUNDS * -0.5
          ]} 
          radius={25}
          objectCount={8 + currentGalaxy}
        />
      )}
      
      {currentGalaxy >= 5 && (
        <ThemedObjectCluster 
          theme="alien_territory" 
          position={[
            CONFIG.GALAXY.BOUNDS * 0.7, 
            CONFIG.GALAXY.BOUNDS * -0.2, 
            CONFIG.GALAXY.BOUNDS * -0.3
          ]} 
          radius={30}
          objectCount={10 + currentGalaxy}
        />
      )}
      
      {/* Wormhole - if this galaxy has one */}
      {galaxyData?.hasWormhole && galaxyData?.connectsTo && (
        <Wormhole 
          position={new THREE.Vector3(
            CONFIG.GALAXY.BOUNDS * 0.6, 
            0, 
            CONFIG.GALAXY.BOUNDS * 0.6
          )}
          connectsTo={galaxyData.connectsTo}
          radius={15}
          intensity={1.5}
          onEnter={(targetGalaxy) => {
            console.log(`Wormhole transport to Galaxy ${targetGalaxy}`);
            // Transport logic would be handled by the game manager
          }}
        />
      )}
      
      {/* Stellar objects generated from astronomical data */}
      {stellarData.length > 0 && (
        <group>
          {stellarData.map((star: Star, index: number) => (
            <mesh 
              key={`star-${index}`}
              position={[star.position[0], star.position[1], star.position[2]]}
              scale={[star.size, star.size, star.size]}
            >
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial 
                color={star.color} 
                emissive={star.color} 
                emissiveIntensity={1}
                toneMapped={false}
              />
              
              {/* Add special effect for certain star types */}
              {(star.type === 'neutron_star' || star.type === 'protostar' || star.type === 'supergiant') && (
                <pointLight 
                  color={star.color} 
                  intensity={10} 
                  distance={50}
                  decay={2}
                />
              )}
            </mesh>
          ))}
        </group>
      )}

      {/* Entire Galaxy Stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={stars.count}
            array={stars.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={stars.count}
            array={stars.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={stars.count}
            array={stars.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.8}
          sizeAttenuation={true}
          vertexColors={true}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={fallbackTexture}
          alphaTest={0.01}
        />
      </points>
      
      {/* Nebula clouds using custom shader */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nebulaParticles.count}
            array={nebulaParticles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={nebulaParticles.count}
            array={nebulaParticles.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={nebulaParticles.count}
            array={nebulaParticles.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={3.5}
          sizeAttenuation={true}
          vertexColors={true}
          transparent={true}
          opacity={0.65}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={fallbackTexture}
          alphaTest={0.01}
        />
      </points>
      
      {/* Central nebula cloud using shader */}
      <mesh ref={nebulaRef} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CONFIG.GALAXY.BOUNDS * 1.5, CONFIG.GALAXY.BOUNDS * 1.5, 1, 1]} />
        <shaderMaterial
          args={[nebulaShader]}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Galactic Core / Black Hole */}
      {galaxyProps.hasBlackHole ? (
        // Advanced black hole for higher galaxies
        <>
          {/* Black hole event horizon */}
          <mesh ref={blackHoleRef}>
            <sphereGeometry args={[galaxyProps.coreSize * 0.5, 32, 32]} />
            <meshBasicMaterial color="black" />
          </mesh>
          
          {/* Accretion disk around black hole */}
          <mesh ref={diskRef} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[galaxyProps.coreSize * 0.6, galaxyProps.coreSize * 2, 64]} />
            <shaderMaterial
              args={[diskShader]}
              transparent={true}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Intense light from accretion disk */}
          <pointLight 
            position={[0, 0, 0]} 
            color={galaxyProps.primaryColor} 
            intensity={galaxyProps.coreIntensity * 1.5} 
            distance={CONFIG.GALAXY.BOUNDS * 3} 
          />
        </>
      ) : (
        // Basic bright core for lower galaxies
        <>
          <mesh>
            <sphereGeometry args={[galaxyProps.coreSize, 32, 32]} />
            <meshBasicMaterial 
              color={galaxyProps.primaryColor} 
              transparent={true}
              opacity={0.8}
            />
          </mesh>
          <pointLight 
            position={[0, 0, 0]} 
            color={galaxyProps.primaryColor} 
            intensity={galaxyProps.coreIntensity} 
            distance={CONFIG.GALAXY.BOUNDS * 3} 
          />
        </>
      )}
      
      {/* Supernovae - special bright explosion stars */}
      {supernovae.map((supernova, index) => (
        <group 
          key={`supernova-${index}`} 
          position={[supernova.position[0], supernova.position[1], supernova.position[2]]}
        >
          <mesh>
            <sphereGeometry args={[supernova.size, 16, 16]} />
            <meshBasicMaterial 
              color={supernova.color} 
              transparent={true}
              opacity={0.8 + Math.sin(Date.now() * 0.001 * supernova.pulseSpeed + supernova.pulseOffset) * 0.2}
            />
          </mesh>
          <pointLight 
            color={supernova.color} 
            intensity={7 + Math.sin(Date.now() * 0.001 * supernova.pulseSpeed + supernova.pulseOffset) * 3} 
            distance={50} 
          />
        </group>
      ))}
      
      {/* Ambient light for the scene */}
      <ambientLight intensity={galaxyProps.ambientIntensity} />
      
      {/* Play area visualization - a faint box showing boundaries with animated opacity */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[
          CONFIG.GALAXY.BOUNDS * 2, 
          CONFIG.GALAXY.BOUNDS * 0.5, 
          CONFIG.GALAXY.BOUNDS * 2
        ]} />
        <meshBasicMaterial 
          color={galaxyProps.primaryColor}
          transparent={true}
          opacity={0.03 + Math.sin(Date.now() * 0.001) * 0.01}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Galaxy rings - some galaxies have them */}
      {galaxyProps.hasRings && (
        <mesh rotation={[Math.PI / 2 + Math.random() * 0.3, 0, 0]}>
          <ringGeometry args={[
            CONFIG.GALAXY.BOUNDS * 1.2, 
            CONFIG.GALAXY.BOUNDS * 1.8, 
            64
          ]} />
          <meshBasicMaterial 
            color={galaxyProps.secondaryColor}
            transparent={true}
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Planetary bodies with terrain */}
      {/* Using the seed from galaxy properties to ensure consistent planetary generation */}
      <group>
        {/* Planet terrains - memoized to improve performance */}
        {useMemo(() => {
          // Primary planet - larger world with terrain
          const primaryPlanet = (
            <Terrain
              position={[CONFIG.GALAXY.BOUNDS * 0.6, -10, CONFIG.GALAXY.BOUNDS * -0.4]}
              rotation={[Math.PI / 2, 0, Math.PI / 4]}
              width={60}
              height={60}
              segments={80}
              amplitude={8}
              seed={currentGalaxy * 1000 + 123}
              color={galaxyProps.primaryColor.clone().offsetHSL(0.1, 0, 0)}
            />
          );
          
          // Secondary planet - more mountainous terrain
          const secondaryPlanet = (
            <Terrain
              position={[CONFIG.GALAXY.BOUNDS * -0.5, -5, CONFIG.GALAXY.BOUNDS * 0.7]}
              rotation={[Math.PI / 2, 0, Math.PI / 3]}
              width={40}
              height={40}
              segments={60}
              amplitude={12}
              seed={currentGalaxy * 1000 + 456}
              color={galaxyProps.secondaryColor.clone().offsetHSL(-0.05, 0.2, 0)}
            />
          );
          
          // Asteroid field - generate 5 smaller terrain chunks
          const asteroids = Array.from({ length: 5 }).map((_, index) => {
            // Seeded random positions spread around the galaxy
            const angle = (index / 5) * Math.PI * 2 + currentGalaxy;
            const distance = CONFIG.GALAXY.BOUNDS * (0.3 + Math.sin(currentGalaxy + index) * 0.2);
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            const terrainSize = 10 + (index % 3) * 5;
            
            return (
              <Terrain
                key={`asteroid-${index}`}
                position={[x, Math.sin(index + currentGalaxy) * 10 - 20, z]}
                rotation={[
                  Math.PI / 2 + Math.sin(currentGalaxy + index * 10) * 0.3,
                  Math.sin(currentGalaxy + index * 5) * 0.5,
                  Math.sin(currentGalaxy + index * 2) * Math.PI
                ]}
                width={terrainSize}
                height={terrainSize}
                segments={30}
                amplitude={4}
                seed={currentGalaxy * 1000 + index * 789}
                color={new THREE.Color().setHSL(
                  (galaxyProps.primaryColor.getHSL({ h: 0, s: 0, l: 0 }).h + index * 0.1) % 1,
                  0.5,
                  0.4
                )}
                wireframe={index % 4 === 0} // Some asteroids have wireframe look
              />
            );
          });
          
          return (
            <>
              {primaryPlanet}
              {secondaryPlanet}
              {asteroids}
            </>
          );
        }, [currentGalaxy, galaxyProps.primaryColor, galaxyProps.secondaryColor])}
      </group>
      
      {/* Add lens flares */}
      {lensFlares.map((flare, index) => (
        <LensFlare 
          key={`flare-${index}`}
          position={[flare.position[0], flare.position[1], flare.position[2]]}
          color={flare.color}
          size={flare.size}
          intensity={flare.intensity}
        />
      ))}
      
      {/* Add interactive points */}
      <InteractivePoints 
        points={interactivePoints}
        onPointHover={(point) => setHoveredStar(point)}
        onPointClick={(point) => {
          console.log('Clicked on:', point.name, point.data);
          // Could trigger game actions like collecting resources, starting a mission, etc.
        }}
        maxDistance={200}
        pointSize={3}
        hoverScale={2.5}
      />
      
      {/* UI tooltip for hovered star */}
      {hoveredStar && (
        <Html 
          position={[hoveredStar.position[0], hoveredStar.position[1], hoveredStar.position[2]]}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '8px 12px',
            borderRadius: '4px',
            color: 'white',
            fontFamily: 'Arial',
            fontSize: '14px',
            pointerEvents: 'none',
            transform: 'translate3d(-50%, -100%, 0)',
            marginBottom: '10px',
            width: 'auto',
            whiteSpace: 'nowrap'
          }}
          distanceFactor={20}
        >
          <div>
            <div style={{ fontWeight: 'bold' }}>{hoveredStar.name}</div>
            {hoveredStar.data?.description && (
              <div style={{ fontSize: '12px', opacity: 0.8 }}>{hoveredStar.data.description}</div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
