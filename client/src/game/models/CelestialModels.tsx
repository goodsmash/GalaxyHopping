import * as THREE from 'three';
import { StellarObjectType, NebulaType, ExoticObjectType } from '../types';

/**
 * Creates a star model based on the specified star type
 * @param type - The type of stellar object to create
 * @param size - Scale factor for the star (default: 1)
 * @param color - Optional color override
 * @returns A Three.js Group containing the star model
 */
export function createStarModel(
  type: StellarObjectType, 
  size: number = 1,
  color?: THREE.Color
): THREE.Group {
  // Create a group to hold the star and its effects
  const starGroup = new THREE.Group();
  
  // Set default star color based on type if not provided
  if (!color) {
    color = getStarColor(type);
  }
  
  // Create the base star sphere
  const starGeometry = new THREE.SphereGeometry(size, 32, 32);
  const starMaterial = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 1,
    roughness: 0.7,
    metalness: 0,
  });
  
  const starMesh = new THREE.Mesh(starGeometry, starMaterial);
  starGroup.add(starMesh);
  
  // Add type-specific features
  switch (type) {
    case 'main_sequence':
      // Add solar flares/prominences for main sequence stars
      addSolarProminences(starGroup, size, color);
      break;
      
    case 'red_giant':
      // Add glowing outer atmosphere for red giants
      addGlowingAtmosphere(starGroup, size * 1.3, color);
      break;
      
    case 'supergiant':
      // Add massive atmosphere and plasma ejections
      addGlowingAtmosphere(starGroup, size * 1.5, color);
      addPlasmaClouds(starGroup, size, color);
      break;
      
    case 'white_dwarf':
      // Add intense glow for white dwarfs
      addIntenseGlow(starGroup, size, color);
      break;
      
    case 'neutron_star':
      // Add pulsing effect and radiation beams for neutron stars
      addNeutronStarEffects(starGroup, size, color);
      break;
      
    case 'black_hole':
      // Create accretion disk and event horizon for black holes
      createBlackHole(starGroup, size);
      break;
      
    case 'protostar':
      // Add nebulous cloud and formation effects
      addProtosarFormation(starGroup, size, color);
      break;
      
    case 'brown_dwarf':
      // Dim glow and mottled surface for brown dwarfs
      addMottledSurface(starGroup, size, color);
      break;
  }
  
  return starGroup;
}

/**
 * Creates a nebula model based on the specified nebula type
 * @param type - The type of nebula to create
 * @param size - Scale factor for the nebula (default: 10)
 * @param color - Optional color override
 * @returns A Three.js Group containing the nebula model
 */
export function createNebulaModel(
  type: NebulaType,
  size: number = 10,
  color?: THREE.Color
): THREE.Group {
  // Create a group to hold the nebula components
  const nebulaGroup = new THREE.Group();
  
  // Set default nebula color based on type if not provided
  if (!color) {
    color = getNebulaColor(type);
  }
  
  switch (type) {
    case 'emission':
      createEmissionNebula(nebulaGroup, size, color);
      break;
      
    case 'reflection':
      createReflectionNebula(nebulaGroup, size, color);
      break;
      
    case 'dark':
      createDarkNebula(nebulaGroup, size);
      break;
      
    case 'planetary':
      createPlanetaryNebula(nebulaGroup, size, color);
      break;
      
    case 'supernova_remnant':
      createSupernovaRemnant(nebulaGroup, size, color);
      break;
  }
  
  return nebulaGroup;
}

/**
 * Creates an exotic space object model
 * @param type - The type of exotic object to create
 * @param size - Scale factor for the object (default: 1)
 * @param color - Optional color override
 * @returns A Three.js Group containing the exotic object model
 */
export function createExoticObjectModel(
  type: ExoticObjectType,
  size: number = 1,
  color?: THREE.Color
): THREE.Group {
  // Create a group to hold the exotic object
  const objectGroup = new THREE.Group();
  
  switch (type) {
    case 'wormhole':
      createWormhole(objectGroup, size, color);
      break;
      
    case 'magnetar':
      createMagnetar(objectGroup, size, color);
      break;
      
    case 'gamma_ray_burst':
      createGammaRayBurst(objectGroup, size, color);
      break;
      
    case 'gravitational_lens':
      createGravitationalLens(objectGroup, size);
      break;
      
    case 'cosmic_microwave_background':
      createCosmicMicrowaveBackground(objectGroup, size);
      break;
  }
  
  return objectGroup;
}

// ======================== HELPER FUNCTIONS ======================== //

/**
 * Gets an appropriate color for a star based on its type
 */
function getStarColor(type: StellarObjectType): THREE.Color {
  switch (type) {
    case 'protostar':
      return new THREE.Color(0xff6633); // Orange-red
    case 'main_sequence':
      return new THREE.Color(0xffee66); // Yellow-white like our sun
    case 'red_giant':
      return new THREE.Color(0xff3300); // Deep red
    case 'supergiant':
      return new THREE.Color(0xff5500); // Bright orange-red
    case 'white_dwarf':
      return new THREE.Color(0xaaddff); // Pale blue-white
    case 'neutron_star':
      return new THREE.Color(0x99ccff); // Blue-white
    case 'black_hole':
      return new THREE.Color(0x000000); // Black (though it will be visualized differently)
    case 'brown_dwarf':
      return new THREE.Color(0x994422); // Dark reddish-brown
    default:
      return new THREE.Color(0xffffff); // Default white
  }
}

/**
 * Gets an appropriate color for a nebula based on its type
 */
