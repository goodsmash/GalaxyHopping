import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

// List of all available models that have been verified to exist
export const AVAILABLE_MODELS = [
  'alien_enemy_ship',
  'alien_research_probe',
  'asteroid_cluster',
  'battleship',
  'black_hole',
  'cargo_ship',
  'damaged_cruiser',
  'defense_satellite',
  'explorer_ship',
  'fighter_squadron',
  'gas_giant_planet',
  'heavy_ship',
  'ice_planet',
  'mining_station',
  'nebula_formation',
  'scout_ship',
  'space_outpost',
  'space_station',
  'standard_ship',
  'stealth_ship',
  'weapon_powerup',
  'wormhole_portal'
];

// Define types for our galaxy objects
export type GalaxyObjectType = 
  // Basic space structures
  | 'space_station' 
  | 'space_outpost'
  | 'mining_station'
  | 'research_facility'
  | 'habitation_ring'
  | 'orbital_dock'
  | 'defense_platform'
  | 'communications_array'
  | 'sensor_array'
  | 'fuel_depot'
  | 'maintenance_hub'

  // Planetary objects
  | 'gas_giant_planet'
  | 'ice_planet'
  | 'lava_planet'
  | 'earth_like_planet'
  | 'desert_planet'
  | 'ocean_planet'
  | 'jungle_planet'
  | 'barren_moon'
  | 'ringed_planet'
  | 'binary_planet_system'
  | 'dwarf_planet'
  | 'hot_jupiter'
  | 'frozen_planet'

  // Asteroids and debris
  | 'asteroid_cluster'
  | 'asteroid_field'
  | 'mineral_rich_asteroid'
  | 'ice_asteroid'
  | 'metallic_asteroid'
  | 'comet'
  | 'meteoroid_stream'
  | 'debris_field'
  | 'space_junk'
  | 'wreckage_field'

  // Anomalies and special objects
  | 'wormhole_portal'
  | 'black_hole'
  | 'neutron_star'
  | 'pulsar'
  | 'supernova_remnant'
  | 'nebula_formation'
  | 'cosmic_dust_cloud'
  | 'gravity_well'
  | 'time_distortion'
  | 'quantum_singularity'
  | 'plasma_storm'
  | 'ion_cloud'
  | 'space_time_rift'
  | 'dark_matter_cluster'
  | 'radiation_field'

  // Ships and vessels
  | 'alien_enemy_ship'
  | 'cargo_ship'
  | 'fighter_squadron'
  | 'damaged_cruiser'
  | 'battleship'
  | 'carrier_vessel'
  | 'destroyer'
  | 'corvette'
  | 'pirate_raider'
  | 'smuggler_vessel'
  | 'patrol_craft'
  | 'colony_ship'
  | 'exploration_vessel'
  | 'science_vessel'
  | 'refugee_fleet'
  | 'generation_ship'
  | 'trader_convoy'
  | 'deep_space_explorer'
  | 'capital_ship'

  // Satellites and probes
  | 'defense_satellite'
  | 'alien_research_probe'
  | 'spy_satellite'
  | 'weapon_platform'
  | 'survey_drone'
  | 'combat_drone'
  | 'harvester_drone'
  | 'automated_sentry'
  | 'data_beacon'
  | 'relay_satellite'
  | 'scanner_array'

  // Resources and collectibles
  | 'weapon_powerup'
  | 'shield_powerup'
  | 'speed_powerup'
  | 'health_powerup'
  | 'repair_kit'
  | 'fuel_cell'
  | 'data_cube'
  | 'rare_crystal'
  | 'ancient_artifact'
  | 'alien_technology'
  | 'emergency_cache'
  | 'salvage_container'

  // Faction structures
  | 'military_base'
  | 'trading_post'
  | 'pirate_hideout'
  | 'alien_hive'
  | 'ancient_ruins'
  | 'temple_structure'
  | 'megastructure'
  | 'orbital_cannon'
  | 'federation_outpost'
  | 'smuggler_den'
  | 'rebel_base'
  | 'alliance_headquarters'
  | 'imperial_fortress'

  // Environmental hazards
  | 'mine_field'
  | 'automated_turret'
  | 'laser_grid'
  | 'energy_barrier'
  | 'gravity_disruptor'
  | 'temporal_trap'
  | 'solar_flare'
  | 'toxic_gas_cloud'
  | 'corrosive_nebula'
  | 'electromagnetic_pulse'
  | 'radiation_zone'

  // Space phenomena
  | 'galactic_core'
  | 'stellar_nursery'
  | 'protostar_cluster'
  | 'binary_star_system'
  | 'white_dwarf'
  | 'red_giant'
  | 'magnetar'
  | 'quasar'
  | 'interstellar_cloud'
  | 'asteroid_belt'
  | 'planetary_ring';

// Define properties for different object types
interface ObjectProperties {
  scale: [number, number, number];
  rotationSpeed: number;
  animationType?: 'rotate' | 'float' | 'orbit' | 'pulse';
  animationParams?: any;
  interactable?: boolean;
  hazard?: boolean;
  collectible?: boolean;
}

