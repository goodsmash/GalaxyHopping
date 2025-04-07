import * as THREE from 'three';

/**
 * Planet types that can be generated
 */
export type PlanetType = 
  'terrestrial' | 'gas_giant' | 'ice_giant' | 'lava' | 
  'ocean' | 'desert' | 'rocky' | 'jungle' | 'tundra' | 
  'artificial';

/**
 * Creates a planet model based on specified type
 * @param type - The type of planet to create
 * @param size - Size/scale of the planet (default: 1)
 * @returns A Three.js Group containing the planet model
 */
export function createPlanetModel(type: PlanetType, size: number = 1): THREE.Group {
  // Create a group to hold the planet and its features
  const planetGroup = new THREE.Group();
  
  // Apply the specified scale
  planetGroup.scale.set(size, size, size);
  
  // Create planet based on type
  switch (type) {
    case 'terrestrial':
      createTerrestrialPlanet(planetGroup);
      break;
    case 'gas_giant':
      createGasGiant(planetGroup);
      break;
    case 'ice_giant':
      createIceGiant(planetGroup);
      break;
    case 'lava':
      createLavaPlanet(planetGroup);
      break;
    case 'ocean':
      createOceanPlanet(planetGroup);
      break;
    case 'desert':
      createDesertPlanet(planetGroup);
      break;
    case 'rocky':
      createRockyPlanet(planetGroup);
      break;
    case 'jungle':
      createJunglePlanet(planetGroup);
      break;
    case 'tundra':
      createTundraPlanet(planetGroup);
      break;
    case 'artificial':
      createArtificialPlanet(planetGroup);
      break;
    default:
      // Default to terrestrial if type is not recognized
      createTerrestrialPlanet(planetGroup);
  }
  
  return planetGroup;
}

/**
 * Creates a terrestrial (Earth-like) planet
 */
function createTerrestrialPlanet(group: THREE.Group): void {
  // Create the base planet sphere
  const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
  
  // Create a more complex material with blend of colors for land and water
  const landColor = new THREE.Color(0x338855); // Green for land
  const waterColor = new THREE.Color(0x1155aa); // Blue for water
  
  // Use vertex colors to create land/water patterns
  const colorAttribute = new THREE.BufferAttribute(
    new Float32Array(planetGeometry.attributes.position.count * 3), 
    3
  );
  
  for (let i = 0; i < planetGeometry.attributes.position.count; i++) {
    const position = new THREE.Vector3();
    position.fromBufferAttribute(planetGeometry.attributes.position, i);
    position.normalize();
    
    // Generate continents using noise-like patterns
    // This simple approach uses sine waves at different frequencies
    const noise = 
      Math.sin(position.x * 4) * Math.sin(position.y * 4) * Math.sin(position.z * 4) +
      0.5 * Math.sin(position.x * 8) * Math.sin(position.y * 8) * Math.sin(position.z * 8);
    
    // Convert to a 0-1 range for land/water threshold
    const normalizedNoise = (noise + 1.5) / 3;
    
    // Mix colors based on noise value (water vs land)
    const color = new THREE.Color();
    if (normalizedNoise < 0.5) {
      // Water
      color.copy(waterColor);
    } else {
      // Land - vary the green for terrain height
      color.copy(landColor).multiplyScalar(0.8 + normalizedNoise * 0.4);
    }
    
    // Add polar ice caps
    const latitude = Math.asin(position.y); // -π/2 to π/2
    const normalizedLatitude = Math.abs(latitude) / (Math.PI / 2); // 0 at equator, 1 at poles
    
    if (normalizedLatitude > 0.7) {
      // Blend to white for polar ice
      const polarFactor = (normalizedLatitude - 0.7) / 0.3;
      color.lerp(new THREE.Color(0xffffff), polarFactor);
    }
    
    colorAttribute.setXYZ(i, color.r, color.g, color.b);
  }
  
  planetGeometry.setAttribute('color', colorAttribute);
  
  const planetMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.1
  });
  
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  group.add(planet);
  
  // Add cloud layer
  const cloudGeometry = new THREE.SphereGeometry(1.02, 48, 48);
  
  // Create patchy cloud patterns
  const cloudColorAttribute = new THREE.BufferAttribute(
    new Float32Array(cloudGeometry.attributes.position.count * 3), 
    3
  );
  
  for (let i = 0; i < cloudGeometry.attributes.position.count; i++) {
    const position = new THREE.Vector3();
    position.fromBufferAttribute(cloudGeometry.attributes.position, i);
    position.normalize();
    
    // Generate cloud patterns - higher frequency for smaller cloud formations
    const noise = 
      Math.sin(position.x * 10) * Math.sin(position.y * 10) * Math.sin(position.z * 10) +
      0.5 * Math.sin(position.x * 20) * Math.sin(position.y * 20) * Math.sin(position.z * 20);
    
    // Normalize to 0-1 range
    const normalizedNoise = (noise + 1.5) / 3;
    
    // Only create clouds where the noise value is high enough (patchy clouds)
    const cloudiness = normalizedNoise > 0.55 ? 1 : 0;
    
    // White clouds
    cloudColorAttribute.setXYZ(i, 1, 1, 1);
  }
  
  cloudGeometry.setAttribute('color', cloudColorAttribute);
  
  const cloudMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    roughness: 0.9,
    metalness: 0.0
  });
  
  const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  group.add(clouds);
  
  // Add a subtle atmosphere glow
  const atmosphereGeometry = new THREE.SphereGeometry(1.08, 48, 48);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x88aaff,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  group.add(atmosphere);
}