function getNebulaColor(type: NebulaType): THREE.Color {
  switch (type) {
    case 'emission':
      return new THREE.Color(0xff3366); // Pink/red (hydrogen emission)
    case 'reflection':
      return new THREE.Color(0x3366ff); // Blue (reflecting starlight)
    case 'dark':
      return new THREE.Color(0x222222); // Very dark (dust clouds)
    case 'planetary':
      return new THREE.Color(0x33ff99); // Teal/green
    case 'supernova_remnant':
      return new THREE.Color(0xff6633); // Orange/red
    default:
      return new THREE.Color(0xaaaaaa); // Default gray
  }
}

// ======================== STAR EFFECT FUNCTIONS ======================== //

/**
 * Adds solar prominences (flares) to a star
 */
function addSolarProminences(group: THREE.Group, size: number, color: THREE.Color): void {
  // Create several loop-like prominences around the star
  const loopCount = 5;
  
  for (let i = 0; i < loopCount; i++) {
    // Create a curved path for the prominence
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, size, 0),
      new THREE.Vector3(size * 1.5, size * 1.5, 0),
      new THREE.Vector3(size * 2, 0, 0),
      new THREE.Vector3(0, -size, 0)
    );
    
    const points = curve.getPoints(20);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const prominenceMaterial = new THREE.LineBasicMaterial({
      color: color,
      opacity: 0.7,
      transparent: true
    });
    
    const prominence = new THREE.Line(geometry, prominenceMaterial);
    
    // Rotate each prominence to a different position around the star
    prominence.rotation.y = (i / loopCount) * Math.PI * 2;
    prominence.rotation.z = Math.random() * Math.PI;
    
    group.add(prominence);
  }
}

/**
 * Adds a glowing atmosphere around a star
 */
function addGlowingAtmosphere(group: THREE.Group, size: number, color: THREE.Color): void {
  // Create a larger, transparent sphere for the atmosphere
  const atmosphereGeometry = new THREE.SphereGeometry(size * 1.2, 32, 32);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide // Render the inside of the sphere
  });
  
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  group.add(atmosphere);
  
  // Add a second, even larger and more transparent atmosphere layer
  const outerAtmosphereGeometry = new THREE.SphereGeometry(size * 1.5, 32, 32);
  const outerAtmosphereMaterial = new THREE.MeshBasicMaterial({
    color: color.clone().offsetHSL(0, -0.2, 0.2), // Lighter, less saturated color
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  
  const outerAtmosphere = new THREE.Mesh(outerAtmosphereGeometry, outerAtmosphereMaterial);
  group.add(outerAtmosphere);
}

/**
 * Adds plasma clouds around a supergiant star
 */
function addPlasmaClouds(group: THREE.Group, size: number, color: THREE.Color): void {
  // Create several blobs of plasma ejected from the star
  const cloudCount = 7;
  
  for (let i = 0; i < cloudCount; i++) {
    // Random position around the star, but outside its surface
    const distance = size * (1.2 + Math.random() * 0.8);
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    
    const x = distance * Math.sin(theta) * Math.cos(phi);
    const y = distance * Math.sin(theta) * Math.sin(phi);
    const z = distance * Math.cos(theta);
    
    // Create an irregular cloud shape
    const cloudGeometry = new THREE.SphereGeometry(
      size * (0.1 + Math.random() * 0.3), // Random size
      8, 8
    );
    
    // Distort the geometry to make it more irregular
    const positions = cloudGeometry.attributes.position.array;
    for (let j = 0; j < positions.length; j += 3) {
      positions[j] += (Math.random() - 0.5) * size * 0.1;
      positions[j + 1] += (Math.random() - 0.5) * size * 0.1;
      positions[j + 2] += (Math.random() - 0.5) * size * 0.1;
    }
    
    const cloudMaterial = new THREE.MeshBasicMaterial({
      color: color.clone().offsetHSL(0, -0.3, 0.2), // Lighter version of star color
      transparent: true,
      opacity: 0.4 + Math.random() * 0.3
    });
    
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloud.position.set(x, y, z);
    
    group.add(cloud);
  }
}

/**
 * Adds an intense glow effect for white dwarfs
 */
function addIntenseGlow(group: THREE.Group, size: number, color: THREE.Color): void {
  // Create a series of transparent shells for the glow effect
  const glowLayers = 4;
  
  for (let i = 0; i < glowLayers; i++) {
    const layerSize = size * (1 + 0.2 * (i + 1));
    const glowGeometry = new THREE.SphereGeometry(layerSize, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color.clone().lerp(new THREE.Color(0xffffff), 0.3 * i), // Get brighter with each layer
      transparent: true,
      opacity: 0.2 - (i * 0.04), // Fade out with each layer
      side: THREE.BackSide
    });
    
    const glowLayer = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glowLayer);
  }
  
  // Add a bright central point
  const coreGeometry = new THREE.SphereGeometry(size * 0.5, 16, 16);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 2
  });
  
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(core);
}

/**
 * Adds neutron star-specific effects like pulsing beams
 */
