import * as THREE from 'three';
import { VehicleType, VehicleProperties } from '../types';

// Vehicle definitions for different spacecraft types
export const vehicleProperties: Record<VehicleType, VehicleProperties> = {
  'standard': {
    type: 'standard',
    speed: 30,
    health: 100,
    shield: 50,
    weapons: [
      {
        damage: 1,
        fireRate: 0.2, // seconds between shots
        range: 100,
      }
    ],
    specialAbilities: [],
    fuelEfficiency: 1.0,
    sensorRange: 150,
    stealthRating: 0.5,
  },
  
  'scout': {
    type: 'scout',
    speed: 45, // 50% faster than standard
    health: 70, // 30% less health
    shield: 30, // 40% less shield
    weapons: [
      {
        damage: 0.8, // 20% less damage
        fireRate: 0.15, // 25% faster fire rate
        range: 80, // 20% less range
      }
    ],
    specialAbilities: ['boost', 'quick_turn'],
    fuelEfficiency: 1.2, // 20% better fuel efficiency
    sensorRange: 180, // 20% better sensors
    stealthRating: 0.7, // 40% better stealth
  },
  
  'heavy': {
    type: 'heavy',
    speed: 20, // 33% slower than standard
    health: 150, // 50% more health
    shield: 100, // 100% more shield
    weapons: [
      {
        damage: 1.5, // 50% more damage
        fireRate: 0.3, // 50% slower fire rate
        range: 120, // 20% more range
      },
      {
        damage: 3, // secondary weapon with high damage
        fireRate: 1.0, // slow firing rate
        range: 80, // shorter range
      }
    ],
    specialAbilities: ['shield_boost', 'armor_plating'],
    fuelEfficiency: 0.8, // 20% worse fuel efficiency
    sensorRange: 130, // 13% less sensor range
    stealthRating: 0.3, // 40% worse stealth
  },
  
  'explorer': {
    type: 'explorer',
    speed: 35, // 17% faster than standard
    health: 90, // 10% less health
    shield: 60, // 20% more shield
    weapons: [
      {
        damage: 0.9, // 10% less damage
        fireRate: 0.25, // 25% slower fire rate
        range: 150, // 50% more range
      }
    ],
    specialAbilities: ['scanner_boost', 'wormhole_detection', 'resource_scanner'],
    fuelEfficiency: 1.5, // 50% better fuel efficiency
    sensorRange: 250, // 67% better sensors
    stealthRating: 0.5, // standard stealth
  },
  
  'stealth': {
    type: 'stealth',
    speed: 40, // 33% faster than standard
    health: 80, // 20% less health
    shield: 40, // 20% less shield
    weapons: [
      {
        damage: 1.2, // 20% more damage
        fireRate: 0.4, // 100% slower fire rate
        range: 90, // 10% less range
      }
    ],
    specialAbilities: ['cloak', 'emp_burst', 'silent_running'],
    fuelEfficiency: 1.1, // 10% better fuel efficiency
    sensorRange: 200, // 33% better sensors
    stealthRating: 0.9, // 80% better stealth
  }
};