/**
 * Creates a gas giant planet (like Jupiter or Saturn)
 */
function createGasGiant(group: THREE.Group): void {
  // Create the base planet sphere
  const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
  
  // Gas giants have distinctive bands of different colored gases
  const colorAttribute = new THREE.BufferAttribute(
    new Float32Array(planetGeometry.attributes.position.count * 3), 
    3
  );
  
  // Define colors for bands
  const bandColors = [
    new THREE.Color(0xffcc77), // Pale orange
    new THREE.Color(0xee9944), // Orange
    new THREE.Color(0xdd8833), // Dark orange
    new THREE.Color(0xcc6622), // Brown
    new THREE.Color(0xffddaa)  // Light beige
  ];
  
  for (let i = 0; i < planetGeometry.attributes.position.count; i++) {
    const position = new THREE.Vector3();
    position.fromBufferAttribute(planetGeometry.attributes.position, i);
    position.normalize();
    
    // Calculate the latitude (-1 to 1, where 0 is equator)
    const latitude = position.y;
    
    // Create bands based on latitude
    const bandIndex = Math.floor((latitude + 1) * 10) % bandColors.length;
    const baseColor = bandColors[bandIndex];
    
    // Add some variation within each band
    const variation = 
      0.1 * Math.sin(position.x * 20) * Math.sin(position.z * 20);
    
    const color = baseColor.clone().offsetHSL(0, 0, variation);
    
    // Add the great red spot (or similar feature)
    const distanceFromSpot = 
      Math.sqrt(
        Math.pow(position.x - 0.5, 2) + 
        Math.pow(position.y - 0.2, 2) + 
        Math.pow(position.z - 0.6, 2)
      );
    
    if (distanceFromSpot < 0.3) {
      // Red spot
      const spotFactor = 1 - distanceFromSpot / 0.3;
      color.lerp(new THREE.Color(0xcc3311), spotFactor * 0.7);
    }
    
    colorAttribute.setXYZ(i, color.r, color.g, color.b);
  }
  
  planetGeometry.setAttribute('color', colorAttribute);
  
  const planetMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.6,
    metalness: 0.1
  });
  
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  group.add(planet);
  
  // Randomly decide whether to add rings (like Saturn)
  if (Math.random() > 0.5) {
    // Create rings
    const ringGeometry = new THREE.RingGeometry(1.5, 2.5, 64);
    
    // Rings have bands of different colors and opacity
    const ringColorAttribute = new THREE.BufferAttribute(
      new Float32Array(ringGeometry.attributes.position.count * 3), 
      3
    );
    
    for (let i = 0; i < ringGeometry.attributes.position.count; i++) {
      const position = new THREE.Vector3();
      position.fromBufferAttribute(ringGeometry.attributes.position, i);
      
      // Calculate distance from center to determine ring band
      const distance = Math.sqrt(position.x * position.x + position.y * position.y);
      
      // Create banded ring pattern
      const bandFactor = ((distance - 1.5) / 1.0) * 10;
      const band = Math.floor(bandFactor);
      
      // Alternate between light and dark bands
      const color = new THREE.Color();
      if (band % 2 === 0) {
        color.setRGB(0.9, 0.8, 0.6); // Light band
      } else {
        color.setRGB(0.6, 0.5, 0.3); // Dark band
      }
      
      // Add some variation
      color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
      
      ringColorAttribute.setXYZ(i, color.r, color.g, color.b);
    }
    
    ringGeometry.setAttribute('color', ringColorAttribute);
    
    const ringMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    
    const rings = new THREE.Mesh(ringGeometry, ringMaterial);
    rings.rotation.x = Math.PI / 2; // Make rings horizontal
    group.add(rings);
  }
  
  // Add an atmospheric effect
  const atmosphereGeometry = new THREE.SphereGeometry(1.1, 48, 48);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xffcc88,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  group.add(atmosphere);
}

/**
 * Creates an ice giant planet (like Uranus or Neptune)
 */
