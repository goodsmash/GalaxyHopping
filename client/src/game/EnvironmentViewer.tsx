import { Suspense, useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats, Environment, PerspectiveCamera, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GalaxyObject, GalaxyObjectType, ThemedObjectCluster, GalaxyTheme, preloadAllModels } from "./models/GalaxyObjectFactory";

// Define detailed information for each object type
const objectDetails: Record<GalaxyObjectType, { 
  name: string, 
  description: string, 
  scale: number,
  gameRoles: string[]
}> = {
  space_station: { 
    name: "Space Station", 
    description: "An advanced space station with multiple docking bays, rotating rings, and modular sections. Players can dock here for missions, trading, and upgrades.", 
    scale: 1.5,
    gameRoles: [
      "Trading hub for equipment and resources",
      "Mission control center",
      "Safe zone from enemies",
      "Repair and upgrade facilities"
    ]
  },
  gas_giant_planet: { 
    name: "Gas Giant Planet", 
    description: "A massive ringed gas giant with swirling atmospheric bands and impressive ring system. An important celestial body in our galaxy system.", 
    scale: 2.0,
    gameRoles: [
      "Major navigational landmark",
      "Resource harvesting location",
      "Gravitational hazard to navigate",
      "Potential location for hidden bases"
    ]
  },
  asteroid_cluster: { 
    name: "Asteroid Cluster", 
    description: "A collection of varied space rocks with realistic surface details. Players can mine these for valuable resources or navigate around them.", 
    scale: 1.8,
    gameRoles: [
      "Resource mining locations",
      "Navigation hazards",
      "Potential hiding spots",
      "Combat arenas with cover"
    ]
  },
  wormhole_portal: { 
    name: "Wormhole Portal", 
    description: "A mysterious portal that allows faster-than-light travel between galaxy systems. The alien technology creating these is unknown.", 
    scale: 3.0,
    gameRoles: [
      "Fast travel between galaxies",
      "Story progression points",
      "Escape routes during combat",
      "Strategic control points"
    ]
  },
  weapon_powerup: { 
    name: "Weapon Powerup", 
    description: "A high-tech weapon enhancement that provides players with increased firepower, rate of fire, or special weapons capabilities.", 
    scale: 5.0,
    gameRoles: [
      "Temporary weapon enhancements",
      "Encourages exploration",
      "Strategic advantage in combat",
      "Reward for completing objectives"
    ]
  },
  alien_enemy_ship: { 
    name: "Alien Enemy Ship", 
    description: "A dangerous bio-mechanical alien vessel that presents a significant threat. These advanced ships are heavily armed and shielded.", 
    scale: 3.0,
    gameRoles: [
      "Advanced enemy combatant",
      "Boss encounter potential",
      "Drops valuable resources when defeated",
      "Part of invasion events"
    ]
  },
  cargo_ship: {
    name: "Cargo Ship",
    description: "A massive interstellar transport vessel designed to haul resources and goods between star systems. Features multiple cargo holds and efficient engines.",
    scale: 1.2,
    gameRoles: [
      "Trade mission objectives",
      "Escort mission target",
      "Source of valuable resources",
      "Neutral faction encounters"
    ]
  },
  mining_station: {
    name: "Mining Station",
    description: "An industrial facility designed for extracting resources from asteroids and planets. Contains processing facilities and storage silos.",
    scale: 1.5,
    gameRoles: [
      "Resource gathering hub",
      "Side mission location",
      "Defensive position in combat",
      "Economic gameplay element"
    ]
  },
  ice_planet: {
    name: "Ice Planet",
    description: "A frozen world with crystalline ice structures, deep crevasses, and a beautiful ring system. The surface glimmers with blue-white reflections.",
    scale: 2.5,
    gameRoles: [
      "Extreme environment challenge",
      "Source of rare resources",
      "Scenic exploration location",
      "Home to specialized alien species"
    ]
  },
  defense_satellite: {
    name: "Defense Satellite",
    description: "Military-grade orbital weapon platform with targeting systems, shield generators, and multiple weapon arrays for system defense.",
    scale: 0.6,
    gameRoles: [
      "Defensive perimeter hazard",
      "Hackable offensive asset",
      "Territory control indicator",
      "Strategic mission objective"
    ]
  },
  nebula_formation: {
    name: "Nebula Formation",
    description: "A vast cosmic cloud of interstellar gas and dust where new stars are forming. Features vibrant colors and swirling patterns of energy.",
    scale: 5.0,
    gameRoles: [
      "Visual landmark for navigation",
      "Environmental hazard (radiation)",
      "Source of exotic resources",
      "Stealth gameplay element (sensor disruption)"
    ]
  },
  fighter_squadron: {
    name: "Fighter Squadron",
    description: "A coordinated group of small, agile combat ships that operate together. Fast, maneuverable, and deadly in sufficient numbers.",
    scale: 0.8,
    gameRoles: [
      "Dynamic combat encounters",
      "Escort mission allies/enemies",
      "Faction reputation indicators",
      "Tactical combat challenges"
    ]
  },
  damaged_cruiser: {
    name: "Damaged Cruiser",
    description: "A once-powerful military vessel now drifting with severe battle damage. Hull breaches and flickering emergency systems create an eerie atmosphere.",
    scale: 1.8,
    gameRoles: [
      "Salvage mission location",
      "Story element (battle aftermath)",
      "Source of valuable technology",
      "Rescue mission setting"
    ]
  },
  space_outpost: {
    name: "Space Outpost",
    description: "A small self-sufficient station positioned in strategic locations. Features minimal facilities but serves as an important waypoint in deep space.",
    scale: 1.3,
    gameRoles: [
      "Refueling/resupply point",
      "Intelligence gathering location",
      "Territorial boundary marker",
      "Communication relay station"
    ]
  },
  black_hole: {
    name: "Black Hole",
    description: "A cosmic phenomenon with gravity so intense that not even light can escape. Surrounded by a bright accretion disk of matter being consumed.",
    scale: 2.0,
    gameRoles: [
      "Major navigational hazard",
      "End-game area gateway",
      "Source of exotic physics",
      "Time distortion gameplay mechanic"
    ]
  },
  alien_research_probe: {
    name: "Alien Research Probe",
    description: "A sleek, advanced device of clearly alien origin with mysterious scanning equipment and glowing blue energy panels. Its purpose seems to be gathering data on this sector of space.",
    scale: 1.0,
    gameRoles: [
      "Interactive investigation object with tech rewards",
      "Story-related discovery that reveals alien motives",
      "Source of advanced technological upgrades", 
      "Trigger for special alien encounter events"
    ]
  }
};