// Object properties database - define characteristics and behaviors for all object types
const objectPropertiesDatabase: Record<GalaxyObjectType, ObjectProperties> = {
  // Basic space structures
  space_station: { scale: [1.0, 1.0, 1.0], rotationSpeed: 0.001, animationType: 'rotate', interactable: true },
  space_outpost: { scale: [1.3, 1.3, 1.3], rotationSpeed: 0.0004, animationType: 'rotate', interactable: true },
  mining_station: { scale: [1.5, 1.5, 1.5], rotationSpeed: 0.0005, animationType: 'rotate', interactable: true },
  research_facility: { scale: [1.4, 1.4, 1.4], rotationSpeed: 0.0004, animationType: 'rotate', interactable: true },
  habitation_ring: { scale: [2.0, 0.4, 2.0], rotationSpeed: 0.001, animationType: 'rotate', interactable: true },
  orbital_dock: { scale: [1.6, 0.8, 1.6], rotationSpeed: 0.0006, animationType: 'rotate', interactable: true },
  defense_platform: { scale: [1.1, 0.6, 1.1], rotationSpeed: 0.0005, animationType: 'rotate', interactable: true, hazard: true },
  communications_array: { scale: [1.2, 1.8, 1.2], rotationSpeed: 0.0003, animationType: 'rotate', interactable: true },
  sensor_array: { scale: [0.9, 1.5, 0.9], rotationSpeed: 0.0008, animationType: 'rotate', interactable: true },
  fuel_depot: { scale: [1.3, 1.0, 1.3], rotationSpeed: 0.0003, animationType: 'rotate', interactable: true },
  maintenance_hub: { scale: [1.2, 0.8, 1.2], rotationSpeed: 0.0004, animationType: 'rotate', interactable: true },

  // Planetary objects
  gas_giant_planet: { scale: [3.0, 3.0, 3.0], rotationSpeed: 0.0005, animationType: 'rotate' },
  ice_planet: { scale: [2.5, 2.5, 2.5], rotationSpeed: 0.0003, animationType: 'rotate' },
  lava_planet: { scale: [2.3, 2.3, 2.3], rotationSpeed: 0.0004, animationType: 'rotate' },
  earth_like_planet: { scale: [2.2, 2.2, 2.2], rotationSpeed: 0.0006, animationType: 'rotate' },
  desert_planet: { scale: [2.0, 2.0, 2.0], rotationSpeed: 0.0006, animationType: 'rotate' },
  ocean_planet: { scale: [2.4, 2.4, 2.4], rotationSpeed: 0.0005, animationType: 'rotate' },
  jungle_planet: { scale: [2.1, 2.1, 2.1], rotationSpeed: 0.0006, animationType: 'rotate' },
  barren_moon: { scale: [1.2, 1.2, 1.2], rotationSpeed: 0.0002, animationType: 'rotate' },
  ringed_planet: { scale: [2.6, 2.6, 2.6], rotationSpeed: 0.0004, animationType: 'rotate' },
  binary_planet_system: { scale: [3.5, 3.5, 3.5], rotationSpeed: 0.0003, animationType: 'rotate' },
  dwarf_planet: { scale: [1.4, 1.4, 1.4], rotationSpeed: 0.0007, animationType: 'rotate' },
  hot_jupiter: { scale: [3.2, 3.2, 3.2], rotationSpeed: 0.0008, animationType: 'rotate' },
  frozen_planet: { scale: [2.2, 2.2, 2.2], rotationSpeed: 0.0002, animationType: 'rotate' },

  // Asteroids and debris
  asteroid_cluster: { scale: [0.8, 0.8, 0.8], rotationSpeed: 0.002, animationType: 'float', animationParams: { amplitude: 0.2, frequency: 0.5 } },
  asteroid_field: { scale: [4.0, 2.0, 4.0], rotationSpeed: 0.0003, animationType: 'rotate' },
  mineral_rich_asteroid: { scale: [0.7, 0.7, 0.7], rotationSpeed: 0.003, animationType: 'float', animationParams: { amplitude: 0.1, frequency: 0.3 }, interactable: true },
  ice_asteroid: { scale: [0.9, 0.9, 0.9], rotationSpeed: 0.002, animationType: 'float', animationParams: { amplitude: 0.15, frequency: 0.4 } },
  metallic_asteroid: { scale: [0.7, 0.7, 0.7], rotationSpeed: 0.0025, animationType: 'float', animationParams: { amplitude: 0.12, frequency: 0.35 } },
  comet: { scale: [0.8, 0.8, 2.0], rotationSpeed: 0.01, animationType: 'float', animationParams: { amplitude: 0.1, frequency: 0.8 } },
  meteoroid_stream: { scale: [3.0, 0.5, 3.0], rotationSpeed: 0.001, animationType: 'rotate' },
  debris_field: { scale: [3.0, 1.0, 3.0], rotationSpeed: 0.0005, animationType: 'rotate' },
  space_junk: { scale: [1.5, 1.5, 1.5], rotationSpeed: 0.002, animationType: 'float', animationParams: { amplitude: 0.1, frequency: 0.2 } },
  wreckage_field: { scale: [2.5, 1.5, 2.5], rotationSpeed: 0.0004, animationType: 'rotate', interactable: true },

  // Anomalies and special objects
  wormhole_portal: { scale: [2.0, 2.0, 2.0], rotationSpeed: 0.01, animationType: 'pulse', animationParams: { minScale: 1.9, maxScale: 2.1, speed: 2 }, interactable: true },
  black_hole: { scale: [2.0, 2.0, 2.0], rotationSpeed: 0.008, animationType: 'pulse', animationParams: { minScale: 1.8, maxScale: 2.2, speed: 1.5 }, hazard: true },
  neutron_star: { scale: [1.5, 1.5, 1.5], rotationSpeed: 0.02, animationType: 'pulse', animationParams: { minScale: 1.4, maxScale: 1.6, speed: 3 }, hazard: true },
  pulsar: { scale: [1.6, 1.6, 1.6], rotationSpeed: 0.03, animationType: 'pulse', animationParams: { minScale: 1.5, maxScale: 1.7, speed: 4 }, hazard: true },
  supernova_remnant: { scale: [4.0, 4.0, 4.0], rotationSpeed: 0.0006, animationType: 'pulse', animationParams: { minScale: 3.9, maxScale: 4.1, speed: 0.3 } },
  nebula_formation: { scale: [5.0, 5.0, 5.0], rotationSpeed: 0.0001, animationType: 'pulse', animationParams: { minScale: 4.9, maxScale: 5.1, speed: 0.5 } },
  cosmic_dust_cloud: { scale: [4.5, 4.5, 4.5], rotationSpeed: 0.0002, animationType: 'pulse', animationParams: { minScale: 4.4, maxScale: 4.6, speed: 0.4 } },
  gravity_well: { scale: [2.5, 0.5, 2.5], rotationSpeed: 0.004, animationType: 'pulse', animationParams: { minScale: 2.4, maxScale: 2.6, speed: 1.0 }, hazard: true },
  time_distortion: { scale: [1.8, 1.8, 1.8], rotationSpeed: 0.009, animationType: 'pulse', animationParams: { minScale: 1.7, maxScale: 1.9, speed: 2.5 }, hazard: true },
  quantum_singularity: { scale: [1.5, 1.5, 1.5], rotationSpeed: 0.015, animationType: 'pulse', animationParams: { minScale: 1.4, maxScale: 1.6, speed: 3.0 }, hazard: true },
  plasma_storm: { scale: [3.5, 3.5, 3.5], rotationSpeed: 0.003, animationType: 'pulse', animationParams: { minScale: 3.4, maxScale: 3.6, speed: 0.8 }, hazard: true },
  ion_cloud: { scale: [3.0, 3.0, 3.0], rotationSpeed: 0.002, animationType: 'pulse', animationParams: { minScale: 2.9, maxScale: 3.1, speed: 0.7 } },
  space_time_rift: { scale: [2.2, 2.2, 2.2], rotationSpeed: 0.012, animationType: 'pulse', animationParams: { minScale: 2.1, maxScale: 2.3, speed: 2.2 }, hazard: true },
  dark_matter_cluster: { scale: [3.0, 3.0, 3.0], rotationSpeed: 0.001, animationType: 'pulse', animationParams: { minScale: 2.9, maxScale: 3.1, speed: 0.3 }, hazard: true },
  radiation_field: { scale: [3.2, 3.2, 3.2], rotationSpeed: 0.0015, animationType: 'pulse', animationParams: { minScale: 3.1, maxScale: 3.3, speed: 0.6 }, hazard: true },

  // Ships and vessels
  alien_enemy_ship: { scale: [0.7, 0.7, 0.7], rotationSpeed: 0.002, animationType: 'float', animationParams: { amplitude: 0.15, frequency: 0.4 }, hazard: true },
  cargo_ship: { scale: [1.2, 1.2, 1.2], rotationSpeed: 0.0008, animationType: 'float', animationParams: { amplitude: 0.1, frequency: 0.2 } },
  fighter_squadron: { scale: [0.8, 0.8, 0.8], rotationSpeed: 0.005, animationType: 'float', animationParams: { amplitude: 0.2, frequency: 0.6 }, hazard: true },
  damaged_cruiser: { scale: [1.8, 1.8, 1.8], rotationSpeed: 0.0002, animationType: 'float', animationParams: { amplitude: 0.1, frequency: 0.2 }, interactable: true },
  battleship: { scale: [2.0, 2.0, 2.0], rotationSpeed: 0.0004, animationType: 'float', animationParams: { amplitude: 0.05, frequency: 0.1 }, hazard: true },
  carrier_vessel: { scale: [2.5, 2.5, 2.5], rotationSpeed: 0.0003, animationType: 'float', animationParams: { amplitude: 0.05, frequency: 0.1 } },
  destroyer: { scale: [1.5, 1.5, 1.5], rotationSpeed: 0.0006, animationType: 'float', animationParams: { amplitude: 0.08, frequency: 0.3 }, hazard: true },
  corvette: { scale: [1.0, 1.0, 1.0], rotationSpeed: 0.0008, animationType: 'float', animationParams: { amplitude: 0.12, frequency: 0.4 }, hazard: true },
  pirate_raider: { scale: [1.1, 1.1, 1.1], rotationSpeed: 0.001, animationType: 'float', animationParams: { amplitude: 0.15, frequency: 0.5 }, hazard: true },
  smuggler_vessel: { scale: [1.3, 1.3, 1.3], rotationSpeed: 0.0009, animationType: 'float', animationParams: { amplitude: 0.1, frequency: 0.35 }, interactable: true },
  patrol_craft: { scale: [0.9, 0.9, 0.9], rotationSpeed: 0.001, animationType: 'float', animationParams: { amplitude: 0.12, frequency: 0.4 } },
  colony_ship: { scale: [2.2, 2.2, 2.2], rotationSpeed: 0.0004, animationType: 'float', animationParams: { amplitude: 0.05, frequency: 0.1 } },
  exploration_vessel: { scale: [1.4, 1.4, 1.4], rotationSpeed: 0.0006, animationType: 'float', animationParams: { amplitude: 0.1, frequency: 0.3 }, interactable: true },
  science_vessel: { scale: [1.2, 1.2, 1.2], rotationSpeed: 0.0007, animationType: 'float', animationParams: { amplitude: 0.08, frequency: 0.25 }, interactable: true },
  refugee_fleet: { scale: [2.0, 2.0, 2.0], rotationSpeed: 0.0003, animationType: 'float', animationParams: { amplitude: 0.05, frequency: 0.15 }, interactable: true },
  generation_ship: { scale: [2.8, 2.8, 2.8], rotationSpeed: 0.0002, animationType: 'float', animationParams: { amplitude: 0.03, frequency: 0.1 }, interactable: true },
  trader_convoy: { scale: [1.6, 1.6, 1.6], rotationSpeed: 0.0005, animationType: 'float', animationParams: { amplitude: 0.08, frequency: 0.2 }, interactable: true },
  deep_space_explorer: { scale: [1.3, 1.3, 1.3], rotationSpeed: 0.0007, animationType: 'float', animationParams: { amplitude: 0.1, frequency: 0.3 }, interactable: true },
  capital_ship: { scale: [2.5, 2.5, 2.5], rotationSpeed: 0.0003, animationType: 'float', animationParams: { amplitude: 0.04, frequency: 0.08 }, hazard: true },

  // Satellites and probes
  defense_satellite: { scale: [0.6, 0.6, 0.6], rotationSpeed: 0.003, animationType: 'orbit', animationParams: { radius: 3, speed: 0.5 }, hazard: true },
  alien_research_probe: { scale: [1.0, 1.0, 1.0], rotationSpeed: 0.003, animationType: 'float', animationParams: { amplitude: 0.15, frequency: 0.3 }, interactable: true },
  spy_satellite: { scale: [0.5, 0.5, 0.5], rotationSpeed: 0.004, animationType: 'orbit', animationParams: { radius: 2.5, speed: 0.6 } },
  weapon_platform: { scale: [0.8, 0.8, 0.8], rotationSpeed: 0.002, animationType: 'orbit', animationParams: { radius: 3.5, speed: 0.4 }, hazard: true },
  survey_drone: { scale: [0.4, 0.4, 0.4], rotationSpeed: 0.006, animationType: 'float', animationParams: { amplitude: 0.2, frequency: 0.7 }, interactable: true },
  combat_drone: { scale: [0.4, 0.4, 0.4], rotationSpeed: 0.008, animationType: 'float', animationParams: { amplitude: 0.25, frequency: 0.8 }, hazard: true },
  harvester_drone: { scale: [0.5, 0.5, 0.5], rotationSpeed: 0.005, animationType: 'float', animationParams: { amplitude: 0.18, frequency: 0.6 } },
  automated_sentry: { scale: [0.6, 0.6, 0.6], rotationSpeed: 0.002, animationType: 'orbit', animationParams: { radius: 2.8, speed: 0.45 }, hazard: true },
  data_beacon: { scale: [0.4, 0.4, 0.4], rotationSpeed: 0.004, animationType: 'pulse', animationParams: { minScale: 0.38, maxScale: 0.42, speed: 1.2 }, interactable: true },
  relay_satellite: { scale: [0.6, 0.8, 0.6], rotationSpeed: 0.003, animationType: 'orbit', animationParams: { radius: 3.2, speed: 0.55 } },
  scanner_array: { scale: [0.7, 0.7, 0.7], rotationSpeed: 0.002, animationType: 'rotate', interactable: true },

  // Resources and collectibles
  weapon_powerup: { scale: [0.5, 0.5, 0.5], rotationSpeed: 0.01, animationType: 'float', animationParams: { amplitude: 0.2, frequency: 0.8 }, collectible: true },
  shield_powerup: { scale: [0.5, 0.5, 0.5], rotationSpeed: 0.01, animationType: 'float', animationParams: { amplitude: 0.2, frequency: 0.85 }, collectible: true },
  speed_powerup: { scale: [0.5, 0.5, 0.5], rotationSpeed: 0.012, animationType: 'float', animationParams: { amplitude: 0.22, frequency: 0.9 }, collectible: true },
  health_powerup: { scale: [0.5, 0.5, 0.5], rotationSpeed: 0.009, animationType: 'float', animationParams: { amplitude: 0.18, frequency: 0.75 }, collectible: true },
  repair_kit: { scale: [0.45, 0.45, 0.45], rotationSpeed: 0.008, animationType: 'float', animationParams: { amplitude: 0.15, frequency: 0.7 }, collectible: true },
  fuel_cell: { scale: [0.4, 0.4, 0.4], rotationSpeed: 0.01, animationType: 'float', animationParams: { amplitude: 0.2, frequency: 0.8 }, collectible: true },
  data_cube: { scale: [0.3, 0.3, 0.3], rotationSpeed: 0.02, animationType: 'float', animationParams: { amplitude: 0.15, frequency: 1.0 }, collectible: true },
  rare_crystal: { scale: [0.35, 0.35, 0.35], rotationSpeed: 0.015, animationType: 'pulse', animationParams: { minScale: 0.33, maxScale: 0.37, speed: 1.5 }, collectible: true },
  ancient_artifact: { scale: [0.5, 0.5, 0.5], rotationSpeed: 0.006, animationType: 'float', animationParams: { amplitude: 0.1, frequency: 0.5 }, collectible: true, interactable: true },
  alien_technology: { scale: [0.45, 0.45, 0.45], rotationSpeed: 0.01, animationType: 'pulse', animationParams: { minScale: 0.43, maxScale: 0.47, speed: 1.2 }, collectible: true, interactable: true },
  emergency_cache: { scale: [0.55, 0.55, 0.55], rotationSpeed: 0.005, animationType: 'float', animationParams: { amplitude: 0.1, frequency: 0.4 }, collectible: true },
  salvage_container: { scale: [0.6, 0.6, 0.6], rotationSpeed: 0.003, animationType: 'float', animationParams: { amplitude: 0.08, frequency: 0.3 }, collectible: true },

  // Faction structures
  military_base: { scale: [1.8, 1.8, 1.8], rotationSpeed: 0.0003, animationType: 'rotate', interactable: true, hazard: true },
  trading_post: { scale: [1.6, 1.6, 1.6], rotationSpeed: 0.0004, animationType: 'rotate', interactable: true },
  pirate_hideout: { scale: [1.5, 1.5, 1.5], rotationSpeed: 0.0004, animationType: 'rotate', interactable: true, hazard: true },
  alien_hive: { scale: [2.0, 2.0, 2.0], rotationSpeed: 0.0006, animationType: 'pulse', animationParams: { minScale: 1.95, maxScale: 2.05, speed: 0.3 }, hazard: true },
  ancient_ruins: { scale: [1.7, 1.7, 1.7], rotationSpeed: 0.0002, animationType: 'rotate', interactable: true },
  temple_structure: { scale: [1.9, 1.9, 1.9], rotationSpeed: 0.0001, animationType: 'rotate', interactable: true },
  megastructure: { scale: [3.0, 3.0, 3.0], rotationSpeed: 0.0001, animationType: 'rotate', interactable: true },
  orbital_cannon: { scale: [1.2, 1.2, 1.2], rotationSpeed: 0.0005, animationType: 'rotate', hazard: true },
  federation_outpost: { scale: [1.4, 1.4, 1.4], rotationSpeed: 0.0004, animationType: 'rotate', interactable: true },
  smuggler_den: { scale: [1.3, 1.3, 1.3], rotationSpeed: 0.0005, animationType: 'rotate', interactable: true },
  rebel_base: { scale: [1.5, 1.5, 1.5], rotationSpeed: 0.0004, animationType: 'rotate', interactable: true },
  alliance_headquarters: { scale: [1.9, 1.9, 1.9], rotationSpeed: 0.0003, animationType: 'rotate', interactable: true },
  imperial_fortress: { scale: [2.2, 2.2, 2.2], rotationSpeed: 0.0002, animationType: 'rotate', interactable: true, hazard: true },

  // Environmental hazards
  mine_field: { scale: [2.5, 2.5, 2.5], rotationSpeed: 0.001, animationType: 'float', animationParams: { amplitude: 0.05, frequency: 0.2 }, hazard: true },
  automated_turret: { scale: [0.7, 0.7, 0.7], rotationSpeed: 0.002, animationType: 'rotate', hazard: true },
  laser_grid: { scale: [2.0, 2.0, 2.0], rotationSpeed: 0.001, animationType: 'pulse', animationParams: { minScale: 1.95, maxScale: 2.05, speed: 0.5 }, hazard: true },
  energy_barrier: { scale: [2.2, 2.2, 2.2], rotationSpeed: 0.0005, animationType: 'pulse', animationParams: { minScale: 2.15, maxScale: 2.25, speed: 0.4 }, hazard: true },
  gravity_disruptor: { scale: [1.8, 1.8, 1.8], rotationSpeed: 0.002, animationType: 'pulse', animationParams: { minScale: 1.75, maxScale: 1.85, speed: 0.8 }, hazard: true },
  temporal_trap: { scale: [1.5, 1.5, 1.5], rotationSpeed: 0.003, animationType: 'pulse', animationParams: { minScale: 1.45, maxScale: 1.55, speed: 1.0 }, hazard: true },
  solar_flare: { scale: [3.0, 3.0, 3.0], rotationSpeed: 0.002, animationType: 'pulse', animationParams: { minScale: 2.9, maxScale: 3.1, speed: 0.7 }, hazard: true },
  toxic_gas_cloud: { scale: [2.8, 2.8, 2.8], rotationSpeed: 0.001, animationType: 'pulse', animationParams: { minScale: 2.7, maxScale: 2.9, speed: 0.4 }, hazard: true },
  corrosive_nebula: { scale: [3.5, 3.5, 3.5], rotationSpeed: 0.0008, animationType: 'pulse', animationParams: { minScale: 3.4, maxScale: 3.6, speed: 0.3 }, hazard: true },
  electromagnetic_pulse: { scale: [2.0, 2.0, 2.0], rotationSpeed: 0.002, animationType: 'pulse', animationParams: { minScale: 1.9, maxScale: 2.1, speed: 0.9 }, hazard: true },
  radiation_zone: { scale: [3.2, 3.2, 3.2], rotationSpeed: 0.0005, animationType: 'pulse', animationParams: { minScale: 3.1, maxScale: 3.3, speed: 0.3 }, hazard: true },

  // Space phenomena
  galactic_core: { scale: [4.0, 4.0, 4.0], rotationSpeed: 0.001, animationType: 'pulse', animationParams: { minScale: 3.9, maxScale: 4.1, speed: 0.2 }, hazard: true },
  stellar_nursery: { scale: [3.8, 3.8, 3.8], rotationSpeed: 0.0008, animationType: 'pulse', animationParams: { minScale: 3.7, maxScale: 3.9, speed: 0.25 } },
  protostar_cluster: { scale: [3.5, 3.5, 3.5], rotationSpeed: 0.001, animationType: 'pulse', animationParams: { minScale: 3.4, maxScale: 3.6, speed: 0.3 } },
  binary_star_system: { scale: [3.8, 3.8, 3.8], rotationSpeed: 0.0007, animationType: 'pulse', animationParams: { minScale: 3.7, maxScale: 3.9, speed: 0.22 } },
  white_dwarf: { scale: [1.8, 1.8, 1.8], rotationSpeed: 0.0015, animationType: 'pulse', animationParams: { minScale: 1.75, maxScale: 1.85, speed: 0.5 } },
  red_giant: { scale: [3.5, 3.5, 3.5], rotationSpeed: 0.0005, animationType: 'pulse', animationParams: { minScale: 3.45, maxScale: 3.55, speed: 0.15 } },
  magnetar: { scale: [1.6, 1.6, 1.6], rotationSpeed: 0.003, animationType: 'pulse', animationParams: { minScale: 1.55, maxScale: 1.65, speed: 0.8 }, hazard: true },
  quasar: { scale: [2.5, 2.5, 2.5], rotationSpeed: 0.002, animationType: 'pulse', animationParams: { minScale: 2.45, maxScale: 2.55, speed: 0.6 }, hazard: true },
  interstellar_cloud: { scale: [4.0, 4.0, 4.0], rotationSpeed: 0.0003, animationType: 'pulse', animationParams: { minScale: 3.95, maxScale: 4.05, speed: 0.1 } },
  asteroid_belt: { scale: [4.5, 0.5, 4.5], rotationSpeed: 0.0005, animationType: 'rotate' },
  planetary_ring: { scale: [3.5, 0.2, 3.5], rotationSpeed: 0.0006, animationType: 'rotate' }
};