function createIceGiant(group: THREE.Group): void {
  // Create the base planet sphere
  const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
  
  // Ice giants are predominantly blue-green
  const colorAttribute = new THREE.BufferAttribute(
    new Float32Array(planetGeometry.attributes.position.count * 3), 
    3
  );
  
  // Define base color
  const baseColor = new THREE.Color(0x55aacc); // Blue-green
  
  for (let i = 0; i < planetGeometry.attributes.position.count; i++) {
    const position = new THREE.Vector3();
    position.fromBufferAttribute(planetGeometry.attributes.position, i);
    position.normalize();
    
    // Create smooth variation across the surface
    const variation = 
      0.2 * Math.sin(position.x * 5) * Math.sin(position.y * 5) * Math.sin(position.z * 5);
    
    const color = baseColor.clone().offsetHSL(variation, 0.1, variation);
    
    // Add some white streaks representing high-altitude clouds
    const streakFactor = Math.pow(Math.sin(position.x * 10 + position.y * 20), 8);
    if (streakFactor > 0.7) {
      color.lerp(new THREE.Color(0xffffff), (streakFactor - 0.7) / 0.3 * 0.6);
    }
    
    colorAttribute.setXYZ(i, color.r, color.g, color.b);
  }
  
  planetGeometry.setAttribute('color', colorAttribute);
  
  const planetMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.7,
    metalness: 0.2
  });
  
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  group.add(planet);
  
  // Add thin rings at a random angle for some ice giants
  if (Math.random() > 0.6) {
    // Create thin rings
    const ringGeometry = new THREE.RingGeometry(1.3, 1.8, 64);
    
    // Rings have a consistent color with some variation
    const ringColorAttribute = new THREE.BufferAttribute(
      new Float32Array(ringGeometry.attributes.position.count * 3), 
      3
    );
    
    for (let i = 0; i < ringGeometry.attributes.position.count; i++) {
      const color = new THREE.Color(0x99bbcc);
      color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
      ringColorAttribute.setXYZ(i, color.r, color.g, color.b);
    }
    
    ringGeometry.setAttribute('color', ringColorAttribute);
    
    const ringMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    
    const rings = new THREE.Mesh(ringGeometry, ringMaterial);
    
    // Tilt the rings at a random angle, like Uranus' extreme axial tilt
    rings.rotation.x = Math.PI / 2; // Start horizontal
    rings.rotation.y = Math.random() * Math.PI; // Random rotation
    
    group.add(rings);
  }
  
  // Add a subtle atmospheric haze
  const atmosphereGeometry = new THREE.SphereGeometry(1.05, 48, 48);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x88ddff,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  group.add(atmosphere);
}

/**
 * Creates a lava planet with active volcanism
 */
function createLavaPlanet(group: THREE.Group): void {
  // Create the base planet sphere
  const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
  
  // Lava planets have a mix of dark rock and glowing lava
  const colorAttribute = new THREE.BufferAttribute(
    new Float32Array(planetGeometry.attributes.position.count * 3), 
    3
  );
  
  // Define base colors
  const rockColor = new THREE.Color(0x221100); // Dark brown/black
  const lavaColor = new THREE.Color(0xff3300); // Bright red/orange
  
  for (let i = 0; i < planetGeometry.attributes.position.count; i++) {
    const position = new THREE.Vector3();
    position.fromBufferAttribute(planetGeometry.attributes.position, i);
    position.normalize();
    
    // Generate lava flow patterns using noise-like functions
    const noise = 
      Math.sin(position.x * 15) * Math.sin(position.y * 15) * Math.sin(position.z * 15) +
      0.5 * Math.sin(position.x * 30) * Math.sin(position.y * 30) * Math.sin(position.z * 30);
    
    // Normalize to 0-1 range
    const normalizedNoise = (noise + 1.5) / 3;
    
    // Mix rock and lava colors based on noise value
    const color = new THREE.Color();
    if (normalizedNoise < 0.5) {
      // Dark rock with slight variation
      color.copy(rockColor).offsetHSL(0, 0, (Math.random() - 0.5) * 0.05);
    } else {
      // Lava - brighter where noise is higher
      const lavaIntensity = (normalizedNoise - 0.5) * 2; // 0-1 range
      color.copy(lavaColor).multiplyScalar(0.7 + lavaIntensity * 0.5);
    }
    
    colorAttribute.setXYZ(i, color.r, color.g, color.b);
  }
  
  planetGeometry.setAttribute('color', colorAttribute);
  
  // Create a custom material that includes emissive properties for the lava
  const planetMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.2,
    emissive: new THREE.Color(0xff2200),
    emissiveIntensity: 0.5
  });
  
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  group.add(planet);
  
  // Add volcanic eruptions and lava plumes
  const eruptionCount = 5 + Math.floor(Math.random() * 5);
  
  for (let i = 0; i < eruptionCount; i++) {
    // Random position on the sphere
    const phi = Math.acos(2 * Math.random() - 1); // 0 to π
    const theta = 2 * Math.PI * Math.random(); // 0 to 2π
    
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);
    
    // Create an eruption cone
    const coneGeometry = new THREE.ConeGeometry(0.1, 0.2, 8);
    const coneMaterial = new THREE.MeshStandardMaterial({
      color: 0x443322,
      roughness: 0.9
    });
    
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    
    // Position and orient the cone on the planet surface
    cone.position.set(x, y, z).multiplyScalar(0.95); // Slightly below surface
    cone.lookAt(0, 0, 0);
    cone.rotateX(Math.PI); // Flip to point outward
    
    group.add(cone);
    
    // Add lava plume for some volcanoes
    if (Math.random() > 0.5) {
      const plumeGeometry = new THREE.ConeGeometry(0.05, 0.3, 8);
      const plumeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff5500,
        transparent: true,
        opacity: 0.7
      });
      
      const plume = new THREE.Mesh(plumeGeometry, plumeMaterial);
      
      // Position at the top of the volcano
      plume.position.set(x, y, z).multiplyScalar(1.05);
      plume.lookAt(0, 0, 0);
      plume.rotateX(Math.PI); // Flip to point outward
      
      group.add(plume);
      
      // Add lava particles
      const particleCount = 10;
      const particleGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      
      for (let j = 0; j < particleCount; j++) {
        const particlePosition = new THREE.Vector3(x, y, z).multiplyScalar(1.1);
        
        // Add random offset
        particlePosition.x += (Math.random() - 0.5) * 0.2;
        particlePosition.y += (Math.random() - 0.5) * 0.2;
        particlePosition.z += (Math.random() - 0.5) * 0.2;
        
        particlePositions[j * 3] = particlePosition.x;
        particlePositions[j * 3 + 1] = particlePosition.y;
        particlePositions[j * 3 + 2] = particlePosition.z;
      }
      
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      
      const particleMaterial = new THREE.PointsMaterial({
        color: 0xff8800,
        size: 0.03,
        transparent: true,
        opacity: 0.8
      });
      
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      group.add(particles);
    }
  }
  
  // Add a heat haze atmosphere
  const atmosphereGeometry = new THREE.SphereGeometry(1.1, 48, 48);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  group.add(atmosphere);
}