function addNeutronStarEffects(group: THREE.Group, size: number, color: THREE.Color): void {
  // Add a bright, dense core
  const coreGeometry = new THREE.SphereGeometry(size, 32, 32);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 1.5,
    metalness: 0.8,
    roughness: 0.2
  });
  
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(core);
  
  // Add radiation beams along magnetic poles
  const beamGeometry = new THREE.CylinderGeometry(0, size * 0.7, size * 10, 16, 1, true);
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: color.clone().lerp(new THREE.Color(0xffffff), 0.5),
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  
  // First beam along one pole
  const beam1 = new THREE.Mesh(beamGeometry, beamMaterial);
  beam1.position.set(0, size * 5, 0);
  beam1.rotation.x = Math.PI;
  group.add(beam1);
  
  // Second beam along opposite pole
  const beam2 = new THREE.Mesh(beamGeometry, beamMaterial);
  beam2.position.set(0, -size * 5, 0);
  group.add(beam2);
  
  // Magnetic field lines
  const fieldCount = 12;
  
  for (let i = 0; i < fieldCount; i++) {
    const angle = (i / fieldCount) * Math.PI * 2;
    const xStart = Math.cos(angle) * size;
    const zStart = Math.sin(angle) * size;
    
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(xStart, size, zStart),
      new THREE.Vector3(xStart * 2, size * 3, zStart * 2),
      new THREE.Vector3(-xStart * 2, -size * 3, -zStart * 2),
      new THREE.Vector3(-xStart, -size, -zStart)
    );
    
    const points = curve.getPoints(20);
    const fieldGeometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const fieldMaterial = new THREE.LineBasicMaterial({
      color: 0x6699ff,
      transparent: true,
      opacity: 0.4
    });
    
    const fieldLine = new THREE.Line(fieldGeometry, fieldMaterial);
    group.add(fieldLine);
  }
}

/**
 * Creates a black hole with accretion disk and event horizon
 */
function createBlackHole(group: THREE.Group, size: number): void {
  // Event horizon - a completely black sphere
  const horizonGeometry = new THREE.SphereGeometry(size, 32, 32);
  const horizonMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: false,
    side: THREE.FrontSide
  });
  
  const horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
  group.add(horizon);
  
  // Accretion disk - a glowing, rotating ring of matter
  const diskGeometry = new THREE.RingGeometry(size * 2, size * 5, 64);
  const diskMaterial = new THREE.MeshBasicMaterial({
    color: 0xff3300,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7
  });
  
  const disk = new THREE.Mesh(diskGeometry, diskMaterial);
  disk.rotation.x = Math.PI / 2;
  group.add(disk);
  
  // Add a subtle distortion effect for the area around the black hole
  const distortionGeometry = new THREE.SphereGeometry(size * 1.5, 32, 32);
  const distortionMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  
  const distortion = new THREE.Mesh(distortionGeometry, distortionMaterial);
  group.add(distortion);
  
  // Jets - relativistic particle beams often emitted by active black holes
  const jetGeometry = new THREE.CylinderGeometry(0, size * 0.5, size * 15, 16, 1, true);
  const jetMaterial = new THREE.MeshBasicMaterial({
    color: 0x6699ff,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  
  const jet1 = new THREE.Mesh(jetGeometry, jetMaterial);
  jet1.position.set(0, size * 7.5, 0);
  jet1.rotation.x = Math.PI;
  group.add(jet1);
  
  const jet2 = new THREE.Mesh(jetGeometry, jetMaterial);
  jet2.position.set(0, -size * 7.5, 0);
  group.add(jet2);
}

/**
 * Adds protostar formation effects - nebulous clouds and accreting matter
 */
function addProtosarFormation(group: THREE.Group, size: number, color: THREE.Color): void {
  // The central forming star
  const coreGeometry = new THREE.SphereGeometry(size * 0.7, 32, 32);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.5, // Less intense than a main sequence star
    roughness: 0.7
  });
  
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(core);
  
  // Surrounding gas and dust cloud
  const cloudGeometry = new THREE.SphereGeometry(size * 2, 32, 32);
  const cloudMaterial = new THREE.MeshBasicMaterial({
    color: color.clone().lerp(new THREE.Color(0x775533), 0.5), // Mix with dust color
    transparent: true,
    opacity: 0.5,
    side: THREE.BackSide
  });
  
  const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
  group.add(cloud);
  
  // Accretion disk - matter falling into the forming star
  const diskGeometry = new THREE.RingGeometry(size, size * 3, 64);
  const diskMaterial = new THREE.MeshBasicMaterial({
    color: color.clone().lerp(new THREE.Color(0x553322), 0.3),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7
  });
  
  const disk = new THREE.Mesh(diskGeometry, diskMaterial);
  disk.rotation.x = Math.PI / 2;
  group.add(disk);
  
  // Add some dust particles in the surrounding area
  const particleCount = 100;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = size * (2 + Math.random() * 2);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    particlePositions[i3 + 2] = radius * Math.cos(phi);
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xaa7744,
    size: size * 0.1,
    transparent: true,
    opacity: 0.7
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  group.add(particles);
}

/**
 * Adds a mottled surface texture to brown dwarfs
 */
function addMottledSurface(group: THREE.Group, size: number, color: THREE.Color): void {
  // Create the basic brown dwarf sphere
  const dwarfGeometry = new THREE.SphereGeometry(size, 32, 32);
  
  // Use vertex colors to create a mottled surface pattern
  const colorAttribute = new THREE.BufferAttribute(
    new Float32Array(dwarfGeometry.attributes.position.count * 3), 
    3
  );
  
  for (let i = 0; i < dwarfGeometry.attributes.position.count; i++) {
    // Base color
    const baseColor = color.clone();
    
    // Add random color variation
    const noiseValue = Math.random() * 0.2 - 0.1; // -0.1 to 0.1
    baseColor.offsetHSL(0, 0, noiseValue);
    
    colorAttribute.setXYZ(i, baseColor.r, baseColor.g, baseColor.b);
  }
  
  dwarfGeometry.setAttribute('color', colorAttribute);
  
  const dwarfMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    emissive: color.clone().multiplyScalar(0.3), // Dim glow
    emissiveIntensity: 0.3,
    roughness: 0.9,
    metalness: 0.1
  });
  
  const dwarf = new THREE.Mesh(dwarfGeometry, dwarfMaterial);
  group.add(dwarf);
  
  // Add a very subtle atmosphere
  const atmosphereGeometry = new THREE.SphereGeometry(size * 1.05, 32, 32);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  group.add(atmosphere);
}

