import * as THREE from 'three';
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { StellarObjectType, NebulaType, GalaxyType } from '../types';

/**
 * Props for the StellarObject component
 */
interface StellarObjectProps {
  type: StellarObjectType;
  position?: [number, number, number];
  size?: number;
  color?: THREE.Color | string | number;
  rotation?: [number, number, number];
  seed?: number;
  animate?: boolean;
  detail?: 'low' | 'medium' | 'high';
}

/**
 * Props for the Nebula component
 */
interface NebulaProps {
  type: NebulaType;
  position?: [number, number, number];
  size?: number;
  color?: THREE.Color | string | number;
  secondaryColor?: THREE.Color | string | number;
  rotation?: [number, number, number];
  seed?: number;
  animate?: boolean;
  density?: number;
}

/**
 * A procedurally generated stellar object based on real astronomical data
 */
export function StellarObject({
  type,
  position = [0, 0, 0],
  size = 1,
  color,
  rotation = [0, 0, 0],
  seed = Math.random() * 1000,
  animate = true,
  detail = 'medium'
}: StellarObjectProps) {
  const objectRef = useRef<THREE.Group>(null);
  const diskRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Create a deterministic random function based on the seed
  const seededRandom = (min: number, max: number, offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    const rand = x - Math.floor(x); // 0-1 range
    return min + rand * (max - min);
  };
  
  // Set default color based on stellar object type if not provided
  const objectColor = useMemo(() => {
    if (color) {
      return new THREE.Color(color);
    }
    
    // Astronomically accurate colors based on type
    switch (type) {
      case 'protostar':
        return new THREE.Color(0xff6633); // Orange-red
      case 'main_sequence':
        // Sun-like stars vary in color based on temperature
        const temp = seededRandom(3000, 30000, 100);
        if (temp < 3700) {
          // M-class (red)
          return new THREE.Color(0xff3300);
        } else if (temp < 5200) {
          // K-class (orange)
          return new THREE.Color(0xff6600);
        } else if (temp < 6000) {
          // G-class (yellow, like the Sun)
          return new THREE.Color(0xffcc00);
        } else if (temp < 7500) {
          // F-class (yellow-white)
          return new THREE.Color(0xffffcc);
        } else if (temp < 10000) {
          // A-class (white)
          return new THREE.Color(0xffffff);
        } else if (temp < 30000) {
          // B-class (blue-white)
          return new THREE.Color(0xaaddff);
        } else {
          // O-class (blue)
          return new THREE.Color(0x99aaff);
        }
      case 'red_giant':
        return new THREE.Color(0xff3300); // Deep red
      case 'supergiant':
        return new THREE.Color(0xff5500); // Bright orange-red
      case 'white_dwarf':
        return new THREE.Color(0xaaddff); // Pale blue-white
      case 'neutron_star':
        return new THREE.Color(0x99ccff); // Blue-white
      case 'black_hole':
        return new THREE.Color(0x000000); // Black
      case 'brown_dwarf':
        return new THREE.Color(0x994422); // Dark reddish-brown
      default:
        return new THREE.Color(0xffffff); // Default white
    }
  }, [type, color, seededRandom]);
  
  // Animation logic
  useFrame((_, delta) => {
    if (animate && objectRef.current) {
      // Different animation based on object type
      switch (type) {
        case 'black_hole':
          // Rotate accretion disk
          if (diskRef.current) {
            diskRef.current.rotation.z += delta * 0.2;
          }
          break;
        case 'neutron_star':
          // Pulse the glow
          if (glowRef.current && glowRef.current.material instanceof THREE.MeshBasicMaterial) {
            glowRef.current.material.opacity = 0.5 + Math.sin(Date.now() * 0.003) * 0.3;
          }
          // Rotate rapidly
          if (objectRef.current) {
            objectRef.current.rotation.y += delta * 2;
          }
          break;
        case 'protostar':
        case 'red_giant':
          // Pulsate slightly
          if (objectRef.current && objectRef.current.scale.x) {
            const pulseFactor = 1 + Math.sin(Date.now() * 0.001) * 0.03;
            objectRef.current.scale.set(pulseFactor, pulseFactor, pulseFactor);
          }
          break;
        case 'main_sequence':
          // Rotate slowly
          if (objectRef.current) {
            objectRef.current.rotation.y += delta * 0.1;
          }
          // Corona fluctuations
          if (coronaRef.current && coronaRef.current.material instanceof THREE.MeshBasicMaterial) {
            coronaRef.current.material.opacity = 0.2 + Math.sin(Date.now() * 0.002) * 0.1;
          }
          break;
        default:
          // General slow rotation
          if (objectRef.current) {
            objectRef.current.rotation.y += delta * 0.05;
          }
      }
    }
  });
  
  // Generate the specific stellar object based on type
  const segments = detail === 'low' ? 16 : detail === 'medium' ? 32 : 64;
  
  return (
    <group 
      ref={objectRef}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={[size, size, size]}
    >
      {type === 'black_hole' ? (
        // Black hole with accretion disk and gravitational lensing effect
        <>
          {/* Event horizon */}
          <mesh>
            <sphereGeometry args={[1, segments, segments]} />
            <meshBasicMaterial color={0x000000} />
          </mesh>
          
          {/* Accretion disk */}
          <mesh ref={diskRef} rotation={[Math.PI/2, 0, 0]}>
            <ringGeometry args={[1.5, 5, segments]} />
            <meshBasicMaterial 
              color={objectColor.clone().offsetHSL(0.1, 0.2, 0.1)} 
              side={THREE.DoubleSide} 
              transparent={true} 
              opacity={0.8}
            />
          </mesh>
          
          {/* Gravitational lensing effect (distortion of space) */}
          <mesh>
            <sphereGeometry args={[8, segments/2, segments/2]} />
            <meshBasicMaterial 
              color={0x000000} 
              transparent={true} 
              opacity={0.03} 
              side={THREE.BackSide}
            />
          </mesh>
          
          {/* Intense light from the disk */}
          <pointLight 
            color={objectColor.clone().offsetHSL(0.1, 0, 0.2)} 
            intensity={2} 
            distance={50} 
          />
        </>
      ) : type === 'neutron_star' ? (
        // Neutron star with radiation jets
        <>
          {/* Dense core */}
          <mesh>
            <sphereGeometry args={[0.5, segments, segments]} />
            <meshBasicMaterial color={objectColor} />
          </mesh>
          
          {/* Glowing aura */}
          <mesh ref={glowRef}>
            <sphereGeometry args={[1, segments, segments]} />
            <meshBasicMaterial 
              color={objectColor.clone().offsetHSL(0, -0.5, 0.2)} 
              transparent={true} 
              opacity={0.7}
            />
          </mesh>
          
          {/* Radiation jets along magnetic poles */}
          {[-1, 1].map((dir, i) => (
            <mesh key={`jet-${i}`} position={[0, dir * 1.5, 0]} rotation={[dir === 1 ? 0 : Math.PI, 0, 0]}>
              <coneGeometry args={[0.7, 3, segments/2, 1, true]} />
              <meshBasicMaterial 
                color={objectColor.clone().offsetHSL(0.1, -0.3, 0.2)} 
                transparent={true} 
                opacity={0.4}
              />
            </mesh>
          ))}
          
          {/* Strong light */}
          <pointLight color={objectColor} intensity={2} distance={20} />
        </>
      ) : type === 'red_giant' || type === 'supergiant' ? (
        // Giant stars with extended atmospheres
        <>
          {/* Core */}
          <mesh>
            <sphereGeometry args={[0.7, segments, segments]} />
            <meshStandardMaterial 
              color={objectColor} 
              emissive={objectColor} 
              emissiveIntensity={1}
            />
          </mesh>
          
          {/* Extended atmosphere layers */}
          {[0.9, 1.1, 1.3].map((radius, i) => (
            <mesh key={`atmosphere-${i}`}>
              <sphereGeometry args={[radius, segments, segments]} />
              <meshBasicMaterial 
                color={objectColor.clone().offsetHSL(0, -0.2 * i, 0.1 * i)} 
                transparent={true} 
                opacity={0.7 - i * 0.2}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
          
          {/* Bright light */}
          <pointLight 
            color={objectColor} 
            intensity={type === 'supergiant' ? 3 : 2} 
            distance={type === 'supergiant' ? 50 : 30} 
          />
        </>
      ) : type === 'main_sequence' ? (
        // Standard star with corona
        <>
          {/* Core */}
          <mesh>
            <sphereGeometry args={[1, segments, segments]} />
            <meshStandardMaterial 
              color={objectColor} 
              emissive={objectColor} 
              emissiveIntensity={1}
            />
          </mesh>
          
          {/* Corona */}
          <mesh ref={coronaRef}>
            <sphereGeometry args={[1.2, segments/2, segments/2]} />
            <meshBasicMaterial 
              color={objectColor.clone().offsetHSL(0, -0.5, 0.3)} 
              transparent={true} 
              opacity={0.3}
              side={THREE.BackSide}
            />
          </mesh>
          
          {/* Surface details (granulation, sunspots, etc.) */}
          {Array.from({ length: 10 }).map((_, i) => {
            const phi = Math.acos(2 * seededRandom(0, 1, i * 10 + 200) - 1);
            const theta = seededRandom(0, Math.PI * 2, i * 10 + 300);
            const radius = 1.01;
            const size = seededRandom(0.05, 0.2, i * 10 + 400);
            
            return (
              <mesh 
                key={`feature-${i}`}
                position={[
                  radius * Math.sin(phi) * Math.cos(theta),
                  radius * Math.sin(phi) * Math.sin(theta),
                  radius * Math.cos(phi)
                ]}
                lookAt={[0, 0, 0]}
              >
                <circleGeometry args={[size, segments/4]} />
                <meshBasicMaterial 
                  color={i % 3 === 0 ? 0x000000 : objectColor.clone().offsetHSL(0, 0, -0.2)} 
                  transparent={true}
                  opacity={0.7}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })}
          
          {/* Light */}
          <pointLight color={objectColor} intensity={1.5} distance={30} />
        </>
      ) : type === 'white_dwarf' ? (
        // White dwarf - small but very bright
        <>
          {/* Dense core */}
          <mesh>
            <sphereGeometry args={[0.5, segments, segments]} />
            <meshStandardMaterial 
              color={objectColor} 
              emissive={objectColor} 
              emissiveIntensity={1.5}
            />
          </mesh>
          
          {/* Intense glow layers */}
          {[0.7, 0.9, 1.1, 1.3].map((radius, i) => (
            <mesh key={`glow-${i}`}>
              <sphereGeometry args={[radius, segments/2, segments/2]} />
              <meshBasicMaterial 
                color={objectColor.clone().lerp(new THREE.Color(0xffffff), i * 0.2)} 
                transparent={true} 
                opacity={0.5 - i * 0.1}
                side={THREE.BackSide}
              />
            </mesh>
          ))}
          
          {/* Bright light */}
          <pointLight color={objectColor} intensity={2} distance={20} />
        </>
      ) : type === 'protostar' ? (
        // Protostar with surrounding nebula/dust
        <>
          {/* Young star core */}
          <mesh>
            <sphereGeometry args={[0.7, segments, segments]} />
            <meshStandardMaterial 
              color={objectColor} 
              emissive={objectColor} 
              emissiveIntensity={0.7}
            />
          </mesh>
          
          {/* Surrounding dust cloud */}
          <mesh>
            <sphereGeometry args={[2, segments/2, segments/2]} />
            <meshStandardMaterial 
              color={objectColor.clone().offsetHSL(0, -0.5, -0.3)} 
              transparent={true} 
              opacity={0.4}
              side={THREE.BackSide}
            />
          </mesh>
          
          {/* Accretion disk */}
          <mesh rotation={[Math.PI/2, 0, 0]}>
            <ringGeometry args={[0.8, 3, segments]} />
            <meshStandardMaterial 
              color={objectColor.clone().offsetHSL(0, 0.2, -0.2)}
              transparent={true}
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Medium light */}
          <pointLight color={objectColor} intensity={1} distance={15} />
        </>
      ) : type === 'brown_dwarf' ? (
        // Brown dwarf - failed star, very dim
        <>
          {/* Main body */}
          <mesh>
            <sphereGeometry args={[1, segments, segments]} />
            <meshStandardMaterial 
              color={objectColor} 
              emissive={objectColor} 
              emissiveIntensity={0.3}
              roughness={0.8}
            />
          </mesh>
          
          {/* Surface features - cloud bands */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = -1 + (i / 5) * 2;
            const height = 0.3;
            
            return (
              <mesh key={`band-${i}`} position={[0, y, 0]}>
                <torusGeometry args={[Math.sqrt(1 - y * y), height * 0.1, segments/4, segments]} rotation={[Math.PI/2, 0, 0]} />
                <meshStandardMaterial 
                  color={objectColor.clone().offsetHSL(0, 0.1, i % 2 === 0 ? 0.1 : -0.1)} 
                  roughness={0.9}
                />
              </mesh>
            );
          })}
          
          {/* Dim light */}
          <pointLight color={objectColor} intensity={0.5} distance={10} />
        </>
      ) : (
        // Fallback for any unspecified type
        <>
          <mesh>
            <sphereGeometry args={[1, segments, segments]} />
            <meshStandardMaterial 
              color={objectColor} 
              emissive={objectColor} 
              emissiveIntensity={0.5}
            />
          </mesh>
          <pointLight color={objectColor} intensity={1} distance={15} />
        </>
      )}
    </group>
  );
}

/**
 * A procedurally generated nebula based on real astronomical data
 */
export function Nebula({
  type,
  position = [0, 0, 0],
  size = 10,
  color,
  secondaryColor,
  rotation = [0, 0, 0],
  seed = Math.random() * 1000,
  animate = true,
  density = 1
}: NebulaProps) {
  const nebulaRef = useRef<THREE.Group>(null);
  const cloudLayerRefs = useRef<THREE.Mesh[]>([]);
  
  // Create a deterministic random function based on the seed
  const seededRandom = (min: number, max: number, offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    const rand = x - Math.floor(x); // 0-1 range
    return min + rand * (max - min);
  };
  
  // Set default colors based on nebula type if not provided
  const nebulaPrimaryColor = useMemo(() => {
    if (color) {
      return new THREE.Color(color);
    }
    
    // Astronomically accurate colors based on type
    switch (type) {
      case 'emission':
        // Emission nebulae can be various colors based on gas composition
        const emissionType = Math.floor(seededRandom(0, 3, 1000));
        if (emissionType === 0) {
          return new THREE.Color(0xff3366); // Pink/red (hydrogen)
        } else if (emissionType === 1) {
          return new THREE.Color(0xaaff66); // Green (oxygen)
        } else {
          return new THREE.Color(0xffaa33); // Orange (sulfur)
        }
      case 'reflection':
        return new THREE.Color(0x3366ff); // Blue (reflecting starlight)
      case 'dark':
        return new THREE.Color(0x222222); // Very dark (dust clouds)
      case 'planetary':
        // Planetary nebulae can vary in color
        const planetaryType = Math.floor(seededRandom(0, 3, 1100));
        if (planetaryType === 0) {
          return new THREE.Color(0x33ff99); // Teal/green
        } else if (planetaryType === 1) {
          return new THREE.Color(0x3366ff); // Blue
        } else {
          return new THREE.Color(0xffaaff); // Pink
        }
      case 'supernova_remnant':
        // Supernova remnants can be various colors
        const snovaType = Math.floor(seededRandom(0, 3, 1200));
        if (snovaType === 0) {
          return new THREE.Color(0xff6633); // Orange/red
        } else if (snovaType === 1) {
          return new THREE.Color(0x99aaff); // Blue
        } else {
          return new THREE.Color(0xff99ff); // Pink
        }
      default:
        return new THREE.Color(0xaaaaaa); // Default gray
    }
  }, [type, color, seededRandom]);
  
  // Secondary color (for variation)
  const nebulaSecondaryColor = useMemo(() => {
    if (secondaryColor) {
      return new THREE.Color(secondaryColor);
    }
    
    // Create a complementary color
    return nebulaPrimaryColor.clone().offsetHSL(0.5, 0, 0);
  }, [nebulaPrimaryColor, secondaryColor]);
  
  // Animation for nebula
  useFrame((_, delta) => {
    if (animate && nebulaRef.current) {
      // Slow rotation
      nebulaRef.current.rotation.y += delta * 0.01;
      
      // Animate individual cloud layers
      cloudLayerRefs.current.forEach((layer, index) => {
        if (layer) {
          // Each layer rotates at slightly different speed and axis
          layer.rotation.x += delta * 0.005 * (1 + index * 0.2);
          layer.rotation.z += delta * 0.007 * (1 - index * 0.1);
          
          // Subtle pulsing effect
          if (layer.material instanceof THREE.MeshBasicMaterial) {
            layer.material.opacity = 
              0.2 + 
              0.1 * Math.sin(Date.now() * 0.0005 + index) * 
              layer.material.opacity;
          }
        }
      });
    }
  });
  
  // Determine cloud count based on nebula type and density
  const getCloudCount = () => {
    let baseCount = 0;
    
    switch (type) {
      case 'emission':
        baseCount = 100;
        break;
      case 'reflection':
        baseCount = 80;
        break;
      case 'dark':
        baseCount = 120;
        break;
      case 'planetary':
        baseCount = 60;
        break;
      case 'supernova_remnant':
        baseCount = 150;
        break;
      default:
        baseCount = 100;
    }
    
    return Math.floor(baseCount * density);
  };
  
  // Generate cloud particles for the nebula
  const cloudCount = getCloudCount();
  const cloudPositions = useMemo(() => {
    const positions = new Float32Array(cloudCount * 3);
    const colors = new Float32Array(cloudCount * 3);
    const sizes = new Float32Array(cloudCount);
    
    for (let i = 0; i < cloudCount; i++) {
      const i3 = i * 3;
      
      // Distribution depends on nebula type
      let x, y, z;
      
      if (type === 'planetary') {
        // Planetary nebulae are shell-like
        const phi = Math.acos(2 * seededRandom(0, 1, i * 10 + 1300) - 1);
        const theta = seededRandom(0, Math.PI * 2, i * 10 + 1400);
        const r = seededRandom(0.7, 1, i * 10 + 1500) * size;
        
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
      } else if (type === 'supernova_remnant') {
        // Supernova remnants are expanding shells with filaments
        const phi = Math.acos(2 * seededRandom(0, 1, i * 10 + 1600) - 1);
        const theta = seededRandom(0, Math.PI * 2, i * 10 + 1700);
        
        // Filamentary structure
        const filamentFactor = Math.pow(seededRandom(0, 1, i * 10 + 1800), 2);
        const r = (0.8 + filamentFactor * 0.4) * size;
        
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        
        // Add some randomness for filaments
        x += seededRandom(-1, 1, i * 10 + 1900) * size * 0.2;
        y += seededRandom(-1, 1, i * 10 + 2000) * size * 0.2;
        z += seededRandom(-1, 1, i * 10 + 2100) * size * 0.2;
      } else {
        // Other nebula types have more volumetric distributions
        const phi = Math.acos(2 * seededRandom(0, 1, i * 10 + 2200) - 1);
        const theta = seededRandom(0, Math.PI * 2, i * 10 + 2300);
        const r = Math.pow(seededRandom(0, 1, i * 10 + 2400), 1/3) * size; // Cube root for uniform volume distribution
        
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
      }
      
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      
      // Color varies between primary and secondary
      const colorMix = seededRandom(0, 1, i * 10 + 2500);
      const particleColor = new THREE.Color().copy(nebulaPrimaryColor).lerp(nebulaSecondaryColor, colorMix);
      
      colors[i3] = particleColor.r;
      colors[i3 + 1] = particleColor.g;
      colors[i3 + 2] = particleColor.b;
      
      // Size varies based on position and nebula type
      if (type === 'dark') {
        // Dark nebulae have larger, more opaque dust particles
        sizes[i] = seededRandom(0.5, 1.5, i * 10 + 2600) * size * 0.05;
      } else if (type === 'planetary') {
        // Planetary nebulae have smaller, brighter particles
        sizes[i] = seededRandom(0.3, 0.8, i * 10 + 2700) * size * 0.03;
      } else {
        // Default size distribution
        sizes[i] = seededRandom(0.2, 1, i * 10 + 2800) * size * 0.04;
      }
    }
    
    return { positions, colors, sizes };
  }, [cloudCount, type, size, nebulaPrimaryColor, nebulaSecondaryColor, seededRandom]);
  
  // Generate cloud layers for the nebula (large amorphous shapes)
  const cloudLayerCount = type === 'planetary' ? 3 : type === 'dark' ? 5 : 4;
  
  return (
    <group 
      ref={nebulaRef}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
    >
      {/* Cloud particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={cloudCount}
            array={cloudPositions.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={cloudCount}
            array={cloudPositions.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={cloudCount}
            array={cloudPositions.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1}
          sizeAttenuation={true}
          vertexColors={true}
          transparent={true}
          opacity={type === 'dark' ? 0.8 : 0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Cloud layers - large amorphous meshes for volumetric feel */}
      {Array.from({ length: cloudLayerCount }).map((_, i) => {
        const layerSize = (0.6 + i * 0.15) * size;
        const layerOpacity = type === 'dark' ? 0.2 : i === 0 ? 0.3 : 0.15;
        const layerColor = new THREE.Color().copy(nebulaPrimaryColor).lerp(nebulaSecondaryColor, i / cloudLayerCount);
        
        // Position offset for each layer
        const offsetX = seededRandom(-0.3, 0.3, i * 100 + 3000) * size;
        const offsetY = seededRandom(-0.3, 0.3, i * 100 + 3100) * size;
        const offsetZ = seededRandom(-0.3, 0.3, i * 100 + 3200) * size;
        
        // For planetary nebulae, create a shell structure
        if (type === 'planetary') {
          return (
            <mesh 
              key={`layer-${i}`}
              position={[offsetX, offsetY, offsetZ]}
              ref={(el) => {
                if (el) cloudLayerRefs.current[i] = el;
              }}
            >
              <sphereGeometry args={[layerSize, 32, 32]} />
              <meshBasicMaterial 
                color={layerColor} 
                transparent={true} 
                opacity={layerOpacity}
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          );
        }
        
        // For other nebula types, create irregular blob shapes
        let geometry;
        if (type === 'supernova_remnant') {
          // Create a more filamentary, irregular shape for supernova remnants
          geometry = new THREE.IcosahedronGeometry(layerSize, 2);
          
          // Distort the geometry to create filaments
          const positions = geometry.attributes.position.array;
          for (let j = 0; j < positions.length; j += 3) {
            const x = positions[j];
            const y = positions[j + 1];
            const z = positions[j + 2];
            
            // Calculate distortion amount based on position
            const length = Math.sqrt(x * x + y * y + z * z);
            const distortion = seededRandom(0.7, 1.5, j + i * 1000 + 4000);
            
            // Apply distortion along normal direction
            positions[j] = x * distortion;
            positions[j + 1] = y * distortion;
            positions[j + 2] = z * distortion;
          }
        } else {
          // For other nebulae, use an ellipsoid-like shape
          geometry = new THREE.SphereGeometry(layerSize, 32, 32);
          
          // Scale to create an ellipsoidal shape
          const scaleX = seededRandom(0.8, 1.2, i * 100 + 4100);
          const scaleY = seededRandom(0.8, 1.2, i * 100 + 4200);
          const scaleZ = seededRandom(0.8, 1.2, i * 100 + 4300);
          
          const positions = geometry.attributes.position.array;
          for (let j = 0; j < positions.length; j += 3) {
            positions[j] *= scaleX;
            positions[j + 1] *= scaleY;
            positions[j + 2] *= scaleZ;
          }
        }
        
        return (
          <mesh 
            key={`layer-${i}`}
            position={[offsetX, offsetY, offsetZ]}
            ref={(el) => {
              if (el) cloudLayerRefs.current[i] = el;
            }}
          >
            <bufferGeometry attach="geometry">
              <bufferAttribute 
                attach="attributes-position" 
                array={geometry.attributes.position.array} 
                count={geometry.attributes.position.count} 
                itemSize={3} 
              />
              <bufferAttribute 
                attach="attributes-normal" 
                array={geometry.attributes.normal.array} 
                count={geometry.attributes.normal.count} 
                itemSize={3} 
              />
            </bufferGeometry>
            <meshBasicMaterial 
              color={layerColor} 
              transparent={true} 
              opacity={layerOpacity}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
      
      {/* Light source for nebula - varies by type */}
      {type === 'emission' && (
        <pointLight 
          color={nebulaPrimaryColor} 
          intensity={1} 
          distance={size * 3} 
          position={[0, 0, 0]} 
        />
      )}
      
      {type === 'reflection' && (
        <pointLight 
          color={0xffffff} 
          intensity={0.7} 
          distance={size * 2.5} 
          position={[size * 0.5, 0, 0]} 
        />
      )}
      
      {type === 'planetary' && (
        <pointLight 
          color={nebulaPrimaryColor.clone().offsetHSL(0, 0.3, 0.2)} 
          intensity={1.2} 
          distance={size * 2} 
          position={[0, 0, 0]} 
        />
      )}
      
      {type === 'supernova_remnant' && (
        <>
          <pointLight 
            color={nebulaPrimaryColor} 
            intensity={1.5} 
            distance={size * 4} 
            position={[0, 0, 0]} 
          />
          {/* Remnant core (neutron star or black hole) */}
          {seededRandom(0, 1, 5000) > 0.5 ? (
            <StellarObject 
              type="neutron_star" 
              size={size * 0.02} 
              position={[0, 0, 0]} 
              seed={seed + 100}
            />
          ) : (
            <StellarObject 
              type="black_hole" 
              size={size * 0.05} 
              position={[0, 0, 0]}
              seed={seed + 100}
            />
          )}
        </>
      )}
    </group>
  );
}