// Themed collections information
const themeDetails: Record<GalaxyTheme, {
  name: string,
  description: string,
  backgroundColor: string
}> = {
  mining_operation: {
    name: "Mining Operation",
    description: "An industrial complex focused on resource extraction and processing, with specialized equipment and transport vessels.",
    backgroundColor: "#3a2f0b"
  },
  battle_aftermath: {
    name: "Battle Aftermath",
    description: "The remnants of an intense space battle, featuring damaged vessels, defensive platforms, and military presence.",
    backgroundColor: "#3b0c0c"
  },
  trade_route: {
    name: "Trade Route",
    description: "A busy commercial corridor between star systems with cargo vessels, outposts, and security patrols ensuring safe passage.",
    backgroundColor: "#0b263a"
  },
  scientific_outpost: {
    name: "Scientific Outpost",
    description: "A research installation studying cosmic phenomena, featuring observation equipment, laboratories, and experimental technologies.",
    backgroundColor: "#1e0b3a"
  },
  alien_territory: {
    name: "Alien Territory",
    description: "A region controlled by non-human species with unique architecture, bizarre technology, and potentially hostile forces.",
    backgroundColor: "#0b3a1e"
  }
};

export function EnvironmentViewer() {
  const [viewMode, setViewMode] = useState<'single' | 'themed' | 'showcase'>('single');
  const [selectedObject, setSelectedObject] = useState<GalaxyObjectType>('space_station');
  const [selectedTheme, setSelectedTheme] = useState<GalaxyTheme>('mining_operation');
  const controlsRef = useRef<any>(null);
  
  // Use preloadAllModels from GalaxyObjectFactory
  useEffect(() => {
    try {
      // Call the preload function from GalaxyObjectFactory
      preloadAllModels();
      console.log("Preloaded all galaxy object models");
    } catch (error) {
      console.error("Error in preloading models:", error);
    }
  }, []);
  
  // Showcase rotation for camera
  useEffect(() => {
    if (viewMode === 'showcase' && controlsRef.current) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 0.5;
    } else if (controlsRef.current) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 0.2;
    }
  }, [viewMode]);
  
  // Render component based on current view mode
  const renderContent = () => {
    switch(viewMode) {
      case 'single':
        return (
          <GalaxyObject 
            type={selectedObject} 
            position={[0, 0, 0]} 
            customScale={[1, 1, 1]} 
          />
        );
      
      case 'themed':
        return (
          <ThemedObjectCluster 
            theme={selectedTheme}
            position={[0, 0, 0]}
            radius={15}
            objectCount={8}
          />
        );
      
      case 'showcase':
        return (
          <>
            {/* Create a showcase of multiple objects in a fancy arrangement */}
            <GalaxyObject type="space_station" position={[0, 0, 0]} customScale={[0.7, 0.7, 0.7]} />
            <GalaxyObject type="alien_enemy_ship" position={[8, 3, 8]} customScale={[0.5, 0.5, 0.5]} />
            <GalaxyObject type="cargo_ship" position={[-8, -2, 5]} customScale={[0.6, 0.6, 0.6]} />
            <GalaxyObject type="ice_planet" position={[-12, 5, -10]} customScale={[1.2, 1.2, 1.2]} />
            <GalaxyObject type="defense_satellite" position={[5, -3, -7]} customScale={[0.4, 0.4, 0.4]} />
            <GalaxyObject type="black_hole" position={[-5, 7, -15]} customScale={[1.0, 1.0, 1.0]} />
            <GalaxyObject type="fighter_squadron" position={[15, -5, -3]} customScale={[0.5, 0.5, 0.5]} />
            <GalaxyObject type="wormhole_portal" position={[-15, -8, -15]} customScale={[0.8, 0.8, 0.8]} />
            <GalaxyObject type="mining_station" position={[10, 8, -8]} customScale={[0.7, 0.7, 0.7]} />
          </>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* View mode selector */}
      <div className="flex justify-center p-4 bg-gray-900 border-b border-gray-700">
        <div className="flex space-x-4">
          <button
            className={`px-6 py-2 rounded ${viewMode === 'single' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setViewMode('single')}
          >
            Single Object
          </button>
          <button
            className={`px-6 py-2 rounded ${viewMode === 'themed' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setViewMode('themed')}
          >
            Themed Clusters
          </button>
          <button
            className={`px-6 py-2 rounded ${viewMode === 'showcase' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setViewMode('showcase')}
          >
            Object Showcase
          </button>
        </div>
      </div>
      
      {/* Object/Theme selector */}
      {viewMode !== 'showcase' && (
        <div className="flex justify-center p-4 bg-gray-800 border-b border-gray-700 overflow-x-auto">
          <div className="flex space-x-2 flex-wrap justify-center">
            {viewMode === 'single' && (
              (Object.keys(objectDetails) as GalaxyObjectType[]).map((objectType) => (
                <button
                  key={objectType}
                  className={`px-3 py-1 rounded text-sm mb-2 ${selectedObject === objectType ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setSelectedObject(objectType)}
                >
                  {objectDetails[objectType].name}
                </button>
              ))
            )}
            
            {viewMode === 'themed' && (
              (Object.keys(themeDetails) as GalaxyTheme[]).map((theme) => (
                <button
                  key={theme}
                  className={`px-3 py-1 rounded text-sm mb-2 ${selectedTheme === theme ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setSelectedTheme(theme)}
                  style={{
                    borderBottom: selectedTheme === theme ? `3px solid ${themeDetails[theme].backgroundColor}` : 'none'
                  }}
                >
                  {themeDetails[theme].name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
      
      <div className="flex flex-grow">
        <div className="w-3/4 h-full relative">
          <Canvas shadows>
            <PerspectiveCamera 
              makeDefault 
              position={[15, 8, 15]} 
              fov={viewMode === 'showcase' ? 60 : 50}
            />
            <color attach="background" args={[
              viewMode === 'themed' ? themeDetails[selectedTheme].backgroundColor : "#020209"
            ]} />
            <fog attach="fog" args={[
              viewMode === 'themed' ? themeDetails[selectedTheme].backgroundColor : "#020209", 
              20, 
              60
            ]} />
            
            <Suspense fallback={null}>
              {renderContent()}
              <Environment preset="night" />
            </Suspense>
            
            <ambientLight intensity={0.3} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <pointLight position={[-5, 5, -5]} intensity={0.5} color="#8844ff" />
            
            {/* Add extra themed lighting based on view mode */}
            {viewMode === 'themed' && selectedTheme === 'mining_operation' && (
              <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffbb33" />
            )}
            {viewMode === 'themed' && selectedTheme === 'battle_aftermath' && (
              <pointLight position={[0, 0, 0]} intensity={0.7} color="#ff5533" />
            )}
            {viewMode === 'themed' && selectedTheme === 'scientific_outpost' && (
              <pointLight position={[3, 3, 3]} intensity={0.6} color="#33bbff" />
            )}
            {viewMode === 'themed' && selectedTheme === 'alien_territory' && (
              <pointLight position={[-3, 0, 3]} intensity={0.8} color="#33ff99" />
            )}
            
            <OrbitControls
              ref={controlsRef}
              autoRotate
              autoRotateSpeed={0.5}
              enableZoom={true}
              enablePan={true}
              minDistance={5}
              maxDistance={viewMode === 'showcase' ? 50 : 30}
            />
            
            <Stats />
          </Canvas>
          
          <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 p-2 rounded">
            <p>Click and drag to rotate • Scroll to zoom • {Object.keys(objectDetails).length} unique objects available</p>
          </div>
        </div>
        
        <div className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
          {viewMode === 'single' && (
            <>
              <h2 className="text-2xl font-bold mb-4">{objectDetails[selectedObject].name}</h2>
              <p className="mb-6 text-gray-300">{objectDetails[selectedObject].description}</p>
              
              <div className="mt-4 bg-gray-900 p-4 rounded">
                <h3 className="text-lg font-semibold mb-2">Model Properties</h3>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Scale:</span>
                    <span>{objectDetails[selectedObject].scale}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Animated:</span>
                    <span>Yes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Polygon Count:</span>
                    <span>High Detail</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span>GLB</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-900 p-4 rounded">
                <h3 className="text-lg font-semibold mb-2">Game Role</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                  {objectDetails[selectedObject].gameRoles.map((role, index) => (
                    <li key={index}>{role}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
          
          {viewMode === 'themed' && (
            <>
              <h2 className="text-2xl font-bold mb-4">{themeDetails[selectedTheme].name}</h2>
              <p className="mb-6 text-gray-300">{themeDetails[selectedTheme].description}</p>
              
              <div className="mt-4 bg-gray-900 p-4 rounded">
                <h3 className="text-lg font-semibold mb-2">Objects In This Theme</h3>
                <ul className="space-y-2 text-gray-300">
                  {(() => {
                    // Get the object types for this theme
                    const themeObjectArray = {
                      mining_operation: ['mining_station', 'asteroid_cluster', 'cargo_ship', 'space_outpost'],
                      battle_aftermath: ['damaged_cruiser', 'fighter_squadron', 'defense_satellite', 'space_station'],
                      trade_route: ['cargo_ship', 'space_station', 'space_outpost', 'fighter_squadron'],
                      scientific_outpost: ['space_station', 'wormhole_portal', 'defense_satellite', 'ice_planet'],
                      alien_territory: ['alien_enemy_ship', 'wormhole_portal', 'nebula_formation', 'black_hole']
                    }[selectedTheme] as GalaxyObjectType[];
                    
                    return themeObjectArray.map((objType, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded-full mr-2">
                          {index + 1}
                        </span>
                        <span>{objectDetails[objType].name}</span>
                      </li>
                    ));
                  })()}
                </ul>
              </div>
              
              <div className="mt-6 bg-gray-900 p-4 rounded">
                <h3 className="text-lg font-semibold mb-2">Gameplay Scenario</h3>
                <p className="text-gray-300">
                  {selectedTheme === 'mining_operation' && "Players can engage with mining operations to earn resources, complete delivery contracts, or defend against pirate attacks on vulnerable operations."}
                  {selectedTheme === 'battle_aftermath' && "Search for valuable salvage, rescue survivors, investigate the cause of the battle, or defend against scavenger groups already looting the area."}
                  {selectedTheme === 'trade_route' && "Escort important cargo ships, intercept smugglers, negotiate trade deals, or find shortcuts through dangerous sections to improve trade efficiency."}
                  {selectedTheme === 'scientific_outpost' && "Protect researchers from cosmic threats, retrieve valuable data, test experimental technologies, or investigate strange anomalies discovered by the scientists."}
                  {selectedTheme === 'alien_territory' && "Navigate through hostile territory, establish diplomatic contact, study advanced alien technology, or defend against aggressive alien species protecting their space."}
                </p>
              </div>
            </>
          )}
          
          {viewMode === 'showcase' && (
            <>
              <h2 className="text-2xl font-bold mb-4">Galaxy Objects Showcase</h2>
              <p className="mb-6 text-gray-300">
                This view displays multiple objects positioned throughout space to demonstrate the variety and detail of available 3D models for the game environment.
              </p>
              
              <div className="mt-4 bg-gray-900 p-4 rounded">
                <h3 className="text-lg font-semibold mb-2">Featured Objects</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center text-blue-400">
                    <span className="mr-2">•</span>
                    <span>Space Station</span>
                  </li>
                  <li className="flex items-center text-red-400">
                    <span className="mr-2">•</span>
                    <span>Alien Enemy Ship</span>
                  </li>
                  <li className="flex items-center text-yellow-400">
                    <span className="mr-2">•</span>
                    <span>Cargo Ship</span>
                  </li>
                  <li className="flex items-center text-cyan-400">
                    <span className="mr-2">•</span>
                    <span>Ice Planet</span>
                  </li>
                  <li className="flex items-center text-orange-400">
                    <span className="mr-2">•</span>
                    <span>Defense Satellite</span>
                  </li>
                  <li className="flex items-center text-purple-400">
                    <span className="mr-2">•</span>
                    <span>Black Hole</span>
                  </li>
                  <li className="flex items-center text-green-400">
                    <span className="mr-2">•</span>
                    <span>And more...</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-6 bg-gray-900 p-4 rounded">
                <h3 className="text-lg font-semibold mb-2">About Our 3D Models</h3>
                <p className="text-gray-300 mb-3">
                  All models are high-quality GLB format with optimized geometry and textures. 
                  Each object features custom animations, realistic lighting responses, and 
                  detailed textures for an immersive game experience.
                </p>
                <p className="text-gray-300">
                  The game environment uses procedural placement algorithms to create unique
                  and interesting layouts every time you play, while maintaining logical
                  groupings based on each galaxy's theme and background lore.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}