// ======================== NEBULA CREATION FUNCTIONS ======================== //

/**
 * Creates an emission nebula (glowing gas, often pink/red from hydrogen)
 */
function createEmissionNebula(group: THREE.Group, size: number, color: THREE.Color): void {
  // Create multiple cloud layers with different colors and opacities
  const cloudCount = 5;
  
  for (let i = 0; i < cloudCount; i++) {
    // Create an irregular cloud shape using a distorted sphere
    const cloudGeometry = new THREE.SphereGeometry(
      size * (0.5 + Math.random() * 0.5), // Varying sizes
      16, 16
    );
    
    // Distort the geometry to make it more nebula-like
    const positions = cloudGeometry.attributes.position.array;
    for (let j = 0; j < positions.length; j += 3) {
      positions[j] += (Math.random() - 0.5) * size * 0.4;
      positions[j + 1] += (Math.random() - 0.5) * size * 0.4;
      positions[j + 2] += (Math.random() - 0.5) * size * 0.4;
    }
    
    // Vary the color slightly for each cloud layer
    const cloudColor = color.clone().offsetHSL(
      (Math.random() - 0.5) * 0.1, // Slight hue variation
      Math.random() * 0.2, // Saturation variation
      Math.random() * 0.2  // Lightness variation
    );
    
    const cloudMaterial = new THREE.MeshBasicMaterial({
      color: cloudColor,
      transparent: true,
      opacity: 0.15 + Math.random() * 0.2,
      side: THREE.DoubleSide
    });
    
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    
    // Position the cloud layer randomly within the nebula volume
    const distance = size * Math.random() * 0.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    cloud.position.set(
      distance * Math.sin(phi) * Math.cos(theta),
      distance * Math.sin(phi) * Math.sin(theta),
      distance * Math.cos(phi)
    );
    
    group.add(cloud);
  }
  
  // Add bright stars within the nebula
  const starCount = 20;
  const starGeometry = new THREE.SphereGeometry(size * 0.02, 8, 8);
  const starMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    emissive: 0xffffff
  });
  
  for (let i = 0; i < starCount; i++) {
    const star = new THREE.Mesh(starGeometry, starMaterial);
    
    // Position stars randomly throughout the nebula
    const distance = size * Math.random() * 0.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    star.position.set(
      distance * Math.sin(phi) * Math.cos(theta),
      distance * Math.sin(phi) * Math.sin(theta),
      distance * Math.cos(phi)
    );
    
    star.scale.set(
      0.5 + Math.random() * 2,
      0.5 + Math.random() * 2,
      0.5 + Math.random() * 2
    );
    
    group.add(star);
  }
}

/**
 * Creates a reflection nebula (dust reflecting blue starlight)
 */
function createReflectionNebula(group: THREE.Group, size: number, color: THREE.Color): void {
  // Create wispy, thin clouds in layers
  const cloudCount = 7;
  
  for (let i = 0; i < cloudCount; i++) {
    // Create irregular cloud shapes
    const cloudGeometry = new THREE.SphereGeometry(
      size * (0.6 + Math.random() * 0.4),
      12, 12
    );
    
    // Make the clouds more wispy and irregular
    const positions = cloudGeometry.attributes.position.array;
    for (let j = 0; j < positions.length; j += 3) {
      positions[j] += (Math.random() - 0.5) * size * 0.6;
      positions[j + 1] += (Math.random() - 0.5) * size * 0.6;
      positions[j + 2] += (Math.random() - 0.5) * size * 0.6;
    }
    
    // Reflection nebulae are typically bluer than emission nebulae
    const cloudColor = color.clone().offsetHSL(
      0, // Keep the hue
      -0.1 + Math.random() * 0.2, // Slight saturation variation
      Math.random() * 0.3  // Varying lightness
    );
    
    const cloudMaterial = new THREE.MeshBasicMaterial({
      color: cloudColor,
      transparent: true,
      opacity: 0.1 + Math.random() * 0.15, // More transparent than emission nebulae
      side: THREE.DoubleSide
    });
    
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    
    // Position randomly
    const distance = size * Math.random() * 0.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    cloud.position.set(
      distance * Math.sin(phi) * Math.cos(theta),
      distance * Math.sin(phi) * Math.sin(theta),
      distance * Math.cos(phi)
    );
    
    group.add(cloud);
  }
  
  // Add a bright central star that's illuminating the nebula
  const centralStarGeometry = new THREE.SphereGeometry(size * 0.05, 16, 16);
  const centralStarMaterial = new THREE.MeshBasicMaterial({
    color: 0xaabbff, // Bright blue-white star
    emissive: 0xaabbff,
    emissiveIntensity: 1.5
  });
  
  const centralStar = new THREE.Mesh(centralStarGeometry, centralStarMaterial);
  group.add(centralStar);
  
  // Add a glow around the central star
  const glowGeometry = new THREE.SphereGeometry(size * 0.15, 16, 16);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xaabbff,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide
  });
  
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  group.add(glow);
}

/**
 * Creates a dark nebula (dense cloud of dust that blocks light)
 */
