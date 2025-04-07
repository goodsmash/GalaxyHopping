import * as THREE from 'three';
import { VehicleType } from '../types';

/**
 * Creates a spaceship model based on the specified vehicle type
 * @param vehicleType - The type of vehicle to create
 * @param scale - Optional scale factor (default: 1)
 * @returns A Three.js Group containing the ship model
 */
export function createShipModel(vehicleType: VehicleType, scale: number = 1): THREE.Group {
  // Create a group to hold all ship components
  const shipGroup = new THREE.Group();
  
  // Apply the specified scale
  shipGroup.scale.set(scale, scale, scale);
  
  // Call the appropriate factory function based on vehicle type
  switch (vehicleType) {
    case 'standard':
      return createStandardShip(shipGroup);
    case 'scout':
      return createScoutShip(shipGroup);
    case 'heavy':
      return createHeavyShip(shipGroup);
    case 'explorer':
      return createExplorerShip(shipGroup);
    case 'stealth':
      return createStealthShip(shipGroup);
    default:
      // Default to standard ship if type is unknown
      return createStandardShip(shipGroup);
  }
}

/**
 * Creates a standard balanced spaceship model
 */
function createStandardShip(group: THREE.Group): THREE.Group {
  // Base hull - slightly elongated
  const hullGeometry = new THREE.CylinderGeometry(0.5, 0.8, 2, 8);
  const hullMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3366cc, 
    metalness: 0.8, 
    roughness: 0.2
  });
  const hull = new THREE.Mesh(hullGeometry, hullMaterial);
  hull.rotation.x = Math.PI / 2; // Rotate to point forward
  group.add(hull);
  
  // Cockpit - transparent dome
  const cockpitGeometry = new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const cockpitMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x88ccff, 
    transparent: true, 
    opacity: 0.7,
    metalness: 0.2,
    roughness: 0.1
  });
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  cockpit.position.set(0, 0.25, -0.8);
  cockpit.rotation.x = -Math.PI / 2;
  group.add(cockpit);
  
  // Wings - flat panels extending from sides
  const wingGeometry = new THREE.BoxGeometry(3, 0.1, 1);
  const wingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2255aa,
    metalness: 0.7,
    roughness: 0.3
  });
  const wings = new THREE.Mesh(wingGeometry, wingMaterial);
  wings.position.set(0, 0, 0.2);
  group.add(wings);
  
  // Engine exhausts - glowing cylinders at the back
  const engineGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 8);
  const engineMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    emissive: 0x0055ff,
    emissiveIntensity: 1.5,
    metalness: 0.9,
    roughness: 0.2
  });
  
  // Left engine
  const engineLeft = new THREE.Mesh(engineGeometry, engineMaterial);
  engineLeft.position.set(-0.6, 0, 1.1);
  engineLeft.rotation.x = Math.PI / 2;
  group.add(engineLeft);
  
  // Right engine
  const engineRight = new THREE.Mesh(engineGeometry, engineMaterial);
  engineRight.position.set(0.6, 0, 1.1);
  engineRight.rotation.x = Math.PI / 2;
  group.add(engineRight);
  
  // Add engine glow effect
  const glowGeometry = new THREE.SphereGeometry(0.15, 8, 8);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x0088ff,
    transparent: true,
    opacity: 0.8
  });
  
  const glowLeft = new THREE.Mesh(glowGeometry, glowMaterial);
  glowLeft.position.set(-0.6, 0, 1.4);
  group.add(glowLeft);
  
  const glowRight = new THREE.Mesh(glowGeometry, glowMaterial);
  glowRight.position.set(0.6, 0, 1.4);
  group.add(glowRight);
  
  // Add details to the hull - antenna and sensors
  const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
  const antennaMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.8,
    roughness: 0.2
  });
  
  const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
  antenna.position.set(0, 0.6, -0.5);
  group.add(antenna);
  
  // Add radar dish on top
  const radarGeometry = new THREE.SphereGeometry(0.1, 8, 8, 0, Math.PI);
  const radarMaterial = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    metalness: 0.9,
    roughness: 0.1
  });
  
  const radar = new THREE.Mesh(radarGeometry, radarMaterial);
  radar.position.set(0, 0.6, -0.5);
  radar.rotation.x = Math.PI / 2;
  group.add(radar);
  
  // Cast shadows from all parts
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  
  return group;
}

