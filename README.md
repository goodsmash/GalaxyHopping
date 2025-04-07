# Galaxy Hopping

A dynamic 3D space shooter game featuring immersive spacecraft combat and strategic galaxy exploration. Players navigate through increasingly challenging cosmic environments with evolving enemy encounters and procedurally generated galaxies.

## 🚀 Overview

Galaxy Hopping is a browser-based 3D space exploration and combat game built with modern web technologies. The game leverages real astronomical data inspired by the James Webb telescope to create scientifically accurate galaxy systems. Players can explore unique galaxies, battle enemies, and discover new ships and power-ups.

## 🎮 Game Features

- **Procedural Galaxy Generation**: Each galaxy is uniquely generated with scientifically accurate astronomical features
- **Space Combat**: Battle against various enemy types with different attack patterns
- **Vehicle System**: Multiple spacecraft with varying speeds, maneuverability, and weapons
- **Power-up System**: Collect various power-ups to enhance your ship's capabilities
- **Boss Battles**: Face challenging boss battles at the end of each galaxy level
- **Wormholes**: Travel between galaxies through wormholes
- **Detailed 3D Models**: Rich visual environment with over 25 different 3D models
- **Dynamic Camera System**: Smooth camera transitions and effects
- **Interactive Map**: Navigate with a minimap showing points of interest
- **Physics-Based Movement**: Realistic spacecraft controls with inertia and momentum

## 🏗️ Technology Stack

- **Three.js**: 3D rendering engine
- **React**: UI framework
- **TypeScript**: Type-safe development
- **@react-three/fiber**: React bindings for Three.js
- **@react-three/drei**: Useful helpers for React Three Fiber
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: State management
- **GSAP**: Animation library
- **Howler.js**: Audio library

## 📁 Project Structure

```
/
├── client/                # Client-side code
│   ├── public/            # Static assets
│   │   ├── models/        # 3D GLB models
│   │   ├── textures/      # Texture files 
│   │   └── sounds/        # Game audio files
│   └── src/               # Source code
│       ├── components/    # UI components
│       │   └── ui/        # Shared UI components
│       ├── game/          # Game-specific components
│       │   ├── models/    # 3D model implementations
│       │   └── utils/     # Game utilities
│       └── lib/           # Libraries and shared code
│           └── stores/    # State management
├── server/                # Server-side code
└── shared/                # Shared types and utilities
```

## 🎮 Game Architecture

### Core Components

1. **GameManager.tsx**: Central game controller that manages:
   - Game state (menu, playing, paused, etc)
   - Player references and global access via `window.playerRefGlobal`
   - Keyboard controls and event handling
   - Camera positioning and transitions
   - Background music and sound effects

2. **GameScene.tsx**: Main 3D scene that contains:
   - THREE.js scene setup
   - Lighting and environmental effects
   - Star field generation

3. **Player.tsx**: Player spacecraft implementation with:
   - Vehicle types with different properties
   - Movement controls
   - Weapon systems
   - Health and shield management
   - Model loading with fallbacks

4. **Galaxy.tsx**: Procedural galaxy generation:
   - Creates unique galaxy environments based on galaxy level
   - Generates star systems with accurate astronomical data
   - Implements texture loading with canvas-based fallbacks
   - Manages interactive points and wormholes

5. **Enemy.tsx**: Enemy implementation:
   - Different enemy types (chaser, shooter)
   - AI behavior patterns
   - Collision detection
   - Robust player reference handling

6. **GalaxyObjectFactory.tsx**: Factory for all space objects:
   - Manages loading of 25+ 3D models
   - Creates various space structures, planets, ships, etc.
   - Handles animation types (rotate, float, orbit, pulse)
   - Implements error handling and fallbacks

### State Management

The game uses Zustand for state management, with several stores:

1. **useGalaxyHopping.ts**: Main game state store
   - Current galaxy level
   - Player health and score
   - Game state (menu, playing, paused)