// Preload all models with error handling
export const preloadAllModels = () => {
  console.log('Preloading 3D models...');

  try {
    // Prioritize critical models first
    const criticalModels = [
      'standard_ship',
      'mining_station',
      'cargo_ship',
      'space_station',
      'wormhole_portal'
    ];

    // Preload critical models first
    criticalModels.forEach(model => {
      try {
        console.log(`Preloading critical model: ${model}`);
        useGLTF.preload(`/models/${model}.glb`);
      } catch (error) {
        console.error(`Failed to preload critical model ${model}:`, error);
      }
    });

    // Then preload the rest of the models
    AVAILABLE_MODELS
      .filter(model => !criticalModels.includes(model))
      .forEach(model => {
        try {
          console.log(`Preloading model: ${model}`);
          useGLTF.preload(`/models/${model}.glb`);
        } catch (error) {
          console.warn(`Failed to preload model ${model}:`, error);
        }
      });

    console.log('Model preloading complete');
  } catch (error) {
    console.error("Error in preloadAllModels:", error);
  }
};

interface GalaxyObjectProps {
  type: GalaxyObjectType;
  position: [number, number, number];
  rotation?: [number, number, number];
  onClick?: () => void;
  customScale?: [number, number, number];
  customAnimation?: {
    type: 'rotate' | 'float' | 'orbit' | 'pulse';
    params?: any;
  };
}