/**
 * Creates a fast, agile scout ship model
 */
function createScoutShip(group: THREE.Group): THREE.Group {
  // Scout ships are sleek, small, and fast-looking
  
  // Sleek hull - narrow and pointed
  const hullGeometry = new THREE.ConeGeometry(0.5, 2.5, 8);
  const hullMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x66cc66, 
    metalness: 0.7, 
    roughness: 0.3
  });
  const hull = new THREE.Mesh(hullGeometry, hullMaterial);
  hull.rotation.x = -Math.PI / 2; // Rotate to point forward
  group.add(hull);
  
  // Small cockpit
  const cockpitGeometry = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const cockpitMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x88ffaa, 
    transparent: true, 
    opacity: 0.7,
    metalness: 0.2,
    roughness: 0.1
  });
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  cockpit.position.set(0, 0.2, -0.6);
  cockpit.rotation.x = -Math.PI / 2;
  group.add(cockpit);
  
  // Thin, swept-back wings
  const wingGeometry = new THREE.BoxGeometry(2.5, 0.05, 0.7);
  const wingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x44aa44,
    metalness: 0.7,
    roughness: 0.3
  });
  
  // Transform the wing vertices to create a swept-back shape
  const wing = new THREE.Mesh(wingGeometry, wingMaterial);
  wing.position.set(0, 0, 0.2);
  
  // Use matrix transformations to shape the wings
  const matrix = new THREE.Matrix4();
  matrix.makeShear(0, 0, -0.6, 0, 0, 0);
  wing.geometry.applyMatrix4(matrix);
  
  group.add(wing);
  
  // High-powered engine with stronger glow
  const engineGeometry = new THREE.CylinderGeometry(0.15, 0.25, 0.7, 8);
  const engineMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    emissive: 0x00ff88,
    emissiveIntensity: 2.0,
    metalness: 0.9,
    roughness: 0.2
  });
  
  // Central engine
  const engine = new THREE.Mesh(engineGeometry, engineMaterial);
  engine.position.set(0, 0, 1.0);
  engine.rotation.x = Math.PI / 2;
  group.add(engine);
  
  // Engine glow effect
  const glowGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.8
  });
  
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.set(0, 0, 1.4);
  group.add(glow);
  
  // Add streamlined fins for stability
  const finGeometry = new THREE.BoxGeometry(0.05, 0.4, 0.8);
  const finMaterial = new THREE.MeshStandardMaterial({
    color: 0x44aa44,
    metalness: 0.8,
    roughness: 0.2
  });
  
  // Vertical fin
  const finVertical = new THREE.Mesh(finGeometry, finMaterial);
  finVertical.position.set(0, 0.4, 0.6);
  group.add(finVertical);
  
  // Cast shadows from all parts
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  
  return group;
}

/**
 * Creates a heavily armored but slow ship model
 */
