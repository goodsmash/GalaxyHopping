import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { ShipModel } from './models/ShipModel';
import { VehicleType } from './types';
import { useGalaxyHopping } from '../lib/stores/useGalaxyHopping';
import * as THREE from 'three';

export function ShipViewer() {
  const { selectedShipType, setSelectedShipType, saveGame } = useGalaxyHopping();
  const [selectedShip, setSelectedShip] = useState<VehicleType>(selectedShipType);
  const [showInfo, setShowInfo] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Sync with store when component mounts
  useEffect(() => {
    setSelectedShip(selectedShipType);
  }, [selectedShipType]);

  // Ship type information
  const shipInfo = {
    standard: {
      name: "Standard Fighter",
      description: "A balanced ship with good all-around capabilities. Excellent for beginners.",
      stats: {
        speed: "★★★☆☆",
        armor: "★★★☆☆",
        weapons: "★★★☆☆",
        sensors: "★★★☆☆"
      }
    },
    scout: {
      name: "Scout Interceptor",
      description: "Fast and agile, but lightly armored. Best for reconnaissance and quick strikes.",
      stats: {
        speed: "★★★★★",
        armor: "★★☆☆☆",
        weapons: "★★☆☆☆",
        sensors: "★★★★☆"
      }
    },
    heavy: {
      name: "Heavy Assault Vessel",
      description: "Slow but heavily armored with powerful weapons. Ideal for combat-focused missions.",
      stats: {
        speed: "★★☆☆☆",
        armor: "★★★★★",
        weapons: "★★★★☆",
        sensors: "★★☆☆☆"
      }
    },
    explorer: {
      name: "Science Explorer",
      description: "Equipped with advanced sensors for exploration. Good range but limited combat abilities.",
      stats: {
        speed: "★★★☆☆",
        armor: "★★★☆☆",
        weapons: "★★☆☆☆",
        sensors: "★★★★★"
      }
    },
    stealth: {
      name: "Stealth Infiltrator",
      description: "Designed for covert operations with advanced cloaking technology. Hard to detect.",
      stats: {
        speed: "★★★★☆",
        armor: "★★☆☆☆",
        weapons: "★★★☆☆",
        sensors: "★★★★☆"
      }
    }
  };

  // Handle ship selection
  const handleSelectShip = (type: VehicleType) => {
    setSelectedShip(type);
    setSelectedShipType(type);
    saveGame(); // Save to localStorage
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        {/* 3D Ship Viewer */}
        <Canvas
          ref={canvasRef}
          shadows
          camera={{ position: [0, 2, 5], fov: 50 }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.5} />
          <spotLight 
            position={[10, 10, 10]} 
            angle={0.15} 
            penumbra={1} 
            intensity={1} 
            castShadow 
          />
          <directionalLight
            position={[-5, 5, -5]}
            intensity={0.5}
            castShadow
          />
          
          {/* Ship model */}
          <ShipModel 
            vehicleType={selectedShip} 
            position={[0, 0, 0]}
            rotation={[0, 0, 0]} 
            scale={2.5}
          />
          
          {/* Environment and controls */}
          <Environment preset="city" />
          <OrbitControls 
            enablePan={false}
            minDistance={3}
            maxDistance={10}
          />
          
          {/* Simple floor plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        </Canvas>
        
        {/* Ship info overlay */}
        {showInfo && (
          <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-80 text-white p-4 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-2">{shipInfo[selectedShip].name}</h2>
            <p className="mb-4">{shipInfo[selectedShip].description}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>Speed: {shipInfo[selectedShip].stats.speed}</div>
              <div>Armor: {shipInfo[selectedShip].stats.armor}</div>
              <div>Weapons: {shipInfo[selectedShip].stats.weapons}</div>
              <div>Sensors: {shipInfo[selectedShip].stats.sensors}</div>
            </div>
            <button 
              className="mt-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
              onClick={() => setShowInfo(false)}
            >
              Close
            </button>
          </div>
        )}
      </div>
      
      {/* Ship selection menu */}
      <div className="bg-gray-800 p-4 flex justify-between">
        <div className="flex space-x-4">
          {(Object.keys(shipInfo) as VehicleType[]).map((type) => (
            <button
              key={type}
              className={`px-4 py-2 rounded ${selectedShip === type ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => handleSelectShip(type)}
            >
              {shipInfo[type].name}
            </button>
          ))}
        </div>
        <button 
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          onClick={() => setShowInfo(!showInfo)}
        >
          {showInfo ? 'Hide Info' : 'Show Info'}
        </button>
      </div>
    </div>
  );
}