const FALLBACK_MODEL = 'standard_ship';

export const loadModelWithFallback = async (modelPath: string) => {
  try {
    const model = await useGLTF(modelPath);
    return model;
  } catch (error) {
    console.warn(`Failed to load model ${modelPath}, using fallback`);
    return await useGLTF(`/models/${FALLBACK_MODEL}.glb`);
  }
};

export function GalaxyObject({ 
  type, 
  position, 
  rotation = [0, 0, 0], 
  onClick, 
  customScale,
  customAnimation
}: GalaxyObjectProps) {
  const modelRef = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  // Ensure type exists in our database, use fallback properties if not
  const properties = objectPropertiesDatabase[type] || {
    scale: [1.0, 1.0, 1.0],
    rotationSpeed: 0.001,
    animationType: 'rotate'
  };

  const finalScale = customScale || properties.scale;

  // Create a function to generate a placeholder model with a distinctive shape and color based on the type
  const generatePlaceholderModel = (objectType: string): THREE.Group => {
    const group = new THREE.Group();
    let geometry: THREE.BufferGeometry;
    let color = "#555555";

    // Create different shapes and colors based on object category
    if (objectType.includes('planet') || objectType.includes('giant')) {
      geometry = new THREE.SphereGeometry(0.5, 12, 12);
      color = "#2288ff";
    } else if (objectType.includes('ship') || objectType.includes('cruiser') || objectType.includes('vessel')) {
      geometry = new THREE.ConeGeometry(0.3, 1, 4);
      color = "#ff8822";
    } else if (objectType.includes('station') || objectType.includes('outpost') || objectType.includes('base')) {
      geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      color = "#88ff22";
    } else if (objectType.includes('asteroid') || objectType.includes('debris')) {
      geometry = new THREE.OctahedronGeometry(0.5, 0);
      color = "#aa8866";
    } else if (objectType.includes('black_hole') || objectType.includes('wormhole')) {
      geometry = new THREE.TorusGeometry(0.5, 0.2, 8, 16);
      color = "#aa22ff";
    } else if (objectType.includes('satellite') || objectType.includes('probe') || objectType.includes('drone')) {
      geometry = new THREE.TetrahedronGeometry(0.4);
      color = "#22ffaa";
    } else if (objectType.includes('powerup') || objectType.includes('collectible')) {
      geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
      color = "#ffff22";
    } else {
      // Default fallback
      geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    }

    const material = new THREE.MeshStandardMaterial({ 
      color, 
      emissive: color,
      emissiveIntensity: 0.2,
      roughness: 0.7,
      metalness: 0.3
    });

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    return group;
  };

  // Use the useGLTF hook to load actual models
  const { scene } = (() => {
    try {
      // First check if the type is one of our verified models
      if (type && AVAILABLE_MODELS.includes(type)) {
        // Force a clean path to prevent issues
        const modelPath = `/models/${type}.glb`;
        const result = useGLTF(modelPath) as GLTF & {
          scene: THREE.Group
        };

        // Check if the resulting model is valid
        if (result && result.scene) {
          console.log(`Successfully loaded model from ${modelPath}`);
          return result;
        } else {
          throw new Error("Model loaded but scene is undefined");
        }
      } else {
        // If the model type is not in our list, try to find the closest match
        const closestMatch = type ? 
          AVAILABLE_MODELS.find(model => 
            model.includes(type) || type.includes(model)
          ) : null;

        if (closestMatch) {
          console.log(`Using similar model '${closestMatch}' for requested type '${type}'`);
          const result = useGLTF(`/models/${closestMatch}.glb`) as GLTF & {
            scene: THREE.Group
          };
          return result;
        } else {
          // If no match, try to use a default model
          console.log(`No model match found for '${type}', using standard_ship as fallback`);
          return useGLTF('/models/standard_ship.glb') as GLTF & {
            scene: THREE.Group
          };
        }
      }
    } catch (error) {
      console.error(`Error loading model for ${type}:`, error);

      // Try to load the standard ship as a final fallback
      try {
        console.log("Attempting to load standard_ship as emergency fallback");
        return useGLTF('/models/standard_ship.glb') as GLTF & {
          scene: THREE.Group
        };
      } catch (secondError) {
        console.error("Failed to load even the fallback model:", secondError);
        // Create an empty group as last resort
        const emptyGroup = new THREE.Group();
        return { scene: emptyGroup } as unknown as GLTF & { scene: THREE.Group };
      }
    }
  })();

  // Use a consistent name for the model
  const model = scene;

  // Update loading state
  useEffect(() => {
    if (model) {
      setModelLoaded(true);
      console.log(`Model ${type} loaded successfully`);
    }
  }, [model, type]);

  // Apply animations
  useFrame((state, delta) => {
    if (!modelRef.current) return;

    const animationType = customAnimation?.type || properties.animationType;
    const animationParams = customAnimation?.params || properties.animationParams;

    // Basic rotation
    modelRef.current.rotation.y += properties.rotationSpeed * delta;

    // Apply specific animation types
    if (animationType === 'float') {
      const amplitude = animationParams?.amplitude || 0.1;
      const frequency = animationParams?.frequency || 1;
      modelRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * frequency) * amplitude;
    } 
    else if (animationType === 'orbit') {
      const radius = animationParams?.radius || 2;
      const speed = animationParams?.speed || 1;
      const angle = state.clock.elapsedTime * speed;
      modelRef.current.position.x = position[0] + Math.sin(angle) * radius;
      modelRef.current.position.z = position[2] + Math.cos(angle) * radius;
    }
    else if (animationType === 'pulse') {
      const minScale = animationParams?.minScale || 0.9;
      const maxScale = animationParams?.maxScale || 1.1;
      const speed = animationParams?.speed || 1;
      const scaleFactor = minScale + (Math.sin(state.clock.elapsedTime * speed) + 1) / 2 * (maxScale - minScale);
      modelRef.current.scale.set(
        finalScale[0] * scaleFactor,
        finalScale[1] * scaleFactor,
        finalScale[2] * scaleFactor
      );
    }
  });

  // Interactive properties
  const isClickable = properties.interactable || properties.collectible || onClick;

  return (
    <group 
      ref={modelRef} 
      position={new THREE.Vector3(...position)} 
      rotation={new THREE.Euler(...rotation)} 
      scale={finalScale}
      onClick={isClickable ? (onClick || (() => console.log(`Clicked on ${type}`))) : undefined}
    >
      {modelLoaded ? (
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
        }>
          <primitive object={model.clone()} castShadow receiveShadow />
        </Suspense>
      ) : (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      )}
    </group>
  );
}