/**
 * Creates an ocean planet (water world)
 */
function createOceanPlanet(group: THREE.Group): void {
  // Create the base planet sphere
  const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
  
  // Ocean planets are predominantly blue with some variation
  const colorAttribute = new THREE.BufferAttribute(
    new Float32Array(planetGeometry.attributes.position.count * 3), 
    3
  );
  
  // Define different blue shades for ocean depths
  const shallowColor = new THREE.Color(0x66ccff); // Light blue for shallow waters
  const deepColor = new THREE.Color(0x0055aa);    // Dark blue for deep waters
  
  for (let i = 0; i < planetGeometry.attributes.position.count; i++) {
    const position = new THREE.Vector3();
    position.fromBufferAttribute(planetGeometry.attributes.position, i);
    position.normalize();
    
    // Generate ocean depth patterns
    const noise = 
      Math.sin(position.x * 8) * Math.sin(position.y * 8) * Math.sin(position.z * 8);
    
    // Normalize to 0-1 range
    const normalizedNoise = (noise + 1) / 2;
    
    // Mix shallow and deep water colors based on noise value
    const color = new THREE.Color();
    color.copy(deepColor).lerp(shallowColor, normalizedNoise);
    
    // Add a few small islands
    const islandNoise = 
      Math.sin(position.x * 20) * Math.sin(position.y * 20) * Math.sin(position.z * 20);
    
    if (islandNoise > 0.9) {
      // Small islands
      color.setRGB(0.8, 0.8, 0.5); // Sandy color
    }
    
    colorAttribute.setXYZ(i, color.r, color.g, color.b);
  }
  
  planetGeometry.setAttribute('color', colorAttribute);
  
  const planetMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.3, // Smoother for water
    metalness: 0.2,
    envMapIntensity: 1.5 // More reflective
  });
  
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  group.add(planet);
  
  // Add waves/surface detail
  const wavesGeometry = new THREE.SphereGeometry(1.01, 64, 64);
  
  // Distort the geometry slightly to create wave effects
  const positions = wavesGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Calculate normalized position
    const length = Math.sqrt(x * x + y * y + z * z);
    const nx = x / length;
    const ny = y / length;
    const nz = z / length;
    
    // Add small wave displacement
    const waveHeight = 0.005 * (
      Math.sin(nx * 40 + ny * 30) + 
      Math.sin(ny * 50 + nz * 40) + 
      Math.sin(nz * 60 + nx * 50)
    );
    
    positions[i] = nx * (1.01 + waveHeight);
    positions[i + 1] = ny * (1.01 + waveHeight);
    positions[i + 2] = nz * (1.01 + waveHeight);
  }
  
  const wavesMaterial = new THREE.MeshStandardMaterial({
    color: 0x88ddff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0.3
  });
  
  const waves = new THREE.Mesh(wavesGeometry, wavesMaterial);
  group.add(waves);
  
  // Add a few clouds
  const cloudGeometry = new THREE.SphereGeometry(1.03, 48, 48);
  
  // Create sparse, wispy cloud patterns
  const cloudColorAttribute = new THREE.BufferAttribute(
    new Float32Array(cloudGeometry.attributes.position.count * 3), 
    3
  );
  
  for (let i = 0; i < cloudGeometry.attributes.position.count; i++) {
    const position = new THREE.Vector3();
    position.fromBufferAttribute(cloudGeometry.attributes.position, i);
    position.normalize();
    
    // Generate sparse cloud patterns
    const noise = 
      Math.sin(position.x * 15) * Math.sin(position.y * 15) * Math.sin(position.z * 15);
    
    // Clouds only where noise is high (sparse coverage)
    const cloudiness = noise > 0.8 ? 1 : 0;
    
    // White clouds
    cloudColorAttribute.setXYZ(i, 1, 1, 1);
  }
  
  cloudGeometry.setAttribute('color', cloudColorAttribute);
  
  const cloudMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    roughness: 0.9,
    metalness: 0.0
  });
  
  const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  group.add(clouds);
  
  // Add water atmosphere haze
  const atmosphereGeometry = new THREE.SphereGeometry(1.1, 48, 48);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x99ddff,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  group.add(atmosphere);
}

