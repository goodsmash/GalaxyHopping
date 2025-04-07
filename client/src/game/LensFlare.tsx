import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

interface LensFlareProps {
  position: [number, number, number];
  color?: THREE.Color | string;
  size?: number;
  intensity?: number;
  flareCount?: number;
}

export function LensFlare({
  position,
  color = '#ffffff',
  size = 700,
  intensity = 1.5,
  flareCount = 6
}: LensFlareProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureLoaded = useRef(false);
  const { scene } = useThree();
  
  // Create lens flare textures
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    
    // Create circular gradient texture for main lens
    const mainSize = 64;
    const mainCanvas = document.createElement('canvas');
    mainCanvas.width = mainSize;
    mainCanvas.height = mainSize;
    const mainCtx = mainCanvas.getContext('2d');
    
    if (mainCtx) {
      const gradient = mainCtx.createRadialGradient(
        mainSize / 2, mainSize / 2, 0,
        mainSize / 2, mainSize / 2, mainSize / 2
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      mainCtx.fillStyle = gradient;
      mainCtx.fillRect(0, 0, mainSize, mainSize);
    }
    
    const mainTexture = new THREE.CanvasTexture(mainCanvas);
    
    // Create hexagonal flare texture
    const flareSize = 32;
    const flareCanvas = document.createElement('canvas');
    flareCanvas.width = flareSize;
    flareCanvas.height = flareSize;
    const flareCtx = flareCanvas.getContext('2d');
    
    if (flareCtx) {
      const centerX = flareSize / 2;
      const centerY = flareSize / 2;
      const radius = flareSize / 2 * 0.8;
      
      flareCtx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if (i === 0) {
          flareCtx.moveTo(x, y);
        } else {
          flareCtx.lineTo(x, y);
        }
      }
      flareCtx.closePath();
      
      const gradient = flareCtx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      flareCtx.fillStyle = gradient;
      flareCtx.fill();
    }
    
    const flareTexture = new THREE.CanvasTexture(flareCanvas);
    
    // Create smaller circular flare
    const ghostSize = 32;
    const ghostCanvas = document.createElement('canvas');
    ghostCanvas.width = ghostSize;
    ghostCanvas.height = ghostSize;
    const ghostCtx = ghostCanvas.getContext('2d');
    
    if (ghostCtx) {
      const gradient = ghostCtx.createRadialGradient(
        ghostSize / 2, ghostSize / 2, 0,
        ghostSize / 2, ghostSize / 2, ghostSize / 2
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ghostCtx.fillStyle = gradient;
      ghostCtx.fillRect(0, 0, ghostSize, ghostSize);
    }
    
    const ghostTexture = new THREE.CanvasTexture(ghostCanvas);
    
    return { main: mainTexture, flare: flareTexture, ghost: ghostTexture };
  }, []);
  
  // Create flare elements
  const flareElements = useMemo(() => {
    const elements: THREE.Sprite[] = [];
    const flareColor = typeof color === 'string' 
      ? new THREE.Color(color) 
      : (color as THREE.Color);
    
    // Main lens flare (brightest)
    const mainMaterial = new THREE.SpriteMaterial({ 
      map: textures.main,
      color: flareColor,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    
    const mainSprite = new THREE.Sprite(mainMaterial);
    mainSprite.scale.set(size, size, 1);
    elements.push(mainSprite);
    
    // Create secondary flares
    for (let i = 0; i < flareCount; i++) {
      // Alternate between flare types
      const texture = i % 2 === 0 ? textures.flare : textures.ghost;
      
      // Vary the color slightly
      const flareHSL = { h: 0, s: 0, l: 0 };
      flareColor.getHSL(flareHSL);
      
      const variedColor = new THREE.Color().setHSL(
        (flareHSL.h + (i * 0.1)) % 1, 
        flareHSL.s, 
        Math.min(1, flareHSL.l + (i % 3) * 0.2)
      );
      
      const flareMaterial = new THREE.SpriteMaterial({
        map: texture,
        color: variedColor,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      });
      
      const sprite = new THREE.Sprite(flareMaterial);
      // Scale depends on position in flare sequence
      const flareScale = size * (0.7 - i * 0.1) * 0.6;
      sprite.scale.set(flareScale, flareScale, 1);
      
      elements.push(sprite);
    }
    
    textureLoaded.current = true;
    return elements;
  }, [textures, color, size, flareCount]);
  
  // Add flares to the scene on mount
  useEffect(() => {
    if (!meshRef.current) return;
    
    // Add all flare elements to the mesh
    flareElements.forEach(element => {
      meshRef.current?.add(element);
    });
    
    // Cleanup
    return () => {
      flareElements.forEach(element => {
        element.material.dispose();
        if (element.parent) {
          element.parent.remove(element);
        }
      });
    };
  }, [flareElements]);
  
  // Update flare positions on each frame
  useFrame(({ camera }) => {
    if (!meshRef.current || !textureLoaded.current) return;
    
    // Get vector from camera to light source
    const vecX = meshRef.current.position.x - camera.position.x;
    const vecY = meshRef.current.position.y - camera.position.y;
    const vecZ = meshRef.current.position.z - camera.position.z;
    
    // Position flares at different positions along the source-camera line
    flareElements.forEach((flare, i) => {
      if (i === 0) {
        // Main flare stays at the light source
        flare.position.set(0, 0, 0);
      } else {
        // Position flares at different points along the camera-light axis
        const factor = -0.3 - (i * 0.15); // Vary positions
        flare.position.set(
          vecX * factor,
          vecY * factor,
          vecZ * factor
        );
      }
    });
  });
  
  // Update visibility based on camera direction
  useFrame(({ camera }) => {
    if (!meshRef.current) return;
    
    // Calculate direction to light source
    const lightDir = new THREE.Vector3().subVectors(
      new THREE.Vector3().fromArray(position),
      camera.position
    ).normalize();
    
    // Get camera forward direction
    const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    
    // Dot product gives cosine of angle between vectors
    const dot = lightDir.dot(camDir);
    
    // Only show flares when light is in view (in front of camera)
    const visible = dot > 0.1;
    
    // Apply visibility to all flare elements
    flareElements.forEach(flare => {
      flare.visible = visible;
      
      // Adjust opacity based on view angle
      if (flare.material instanceof THREE.SpriteMaterial) {
        flare.material.opacity = visible ? Math.min(1, dot * intensity) : 0;
      }
    });
  });
  
  return (
    <mesh ref={meshRef} position={new THREE.Vector3().fromArray(position)}>
      {/* This is just a point light, flares are added as children */}
      <pointLight 
        color={color} 
        intensity={intensity * 10} 
        distance={2000} 
      />
    </mesh>
  );
}