// Function to create a vehicle model with the correct appearance
export function createVehicleModel(vehicleType: VehicleType): THREE.Group {
  const vehicleGroup = new THREE.Group();
  
  // Colors for different vehicle types
  const colorSchemes = {
    'standard': {
      primary: new THREE.Color(0.2, 0.4, 0.8),
      secondary: new THREE.Color(0.1, 0.2, 0.5),
      accent: new THREE.Color(0.5, 0.7, 1.0),
      emissive: new THREE.Color(0.2, 0.4, 0.8),
    },
    'scout': {
      primary: new THREE.Color(0.2, 0.8, 0.4),
      secondary: new THREE.Color(0.1, 0.5, 0.2),
      accent: new THREE.Color(0.5, 1.0, 0.7),
      emissive: new THREE.Color(0.2, 0.8, 0.4),
    },
    'heavy': {
      primary: new THREE.Color(0.8, 0.2, 0.2),
      secondary: new THREE.Color(0.5, 0.1, 0.1),
      accent: new THREE.Color(1.0, 0.5, 0.5),
      emissive: new THREE.Color(0.8, 0.2, 0.2),
    },
    'explorer': {
      primary: new THREE.Color(0.8, 0.8, 0.2),
      secondary: new THREE.Color(0.5, 0.5, 0.1),
      accent: new THREE.Color(1.0, 1.0, 0.5),
      emissive: new THREE.Color(0.8, 0.8, 0.2),
    },
    'stealth': {
      primary: new THREE.Color(0.2, 0.2, 0.3),
      secondary: new THREE.Color(0.1, 0.1, 0.15),
      accent: new THREE.Color(0.4, 0.4, 0.6),
      emissive: new THREE.Color(0.2, 0.2, 0.3),
    },
  };
  
  const colors = colorSchemes[vehicleType];
  
  // Base materials
  const primaryMaterial = new THREE.MeshStandardMaterial({
    color: colors.primary,
    metalness: 0.8,
    roughness: 0.2,
  });
  
  const secondaryMaterial = new THREE.MeshStandardMaterial({
    color: colors.secondary,
    metalness: 0.6,
    roughness: 0.3,
  });
  
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: colors.accent,
    metalness: 0.9,
    roughness: 0.1,
    emissive: colors.emissive,
    emissiveIntensity: 0.5,
  });
  
  // Create ship based on type
  switch (vehicleType) {
    case 'scout':
      // Sleek, aerodynamic design
      createScoutShip(vehicleGroup, primaryMaterial, secondaryMaterial, accentMaterial);
      break;
      
    case 'heavy':
      // Bulky, armored design
      createHeavyShip(vehicleGroup, primaryMaterial, secondaryMaterial, accentMaterial);
      break;
      
    case 'explorer':
      // Balanced design with sensor arrays
      createExplorerShip(vehicleGroup, primaryMaterial, secondaryMaterial, accentMaterial);
      break;
      
    case 'stealth':
      // Angular, low-profile design
      createStealthShip(vehicleGroup, primaryMaterial, secondaryMaterial, accentMaterial);
      break;
      
    default:
      // Standard balanced design
      createStandardShip(vehicleGroup, primaryMaterial, secondaryMaterial, accentMaterial);
      break;
  }
  
  // Add engine effects
  addEngineEffects(vehicleGroup, vehicleType, colors.emissive);
  
  return vehicleGroup;
}

// Helper function to create a standard ship
function createStandardShip(
  group: THREE.Group,
  primaryMaterial: THREE.Material,
  secondaryMaterial: THREE.Material,
  accentMaterial: THREE.Material
) {
  // Main hull - elongated shape
  const hullGeometry = new THREE.CylinderGeometry(0.5, 0.8, 3, 8);
  const hull = new THREE.Mesh(hullGeometry, primaryMaterial);
  hull.rotation.x = Math.PI / 2; // Rotate to face forward
  hull.position.z = 0;
  group.add(hull);
  
  // Cockpit - half sphere at front
  const cockpitGeometry = new THREE.SphereGeometry(0.6, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const cockpit = new THREE.Mesh(cockpitGeometry, accentMaterial);
  cockpit.rotation.x = -Math.PI / 2; // Rotate to face forward
  cockpit.position.z = 1.5; // Place at front
  group.add(cockpit);
  
  // Wings (2 sides)
  const wingGeometry = new THREE.BoxGeometry(3, 0.1, 1);
  
  const leftWing = new THREE.Mesh(wingGeometry, secondaryMaterial);
  leftWing.position.set(-1.2, 0, 0);
  group.add(leftWing);
  
  const rightWing = new THREE.Mesh(wingGeometry, secondaryMaterial);
  rightWing.position.set(1.2, 0, 0);
  group.add(rightWing);
  
  // Engines (2 sides)
  const engineGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 8);
  
  const leftEngine = new THREE.Mesh(engineGeometry, secondaryMaterial);
  leftEngine.rotation.x = Math.PI / 2; // Rotate to face backward
  leftEngine.position.set(-0.8, -0.2, -1.4);
  group.add(leftEngine);
  
  const rightEngine = new THREE.Mesh(engineGeometry, secondaryMaterial);
  rightEngine.rotation.x = Math.PI / 2; // Rotate to face backward
  rightEngine.position.set(0.8, -0.2, -1.4);
  group.add(rightEngine);
  
  // Add weapon mounts
  const weaponGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.6);
  
  const leftWeapon = new THREE.Mesh(weaponGeometry, accentMaterial);
  leftWeapon.position.set(-0.7, -0.1, 1.2);
  group.add(leftWeapon);
  
  const rightWeapon = new THREE.Mesh(weaponGeometry, accentMaterial);
  rightWeapon.position.set(0.7, -0.1, 1.2);
  group.add(rightWeapon);
}