function createDarkNebula(group: THREE.Group, size: number): void {
  // Dark nebulae are dust clouds that block light from stars behind them
  // Create a dense, dark cloud
  const cloudGeometry = new THREE.SphereGeometry(size, 32, 32);
  
  // Distort the geometry to create an irregular shape
  const positions = cloudGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += (Math.random() - 0.5) * size * 0.8;
    positions[i + 1] += (Math.random() - 0.5) * size * 0.8;
    positions[i + 2] += (Math.random() - 0.5) * size * 0.8;
  }
  
  // Dark, dense material
  const cloudMaterial = new THREE.MeshBasicMaterial({
    color: 0x222222, // Very dark
    transparent: true,
    opacity: 0.8, // Dense enough to block light
    side: THREE.DoubleSide
  });
  
  const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
  group.add(cloud);
  
  // Add some random dust particles throughout the volume
  const particleCount = 200;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = size * Math.random();
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    particlePositions[i3 + 2] = radius * Math.cos(phi);
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x333333, // Dark dust
    size: size * 0.05,
    transparent: true,
    opacity: 0.7
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  group.add(particles);
  
  // Add a few stars visible in front of or within the edges of the nebula
  const starCount = 10;
  const starGeometry = new THREE.SphereGeometry(size * 0.01, 8, 8);
  const starMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    emissive: 0xffffff
  });
  
  for (let i = 0; i < starCount; i++) {
    const star = new THREE.Mesh(starGeometry, starMaterial);
    
    // Position mostly around the edges
    const radius = size * (0.8 + Math.random() * 0.4); // Mostly around the periphery
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    star.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );
    
    group.add(star);
  }
}

/**
 * Creates a planetary nebula (glowing shell of gas ejected by a dying star)
 */