// Create a component with multiple random space objects
interface RandomSpaceObjectsProps {
  count: number;
  radius: number;
  centerPosition?: [number, number, number];
  excludeTypes?: GalaxyObjectType[];
  galaxyLevel?: number;
}

export function RandomSpaceObjects({ 
  count, 
  radius, 
  centerPosition = [0, 0, 0],
  excludeTypes = [],
  galaxyLevel = 1
}: RandomSpaceObjectsProps) {
  // Generate seeds based on galaxy level to ensure consistent randomization
  const generateSeed = (index: number) => {
    return (galaxyLevel * 1000) + index;
  };

  // Deterministic random function
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Get random position within radius
  const getRandomPosition = (index: number): [number, number, number] => {
    const seed = generateSeed(index);
    const theta = seededRandom(seed) * Math.PI * 2;
    const phi = seededRandom(seed + 1) * Math.PI;
    const r = seededRandom(seed + 2) * radius;

    const x = centerPosition[0] + r * Math.sin(phi) * Math.cos(theta);
    const y = centerPosition[1] + r * Math.sin(phi) * Math.sin(theta);
    const z = centerPosition[2] + r * Math.cos(phi);

    return [x, y, z];
  };

  // Get random object type based on galaxy level with improved error handling
  const getRandomObjectType = (index: number): GalaxyObjectType => {
    // First ensure we have valid defined types to choose from
    const seed = generateSeed(index + 100);
    const definedTypes = Object.keys(objectPropertiesDatabase) as GalaxyObjectType[];

    // Filter out excluded types if they exist
    const availableTypes = definedTypes.filter(type => !excludeTypes.includes(type));

    // If no types are available, provide a safe fallback
    if (availableTypes.length === 0) {
      console.warn("No available object types after filtering. Using fallback types.");
      return 'space_station'; // Safe default
    }

    // Use a seeded random value to select a type
    const randomIndex = Math.floor(Math.abs(seededRandom(seed)) * availableTypes.length) % availableTypes.length;
    return availableTypes[randomIndex] || 'space_station'; // Extra safety check
  };

  const objects = Array.from({ length: count }, (_, i) => {
    const position = getRandomPosition(i);
    const type = getRandomObjectType(i);
    const rotation: [number, number, number] = [
      seededRandom(generateSeed(i + 200)) * Math.PI * 2,
      seededRandom(generateSeed(i + 300)) * Math.PI * 2,
      seededRandom(generateSeed(i + 400)) * Math.PI * 2
    ];

    return { position, type, rotation };
  });

  return (
    <>
      {objects.map((obj, index) => (
        <GalaxyObject
          key={`space-obj-${index}-${galaxyLevel}`}
          type={obj.type}
          position={obj.position}
          rotation={obj.rotation}
        />
      ))}
    </>
  );
}

