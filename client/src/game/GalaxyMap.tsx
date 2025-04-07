import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGalaxyHopping } from '../lib/stores/useGalaxyHopping';

interface GalaxyMapProps {
  playerRef: React.RefObject<THREE.Group>;
  open?: boolean;
  onClose?: () => void;
  size?: number;
  galaxyRadius?: number;
}

interface ExploredArea {
  x: number;
  z: number;
  radius: number;
  timestamp: number;
}

interface PointOfInterest {
  id: number;
  type: 'wormhole' | 'enemy' | 'station' | 'resource' | 'mission';
  position: [number, number];
  discovered: boolean;
  name: string;
  info?: string;
}

export function GalaxyMap({ 
  playerRef, 
  open = false, 
  onClose, 
  size = 200, 
  galaxyRadius = 500
}: GalaxyMapProps) {
  const { scene, camera } = useThree();
  const mapRef = useRef<THREE.Group>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);
  
  // Game state
  const gameState = useGalaxyHopping(state => state.gameState);
  const currentGalaxy = useGalaxyHopping(state => state.currentGalaxy);
  
  // Map state
  const [exploredAreas, setExploredAreas] = useState<ExploredArea[]>([]);
  const [pointsOfInterest, setPointsOfInterest] = useState<PointOfInterest[]>([]);
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<PointOfInterest | null>(null);
  
  // Generate canvas for map rendering
  useEffect(() => {
    if (!canvasRef.current) {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      canvasRef.current = canvas;
      
      // Get context
      const context = canvas.getContext('2d');
      if (context) {
        contextRef.current = context;
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        textureRef.current = texture;
      }
    }
    
    // Initial map render
    renderMap();
  }, []);
  
  // Handle galaxy change
  useEffect(() => {
    // Reset explored areas and generate new POIs when galaxy changes
    setExploredAreas([]);
    generatePointsOfInterest();
  }, [currentGalaxy]);
  
  // Update visibility
  useEffect(() => {
    setMapVisible(open);
  }, [open]);
  
  // Generate random points of interest for the current galaxy
  const generatePointsOfInterest = () => {
    const seed = currentGalaxy * 1000; // Use galaxy number as seed
    const random = (min: number, max: number) => {
      const x = Math.sin(seed + pointsOfInterest.length) * 10000;
      return min + (x - Math.floor(x)) * (max - min);
    };
    
    const poiCount = 5 + Math.floor(currentGalaxy * 1.5); // More POIs in higher galaxies
    const newPOIs: PointOfInterest[] = [];
    
    // Always add a wormhole to the next galaxy
    const wormholeAngle = random(0, Math.PI * 2);
    const wormholeDistance = galaxyRadius * 0.8;
    newPOIs.push({
      id: 1000 + currentGalaxy,
      type: 'wormhole',
      position: [
        Math.cos(wormholeAngle) * wormholeDistance, 
        Math.sin(wormholeAngle) * wormholeDistance
      ],
      discovered: false,
      name: `Wormhole to Galaxy ${currentGalaxy + 1}`
    });
    
    // Add various POIs
    const poiTypes: Array<'enemy' | 'station' | 'resource' | 'mission'> = [
      'enemy', 'station', 'resource', 'mission'
    ];
    
    for (let i = 0; i < poiCount; i++) {
      const angle = random(0, Math.PI * 2);
      const distance = random(galaxyRadius * 0.2, galaxyRadius * 0.9);
      const type = poiTypes[Math.floor(random(0, poiTypes.length))];
      
      let name = '';
      let info = '';
      
      // Generate names and info based on type
      switch (type) {
        case 'enemy':
          name = `Enemy Base ${String.fromCharCode(65 + Math.floor(random(0, 26)))}`;
          info = 'Hostile forces detected. Approach with caution.';
          break;
        case 'station':
          name = `Station ${Math.floor(random(1, 100))}`;
          info = 'Trading and refueling available.';
          break;
        case 'resource':
          name = `Resource Node ${Math.floor(random(100, 999))}`;
          info = 'Valuable minerals detected.';
          break;
        case 'mission':
          name = `Mission ${Math.floor(random(1, 50))}`;
          info = 'Special objective available.';
          break;
      }
      
      newPOIs.push({
        id: i + currentGalaxy * 100,
        type,
        position: [
          Math.cos(angle) * distance, 
          Math.sin(angle) * distance
        ],
        discovered: false,
        name,
        info
      });
    }
    
    setPointsOfInterest(newPOIs);
  };
  
  // Update explored areas based on player position
  useFrame(() => {
    if (gameState !== 'playing' || !playerRef.current) return;
    
    // Get player world position
    const playerPosition = new THREE.Vector3();
    playerRef.current.getWorldPosition(playerPosition);
    
    // Check if player is in a new area to reveal on map
    const exploreRadius = 50; // Detection radius
    const now = Date.now();
    
    // Only add new explored areas every second or so
    const lastArea = exploredAreas[exploredAreas.length - 1];
    if (!lastArea || now - lastArea.timestamp > 1000) {
      // Check if this area is already explored (to avoid duplicates)
      const isNewArea = !exploredAreas.some(area => {
        const distance = Math.sqrt(
          Math.pow(area.x - playerPosition.x, 2) + 
          Math.pow(area.z - playerPosition.z, 2)
        );
        return distance < area.radius;
      });
      
      if (isNewArea) {
        // Add new explored area
        setExploredAreas(prev => [
          ...prev, 
          { 
            x: playerPosition.x, 
            z: playerPosition.z, 
            radius: exploreRadius,
            timestamp: now
          }
        ]);
        
        // Check if any POIs are discovered
        setPointsOfInterest(prev => prev.map(poi => {
          if (!poi.discovered) {
            const poiPos = new THREE.Vector2(poi.position[0], poi.position[1]);
            const playerPos2D = new THREE.Vector2(playerPosition.x, playerPosition.z);
            const distance = poiPos.distanceTo(playerPos2D);
            
            if (distance < exploreRadius) {
              console.log(`Discovered POI: ${poi.name}`);
              return { ...poi, discovered: true };
            }
          }
          return poi;
        }));
        
        // Render map with new data
        renderMap();
      }
    }
    
    // Update map position when visible
    if (mapVisible && mapRef.current) {
      // Position in front of camera
      const cameraDirection = new THREE.Vector3(0, 0, -1);
      cameraDirection.applyQuaternion(camera.quaternion);
      
      const mapPosition = camera.position.clone()
        .add(cameraDirection.multiplyScalar(size * 0.01));
      
      mapRef.current.position.copy(mapPosition);
      mapRef.current.quaternion.copy(camera.quaternion);
    }
  });
  
  // Render the map to canvas
  const renderMap = () => {
    if (!contextRef.current || !textureRef.current) return;
    
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 20, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scale factor
    const scale = canvas.width / (galaxyRadius * 2.2);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Draw galaxy boundary
    ctx.strokeStyle = 'rgba(50, 100, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, galaxyRadius * scale, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw grid
    ctx.strokeStyle = 'rgba(50, 100, 255, 0.2)';
    ctx.lineWidth = 1;
    const gridSize = 100;
    const gridCount = Math.ceil(galaxyRadius * 2 / gridSize);
    
    for (let i = -gridCount; i <= gridCount; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(centerX + i * gridSize * scale, centerY - galaxyRadius * scale);
      ctx.lineTo(centerX + i * gridSize * scale, centerY + galaxyRadius * scale);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(centerX - galaxyRadius * scale, centerY + i * gridSize * scale);
      ctx.lineTo(centerX + galaxyRadius * scale, centerY + i * gridSize * scale);
      ctx.stroke();
    }
    
    // Draw explored areas (fog of war system)
    ctx.fillStyle = 'rgba(100, 150, 255, 0.15)';
    exploredAreas.forEach(area => {
      ctx.beginPath();
      ctx.arc(
        centerX + area.x * scale, 
        centerY + area.z * scale, 
        area.radius * scale, 
        0, Math.PI * 2
      );
      ctx.fill();
    });
    
    // Draw player position
    if (playerRef.current) {
      const playerPosition = new THREE.Vector3();
      playerRef.current.getWorldPosition(playerPosition);
      
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(
        centerX + playerPosition.x * scale, 
        centerY + playerPosition.z * scale, 
        5, 0, Math.PI * 2
      );
      ctx.fill();
      
      // Player direction
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(playerRef.current.quaternion);
      direction.multiplyScalar(15);
      
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX + playerPosition.x * scale, centerY + playerPosition.z * scale);
      ctx.lineTo(
        centerX + (playerPosition.x + direction.x) * scale, 
        centerY + (playerPosition.z + direction.z) * scale
      );
      ctx.stroke();
    }
    
    // Draw points of interest
    pointsOfInterest.forEach(poi => {
      // Only draw discovered POIs
      if (!poi.discovered) return;
      
      const x = centerX + poi.position[0] * scale;
      const y = centerY + poi.position[1] * scale;
      
      // Different styles per POI type
      let color = 'white';
      let radius = 4;
      
      switch (poi.type) {
        case 'wormhole':
          color = 'rgba(255, 0, 255, 0.8)';
          radius = 7;
          break;
        case 'enemy':
          color = 'rgba(255, 50, 50, 0.8)';
          radius = 5;
          break;
        case 'station':
          color = 'rgba(50, 150, 255, 0.8)';
          radius = 6;
          break;
        case 'resource':
          color = 'rgba(255, 255, 50, 0.8)';
          radius = 4;
          break;
        case 'mission':
          color = 'rgba(50, 255, 50, 0.8)';
          radius = 6;
          break;
      }
      
      // Draw POI marker
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw selection highlight if selected
      if (selectedPOI && selectedPOI.id === poi.id) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw info box for selected POI
        ctx.fillStyle = 'rgba(0, 20, 40, 0.8)';
        ctx.fillRect(x + 15, y - 30, 200, 60);
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.8)';
        ctx.strokeRect(x + 15, y - 30, 200, 60);
        
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(poi.name, x + 25, y - 10);
        
        if (poi.info) {
          ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
          ctx.font = '12px Arial';
          ctx.fillText(poi.info, x + 25, y + 10);
        }
      }
      
      // Draw POI names
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '10px Arial';
      ctx.fillText(poi.name, x + 8, y + 4);
    });
    
    // Draw title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Galaxy ${currentGalaxy}`, 20, 40);
    
    // Draw legend
    const legendY = canvas.height - 120;
    ctx.fillStyle = 'rgba(0, 20, 40, 0.8)';
    ctx.fillRect(20, legendY, 160, 100);
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.8)';
    ctx.strokeRect(20, legendY, 160, 100);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Legend', 30, legendY + 20);
    
    const legendItems = [
      { color: 'rgba(255, 0, 255, 0.8)', label: 'Wormhole' },
      { color: 'rgba(255, 50, 50, 0.8)', label: 'Enemy' },
      { color: 'rgba(50, 150, 255, 0.8)', label: 'Station' },
      { color: 'rgba(255, 255, 50, 0.8)', label: 'Resource' },
      { color: 'rgba(50, 255, 50, 0.8)', label: 'Mission' }
    ];
    
    legendItems.forEach((item, index) => {
      const y = legendY + 40 + index * 15;
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(40, y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.fillText(item.label, 55, y + 5);
    });
    
    // Update texture
    textureRef.current.needsUpdate = true;
  };
  
  // Handle map click
  const handleMapClick = (event: any) => {
    if (!mapRef.current || !textureRef.current || !canvasRef.current) return;
    
    // Prevent event from propagating
    if (event.stopPropagation) {
      event.stopPropagation();
    }
    
    // Get clicked UV coordinates from the raycaster
    if (event.intersections && event.intersections[0] && event.intersections[0].uv) {
      const { uv } = event.intersections[0];
      
      // Convert UV to canvas coordinates
      const canvasX = uv.x * canvasRef.current.width;
      const canvasY = (1 - uv.y) * canvasRef.current.height;
      
      // Convert to world coordinates
      const centerX = canvasRef.current.width / 2;
      const centerY = canvasRef.current.height / 2;
      const scale = canvasRef.current.width / (galaxyRadius * 2.2);
      
      const worldX = (canvasX - centerX) / scale;
      const worldY = (canvasY - centerY) / scale;
      
      // Check if player clicked on a POI
      const clickedPOI = pointsOfInterest.find(poi => {
        if (!poi.discovered) return false;
        
        const dx = poi.position[0] - worldX;
        const dy = poi.position[1] - worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < 10; // Clickable radius
      });
      
      // Update selected POI
      setSelectedPOI(clickedPOI || null);
      
      // Re-render map
      renderMap();
    }
  };
  
  // Handle close button click
  const handleCloseClick = (event: any) => {
    if (event.stopPropagation) {
      event.stopPropagation();
    }
    
    if (onClose) onClose();
  };
  
  if (!mapVisible) return null;
  
  return (
    <group ref={mapRef}>
      {/* Map plane */}
      <mesh position={[0, 0, 0]} onClick={handleMapClick}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial 
          map={textureRef.current || undefined} 
          transparent 
          opacity={0.9} 
        />
      </mesh>
      
      {/* Close button */}
      <mesh 
        position={[size/2 - 15, size/2 - 15, 1]} 
        onClick={handleCloseClick}
      >
        <circleGeometry args={[10, 32]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh position={[size/2 - 15, size/2 - 15, 2]}>
        <planeGeometry args={[15, 3]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
}