function createPlanetaryNebula(group: THREE.Group, size: number, color: THREE.Color): void {
  // Planetary nebulae are shells of gas ejected by dying stars
  
  // Central white dwarf star
  const starGeometry = new THREE.SphereGeometry(size * 0.05, 16, 16);
  const starMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1.5
  });
  
  const star = new THREE.Mesh(starGeometry, starMaterial);
  group.add(star);
  
  // Create multiple shell layers
  const shellCount = 3;
  
  for (let i = 0; i < shellCount; i++) {
    const shellRadius = size * (0.5 + i * 0.3);
    const shellGeometry = new THREE.SphereGeometry(shellRadius, 32, 32);
    
    // Distort the shell geometry to create irregularities
    const positions = shellGeometry.attributes.position.array;
    for (let j = 0; j < positions.length; j += 3) {
      const distortAmount = size * 0.1;
      positions[j] += (Math.random() - 0.5) * distortAmount;
      positions[j + 1] += (Math.random() - 0.5) * distortAmount;
      positions[j + 2] += (Math.random() - 0.5) * distortAmount;
    }
    
    // Vary the color for each shell layer
    const shellColor = color.clone().offsetHSL(
      (Math.random() - 0.5) * 0.1, // Slight hue variation
      Math.random() * 0.2, // Saturation variation
      Math.random() * 0.2  // Lightness variation
    );
    
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: shellColor,
      transparent: true,
      opacity: 0.15 + (i * 0.05), // Outer shells slightly more opaque
      side: THREE.DoubleSide
    });
    
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    group.add(shell);
  }
  
  // Add a more detailed inner structure - often bipolar in planetary nebulae
  const innerGeometry = new THREE.SphereGeometry(size * 0.3, 16, 16);
  
  // Create a more complex shape by distorting a sphere
  const positions = innerGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Calculate distance from Y axis
    const distFromAxis = Math.sqrt(x * x + z * z);
    
    // Expand points near the poles (along Y axis)
    if (Math.abs(y) > 0.5 * size * 0.3) {
      positions[i] *= 1.5;
      positions[i + 2] *= 1.5;
    }
    
    // Add some general distortion
    positions[i] += (Math.random() - 0.5) * size * 0.05;
    positions[i + 1] += (Math.random() - 0.5) * size * 0.05;
    positions[i + 2] += (Math.random() - 0.5) * size * 0.05;
  }
  
  const innerMaterial = new THREE.MeshBasicMaterial({
    color: color.clone().lerp(new THREE.Color(0xffffff), 0.3),
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  
  const innerStructure = new THREE.Mesh(innerGeometry, innerMaterial);
  group.add(innerStructure);
}

/**
 * Creates a supernova remnant (expanding shell from a stellar explosion)
 */
function createSupernovaRemnant(group: THREE.Group, size: number, color: THREE.Color): void {
  // Supernova remnants are expanding shells of gas and debris from exploded stars
  
  // Create an expanding, irregular shell
  const shellGeometry = new THREE.SphereGeometry(size, 32, 32);
  
  // Significantly distort the geometry to create a chaotic, expanding shell
  const positions = shellGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    // Get the normalized direction vector
    let x = positions[i];
    let y = positions[i + 1];
    let z = positions[i + 2];
    
    const length = Math.sqrt(x * x + y * y + z * z);
    x /= length;
    y /= length;
    z /= length;
    
    // Add a significant random displacement in the radial direction
    const radialDisplacement = Math.random() * size * 0.4;
    
    // Add smaller random displacements in all directions
    const randomX = (Math.random() - 0.5) * size * 0.2;
    const randomY = (Math.random() - 0.5) * size * 0.2;
    const randomZ = (Math.random() - 0.5) * size * 0.2;
    
    // Apply displacements
    positions[i] = x * (size + radialDisplacement) + randomX;
    positions[i + 1] = y * (size + radialDisplacement) + randomY;
    positions[i + 2] = z * (size + radialDisplacement) + randomZ;
  }
  
  const shellMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
    wireframe: true // Use wireframe to create a more chaotic, filamentary look
  });
  
  const shell = new THREE.Mesh(shellGeometry, shellMaterial);
  group.add(shell);
  
  // Add dense filaments and knots of gas
  const filamentCount = 15;
  
  for (let i = 0; i < filamentCount; i++) {
    // Create irregular blob shapes for filaments
    const filamentGeometry = new THREE.SphereGeometry(
      size * (0.1 + Math.random() * 0.2),
      8, 8
    );
    
    // Distort the geometry to make it more irregular
    const filPositions = filamentGeometry.attributes.position.array;
    for (let j = 0; j < filPositions.length; j += 3) {
      filPositions[j] += (Math.random() - 0.5) * size * 0.2;
      filPositions[j + 1] += (Math.random() - 0.5) * size * 0.2;
      filPositions[j + 2] += (Math.random() - 0.5) * size * 0.2;
    }
    
    // Hot, glowing gas colors
    const filamentColor = color.clone().offsetHSL(
      (Math.random() - 0.5) * 0.2, // Significant hue variation
      Math.random() * 0.3,
      Math.random() * 0.3
    );
    
    const filamentMaterial = new THREE.MeshBasicMaterial({
      color: filamentColor,
      transparent: true,
      opacity: 0.4 + Math.random() * 0.4
    });
    
    const filament = new THREE.Mesh(filamentGeometry, filamentMaterial);
    
    // Position filaments within the shell
    const radius = size * (0.5 + Math.random() * 0.5);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    filament.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );
    
    group.add(filament);
  }
  
  // Add expanding shock front
  const shockGeometry = new THREE.SphereGeometry(size * 1.2, 32, 32);
  const shockMaterial = new THREE.MeshBasicMaterial({
    color: 0xffddcc, // Shock-heated gas
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  
  const shock = new THREE.Mesh(shockGeometry, shockMaterial);
  group.add(shock);
  
  // Add central neutron star or pulsar remnant (or empty space for a black hole)
  if (Math.random() > 0.3) { // 70% chance of a neutron star remnant
    const remnantGeometry = new THREE.SphereGeometry(size * 0.02, 8, 8);
    const remnantMaterial = new THREE.MeshBasicMaterial({
      color: 0xccffff, // Blueish white
      emissive: 0xccffff,
      emissiveIntensity: 2
    });
    
    const remnant = new THREE.Mesh(remnantGeometry, remnantMaterial);
    group.add(remnant);
    
    // Add a pulsing glow for pulsars
    const glowGeometry = new THREE.SphereGeometry(size * 0.04, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xccffff,
      transparent: true,
      opacity: 0.7
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);
  }
}

// ======================== EXOTIC OBJECT CREATION FUNCTIONS ======================== //

/**
 * Creates a wormhole model with space distortion effects
 */
function createWormhole(group: THREE.Group, size: number, color?: THREE.Color): void {
  // If no color is specified, use a default
  if (!color) {
    color = new THREE.Color(0x6600ff); // Purple
  }
  
  // Create the wormhole mouth/event horizon
  const mouthGeometry = new THREE.CircleGeometry(size, 64);
  const mouthMaterial = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide
  });
  
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
  group.add(mouth);
  
  // Create a funnel shape leading into the wormhole
  const funnelGeometry = new THREE.TorusGeometry(size, size / 5, 16, 100, Math.PI * 2);
  
  // Distort the torus to create a funnel effect
  const positions = funnelGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    // Get the vertex position
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Calculate distance from center in the XY plane
    const distanceFromCenter = Math.sqrt(x * x + y * y);
    
    // Distort z based on distance (create funnel effect)
    positions[i + 2] = z - (distanceFromCenter * 0.5);
  }
  
  const funnelMaterial = new THREE.MeshBasicMaterial({
    color: color.clone().multiplyScalar(0.7), // Darker version of color
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
    wireframe: true // Wireframe helps create a space distortion effect
  });
  
  const funnel = new THREE.Mesh(funnelGeometry, funnelMaterial);
  funnel.rotation.x = Math.PI / 2;
  group.add(funnel);
  
  // Add swirling particles around the wormhole
  const particleCount = 1000;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // Create a spiral pattern
    const angle = Math.random() * Math.PI * 10; // Multiple rotations
    const radius = size * (0.5 + Math.random() * 1.5);
    
    // Spiral coordinates
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    // How far from the wormhole mouth (negative values go "inside")
    const z = (Math.random() - 0.5) * size;
    
    particlePositions[i3] = x;
    particlePositions[i3 + 1] = y;
    particlePositions[i3 + 2] = z;
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: color.clone().lerp(new THREE.Color(0xffffff), 0.5),
    size: size * 0.02,
    transparent: true,
    opacity: 0.7
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  group.add(particles);
  
  // Add a glow effect around the mouth
  const glowGeometry = new THREE.RingGeometry(size, size * 1.5, 64);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  group.add(glow);
}

/**
 * Creates a magnetar (extremely magnetic neutron star)
 */