// Helper function to create a scout ship
function createScoutShip(
  group: THREE.Group,
  primaryMaterial: THREE.Material,
  secondaryMaterial: THREE.Material,
  accentMaterial: THREE.Material
) {
  // Main hull - streamlined and narrow
  const hullGeometry = new THREE.CylinderGeometry(0.4, 0.6, 3.5, 8);
  const hull = new THREE.Mesh(hullGeometry, primaryMaterial);
  hull.rotation.x = Math.PI / 2; // Rotate to face forward
  hull.position.z = 0;
  group.add(hull);
  
  // Cockpit - elongated and pointed
  const cockpitGeometry = new THREE.ConeGeometry(0.5, 1.0, 8);
  const cockpit = new THREE.Mesh(cockpitGeometry, accentMaterial);
  cockpit.rotation.x = -Math.PI / 2; // Rotate to face forward
  cockpit.position.z = 1.7; // Place at front
  group.add(cockpit);
  
  // Wings - swept back and thin
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(2, -1);
  wingShape.lineTo(2, -1.5);
  wingShape.lineTo(0, -0.2);
  wingShape.lineTo(0, 0);
  
  const wingGeometry = new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.05,
    bevelEnabled: false
  });
  
  const leftWing = new THREE.Mesh(wingGeometry, secondaryMaterial);
  leftWing.rotation.y = Math.PI / 2;
  leftWing.position.set(-0.2, 0.1, 0);
  group.add(leftWing);
  
  const rightWing = new THREE.Mesh(wingGeometry.clone(), secondaryMaterial);
  rightWing.rotation.y = -Math.PI / 2;
  rightWing.position.set(0.2, 0.1, 0);
  group.add(rightWing);
  
  // Engines - small but powerful looking
  const engineGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.7, 8);
  
  const leftEngine = new THREE.Mesh(engineGeometry, secondaryMaterial);
  leftEngine.rotation.x = Math.PI / 2; // Rotate to face backward
  leftEngine.position.set(-0.6, -0.1, -1.6);
  group.add(leftEngine);
  
  const rightEngine = new THREE.Mesh(engineGeometry, secondaryMaterial);
  rightEngine.rotation.x = Math.PI / 2; // Rotate to face backward
  rightEngine.position.set(0.6, -0.1, -1.6);
  group.add(rightEngine);
  
  // Add small weapon mount
  const weaponGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.5);
  
  const weapon = new THREE.Mesh(weaponGeometry, accentMaterial);
  weapon.position.set(0, -0.2, 1.2);
  group.add(weapon);
}