function createHeavyShip(group: THREE.Group): THREE.Group {
  // Heavy ships are bulky, armored, and powerful-looking
  
  // Large, bulky hull
  const hullGeometry = new THREE.BoxGeometry(2, 1.2, 3);
  const hullMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xaa4444, 
    metalness: 0.8, 
    roughness: 0.4
  });
  
  // Round the edges of the box for a more satisfying shape
  hullGeometry.translate(0, 0, 0);
  
  const hull = new THREE.Mesh(hullGeometry, hullMaterial);
  group.add(hull);
  
  // Add armor plating with overlapping panels
  for (let i = 0; i < 4; i++) {
    const plateGeometry = new THREE.BoxGeometry(2.2, 0.3, 0.6);
    const plateMaterial = new THREE.MeshStandardMaterial({
      color: 0x882222,
      metalness: 0.9,
      roughness: 0.3
    });
    
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.position.set(0, 0, -1 + i * 0.7);
    group.add(plate);
  }
  
  // Reinforced cockpit - smaller window area for protection
  const cockpitGeometry = new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 3);
  const cockpitMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffaaaa, 
    transparent: true, 
    opacity: 0.6,
    metalness: 0.4,
    roughness: 0.2
  });
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  cockpit.position.set(0, 0.4, -1.0);
  cockpit.rotation.x = -Math.PI / 2;
  group.add(cockpit);
  
  // Heavy-duty wings/side armor
  const wingGeometry = new THREE.BoxGeometry(3.5, 0.3, 1.5);
  const wingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x882222,
    metalness: 0.7,
    roughness: 0.5
  });
  const wings = new THREE.Mesh(wingGeometry, wingMaterial);
  wings.position.set(0, -0.1, 0.2);
  group.add(wings);
  
  // Multiple engine exhausts - powerful thrusters
  const enginePositions = [
    [-0.8, -0.2, 1.3],
    [-0.3, -0.2, 1.3],
    [0.3, -0.2, 1.3],
    [0.8, -0.2, 1.3]
  ];
  
  const engineGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.4, 8);
  const engineMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    emissive: 0xff3300,
    emissiveIntensity: 1.2,
    metalness: 0.9,
    roughness: 0.3
  });
  
  enginePositions.forEach(position => {
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.position.set(position[0], position[1], position[2]);
    engine.rotation.x = Math.PI / 2;
    group.add(engine);
    
    // Add engine glow
    const glowGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      transparent: true,
      opacity: 0.8
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(position[0], position[1], position[2] + 0.3);
    group.add(glow);
  });
  
  // Add weapon turrets
  const turretPositions = [
    [-0.8, 0.5, -0.5],
    [0.8, 0.5, -0.5],
    [0, 0.6, 0.5]
  ];
  
  turretPositions.forEach(position => {
    // Turret base
    const baseGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.9,
      roughness: 0.2
    });
    
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(position[0], position[1], position[2]);
    group.add(base);
    
    // Turret gun
    const gunGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.3);
    const gunMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.9,
      roughness: 0.2
    });
    
    const gun = new THREE.Mesh(gunGeometry, gunMaterial);
    gun.position.set(position[0], position[1] + 0.1, position[2] - 0.1);
    group.add(gun);
  });
  
  // Cast shadows from all parts
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  
  return group;
}

/**
 * Creates an explorer ship designed for scientific missions
 */