function createMagnetar(group: THREE.Group, size: number, color?: THREE.Color): void {
  // If no color is specified, use a default
  if (!color) {
    color = new THREE.Color(0x00ccff); // Bright blue
  }
  
  // Create the dense neutron star core
  const coreGeometry = new THREE.SphereGeometry(size, 32, 32);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 1.5,
    metalness: 0.9,
    roughness: 0.2
  });
  
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(core);
  
  // Add intense magnetic field lines
  const fieldLineCount = 50;
  
  for (let i = 0; i < fieldLineCount; i++) {
    // Create magnetic field lines curving from one pole to the other
    
    // Start at random points near the poles
    const startPole = Math.random() > 0.5 ? 1 : -1; // North or south pole
    const startRadius = size * 0.1 * Math.random();
    const startTheta = Math.random() * Math.PI * 2;
    
    const startX = startRadius * Math.cos(startTheta);
    const startY = startPole * size;
    const startZ = startRadius * Math.sin(startTheta);
    
    // End at the opposite pole
    const endRadius = size * 0.1 * Math.random();
    const endTheta = Math.random() * Math.PI * 2;
    
    const endX = endRadius * Math.cos(endTheta);
    const endY = -startPole * size;
    const endZ = endRadius * Math.sin(endTheta);
    
    // Create a curved path using cubic Bezier
    // Control points curve outward to create an arcing field line
    const maxArc = size * (2 + Math.random() * 3); // How far the field lines extend
    
    const ctrl1X = startX * 2;
    const ctrl1Y = startY * 0.5;
    const ctrl1Z = startZ * 2;
    
    const ctrl2X = endX * 2;
    const ctrl2Y = endY * 0.5;
    const ctrl2Z = endZ * 2;
    
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(startX, startY, startZ),
      new THREE.Vector3(ctrl1X, ctrl1Y, ctrl1Z),
      new THREE.Vector3(ctrl2X, ctrl2Y, ctrl2Z),
      new THREE.Vector3(endX, endY, endZ)
    );
    
    const points = curve.getPoints(50);
    const fieldGeometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Color based on magnetic field strength (distance from center)
    const fieldColor = color.clone().lerp(
      new THREE.Color(0xffffff),
      0.3 + Math.random() * 0.3
    );
    
    const fieldMaterial = new THREE.LineBasicMaterial({
      color: fieldColor,
      transparent: true,
      opacity: 0.5
    });
    
    const fieldLine = new THREE.Line(fieldGeometry, fieldMaterial);
    group.add(fieldLine);
  }
  
  // Add energy beams along magnetic poles
  const beamGeometry = new THREE.CylinderGeometry(0, size * 0.5, size * 20, 16, 1, true);
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: color.clone().lerp(new THREE.Color(0xffffff), 0.5),
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  
  // Beam along north pole
  const beam1 = new THREE.Mesh(beamGeometry, beamMaterial);
  beam1.position.set(0, size * 10, 0);
  beam1.rotation.x = Math.PI;
  group.add(beam1);
  
  // Beam along south pole
  const beam2 = new THREE.Mesh(beamGeometry, beamMaterial);
  beam2.position.set(0, -size * 10, 0);
  group.add(beam2);
  
  // Add energy particles being accelerated along the magnetic field
  const particleCount = 200;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Create particles flowing along field lines
    const angle = Math.random() * Math.PI * 2;
    const radius = size * (0.5 + Math.random() * 5);
    const height = (Math.random() * 2 - 1) * size * 10;
    
    // Particles follow a spiral pattern outward from the magnetic poles
    const radiusFactor = Math.abs(height) / (size * 10); // Particles spread out as they move from poles
    
    particlePositions[i3] = Math.cos(angle) * radius * radiusFactor;
    particlePositions[i3 + 1] = height;
    particlePositions[i3 + 2] = Math.sin(angle) * radius * radiusFactor;
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: size * 0.05,
    transparent: true,
    opacity: 0.6
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  group.add(particles);
}

/**
 * Creates a gamma ray burst (intense beam of radiation)
 */
function createGammaRayBurst(group: THREE.Group, size: number, color?: THREE.Color): void {
  // If no color is specified, use a default
  if (!color) {
    color = new THREE.Color(0x00ffaa); // Bright cyan-green
  }
  
  // Create a central energy source (collapsed star or black hole)
  const sourceGeometry = new THREE.SphereGeometry(size * 0.2, 32, 32);
  const sourceMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000, // Black central object
    emissive: color,
    emissiveIntensity: 0.5
  });
  
  const source = new THREE.Mesh(sourceGeometry, sourceMaterial);
  group.add(source);
  
  // Create the main gamma ray jets
  const jetGeometry = new THREE.CylinderGeometry(size * 0.1, size * 2, size * 30, 16, 20, true);
  
  // Modify the jet geometry to create a beam that gets wider and more diffuse
  const positions = jetGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Distance from central axis
    const distFromAxis = Math.sqrt(x * x + z * z);
    
    // Add some random movement to particles further from the source
    if (y > 0) { // Only affect particles away from the source
      const distanceFactor = y / (size * 15); // 0 at center, 1 at end
      positions[i] += (Math.random() - 0.5) * distanceFactor * size * 0.5;
      positions[i + 2] += (Math.random() - 0.5) * distanceFactor * size * 0.5;
    }
  }
  
  const jetMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    wireframe: true
  });
  
  // First jet
  const jet1 = new THREE.Mesh(jetGeometry, jetMaterial);
  jet1.position.set(0, size * 15, 0);
  group.add(jet1);
  
  // Second jet in opposite direction
  const jet2 = new THREE.Mesh(jetGeometry, jetMaterial);
  jet2.position.set(0, -size * 15, 0);
  jet2.rotation.x = Math.PI; // Flip to point in opposite direction
  group.add(jet2);
  
  // Add particle effects within the jets
  const particleCount = 1000;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Determine which jet this particle belongs to
    const jetDirection = Math.random() > 0.5 ? 1 : -1;
    
    // Distance from source along jet
    const distance = Math.random() * size * 30;
    
    // Particles spread out as they move along the jet
    const spread = distance / (size * 30) * size * 2;
    const angle = Math.random() * Math.PI * 2;
    
    particlePositions[i3] = Math.cos(angle) * Math.random() * spread;
    particlePositions[i3 + 1] = jetDirection * distance;
    particlePositions[i3 + 2] = Math.sin(angle) * Math.random() * spread;
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: color.clone().lerp(new THREE.Color(0xffffff), 0.5),
    size: size * 0.1,
    transparent: true,
    opacity: 0.8
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  group.add(particles);
  
  // Add shock wave/energy ring expanding perpendicular to the jets
  const ringGeometry = new THREE.RingGeometry(size * 0.5, size * 3, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  group.add(ring);
}