// Helper function to create a heavy ship
function createHeavyShip(
  group: THREE.Group,
  primaryMaterial: THREE.Material,
  secondaryMaterial: THREE.Material,
  accentMaterial: THREE.Material
) {
  // Main hull - wide and massive
  const hullGeometry = new THREE.CylinderGeometry(1.0, 1.2, 3.2, 8);
  const hull = new THREE.Mesh(hullGeometry, primaryMaterial);
  hull.rotation.x = Math.PI / 2; // Rotate to face forward
  hull.position.z = 0;
  group.add(hull);
  
  // Armored cockpit
  const cockpitGeometry = new THREE.BoxGeometry(1.4, 1.0, 1.2);
  const cockpit = new THREE.Mesh(cockpitGeometry, secondaryMaterial);
  cockpit.position.z = 1.2; // Place at front
  cockpit.position.y = 0.3;
  group.add(cockpit);
  
  // Cockpit window
  const windowGeometry = new THREE.BoxGeometry(1.0, 0.4, 0.1);
  const window = new THREE.Mesh(windowGeometry, accentMaterial);
  window.position.z = 1.8;
  window.position.y = 0.3;
  group.add(window);
  
  // Heavy armor plates
  const armorGeometry = new THREE.BoxGeometry(1.6, 0.3, 2.5);
  
  const topArmor = new THREE.Mesh(armorGeometry, secondaryMaterial);
  topArmor.position.set(0, 0.8, 0);
  group.add(topArmor);
  
  const bottomArmor = new THREE.Mesh(armorGeometry, secondaryMaterial);
  bottomArmor.position.set(0, -0.8, 0);
  group.add(bottomArmor);
  
  // Side armor
  const sideArmorGeometry = new THREE.BoxGeometry(0.3, 1.6, 2.5);
  
  const leftArmor = new THREE.Mesh(sideArmorGeometry, secondaryMaterial);
  leftArmor.position.set(-0.8, 0, 0);
  group.add(leftArmor);
  
  const rightArmor = new THREE.Mesh(sideArmorGeometry, secondaryMaterial);
  rightArmor.position.set(0.8, 0, 0);
  group.add(rightArmor);
  
  // Large engines (3)
  const engineGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.0, 8);
  
  const leftEngine = new THREE.Mesh(engineGeometry, secondaryMaterial);
  leftEngine.rotation.x = Math.PI / 2; // Rotate to face backward
  leftEngine.position.set(-0.7, -0.4, -1.6);
  group.add(leftEngine);
  
  const centerEngine = new THREE.Mesh(engineGeometry, secondaryMaterial);
  centerEngine.rotation.x = Math.PI / 2; // Rotate to face backward
  centerEngine.position.set(0, -0.4, -1.6);
  centerEngine.scale.set(1.2, 1.2, 1.2); // Larger center engine
  group.add(centerEngine);
  
  const rightEngine = new THREE.Mesh(engineGeometry, secondaryMaterial);
  rightEngine.rotation.x = Math.PI / 2; // Rotate to face backward
  rightEngine.position.set(0.7, -0.4, -1.6);
  group.add(rightEngine);
  
  // Heavy weapons
  const mainWeaponGeometry = new THREE.BoxGeometry(0.4, 0.4, 1.2);
  
  const mainWeapon = new THREE.Mesh(mainWeaponGeometry, accentMaterial);
  mainWeapon.position.set(0, -0.2, 1.4);
  group.add(mainWeapon);
  
  // Side cannons
  const cannonGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.8, 8);
  
  const leftCannon = new THREE.Mesh(cannonGeometry, accentMaterial);
  leftCannon.rotation.x = Math.PI / 2; // Rotate to face forward
  leftCannon.position.set(-0.7, 0, 1.2);
  group.add(leftCannon);
  
  const rightCannon = new THREE.Mesh(cannonGeometry, accentMaterial);
  rightCannon.rotation.x = Math.PI / 2; // Rotate to face forward
  rightCannon.position.set(0.7, 0, 1.2);
  group.add(rightCannon);
}

