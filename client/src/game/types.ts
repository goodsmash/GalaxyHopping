import * as THREE from 'three';

// Game Controls
export enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  fire = 'fire',
  pause = 'pause',
}

// Game Configuration
export const CONFIG = {
  PLAYER: {
    SPEED: 30,
    ROTATION_SPEED: 2.5,
    FIRE_RATE: 0.2, // seconds between shots
    HEALTH: 100,
    SIZE: 1.5,
    HIT_RADIUS: 2,
  },
  ENEMY: {
    SPEED: 15,
    HEALTH: 3,
    SPAWN_RATE: 3, // seconds between spawns
    MAX_COUNT: 15,
    BULLET_SPEED: 40,
    FIRE_RATE: 2, // seconds between shots
    SIZE: 1.5,
    HIT_RADIUS: 2,
    POINTS: 100,
  },
  BULLET: {
    SPEED: 100,
    LIFETIME: 3, // seconds
    SIZE: 0.3,
    HIT_RADIUS: 0.5,
  },
  GALAXY: {
    BOUNDS: 200, // size of the play area
    ENEMY_COUNT_MULTIPLIER: 1.5, // increase per galaxy
    ENEMY_SPEED_MULTIPLIER: 1.2, // increase per galaxy
    ENEMY_HEALTH_MULTIPLIER: 1.3, // increase per galaxy
    ENEMY_COUNT_TO_ADVANCE: 25, // enemies to kill to advance
    WORMHOLE_CHANCE: 0.25, // chance of a wormhole spawning
    INFINITE_GENERATION: true, // enable infinite galaxy generation
    STAR_DENSITY: 0.0025, // stars per cubic unit
  },
  
  // Based on real Webb telescope data categories
  ASTRONOMICAL_OBJECTS: {
    // Categories of objects based on Webb telescope observations
    NEBULAE: {
      EMISSION: 'emission',
      REFLECTION: 'reflection',
      DARK: 'dark',
      PLANETARY: 'planetary',
      SUPERNOVA_REMNANT: 'supernova_remnant',
    },
    GALAXIES: {
      SPIRAL: 'spiral',
      ELLIPTICAL: 'elliptical',
      IRREGULAR: 'irregular',
      LENTICULAR: 'lenticular',
      DWARF: 'dwarf',
      QUASAR: 'quasar',
      ACTIVE_GALACTIC_NUCLEUS: 'active_galactic_nucleus',
    },
    STELLAR_OBJECTS: {
      PROTOSTAR: 'protostar',
      MAIN_SEQUENCE: 'main_sequence',
      RED_GIANT: 'red_giant',
      SUPERGIANT: 'supergiant',
      WHITE_DWARF: 'white_dwarf',
      NEUTRON_STAR: 'neutron_star',
      BLACK_HOLE: 'black_hole',
      BROWN_DWARF: 'brown_dwarf',
    },
    EXOTIC_OBJECTS: {
      WORMHOLE: 'wormhole',
      MAGNETAR: 'magnetar',
      GAMMA_RAY_BURST: 'gamma_ray_burst',
      GRAVITATIONAL_LENS: 'gravitational_lens',
      COSMIC_MICROWAVE_BACKGROUND: 'cosmic_microwave_background',
    },
    VEHICLE_TYPES: {
      STANDARD: 'standard',
      SCOUT: 'scout', // Faster but weaker
      HEAVY: 'heavy',  // Slower but stronger
      EXPLORER: 'explorer', // Better sensors, detects secrets
      STEALTH: 'stealth', // Less enemy detection
    }
  },
};

// Game Object Types
export interface GameObject {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  hitRadius: number;
  isAlive: boolean;
}

export interface PlayerObject extends GameObject {
  health: number;
  lastFireTime: number;
}

export interface EnemyObject extends GameObject {
  health: number;
  type: 'chaser' | 'shooter';
  lastFireTime: number;
}

export interface BulletObject extends GameObject {
  fromPlayer: boolean;
  spawnTime: number;
}

// Collision Detection
export interface CollisionResult {
  hit: boolean;
  distance: number;
}

// Astronomic Object Types (based on James Webb Space Telescope categorizations)
export type GalaxyType = 
  'spiral' | 'elliptical' | 'irregular' | 'lenticular' | 
  'dwarf' | 'quasar' | 'active_galactic_nucleus';

export type NebulaType = 
  'emission' | 'reflection' | 'dark' | 'planetary' | 'supernova_remnant';

export type StellarObjectType = 
  'protostar' | 'main_sequence' | 'red_giant' | 'supergiant' | 
  'white_dwarf' | 'neutron_star' | 'black_hole' | 'brown_dwarf';

export type ExoticObjectType = 
  'wormhole' | 'magnetar' | 'gamma_ray_burst' | 
  'gravitational_lens' | 'cosmic_microwave_background';

export type VehicleType = 
  'standard' | 'scout' | 'heavy' | 'explorer' | 'stealth';

// Star structure based on real astronomical data
export interface Star {
  position: [number, number, number];
  color: THREE.Color;
  size: number;
  type: StellarObjectType;
  temperature?: number;  // in Kelvin
  age?: number;          // in billions of years
  mass?: number;         // in solar masses
  luminosity?: number;   // relative to sun
}

// Galaxy structure with real Webb-telescope inspired properties
export interface GalaxyData {
  type: GalaxyType;
  radius: number;
  starCount: number;
  age: number;           // in billions of years
  redshift: number;      // cosmological redshift
  hasActiveCenter: boolean;
  hasSupernovae: boolean;
  hasBlackHole: boolean;
  hasWormhole: boolean;
  stellarDensity: number;  // stars per cubic parsec
  darkMatterRatio: number; // ratio of dark matter to visible matter
  interstellarMedium: {
    density: number;     // particles per cubic meter
    temperature: number; // in Kelvin
    metalicity: number;  // fraction of elements heavier than helium
  };
  specialFeatures: string[];
  connectsTo?: number;   // galaxy ID for wormhole connections
  spectralSignature?: number[]; // emission/absorption lines
}

// Webb telescope observation data structure
export interface WebbObservationData {
  targetName: string;
  observationDate: string;
  wavelengthRange: [number, number]; // in microns
  exposureTime: number;              // in seconds
  instruments: string[];
  features: {
    type: string;
    position: [number, number, number];
    properties: Record<string, any>;
  }[];
}

// Vehicle properties for different spacecraft types
export interface VehicleProperties {
  type: VehicleType;
  speed: number;
  health: number;
  shield: number;
  weapons: {
    damage: number;
    fireRate: number;
    range: number;
  }[];
  specialAbilities: string[];
  fuelEfficiency: number;
  sensorRange: number;
  stealthRating: number;
}