/**
 * Creates a desert planet (like Arrakis/Dune)
 */
function createDesertPlanet(group: THREE.Group): void {
  // Create the base planet sphere
  const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
  
  // Desert planets are predominantly tan/orange with dunes
  const colorAttribute = new THREE.BufferAttribute(
    new Float32Array(planetGeometry.attributes.position.count * 3), 
    3
  );
  
  // Define sand colors
  const lightSand = new THREE.Color(0xddbb88); // Light sand
  const darkSand = new THREE.Color(0xaa7744); // Darker/shadowed sand
  
  for (let i = 0; i < planetGeometry.attributes.position.count; i++) {
    const position = new THREE.Vector3();
    position.fromBufferAttribute(planetGeometry.attributes.position, i);
    position.normalize();
    
    // Generate dune patterns
    // Use higher frequencies for smaller dunes
    const noise = 
      Math.sin(position.x * 15) * Math.cos(position.y * 12) * Math.sin(position.z * 18) +
      0.5 * Math.sin(position.x * 30) * Math.cos(position.y * 24) * Math.sin(position.z * 36);
    
    // Normalize to 0-1 range
    const normalizedNoise = (noise + 1.5) / 3;
    
    // Mix sand colors based on noise (simulating dune ridges and valleys)
    const color = new THREE.Color();
    color.copy(darkSand).lerp(lightSand, normalizedNoise);
    
    // Add some variation for rock formations
    const rockNoise = 
      Math.sin(position.x * 40) * Math.sin(position.y * 40) * Math.sin(position.z * 40);
    
    if (rockNoise > 0.85) {
      // Rocky areas
      color.offsetHSL(0, -0.2, -0.2); // Darker, less saturated
    }
    
    colorAttribute.setXYZ(i, color.r, color.g, color.b);
  }
  
  planetGeometry.setAttribute('color', colorAttribute);
  
  const planetMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1.0, // Very rough for sand
    metalness: 0.1
  });
  
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  group.add(planet);
  
  // Add a dust storm somewhere on the planet
  if (Math.random() > 0.5) {
    // Random position on the sphere
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();
    
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);
    
    // Create dust cloud
    const dustGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    
    // Distort the geometry to make it more cloud-like
    const positions = dustGeometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const dx = positions[i];
      const dy = positions[i + 1];
      const dz = positions[i + 2];
      
      // Add random displacement
      positions[i] = dx + (Math.random() - 0.5) * 0.1;
      positions[i + 1] = dy + (Math.random() - 0.5) * 0.1;
      positions[i + 2] = dz + (Math.random() - 0.5) * 0.1;
    }
    
    const dustMaterial = new THREE.MeshBasicMaterial({
      color: 0xccaa77,
      transparent: true,
      opacity: 0.7
    });
    
    const dust = new THREE.Mesh(dustGeometry, dustMaterial);
    dust.position.set(x, y, z).multiplyScalar(1.1);
    group.add(dust);
  }
  
  // Add a thin, dusty atmosphere
  const atmosphereGeometry = new THREE.SphereGeometry(1.05, 48, 48);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xddbb88,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  group.add(atmosphere);
}

/**
 * Creates a rocky, barren planet (like Mercury or the Moon)
 */