// Helper function to create an explorer ship
function createExplorerShip(
  group: THREE.Group,
  primaryMaterial: THREE.Material,
  secondaryMaterial: THREE.Material,
  accentMaterial: THREE.Material
) {
  // Main hull - oval shape with scientific equipment
  const hullGeometry = new THREE.SphereGeometry(0.8, 16, 16);
  hullGeometry.scale(1, 0.6, 1.3);
  const hull = new THREE.Mesh(hullGeometry, primaryMaterial);
  hull.position.z = 0;
  group.add(hull);
  
  // Cockpit - large observation dome
  const cockpitGeometry = new THREE.SphereGeometry(0.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const cockpit = new THREE.Mesh(cockpitGeometry, accentMaterial);
  cockpit.rotation.x = -Math.PI / 2; // Rotate to face forward
  cockpit.position.z = 0.8; // Place at front
  cockpit.position.y = 0.2;
  group.add(cockpit);
  
  // Sensor array structures
  const sensorDishGeometry = new THREE.CircleGeometry(0.4, 16);
  const sensorStickGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
  
  // Top sensor
  const topSensorStick = new THREE.Mesh(sensorStickGeometry, secondaryMaterial);
  topSensorStick.position.set(0, 0.8, 0);
  group.add(topSensorStick);
  
  const topSensorDish = new THREE.Mesh(sensorDishGeometry, accentMaterial);
  topSensorDish.rotation.x = -Math.PI / 2;
  topSensorDish.position.set(0, 1.2, 0);
  group.add(topSensorDish);
  
  // Bottom sensor
  const bottomSensorStick = new THREE.Mesh(sensorStickGeometry, secondaryMaterial);
  bottomSensorStick.position.set(0, -0.8, 0);
  group.add(bottomSensorStick);
  
  const bottomSensorDish = new THREE.Mesh(sensorDishGeometry, accentMaterial);
  bottomSensorDish.rotation.x = Math.PI / 2;
  bottomSensorDish.position.set(0, -1.2, 0);
  group.add(bottomSensorDish);
  
  // Side scanner arrays
  const scannerGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.5);
  
  const leftScanner = new THREE.Mesh(scannerGeometry, secondaryMaterial);
  leftScanner.position.set(-0.9, 0, 0);
  leftScanner.rotation.z = Math.PI / 6; // Angle upward
  group.add(leftScanner);
  
  const rightScanner = new THREE.Mesh(scannerGeometry, secondaryMaterial);
  rightScanner.position.set(0.9, 0, 0);
  rightScanner.rotation.z = -Math.PI / 6; // Angle upward
  group.add(rightScanner);
  
  // Engine section
  const engineBaseGeometry = new THREE.CylinderGeometry(0.7, 0.8, 0.5, 16);
  const engineBase = new THREE.Mesh(engineBaseGeometry, secondaryMaterial);
  engineBase.rotation.x = Math.PI / 2;
  engineBase.position.z = -0.9;
  group.add(engineBase);
  
  // Multiple small engines
  const smallEngineGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.4, 8);
  const enginePositions = [
    { x: -0.5, y: 0.3, z: -1.2 },
    { x: 0, y: 0.3, z: -1.2 },
    { x: 0.5, y: 0.3, z: -1.2 },
    { x: -0.5, y: -0.3, z: -1.2 },
    { x: 0, y: -0.3, z: -1.2 },
    { x: 0.5, y: -0.3, z: -1.2 },
  ];
  
  enginePositions.forEach((pos) => {
    const smallEngine = new THREE.Mesh(smallEngineGeometry, secondaryMaterial);
    smallEngine.rotation.x = Math.PI / 2;
    smallEngine.position.set(pos.x, pos.y, pos.z);
    group.add(smallEngine);
  });
  
  // Small defensive weapon
  const weaponGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.6);
  const weapon = new THREE.Mesh(weaponGeometry, accentMaterial);
  weapon.position.set(0, -0.3, 1.0);
  group.add(weapon);
}

// Helper function to create a stealth ship
function createStealthShip(
  group: THREE.Group,
  primaryMaterial: THREE.Material,
  secondaryMaterial: THREE.Material,
  accentMaterial: THREE.Material
) {
  // Main hull - flat, angular stealth design
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-1.0, -0.8);
  hullShape.lineTo(1.0, -0.8);
  hullShape.lineTo(0.7, 0.8);
  hullShape.lineTo(-0.7, 0.8);
  hullShape.lineTo(-1.0, -0.8);
  
  const extrudeSettings = {
    steps: 1,
    depth: 2.5,
    bevelEnabled: false
  };
  
  const hullGeometry = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
  const hull = new THREE.Mesh(hullGeometry, primaryMaterial);
  hull.rotation.x = Math.PI / 2;
  hull.position.z = 1.2;
  group.add(hull);
  
  // Cockpit - dark, angular canopy
  const cockpitShape = new THREE.Shape();
  cockpitShape.moveTo(-0.4, 0);
  cockpitShape.lineTo(0.4, 0);
  cockpitShape.lineTo(0.3, 0.3);
  cockpitShape.lineTo(-0.3, 0.3);
  cockpitShape.lineTo(-0.4, 0);
  
  const cockpitExtrudeSettings = {
    steps: 1,
    depth: 0.8,
    bevelEnabled: false
  };
  
  const cockpitGeometry = new THREE.ExtrudeGeometry(cockpitShape, cockpitExtrudeSettings);
  const cockpit = new THREE.Mesh(cockpitGeometry, accentMaterial);
  cockpit.rotation.x = Math.PI / 2;
  cockpit.position.z = 1.3;
  cockpit.position.y = 0.3;
  group.add(cockpit);
  
  // Angular wing extensions
  const wingGeometry = new THREE.BoxGeometry(1.0, 0.05, 1.2);
  
  const leftWing = new THREE.Mesh(wingGeometry, secondaryMaterial);
  leftWing.position.set(-0.8, 0, 0);
  leftWing.rotation.z = Math.PI / 8; // Angled upward
  group.add(leftWing);
  
  const rightWing = new THREE.Mesh(wingGeometry, secondaryMaterial);
  rightWing.position.set(0.8, 0, 0);
  rightWing.rotation.z = -Math.PI / 8; // Angled upward
  group.add(rightWing);
  
  // Flat engines - hidden inside the hull
  const engineGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.3);
  
  const leftEngine = new THREE.Mesh(engineGeometry, accentMaterial);
  leftEngine.position.set(-0.4, -0.3, -1.0);
  group.add(leftEngine);
  
  const rightEngine = new THREE.Mesh(engineGeometry, accentMaterial);
  rightEngine.position.set(0.4, -0.3, -1.0);
  group.add(rightEngine);
  
  // Stealth surfaces - angled plates
  const stealthSurfaceGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.8);
  
  // Top surface
  const topSurface = new THREE.Mesh(stealthSurfaceGeometry, secondaryMaterial);
  topSurface.position.set(0, 0.4, -0.5);
  topSurface.rotation.x = Math.PI / 12; // Slight angle
  group.add(topSurface);
  
  // Bottom surface
  const bottomSurface = new THREE.Mesh(stealthSurfaceGeometry, secondaryMaterial);
  bottomSurface.position.set(0, -0.4, -0.5);
  bottomSurface.rotation.x = -Math.PI / 12; // Slight angle
  group.add(bottomSurface);
  
  // Stealth weapon bay (closed)
  const weaponBayGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.5);
  const weaponBay = new THREE.Mesh(weaponBayGeometry, secondaryMaterial);
  weaponBay.position.set(0, -0.2, 0.8);
  group.add(weaponBay);
}