function createExplorerShip(group: THREE.Group): THREE.Group {
  // Explorer ships are scientific vessels with sensor arrays and equipment
  
  // Cylindrical main hull - like a science vessel
  const hullGeometry = new THREE.CylinderGeometry(0.7, 0.7, 2.5, 12);
  const hullMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xdddddd, 
    metalness: 0.7, 
    roughness: 0.3
  });
  const hull = new THREE.Mesh(hullGeometry, hullMaterial);
  hull.rotation.x = Math.PI / 2; // Rotate to point forward
  group.add(hull);
  
  // Large observation dome/cockpit
  const cockpitGeometry = new THREE.SphereGeometry(0.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const cockpitMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xaaddff, 
    transparent: true, 
    opacity: 0.8,
    metalness: 0.1,
    roughness: 0.1
  });
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  cockpit.position.set(0, 0.3, -1.0);
  cockpit.rotation.x = -Math.PI / 2;
  group.add(cockpit);
  
  // Sensor arrays and scientific equipment
  const sensorRingGeometry = new THREE.TorusGeometry(0.9, 0.05, 8, 24);
  const sensorRingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x88aaff,
    metalness: 0.8,
    roughness: 0.2
  });
  const sensorRing = new THREE.Mesh(sensorRingGeometry, sensorRingMaterial);
  sensorRing.position.set(0, 0, 0);
  sensorRing.rotation.x = Math.PI / 2;
  group.add(sensorRing);
  
  // Add sensor dishes and antennas
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.cos(angle) * 0.9;
    const y = Math.sin(angle) * 0.9;
    
    // Alternating sensor types
    if (i % 2 === 0) {
      // Dish sensors
      const dishGeometry = new THREE.SphereGeometry(0.15, 8, 8, 0, Math.PI);
      const dishMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaccff,
        metalness: 0.7,
        roughness: 0.3
      });
      
      const dish = new THREE.Mesh(dishGeometry, dishMaterial);
      dish.position.set(x, y, 0);
      // Rotate to face outward
      dish.lookAt(new THREE.Vector3(x * 2, y * 2, 0));
      group.add(dish);
    } else {
      // Antenna sensors
      const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.4, 4);
      const antennaMaterial = new THREE.MeshStandardMaterial({
        color: 0x999999,
        metalness: 0.8,
        roughness: 0.2
      });
      
      const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
      antenna.position.set(x, y, 0);
      // Rotate to point outward
      antenna.lookAt(new THREE.Vector3(x * 2, y * 2, 0));
      antenna.rotateX(Math.PI / 2);
      group.add(antenna);
      
      // Antenna tip
      const tipGeometry = new THREE.SphereGeometry(0.03, 4, 4);
      const tipMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5
      });
      
      const tip = new THREE.Mesh(tipGeometry, tipMaterial);
      tip.position.set(x * 1.1, y * 1.1, 0);
      group.add(tip);
    }
  }
  
  // Solar panels/wings
  const panelGeometry = new THREE.BoxGeometry(3, 0.05, 1);
  const panelMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2244aa,
    metalness: 0.6,
    roughness: 0.3
  });
  const panels = new THREE.Mesh(panelGeometry, panelMaterial);
  panels.position.set(0, 0, 0.2);
  
  // Add solar cell texture pattern
  const panelDetailsGeometry = new THREE.BoxGeometry(2.8, 0.06, 0.8);
  const panelDetailsMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1133aa,
    metalness: 0.7,
    roughness: 0.2
  });
  const panelDetails = new THREE.Mesh(panelDetailsGeometry, panelDetailsMaterial);
  panelDetails.position.set(0, 0, 0.2);
  
  group.add(panels);
  group.add(panelDetails);
  
  // Efficient engines
  const engineGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8);
  const engineMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    emissive: 0x0088ff,
    emissiveIntensity: 1.0,
    metalness: 0.9,
    roughness: 0.2
  });
  
  // Left engine
  const engineLeft = new THREE.Mesh(engineGeometry, engineMaterial);
  engineLeft.position.set(-0.3, 0, 1.3);
  engineLeft.rotation.x = Math.PI / 2;
  group.add(engineLeft);
  
  // Right engine
  const engineRight = new THREE.Mesh(engineGeometry, engineMaterial);
  engineRight.position.set(0.3, 0, 1.3);
  engineRight.rotation.x = Math.PI / 2;
  group.add(engineRight);
  
  // Engine glow
  const glowGeometry = new THREE.SphereGeometry(0.12, 8, 8);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x0088ff,
    transparent: true,
    opacity: 0.7
  });
  
  const glowLeft = new THREE.Mesh(glowGeometry, glowMaterial);
  glowLeft.position.set(-0.3, 0, 1.55);
  group.add(glowLeft);
  
  const glowRight = new THREE.Mesh(glowGeometry, glowMaterial);
  glowRight.position.set(0.3, 0, 1.55);
  group.add(glowRight);
  
  // Cast shadows from all parts
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  
  return group;
}

/**
 * Creates a stealthy ship with angular, radar-deflecting surfaces
 */