function createRockyPlanet(group: THREE.Group): void {
  // Create the base planet sphere
  const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
  
  // Rocky planets are gray with craters
  const colorAttribute = new THREE.BufferAttribute(
    new Float32Array(planetGeometry.attributes.position.count * 3), 
    3
  );
  
  // Define rock colors
  const lightRock = new THREE.Color(0xaaaaaa); // Light gray
  const darkRock = new THREE.Color(0x555555); // Dark gray
  
  for (let i = 0; i < planetGeometry.attributes.position.count; i++) {
    const position = new THREE.Vector3();
    position.fromBufferAttribute(planetGeometry.attributes.position, i);
    position.normalize();
    
    // Generate base rocky texture
    const noise = 
      Math.sin(position.x * 10) * Math.sin(position.y * 10) * Math.sin(position.z * 10) +
      0.5 * Math.sin(position.x * 20) * Math.sin(position.y * 20) * Math.sin(position.z * 20);
    
    // Normalize to 0-1 range
    const normalizedNoise = (noise + 1.5) / 3;
    
    // Mix rock colors based on noise value
    const color = new THREE.Color();
    color.copy(darkRock).lerp(lightRock, normalizedNoise);
    
    // Add craters
    const craterCount = 20; // Number of major craters
    let inCrater = false;
    
    for (let c = 0; c < craterCount; c++) {
      // Use deterministic but varied positioning for craters
      const craterPhi = Math.PI * (c / craterCount);
      const craterTheta = 2 * Math.PI * ((c * 0.618) % 1); // Golden ratio for good distribution
      
      const craterX = Math.sin(craterPhi) * Math.cos(craterTheta);
      const craterY = Math.sin(craterPhi) * Math.sin(craterTheta);
      const craterZ = Math.cos(craterPhi);
      
      // Check if this point is within the crater
      const craterCenter = new THREE.Vector3(craterX, craterY, craterZ);
      const distToCrater = position.distanceTo(craterCenter);
      
      // Different sized craters
      const craterSize = 0.1 + (c % 3) * 0.1;
      
      if (distToCrater < craterSize) {
        // Inside crater
        inCrater = true;
        
        // Darker in the center, lighter on the rim
        const rimFactor = distToCrater / craterSize;
        if (rimFactor > 0.8) {
          // Crater rim is slightly lighter
          color.lerp(lightRock, 0.5);
        } else {
          // Crater interior is darker
          color.lerp(darkRock, 0.7);
        }
        
        break; // Only apply the effect of one crater (the first one found)
      }
    }
    
    // Skip the rest if already in a crater
    if (!inCrater) {
      // Add small impact craters everywhere
      const microNoise = 
        Math.sin(position.x * 50) * Math.sin(position.y * 50) * Math.sin(position.z * 50);
      
      if (microNoise > 0.9) {
        // Small crater
        color.offsetHSL(0, 0, -0.1); // Slightly darker
      }
    }
    
    colorAttribute.setXYZ(i, color.r, color.g, color.b);
  }
  
  planetGeometry.setAttribute('color', colorAttribute);
  
  const planetMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.9,
    metalness: 0.2
  });
  
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  group.add(planet);
  
  // No atmosphere on rocky planets, but we can add some surface details
  
  // Add a few larger distinct craters with 3D geometry
  const majorCraterCount = 3 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < majorCraterCount; i++) {
    // Random position on the sphere
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();
    
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);
    
    // Create crater geometry - a ring
    const craterSize = 0.1 + Math.random() * 0.1;
    const craterGeometry = new THREE.RingGeometry(craterSize * 0.6, craterSize, 16);
    const craterMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.9,
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    
    const crater = new THREE.Mesh(craterGeometry, craterMaterial);
    
    // Position and orient on the planet surface
    crater.position.set(x, y, z).multiplyScalar(1.001); // Slightly above surface
    crater.lookAt(0, 0, 0);
    
    group.add(crater);
    
    // Add crater floor
    const floorGeometry = new THREE.CircleGeometry(craterSize * 0.6, 16);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555, // Darker
      roughness: 0.9,
      metalness: 0.2
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    
    // Position just below the ring
    floor.position.set(x, y, z).multiplyScalar(1.000); // At surface
    floor.lookAt(0, 0, 0);
    
    group.add(floor);
  }
}

/**
 * Creates a jungle/heavily vegetated planet
 */