// Add engine effects to the ship
function addEngineEffects(group: THREE.Group, vehicleType: VehicleType, emissiveColor: THREE.Color) {
  let enginePositions: {x: number, y: number, z: number, scale: number}[] = [];
  
  // Define engine positions based on vehicle type
  switch (vehicleType) {
    case 'scout':
      enginePositions = [
        { x: -0.6, y: -0.1, z: -1.7, scale: 0.25 },
        { x: 0.6, y: -0.1, z: -1.7, scale: 0.25 },
      ];
      break;
      
    case 'heavy':
      enginePositions = [
        { x: -0.7, y: -0.4, z: -1.7, scale: 0.4 },
        { x: 0, y: -0.4, z: -1.7, scale: 0.5 },
        { x: 0.7, y: -0.4, z: -1.7, scale: 0.4 },
      ];
      break;
      
    case 'explorer':
      enginePositions = [
        { x: -0.5, y: 0.3, z: -1.3, scale: 0.2 },
        { x: 0, y: 0.3, z: -1.3, scale: 0.2 },
        { x: 0.5, y: 0.3, z: -1.3, scale: 0.2 },
        { x: -0.5, y: -0.3, z: -1.3, scale: 0.2 },
        { x: 0, y: -0.3, z: -1.3, scale: 0.2 },
        { x: 0.5, y: -0.3, z: -1.3, scale: 0.2 },
      ];
      break;
      
    case 'stealth':
      enginePositions = [
        { x: -0.4, y: -0.3, z: -1.1, scale: 0.2 },
        { x: 0.4, y: -0.3, z: -1.1, scale: 0.2 },
      ];
      break;
      
    default: // standard
      enginePositions = [
        { x: -0.8, y: -0.2, z: -1.5, scale: 0.3 },
        { x: 0.8, y: -0.2, z: -1.5, scale: 0.3 },
      ];
      break;
  }
  
  // Create the engine glow effects
  enginePositions.forEach((pos) => {
    // Engine glow
    const glowGeometry = new THREE.SphereGeometry(pos.scale, 16, 16);
    const glowMaterial = new THREE.MeshStandardMaterial({
      color: emissiveColor,
      emissive: emissiveColor,
      emissiveIntensity: 2.0,
      transparent: true,
      opacity: 0.7,
    });
    
    const engineGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    engineGlow.position.set(pos.x, pos.y, pos.z);
    group.add(engineGlow);
  });
}