/**
 * Creates a gravitational lensing effect
 */
function createGravitationalLens(group: THREE.Group, size: number): void {
  // Gravitational lensing is invisible, but we can represent it as a distortion effect
  
  // Create a sphere with distorted space-time representation
  const lensGeometry = new THREE.SphereGeometry(size, 32, 32);
  const lensMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.05, // Nearly invisible
    wireframe: true
  });
  
  const lens = new THREE.Mesh(lensGeometry, lensMaterial);
  group.add(lens);
  
  // Create concentric rings to show the gravity well
  const ringsCount = 5;
  for (let i = 0; i < ringsCount; i++) {
    const radius = size * (1 + i * 0.5);
    const ringGeometry = new THREE.RingGeometry(radius - 0.1, radius, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x4466ff,
      transparent: true,
      opacity: 0.2 - (i * 0.03),
      side: THREE.DoubleSide
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    
    // Tilt rings slightly for a more 3D effect
    ring.rotation.x = Math.PI / 2;
    ring.rotation.y = Math.random() * Math.PI * 0.1;
    
    group.add(ring);
  }
  
  // Add lensed background objects (distorted images of distant objects)
  const arcCount = 8;
  
  for (let i = 0; i < arcCount; i++) {
    // Create arced shapes to represent lensed galaxies
    const angle = (i / arcCount) * Math.PI * 2;
    const radius = size * 1.5;
    
    const arcX = Math.cos(angle) * radius;
    const arcY = Math.sin(angle) * radius;
    
    // Create an arc shape
    const curve = new THREE.EllipseCurve(
      0, 0,                         // Center
      radius, radius,               // X and Y radius
      angle - 0.2, angle + 0.2,     // Start and end angle
      false,                        // Clockwise
      0                             // Rotation
    );
    
    const points = curve.getPoints(20);
    const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const arcMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7
    });
    
    const arc = new THREE.Line(arcGeometry, arcMaterial);
    arc.position.set(0, 0, 0);
    
    // Rotate to face outward from center
    arc.lookAt(new THREE.Vector3(arcX, arcY, 0));
    
    group.add(arc);
  }
  
  // Add a few background "stars" or light sources being lensed
  const starCount = 100;
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const radius = size * (2 + Math.random() * 3);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    starPositions[i3 + 2] = radius * Math.cos(phi);
  }
  
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: size * 0.05,
    transparent: true,
    opacity: 0.7
  });
  
  const stars = new THREE.Points(starGeometry, starMaterial);
  group.add(stars);
}

/**
 * Creates a representation of the cosmic microwave background
 */
function createCosmicMicrowaveBackground(group: THREE.Group, size: number): void {
  // CMB is all around us, so create a large surrounding sphere with temperature variations
  
  // Create a large sphere to represent the cosmic microwave background
  const cmbGeometry = new THREE.SphereGeometry(size * 10, 64, 64);
  
  // Use vertex colors to represent temperature fluctuations
  const colorAttribute = new THREE.BufferAttribute(
    new Float32Array(cmbGeometry.attributes.position.count * 3), 
    3
  );
  
  // Create a Perlin noise-like pattern for temperature variations
  // This is a simplification, real CMB patterns are more complex
  for (let i = 0; i < cmbGeometry.attributes.position.count; i++) {
    const position = new THREE.Vector3();
    position.fromBufferAttribute(cmbGeometry.attributes.position, i);
    position.normalize();
    
    // Create fluctuation pattern
    // This isn't true Perlin noise but creates a similar effect
    const noise = Math.sin(position.x * 10) * Math.sin(position.y * 12) * Math.sin(position.z * 15);
    const normalizedNoise = (noise + 1) / 2; // Convert to 0-1 range
    
    // Map from cold (blue) to hot (red)
    let color = new THREE.Color();
    if (normalizedNoise < 0.4) {
      // Cold regions - blue
      color.setRGB(0, 0, 0.5 + normalizedNoise);
    } else if (normalizedNoise < 0.5) {
      // Neutral regions - green to yellow transition
      color.setRGB(normalizedNoise, 0.5, 0.5 - normalizedNoise);
    } else {
      // Hot regions - yellow to red
      color.setRGB(1, 1 - (normalizedNoise - 0.5) * 2, 0);
    }
    
    colorAttribute.setXYZ(i, color.r, color.g, color.b);
  }
  
  cmbGeometry.setAttribute('color', colorAttribute);
  
  const cmbMaterial = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.BackSide, // Render on the inside of the sphere
    transparent: true,
    opacity: 0.6
  });
  
  const cmb = new THREE.Mesh(cmbGeometry, cmbMaterial);
  group.add(cmb);
  
  // Add a grid to help visualize the spherical space
  const gridHelper1 = new THREE.PolarGridHelper(size * 9.9, 8, 16, 64, 0x444444, 0x444444);
  gridHelper1.rotation.x = Math.PI / 2;
  gridHelper1.material.transparent = true;
  gridHelper1.material.opacity = 0.1;
  group.add(gridHelper1);
  
  const gridHelper2 = new THREE.PolarGridHelper(size * 9.9, 8, 16, 64, 0x444444, 0x444444);
  gridHelper2.rotation.z = Math.PI / 2;
  gridHelper2.material.transparent = true;
  gridHelper2.material.opacity = 0.1;
  group.add(gridHelper2);
  
  // Add text labels for temperature points
  const hotSpotPosition = new THREE.Vector3(size * 8, size * 5, 0);
  const coldSpotPosition = new THREE.Vector3(-size * 7, -size * 6, 0);
  
  // For a complete implementation, you would need to include HTML elements for labeling
  // This would typically be done with HTML/CSS overlays or with a sprite-based solution
}