function createJunglePlanet(group: THREE.Group): void {
  // Create the base planet sphere
  const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
  
  // Jungle planets are predominantly green with blue water
  const colorAttribute = new THREE.BufferAttribute(
    new Float32Array(planetGeometry.attributes.position.count * 3), 
    3
  );
  
  // Define colors
  const deepGreen = new THREE.Color(0x006622); // Dark green for dense forests
  const lightGreen = new THREE.Color(0x44aa44); // Light green for clearings
  const waterColor = new THREE.Color(0x0066aa); // Blue for water
  
  for (let i = 0; i < planetGeometry.attributes.position.count; i++) {
    const position = new THREE.Vector3();
    position.fromBufferAttribute(planetGeometry.attributes.position, i);
    position.normalize();
    
    // Generate jungle patterns
    const forestNoise = 
      Math.sin(position.x * 15) * Math.sin(position.y * 15) * Math.sin(position.z * 15) +
      0.5 * Math.sin(position.x * 30) * Math.sin(position.y * 30) * Math.sin(position.z * 30);
    
    // Normalize to 0-1 range
    const normalizedForestNoise = (forestNoise + 1.5) / 3;
    
    // Generate water pattern
    const waterNoise = 
      Math.sin(position.x * 5) * Math.sin(position.y * 5) * Math.sin(position.z * 5);
    
    const normalizedWaterNoise = (waterNoise + 1) / 2;
    
    // Determine color based on noise values
    const color = new THREE.Color();
    
    if (normalizedWaterNoise < 0.3) {
      // Water areas (rivers, lakes)
      color.copy(waterColor);
    } else {
      // Forest areas - mix different greens based on density
      color.copy(deepGreen).lerp(lightGreen, normalizedForestNoise);
    }
    
    colorAttribute.setXYZ(i, color.r, color.g, color.b);
  }
  
  planetGeometry.setAttribute('color', colorAttribute);
  
  const planetMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.1
  });
  
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  group.add(planet);
  
  // Add 3D forest canopy detail
  const canopyGeometry = new THREE.SphereGeometry(1.02, 64, 64);
  
  // Distort the geometry to create an uneven canopy
  const positions = canopyGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Calculate normalized position
    const length = Math.sqrt(x * x + y * y + z * z);
    const nx = x / length;
    const ny = y / length;
    const nz = z / length;
    
    // Generate noise for this position
    const noise = 
      Math.sin(nx * 20) * Math.sin(ny * 20) * Math.sin(nz * 20) +
      0.5 * Math.sin(nx * 40) * Math.sin(ny * 40) * Math.sin(nz * 40);
    
    // Only add height where there's forest (avoid water areas)
    const waterNoise = Math.sin(nx * 5) * Math.sin(ny * 5) * Math.sin(nz * 5);
    const canopyHeight = (waterNoise + 1) / 2 < 0.3 ? 0 : 0.01 * (noise + 1) / 2;
    
    positions[i] = nx * (1.02 + canopyHeight);
    positions[i + 1] = ny * (1.02 + canopyHeight);
    positions[i + 2] = nz * (1.02 + canopyHeight);
  }
  
  const canopyMaterial = new THREE.MeshStandardMaterial({
    color: 0x228833,
    roughness: 1.0,
    metalness: 0.0,
    transparent: true,
    opacity: 0.9
  });
  
  const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
  group.add(canopy);
  
  // Add thick cloud cover
  const cloudGeometry = new THREE.SphereGeometry(1.05, 48, 48);
  
  // Create patchy cloud patterns
  const cloudColorAttribute = new THREE.BufferAttribute(
    new Float32Array(cloudGeometry.attributes.position.count * 3), 
    3
  );
  
  for (let i = 0; i < cloudGeometry.attributes.position.count; i++) {
    const position = new THREE.Vector3();
    position.fromBufferAttribute(cloudGeometry.attributes.position, i);
    position.normalize();
    
    // Generate cloud patterns
    const noise = 
      Math.sin(position.x * 15) * Math.sin(position.y * 15) * Math.sin(position.z * 15);
    
    // Only create clouds where the noise value is high enough (patchy clouds)
    const cloudiness = noise > 0.2 ? 1 : 0; // More cloud coverage
    
    // White clouds
    cloudColorAttribute.setXYZ(i, 1, 1, 1);
  }
  
  cloudGeometry.setAttribute('color', cloudColorAttribute);
  
  const cloudMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    roughness: 0.9,
    metalness: 0.0
  });
  
  const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  group.add(clouds);
  
  // Add humid atmosphere
  const atmosphereGeometry = new THREE.SphereGeometry(1.1, 48, 48);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xaaddcc,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide
  });
  
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  group.add(atmosphere);
}

/**
 * Creates a tundra/ice planet
 */
function createTundraPlanet(group: THREE.Group): void {
  // Create the base planet sphere
  const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
  
  // Tundra planets are white/blue ice with some exposed rock
  const colorAttribute = new THREE.BufferAttribute(
    new Float32Array(planetGeometry.attributes.position.count * 3), 
    3
  );
  
  // Define colors
  const iceColor = new THREE.Color(0xddeeff); // White-blue ice
  const darkIceColor = new THREE.Color(0x99bbcc); // Darker ice
  const rockColor = new THREE.Color(0x666677); // Dark rock
  
  for (let i = 0; i < planetGeometry.attributes.position.count; i++) {
    const position = new THREE.Vector3();
    position.fromBufferAttribute(planetGeometry.attributes.position, i);
    position.normalize();
    
    // Generate ice patterns
    const iceNoise = 
      Math.sin(position.x * 12) * Math.sin(position.y * 12) * Math.sin(position.z * 12) +
      0.5 * Math.sin(position.x * 24) * Math.sin(position.y * 24) * Math.sin(position.z * 24);
    
    // Normalize to 0-1 range
    const normalizedIceNoise = (iceNoise + 1.5) / 3;
    
    // Generate rock pattern
    const rockNoise = 
      Math.sin(position.x * 20) * Math.sin(position.y * 20) * Math.sin(position.z * 20);
    
    const normalizedRockNoise = (rockNoise + 1) / 2;
    
    // Determine color based on noise values
    const color = new THREE.Color();
    
    if (normalizedRockNoise > 0.8) {
      // Exposed rock areas
      color.copy(rockColor);
    } else {
      // Ice areas - mix different ice colors based on texture
      color.copy(darkIceColor).lerp(iceColor, normalizedIceNoise);
    }
    
    colorAttribute.setXYZ(i, color.r, color.g, color.b);
  }
  
  planetGeometry.setAttribute('color', colorAttribute);
  
  const planetMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.6,
    metalness: 0.3 // More reflective for ice
  });
  
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  group.add(planet);
  
  // Add ice cracks and detail
  const cracksGeometry = new THREE.SphereGeometry(1.001, 64, 64);
  
  // Create crackling ice pattern
  const crackColorAttribute = new THREE.BufferAttribute(
    new Float32Array(cracksGeometry.attributes.position.count * 3), 
    3
  );
  
  for (let i = 0; i < cracksGeometry.attributes.position.count; i++) {
    const position = new THREE.Vector3();
    position.fromBufferAttribute(cracksGeometry.attributes.position, i);
    position.normalize();
    
    // Generate crack patterns with higher frequency noise
    const noise = 
      Math.sin(position.x * 40) * Math.sin(position.y * 40) * Math.sin(position.z * 40);
    
    // Cracks only where noise crosses certain thresholds
    const crackFactor = Math.abs(noise) < 0.05 ? 1 : 0;
    
    // Darker blue for cracks
    const color = new THREE.Color(0x4477aa);
    crackColorAttribute.setXYZ(i, color.r, color.g, color.b);
  }
  
  cracksGeometry.setAttribute('color', crackColorAttribute);
  
  const cracksMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    roughness: 0.4,
    metalness: 0.2
  });
  
  const cracks = new THREE.Mesh(cracksGeometry, cracksMaterial);
  group.add(cracks);
  
  // Add snow/ice fog in the atmosphere
  const fogGeometry = new THREE.SphereGeometry(1.05, 32, 32);
  
  // Distort the geometry to create uneven fog
  const positions = fogGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Add random displacement
    positions[i] = x + (Math.random() - 0.5) * 0.05;
    positions[i + 1] = y + (Math.random() - 0.5) * 0.05;
    positions[i + 2] = z + (Math.random() - 0.5) * 0.05;
  }
  
  const fogMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2
  });
  
  const fog = new THREE.Mesh(fogGeometry, fogMaterial);
  group.add(fog);
  
  // Add thin cold atmosphere
  const atmosphereGeometry = new THREE.SphereGeometry(1.1, 48, 48);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xccddff,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  group.add(atmosphere);
}