2. **useAudio.ts**: Audio management store
   - Background music
   - Sound effects
   - Volume control

### Data Generation

The game uses procedural generation based on real astronomical data:

1. **webbData.ts**: Scientifically accurate data generation
   - Galaxy types (spiral, elliptical, irregular, etc)
   - Star colors based on temperature classes
   - Stellar object types

## 🚀 Game Mechanics

### Player Controls

- **WASD/Arrow Keys**: Movement
- **Space**: Shoot
- **E**: Interact with objects
- **M**: Toggle map
- **P**: Pause game
- **Esc**: Menu

### Combat System

1. **Bullet.tsx**: Projectile system
   - Directional movement
   - Collision detection
   - Particle effects

2. **MonsterSpawner.tsx**: Enemy spawning system
   - Spawns enemies based on galaxy level
   - Manages enemy types and difficulty
   - Handles enemy cleanup

3. **BossBattle.tsx**: End-of-galaxy boss encounters
   - Unique boss behaviors
   - Special attacks
   - Victory conditions

### Collectibles System

1. **Collectible.tsx**: Implements various collectible items
   - Health power-ups
   - Shield power-ups
   - Weapon upgrades
   - Speed boosts

### Navigation System

1. **GalaxyMap.tsx**: Interactive map showing:
   - Player position
   - Points of interest
   - Explored areas
   - Enemy locations

2. **Wormhole.tsx**: Transportation between galaxies
   - Visual effects
   - Transition animations
   - Galaxy linking

## 🔧 Technical Implementations

### 3D Model System

The game uses GLB format for 3D models loaded via Three.js's GLTFLoader:

1. **Models are loaded from `/client/public/models/`**
2. **Verified available models include:**
   - Space stations and structures
   - Various spacecraft
   - Planets and asteroids
   - Special objects (black holes, wormholes)

### Error Handling Strategies

1. **Texture Loading**: 
   - Canvas-based fallback textures for star particles
   - Error handling for missing textures

2. **Model Loading**:
   - Fallback models when primary models fail to load
   - Detailed error logging

3. **Player References**:
   - Global reference system (`window.playerRefGlobal`)
   - Component-level validation before use

### Optimization Techniques

1. **Limited Star Count**: Maximum stars are capped for performance
2. **Conditional Rendering**: Enemies only render when active and within range
3. **Efficient State Updates**: Using React patterns for minimal re-renders

## 🛠️ Development Notes

### Solved Issues

1. **Star Texture Loading**: Implemented canvas-based fallback textures
2. **Player Reference Handling**: Created a global reference system with fallbacks
3. **3D Model Loading**: Enhanced error handling for model loading
4. **Enemy Rendering**: Added safety checks before rendering enemies

## 🎨 Asset Information

### 3D Models

The game uses GLB models located in `client/public/models/`. Notable models include:

- Standard ships: `standard_ship.glb`
- Enemy ships: `alien_enemy_ship.glb`
- Space stations: `space_station.glb`, `mining_station.glb`
- Planets: `ice_planet.glb`, `gas_giant_planet.glb`
- Special objects: `black_hole.glb`, `wormhole_portal.glb`

### Textures

Textures are stored in `client/public/textures/` and include:

- Star particles
- Planet surfaces
- Nebula effects
- UI elements

### Sounds

Sound effects and music are in `client/public/sounds/` and include:

- Engine sounds
- Weapon effects
- Ambient space music
- Explosions and impacts

## 🚀 Future Development

Planned features for future development:

1. **Multiplayer Mode**: Online multiplayer combat and co-op missions
2. **Expanded Ship Customization**: More ship types and customization options
3. **Mission System**: Structured missions with objectives and rewards
4. **Space Trading**: Economic system for trading resources
5. **Enhanced AI**: More sophisticated enemy behaviors

## 📝 Contributing

The development team welcomes contributions to Galaxy Hopping! Please refer to our contribution guidelines and code of conduct for details on how to get involved.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