function createStealthShip(group: THREE.Group): THREE.Group {
  // Stealth ships have angular, faceted surfaces to deflect radar
  
  // Create a faceted, angular hull shape
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-0.5, -1);
  hullShape.lineTo(0.5, -1);
  hullShape.lineTo(0.25, 1);
  hullShape.lineTo(-0.25, 1);
  hullShape.lineTo(-0.5, -1);
  
  const extrudeSettings = {
    steps: 1,
    depth: 2,
    bevelEnabled: false
  };
  
  const hullGeometry = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
  hullGeometry.rotateX(Math.PI / 2);
  hullGeometry.translate(0, 0, -1);
  
  const hullMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x222222, 
    metalness: 0.9, 
    roughness: 0.1
  });
  const hull = new THREE.Mesh(hullGeometry, hullMaterial);
  group.add(hull);
  
  // Angular cockpit
  const cockpitGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.4);
  cockpitGeometry.translate(0, 0.2, -0.7);
  
  // Note: In Three.js r125+ we would modify vertex positions using attributes
  // For now, we'll use the geometry as is
  // If we wanted to make this more angular, we would use:
  // const positionAttribute = cockpitGeometry.getAttribute('position');
  // for specific vertices we would modify their z coordinates
  
  const cockpitMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x444466, 
    transparent: true, 
    opacity: 0.6,
    metalness: 0.8,
    roughness: 0.2
  });
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  group.add(cockpit);
  
  // Angular wings
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(1.5, -0.8);
  wingShape.lineTo(1.5, -1);
  wingShape.lineTo(0.2, -0.3);
  wingShape.lineTo(0, 0);
  
  const wingExtrudeSettings = {
    steps: 1,
    depth: 0.05,
    bevelEnabled: false
  };
  
  // Left wing
  const leftWingGeometry = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
  const rightWingGeometry = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
  rightWingGeometry.scale(-1, 1, 1); // Mirror for right wing
  
  const wingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x111111,
    metalness: 0.9,
    roughness: 0.1
  });
  
  const leftWing = new THREE.Mesh(leftWingGeometry, wingMaterial);
  leftWing.rotation.set(Math.PI / 2, 0, 0);
  leftWing.position.set(-0.5, 0, 0);
  group.add(leftWing);
  
  const rightWing = new THREE.Mesh(rightWingGeometry, wingMaterial);
  rightWing.rotation.set(Math.PI / 2, 0, 0);
  rightWing.position.set(0.5, 0, 0);
  group.add(rightWing);
  
  // Specialized stealth engines with minimal signature
  const engineGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.2);
  const engineMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    emissive: 0x220066,
    emissiveIntensity: 0.5,
    metalness: 0.9,
    roughness: 0.1
  });
  
  // Left engine
  const engineLeft = new THREE.Mesh(engineGeometry, engineMaterial);
  engineLeft.position.set(-0.4, -0.1, 0.9);
  group.add(engineLeft);
  
  // Right engine
  const engineRight = new THREE.Mesh(engineGeometry, engineMaterial);
  engineRight.position.set(0.4, -0.1, 0.9);
  group.add(engineRight);
  
  // Subtle engine glow
  const glowGeometry = new THREE.PlaneGeometry(0.3, 0.1);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x330066,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  
  const glowLeft = new THREE.Mesh(glowGeometry, glowMaterial);
  glowLeft.position.set(-0.4, -0.1, 1.0);
  glowLeft.rotation.x = Math.PI / 2;
  group.add(glowLeft);
  
  const glowRight = new THREE.Mesh(glowGeometry, glowMaterial);
  glowRight.position.set(0.4, -0.1, 1.0);
  glowRight.rotation.x = Math.PI / 2;
  group.add(glowRight);
  
  // Add angular sensor array
  const sensorGeometry = new THREE.ConeGeometry(0.1, 0.3, 4);
  const sensorMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.9,
    roughness: 0.1
  });
  
  const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
  sensor.position.set(0, 0.3, -0.9);
  sensor.rotation.x = Math.PI;
  group.add(sensor);
  
  // Cast shadows from all parts
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  
  return group;
}