/**
 * Creates an artificial/constructed planet or megastructure
 */
function createArtificialPlanet(group: THREE.Group): void {
  // Create a geometric base structure instead of a natural sphere
  const baseGeometry = new THREE.IcosahedronGeometry(1, 1); // Low poly for artificial look
  
  // Create a metallic/technological appearance
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x888899,
    roughness: 0.4,
    metalness: 0.8,
    flatShading: true // Emphasize the geometric facets
  });
  
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  group.add(base);
  
  // Add technological surface details
  
  // Add grid lines across the surface
  const gridCount = 10;
  
  for (let i = 0; i < gridCount; i++) {
    const angle = (i / gridCount) * Math.PI;
    
    // Create a ring around the planet
    const ringGeometry = new THREE.RingGeometry(0.98, 1.02, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffaa, // Glowing tech color
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    
    // Position ring
    ring.rotation.x = angle;
    
    group.add(ring);
    
    // Create a second ring at 90 degrees
    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring2.rotation.y = angle;
    
    group.add(ring2);
  }
  
  // Add structural panels and sections
  const panelCount = 20;
  
  for (let i = 0; i < panelCount; i++) {
    // Random position on the sphere
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();
    
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);
    
    // Create panel
    const panelGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.05);
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: Math.random() > 0.7 ? 0x00ffaa : 0x333344, // Some panels glow
      emissive: Math.random() > 0.7 ? 0x00ffaa : 0x000000,
      emissiveIntensity: 0.5,
      roughness: 0.4,
      metalness: 0.8
    });
    
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    
    // Position and orient on the planet surface
    panel.position.set(x, y, z).multiplyScalar(1);
    panel.lookAt(0, 0, 0);
    panel.rotateX(Math.PI / 2); // Align with surface
    
    group.add(panel);
  }
  
  // Add a large "energy core" or central structure
  const coreGeometry = new THREE.SphereGeometry(0.3, 32, 32);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffaa,
    transparent: true,
    opacity: 0.8
  });
  
  // Randomly position the core slightly off-center
  const corePosition = new THREE.Vector3(
    (Math.random() - 0.5) * 0.2,
    (Math.random() - 0.5) * 0.2,
    (Math.random() - 0.5) * 0.2
  );
  
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.position.copy(corePosition);
  group.add(core);
  
  // Add energy beams emanating from the core
  const beamCount = 5;
  
  for (let i = 0; i < beamCount; i++) {
    // Random direction
    const beamDir = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    
    // Create beam
    const beamGeometry = new THREE.CylinderGeometry(0.01, 0.03, 0.7, 8);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: 0.6
    });
    
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    
    // Position and orient the beam
    beam.position.copy(corePosition).add(beamDir.clone().multiplyScalar(0.35));
    beam.lookAt(corePosition);
    beam.rotateX(Math.PI / 2);
    
    group.add(beam);
  }
  
  // Add artificial atmosphere glow
  const atmosphereGeometry = new THREE.SphereGeometry(1.1, 48, 48);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffaa,
    transparent: true,
    opacity: 0.05,
    side: THREE.BackSide
  });
  
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  group.add(atmosphere);
}