// Create a component to display a themed collection of objects
export type GalaxyTheme = 
  | 'mining_operation'
  | 'battle_aftermath'
  | 'trade_route'
  | 'scientific_outpost'
  | 'alien_territory'
  | 'ancient_ruins_site'
  | 'military_blockade'
  | 'deep_space_exploration'
  | 'stellar_phenomenon'
  | 'smuggler_hideout'
  | 'refugee_settlement'
  | 'pirate_stronghold'
  | 'imperial_outpost'
  | 'hazard_zone'
  | 'resource_rich_sector';

interface ThemedObjectClusterProps {
  theme: GalaxyTheme;
  position: [number, number, number];
  radius?: number;
  objectCount?: number;
}

export function ThemedObjectCluster({
  theme,
  position,
  radius = 30,
  objectCount = 8
}: ThemedObjectClusterProps) {
  // Define object types that appear in each theme
  const themeObjects: Record<GalaxyTheme, GalaxyObjectType[]> = {
    // Original themes with expanded objects
    mining_operation: [
      'mining_station', 
      'asteroid_cluster', 
      'cargo_ship', 
      'space_outpost',
      'mineral_rich_asteroid',
      'harvester_drone',
      'ice_asteroid',
      'metallic_asteroid',
      'maintenance_hub',
      'survey_drone',
      'fuel_depot'
    ],

    battle_aftermath: [
      'damaged_cruiser', 
      'fighter_squadron', 
      'defense_satellite', 
      'space_station',
      'wreckage_field',
      'debris_field',
      'space_junk',
      'weapon_platform',
      'military_base',
      'emergency_cache',
      'salvage_container',
      'data_beacon',
      'combat_drone',
      'automated_sentry'
    ],

    trade_route: [
      'cargo_ship', 
      'space_station', 
      'space_outpost', 
      'fighter_squadron',
      'trading_post',
      'trader_convoy',
      'patrol_craft',
      'fuel_depot',
      'orbital_dock',
      'smuggler_vessel',
      'communications_array',
      'defense_platform'
    ],

    scientific_outpost: [
      'space_station', 
      'wormhole_portal', 
      'defense_satellite', 
      'ice_planet',
      'research_facility',
      'science_vessel',
      'survey_drone',
      'data_cube',
      'sensor_array',
      'scanner_array',
      'alien_research_probe',
      'data_beacon',
      'quantum_singularity'
    ],

    alien_territory: [
      'alien_enemy_ship', 
      'wormhole_portal', 
      'nebula_formation', 
      'black_hole',
      'alien_hive',
      'alien_technology',
      'gravity_well',
      'combat_drone',
      'alien_research_probe',
      'cosmic_dust_cloud',
      'ion_cloud',
      'space_time_rift'
    ],

    // New themes with appropriate object combinations
    ancient_ruins_site: [
      'ancient_ruins',
      'temple_structure',
      'ancient_artifact',
      'alien_technology',
      'data_cube',
      'barren_moon',
      'research_facility',
      'science_vessel',
      'survey_drone',
      'asteroid_cluster',
      'space_time_rift',
      'time_distortion'
    ],

    military_blockade: [
      'military_base',
      'defense_platform',
      'orbital_cannon',
      'battleship',
      'carrier_vessel',
      'destroyer',
      'corvette',
      'defense_satellite',
      'fighter_squadron',
      'automated_turret',
      'patrol_craft',
      'energy_barrier',
      'laser_grid',
      'mine_field'
    ],

    deep_space_exploration: [
      'exploration_vessel',
      'science_vessel',
      'deep_space_explorer',
      'research_facility',
      'survey_drone',
      'scanner_array',
      'data_beacon',
      'nebula_formation',
      'wormhole_portal',
      'neutron_star',
      'pulsar',
      'black_hole',
      'dark_matter_cluster',
      'supernova_remnant'
    ],

    stellar_phenomenon: [
      'neutron_star',
      'pulsar',
      'black_hole',
      'supernova_remnant',
      'nebula_formation',
      'cosmic_dust_cloud',
      'red_giant',
      'white_dwarf',
      'magnetar',
      'quasar',
      'interstellar_cloud',
      'binary_star_system',
      'galactic_core',
      'protostar_cluster',
      'gravity_well'
    ],

    smuggler_hideout: [
      'smuggler_den',
      'smuggler_vessel',
      'trader_convoy',
      'cargo_ship',
      'pirate_raider',
      'corvette',
      'asteroid_cluster',
      'asteroid_field',
      'ancient_ruins',
      'emergency_cache',
      'data_beacon',
      'salvage_container',
      'alien_technology',
      'rare_crystal'
    ],

    refugee_settlement: [
      'refugee_fleet',
      'habitation_ring',
      'colony_ship',
      'generation_ship',
      'cargo_ship',
      'space_station',
      'patrol_craft',
      'defense_satellite',
      'communications_array',
      'emergency_cache',
      'fuel_depot',
      'maintenance_hub'
    ],

    pirate_stronghold: [
      'pirate_hideout',
      'pirate_raider',
      'damaged_cruiser',
      'fighter_squadron',
      'corvette',
      'smuggler_vessel',
      'automated_turret',
      'weapon_platform',
      'defense_satellite',
      'energy_barrier',
      'smuggler_den',
      'asteroid_field',
      'space_junk',
      'salvage_container'
    ],

    imperial_outpost: [
      'imperial_fortress',
      'military_base',
      'orbital_cannon',
      'defense_platform',
      'capital_ship',
      'battleship',
      'carrier_vessel',
      'destroyer',
      'fighter_squadron',
      'communications_array',
      'sensor_array',
      'patrol_craft',
      'automated_sentry',
      'weapon_platform',
      'defense_satellite'
    ],

    hazard_zone: [
      'radiation_zone',
      'toxic_gas_cloud',
      'corrosive_nebula',
      'electromagnetic_pulse',
      'plasma_storm',
      'ion_cloud',
      'gravity_disruptor',
      'space_time_rift',
      'temporal_trap',
      'solar_flare',
      'mine_field',
      'wreckage_field',
      'debris_field',
      'black_hole',
      'neutron_star'
    ],

    resource_rich_sector: [
      'mineral_rich_asteroid',
      'ice_asteroid',
      'metallic_asteroid',
      'asteroid_field',
      'asteroid_cluster',
      'gas_giant_planet',
      'mining_station',
      'cargo_ship',
      'harvester_drone',
      'survey_drone',
      'rare_crystal',
      'fuel_cell'
    ]
  };

  // Get random position within radius, but with more organization
  const getThemedPosition = (index: number, total: number): [number, number, number] => {
    // Organize in a loose formation based on theme
    const angle = (index / total) * Math.PI * 2;
    const radiusVariation = 0.7 + Math.sin(index * 123.456) * 0.3;
    const distanceFromCenter = radius * radiusVariation;

    const x = position[0] + Math.cos(angle) * distanceFromCenter;
    const y = position[1] + Math.sin(index * 789.123) * (radius * 0.2);
    const z = position[2] + Math.sin(angle) * distanceFromCenter;

    return [x, y, z];
  };

  // Generate a mix of themed objects with extra safeguards
  const themeObjectsArray = themeObjects[theme] || themeObjects['mining_operation']; // Fallback if theme not defined

  // Use only the available object types that we've defined in objectPropertiesDatabase
  const availableGalaxyObjectTypes = Object.keys(objectPropertiesDatabase) as GalaxyObjectType[];
  const validThemeObjects = themeObjectsArray.filter(objType => 
    availableGalaxyObjectTypes.includes(objType)
  );

  // If we somehow ended up with no valid objects, use a default safe set
  const objectsToUse = validThemeObjects.length > 0 
    ? validThemeObjects 
    : ['space_station', 'mining_station', 'asteroid_cluster', 'cargo_ship'] as GalaxyObjectType[]; // Safe fallback with type assertion

  // Generate objects using the filtered list
  const objects = Array.from({ length: objectCount }, (_, i) => {
    const objectIndex = Math.floor(Math.abs(Math.sin(i * 456.789) * 10000)) % objectsToUse.length;
    const selectedType = objectsToUse[objectIndex];

    // Double check that we have a valid type (belt & suspenders approach)
    const type = selectedType ? selectedType as GalaxyObjectType : 'space_station' as GalaxyObjectType;

    return {
      type,
      position: getThemedPosition(i, objectCount),
      rotation: [
        Math.sin(i * 123.456) * Math.PI * 2,
        Math.sin(i * 789.123) * Math.PI * 2,
        Math.sin(i * 456.789) * Math.PI * 2
      ] as [number, number, number]
    };
  }) as Array<{
    type: GalaxyObjectType;
    position: [number, number, number];
    rotation: [number, number, number];
  }>;

  return (
    <group>
      {objects.map((obj, index) => (
        <GalaxyObject
          key={`themed-obj-${theme}-${index}`}
          type={obj.type}
          position={obj.position}
          rotation={obj.rotation}
        />
      ))}
    </group>
  );
}