import * as THREE from 'three';

/**
 * Types of space debris that can be generated
 */
export type DebrisType = 
  'asteroid' | 'ice_chunk' | 'metal_debris' | 
  'comet' | 'dust_cloud' | 'space_junk';

/**
 * Creates a single asteroid or space debris object
 * @param type - The type of debris to create
 * @param size - Size scale of the debris (default: 1)
 * @param seed - Random seed for consistent generation (default: random)
 * @returns A Three.js Group containing the debris model
 */
export function createDebrisObject(
  type: DebrisType, 
  size: number = 1,
  seed: number = Math.random() * 1000
): THREE.Group {
  // Create a group to hold the debris and its features
  const debrisGroup = new THREE.Group();
  
  // Apply the specified scale
  debrisGroup.scale.set(size, size, size);
  
  // Create debris based on type
  switch (type) {
    case 'asteroid':
      createAsteroid(debrisGroup, seed);
      break;
    case 'ice_chunk':
      createIceChunk(debrisGroup, seed);
      break;
    case 'metal_debris':
      createMetalDebris(debrisGroup, seed);
      break;
    case 'comet':
      createComet(debrisGroup, seed);
      break;
    case 'dust_cloud':
      createDustCloud(debrisGroup, seed);
      break;
    case 'space_junk':
      createSpaceJunk(debrisGroup, seed);
      break;
    default:
      // Default to asteroid if type is not recognized
      createAsteroid(debrisGroup, seed);
  }
  
  return debrisGroup;
}

/**
 * Creates an asteroid field with multiple asteroids
 * @param count - Number of asteroids to create
 * @param radius - Radius of the asteroid field
 * @param centerPos - Center position of the field
 * @param seedBase - Base seed for consistent generation
 * @returns A Three.js Group containing the asteroid field
 */
export function createAsteroidField(
  count: number, 
  radius: number, 
  centerPos: THREE.Vector3 = new THREE.Vector3(),
  seedBase: number = Math.random() * 1000
): THREE.Group {
  const fieldGroup = new THREE.Group();
  fieldGroup.position.copy(centerPos);
  
  // Create multiple asteroids with varying sizes and positions
  for (let i = 0; i < count; i++) {
    // Use seedBase plus index for deterministic but varied generation
    const seed = seedBase + i * 100;
    
    // Use deterministic random from seed
    const seededRandom = (min: number, max: number, offset = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      const rand = x - Math.floor(x); // 0-1 range
      return min + rand * (max - min);
    };
    
    // Random position within the field radius
    const distance = radius * Math.sqrt(seededRandom(0, 1, 1)); // Square root for uniform distribution
    const angle = seededRandom(0, Math.PI * 2, 2);
    const elevation = seededRandom(-0.3, 0.3, 3) * radius;
    
    const x = Math.cos(angle) * distance;
    const y = elevation;
    const z = Math.sin(angle) * distance;
    
    // Random size (smaller asteroids are more common)
    const size = Math.pow(seededRandom(0, 1, 4), 2) * 2 + 0.5; // 0.5 to 2.5
    
    // Create asteroid with the determined seed
    const asteroid = createDebrisObject('asteroid', size, seed);
    asteroid.position.set(x, y, z);
    
    // Random rotation
    asteroid.rotation.set(
      seededRandom(0, Math.PI * 2, 5),
      seededRandom(0, Math.PI * 2, 6),
      seededRandom(0, Math.PI * 2, 7)
    );
    
    fieldGroup.add(asteroid);
  }
  
  return fieldGroup;
}

/**
 * Creates a debris field with mixed types of space debris
 * @param count - Number of debris pieces to create
 * @param radius - Radius of the debris field
 * @param centerPos - Center position of the field
 * @param seedBase - Base seed for consistent generation
 * @returns A Three.js Group containing the debris field
 */
export function createDebrisField(
  count: number, 
  radius: number, 
  centerPos: THREE.Vector3 = new THREE.Vector3(),
  seedBase: number = Math.random() * 1000
): THREE.Group {
  const fieldGroup = new THREE.Group();
  fieldGroup.position.copy(centerPos);
  
  const debrisTypes: DebrisType[] = [
    'asteroid', 'ice_chunk', 'metal_debris', 'space_junk'
  ];
  
  // Create multiple debris objects with varying types, sizes and positions
  for (let i = 0; i < count; i++) {
    // Use seedBase plus index for deterministic but varied generation
    const seed = seedBase + i * 100;
    
    // Use deterministic random from seed
    const seededRandom = (min: number, max: number, offset = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      const rand = x - Math.floor(x); // 0-1 range
      return min + rand * (max - min);
    };
    
    // Random position within the field radius
    const distance = radius * Math.pow(seededRandom(0, 1, 1), 0.5); // Square root for uniform distribution
    const angle = seededRandom(0, Math.PI * 2, 2);
    const elevation = seededRandom(-0.3, 0.3, 3) * radius;
    
    const x = Math.cos(angle) * distance;
    const y = elevation;
    const z = Math.sin(angle) * distance;
    
    // Random size (smaller debris are more common)
    const size = Math.pow(seededRandom(0, 1, 4), 1.5) * 1.5 + 0.3; // 0.3 to 1.8
    
    // Random debris type
    const typeIndex = Math.floor(seededRandom(0, debrisTypes.length, 5));
    const debrisType = debrisTypes[typeIndex];
    
    // Create debris with the determined seed and type
    const debris = createDebrisObject(debrisType, size, seed);
    debris.position.set(x, y, z);
    
    // Random rotation
    debris.rotation.set(
      seededRandom(0, Math.PI * 2, 6),
      seededRandom(0, Math.PI * 2, 7),
      seededRandom(0, Math.PI * 2, 8)
    );
    
    fieldGroup.add(debris);
  }
  
  return fieldGroup;
}

/**
 * Creates a realistic asteroid model
 */
function createAsteroid(group: THREE.Group, seed: number): void {
  // Use deterministic random from seed
  const seededRandom = (min: number, max: number, offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    const rand = x - Math.floor(x); // 0-1 range
    return min + rand * (max - min);
  };
  
  // Start with an icosahedron for a rough asteroid shape
  const detail = Math.floor(seededRandom(0, 3, 10)); // 0, 1, or 2 subdivisions
  const geometry = new THREE.IcosahedronGeometry(1, detail);
  
  // Distort the vertices to create an irregular, rocky shape
  const positions = geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Get normalized direction
    const length = Math.sqrt(x * x + y * y + z * z);
    const nx = x / length;
    const ny = y / length;
    const nz = z / length;
    
    // Generate displacement using multiple frequencies of noise
    const displacement = 
      (0.2 * seededRandom(-1, 1, i)) + 
      (0.1 * seededRandom(-1, 1, i + 100)) + 
      (0.05 * seededRandom(-1, 1, i + 200));
    
    // Apply displacement along the normal direction
    positions[i] = nx * (1 + displacement);
    positions[i + 1] = ny * (1 + displacement);
    positions[i + 2] = nz * (1 + displacement);
  }
  
  // Choose asteroid color based on type (silicate, carbonaceous, metallic)
  const asteroidType = Math.floor(seededRandom(0, 3, 300));
  let color;
  
  if (asteroidType === 0) {
    // Silicate (S-type) - rocky, brownish
    color = new THREE.Color(
      seededRandom(0.5, 0.7, 301),
      seededRandom(0.35, 0.5, 302),
      seededRandom(0.25, 0.35, 303)
    );
  } else if (asteroidType === 1) {
    // Carbonaceous (C-type) - dark, slightly blue-gray
    color = new THREE.Color(
      seededRandom(0.2, 0.3, 304),
      seededRandom(0.2, 0.3, 305),
      seededRandom(0.25, 0.35, 306)
    );
  } else {
    // Metallic (M-type) - light gray with metallic sheen
    color = new THREE.Color(
      seededRandom(0.5, 0.6, 307),
      seededRandom(0.5, 0.6, 308),
      seededRandom(0.5, 0.6, 309)
    );
  }
  
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: seededRandom(0.7, 0.9, 310),
    metalness: asteroidType === 2 ? seededRandom(0.3, 0.6, 311) : seededRandom(0, 0.2, 311)
  });
  
  const asteroid = new THREE.Mesh(geometry, material);
  group.add(asteroid);
  
  // Add some craters to the surface
  const craterCount = Math.floor(seededRandom(2, 6, 400));
  
  for (let i = 0; i < craterCount; i++) {
    // Random position on the surface
    const phi = seededRandom(0, Math.PI, 401 + i * 10);
    const theta = seededRandom(0, Math.PI * 2, 402 + i * 10);
    
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);
    
    // Create a small indentation for the crater
    const craterSize = seededRandom(0.2, 0.5, 403 + i * 10);
    const craterDepth = seededRandom(0.05, 0.15, 404 + i * 10);
    
    const craterGeometry = new THREE.CircleGeometry(craterSize, 16);
    const craterMaterial = new THREE.MeshStandardMaterial({
      color: color.clone().multiplyScalar(0.8), // Darker than the surface
      roughness: seededRandom(0.7, 0.9, 405 + i * 10),
      metalness: material.metalness,
      side: THREE.DoubleSide
    });
    
    const crater = new THREE.Mesh(craterGeometry, craterMaterial);
    
    // Position and orient the crater on the surface
    crater.position.set(x, y, z);
    crater.lookAt(0, 0, 0);
    crater.position.multiplyScalar(1 - craterDepth); // Push in slightly
    
    group.add(crater);
  }
}

/**
 * Creates an ice chunk model
 */
function createIceChunk(group: THREE.Group, seed: number): void {
  // Use deterministic random from seed
  const seededRandom = (min: number, max: number, offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    const rand = x - Math.floor(x); // 0-1 range
    return min + rand * (max - min);
  };
  
  // Create a crystalline structure starting with a cube
  const geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
  
  // Distort the vertices to create crystalline features
  const positions = geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Create angular, crystal-like distortions
    const displacement = seededRandom(-0.2, 0.4, i);
    
    positions[i] = x + x * displacement;
    positions[i + 1] = y + y * displacement;
    positions[i + 2] = z + z * displacement;
  }
  
  // Ice material with slight blue tint and transparency
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(
      seededRandom(0.8, 0.9, 500),
      seededRandom(0.85, 0.95, 501),
      seededRandom(0.95, 1, 502)
    ),
    roughness: seededRandom(0.1, 0.3, 503),
    metalness: seededRandom(0.1, 0.3, 504),
    transparent: true,
    opacity: seededRandom(0.7, 0.9, 505)
  });
  
  const iceChunk = new THREE.Mesh(geometry, material);
  group.add(iceChunk);
  
  // Add internal fractures/veins
  const fractureCount = Math.floor(seededRandom(3, 8, 600));
  
  for (let i = 0; i < fractureCount; i++) {
    // Create internal plane for fracture
    const fracturePlane = new THREE.PlaneGeometry(
      seededRandom(0.5, 1.2, 601 + i * 10),
      seededRandom(0.5, 1.2, 602 + i * 10)
    );
    
    // Bright blue-white color for fractures
    const fractureMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        seededRandom(0.8, 1, 603 + i * 10),
        seededRandom(0.9, 1, 604 + i * 10),
        seededRandom(0.95, 1, 605 + i * 10)
      ),
      transparent: true,
      opacity: seededRandom(0.2, 0.5, 606 + i * 10),
      side: THREE.DoubleSide
    });
    
    const fracture = new THREE.Mesh(fracturePlane, fractureMaterial);
    
    // Position and rotate fracture randomly inside the ice chunk
    fracture.position.set(
      seededRandom(-0.5, 0.5, 607 + i * 10),
      seededRandom(-0.5, 0.5, 608 + i * 10),
      seededRandom(-0.5, 0.5, 609 + i * 10)
    );
    
    fracture.rotation.set(
      seededRandom(0, Math.PI * 2, 610 + i * 10),
      seededRandom(0, Math.PI * 2, 611 + i * 10),
      seededRandom(0, Math.PI * 2, 612 + i * 10)
    );
    
    group.add(fracture);
  }
}

/**
 * Creates a metal debris/scrap model
 */
function createMetalDebris(group: THREE.Group, seed: number): void {
  // Use deterministic random from seed
  const seededRandom = (min: number, max: number, offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    const rand = x - Math.floor(x); // 0-1 range
    return min + rand * (max - min);
  };
  
  // Determine the type of metal debris
  const debrisType = Math.floor(seededRandom(0, 3, 700));
  
  if (debrisType === 0) {
    // Jagged metal piece
    createJaggedMetalPiece(group, seededRandom);
  } else if (debrisType === 1) {
    // Twisted metal piece
    createTwistedMetalPiece(group, seededRandom);
  } else {
    // Technological debris (circuit board, machinery part)
    createTechnologicalDebris(group, seededRandom);
  }
}

/**
 * Creates jagged metal debris
 */
function createJaggedMetalPiece(group: THREE.Group, seededRandom: (min: number, max: number, offset: number) => number): void {
  // Start with a tetrahedron for sharp edges
  const geometry = new THREE.TetrahedronGeometry(1, 0);
  
  // Distort and stretch it
  const positions = geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] *= seededRandom(0.7, 1.3, 800 + i);
    positions[i + 1] *= seededRandom(0.7, 1.3, 801 + i);
    positions[i + 2] *= seededRandom(0.7, 1.3, 802 + i);
  }
  
  // Metal material with appropriate color and shine
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(
      seededRandom(0.6, 0.8, 803),
      seededRandom(0.6, 0.8, 804),
      seededRandom(0.6, 0.8, 805)
    ),
    roughness: seededRandom(0.3, 0.6, 806),
    metalness: seededRandom(0.7, 0.9, 807)
  });
  
  const jagged = new THREE.Mesh(geometry, material);
  group.add(jagged);
  
  // Add some cut/bent edges
  const edgeCount = Math.floor(seededRandom(2, 5, 810));
  
  for (let i = 0; i < edgeCount; i++) {
    const edgeGeometry = new THREE.BoxGeometry(
      seededRandom(0.1, 0.3, 811 + i * 10),
      seededRandom(0.1, 0.3, 812 + i * 10),
      seededRandom(0.5, 1.5, 813 + i * 10)
    );
    
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: material.color,
      roughness: material.roughness,
      metalness: material.metalness
    });
    
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    
    // Position and rotate the edge randomly
    edge.position.set(
      seededRandom(-0.5, 0.5, 814 + i * 10),
      seededRandom(-0.5, 0.5, 815 + i * 10),
      seededRandom(-0.5, 0.5, 816 + i * 10)
    );
    
    edge.rotation.set(
      seededRandom(0, Math.PI * 2, 817 + i * 10),
      seededRandom(0, Math.PI * 2, 818 + i * 10),
      seededRandom(0, Math.PI * 2, 819 + i * 10)
    );
    
    group.add(edge);
  }
}

/**
 * Creates twisted metal debris
 */
function createTwistedMetalPiece(group: THREE.Group, seededRandom: (min: number, max: number, offset: number) => number): void {
  // Create a tube with a spiral curve
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0.3, -0.5, 0.2),
    new THREE.Vector3(-0.3, 0, 0.4),
    new THREE.Vector3(0.3, 0.5, 0.6),
    new THREE.Vector3(0, 1, 0.8)
  ]);
  
  // Adjust curve points for randomness
  for (let i = 0; i < curve.points.length; i++) {
    curve.points[i].x += seededRandom(-0.2, 0.2, 900 + i * 10);
    curve.points[i].y += seededRandom(-0.2, 0.2, 901 + i * 10);
    curve.points[i].z += seededRandom(-0.2, 0.2, 902 + i * 10);
  }
  
  const tubeGeometry = new THREE.TubeGeometry(
    curve,
    20,
    seededRandom(0.1, 0.2, 910),
    8,
    false
  );
  
  // Metal material with appropriate color and shine
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(
      seededRandom(0.6, 0.8, 911),
      seededRandom(0.6, 0.8, 912),
      seededRandom(0.6, 0.8, 913)
    ),
    roughness: seededRandom(0.3, 0.6, 914),
    metalness: seededRandom(0.7, 0.9, 915)
  });
  
  const twistedMetal = new THREE.Mesh(tubeGeometry, material);
  group.add(twistedMetal);
  
  // Add some torn edges/details
  const detailCount = Math.floor(seededRandom(2, 5, 920));
  
  for (let i = 0; i < detailCount; i++) {
    // Create small jutting pieces
    const detailGeometry = new THREE.BoxGeometry(
      seededRandom(0.05, 0.2, 921 + i * 10),
      seededRandom(0.05, 0.2, 922 + i * 10),
      seededRandom(0.05, 0.2, 923 + i * 10)
    );
    
    const detailMaterial = new THREE.MeshStandardMaterial({
      color: material.color,
      roughness: material.roughness,
      metalness: material.metalness
    });
    
    const detail = new THREE.Mesh(detailGeometry, detailMaterial);
    
    // Position along the tube
    const tubePosition = curve.getPoint(seededRandom(0, 1, 924 + i * 10));
    detail.position.copy(tubePosition);
    
    // Random rotation
    detail.rotation.set(
      seededRandom(0, Math.PI * 2, 925 + i * 10),
      seededRandom(0, Math.PI * 2, 926 + i * 10),
      seededRandom(0, Math.PI * 2, 927 + i * 10)
    );
    
    group.add(detail);
  }
}

/**
 * Creates technological debris (circuit board, machinery part)
 */
function createTechnologicalDebris(group: THREE.Group, seededRandom: (min: number, max: number, offset: number) => number): void {
  // Create a base component (circuit board or machine part)
  const baseWidth = seededRandom(0.8, 1.2, 1000);
  const baseHeight = seededRandom(0.1, 0.3, 1001);
  const baseDepth = seededRandom(0.8, 1.2, 1002);
  
  const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
  
  // Choose color based on component type
  let baseColor;
  if (seededRandom(0, 1, 1003) > 0.5) {
    // Circuit board green
    baseColor = new THREE.Color(
      seededRandom(0.1, 0.3, 1004),
      seededRandom(0.5, 0.7, 1005),
      seededRandom(0.2, 0.4, 1006)
    );
  } else {
    // Metal casing
    baseColor = new THREE.Color(
      seededRandom(0.6, 0.8, 1007),
      seededRandom(0.6, 0.8, 1008),
      seededRandom(0.6, 0.8, 1009)
    );
  }
  
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: seededRandom(0.3, 0.7, 1010),
    metalness: seededRandom(0.2, 0.6, 1011)
  });
  
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  group.add(base);
  
  // Add electronic components on top
  const componentCount = Math.floor(seededRandom(5, 15, 1020));
  
  for (let i = 0; i < componentCount; i++) {
    // Determine component type
    const componentType = Math.floor(seededRandom(0, 4, 1021 + i * 10));
    let component;
    
    if (componentType === 0) {
      // Small IC chip
      const chipGeometry = new THREE.BoxGeometry(
        seededRandom(0.1, 0.3, 1022 + i * 10),
        seededRandom(0.05, 0.1, 1023 + i * 10),
        seededRandom(0.1, 0.3, 1024 + i * 10)
      );
      
      const chipMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x222222),
        roughness: 0.8,
        metalness: 0.2
      });
      
      component = new THREE.Mesh(chipGeometry, chipMaterial);
    } else if (componentType === 1) {
      // Cylindrical capacitor
      const capGeometry = new THREE.CylinderGeometry(
        seededRandom(0.03, 0.08, 1025 + i * 10),
        seededRandom(0.03, 0.08, 1026 + i * 10),
        seededRandom(0.1, 0.2, 1027 + i * 10),
        8
      );
      
      const capColor = [0x3366cc, 0xcc3333, 0x999999][Math.floor(seededRandom(0, 3, 1028 + i * 10))];
      const capMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(capColor),
        roughness: 0.7,
        metalness: 0.3
      });
      
      component = new THREE.Mesh(capGeometry, capMaterial);
    } else if (componentType === 2) {
      // Connector/port
      const connGeometry = new THREE.BoxGeometry(
        seededRandom(0.1, 0.2, 1029 + i * 10),
        seededRandom(0.1, 0.2, 1030 + i * 10),
        seededRandom(0.1, 0.2, 1031 + i * 10)
      );
      
      const connMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x666666),
        roughness: 0.5,
        metalness: 0.8
      });
      
      component = new THREE.Mesh(connGeometry, connMaterial);
    } else {
      // Small LED or indicator
      const ledGeometry = new THREE.SphereGeometry(seededRandom(0.02, 0.04, 1032 + i * 10), 8, 8);
      
      const ledColor = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00][Math.floor(seededRandom(0, 4, 1033 + i * 10))];
      const ledMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(ledColor),
        emissive: new THREE.Color(ledColor),
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.8
      });
      
      component = new THREE.Mesh(ledGeometry, ledMaterial);
    }
    
    // Position component on the base
    component.position.set(
      seededRandom(-baseWidth/2 + 0.1, baseWidth/2 - 0.1, 1034 + i * 10),
      baseHeight/2 + component.geometry.parameters.height/2 || 0.05,
      seededRandom(-baseDepth/2 + 0.1, baseDepth/2 - 0.1, 1035 + i * 10)
    );
    
    group.add(component);
  }
  
  // Add some damage/scorch marks
  if (seededRandom(0, 1, 1050) > 0.3) {
    const damageGeometry = new THREE.CircleGeometry(seededRandom(0.1, 0.3, 1051), 8);
    const damageMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x000000),
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    const damage = new THREE.Mesh(damageGeometry, damageMaterial);
    
    // Position on a random face
    const side = Math.floor(seededRandom(0, 6, 1052));
    switch(side) {
      case 0: // top
        damage.position.set(
          seededRandom(-baseWidth/2 + 0.1, baseWidth/2 - 0.1, 1053),
          baseHeight/2 + 0.001,
          seededRandom(-baseDepth/2 + 0.1, baseDepth/2 - 0.1, 1054)
        );
        damage.rotation.x = -Math.PI/2;
        break;
      case 1: // bottom
        damage.position.set(
          seededRandom(-baseWidth/2 + 0.1, baseWidth/2 - 0.1, 1055),
          -baseHeight/2 - 0.001,
          seededRandom(-baseDepth/2 + 0.1, baseDepth/2 - 0.1, 1056)
        );
        damage.rotation.x = Math.PI/2;
        break;
      // ... other sides similarly
    }
    
    group.add(damage);
  }
}

/**
 * Creates a comet model with a tail
 */
function createComet(group: THREE.Group, seed: number): void {
  // Use deterministic random from seed
  const seededRandom = (min: number, max: number, offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    const rand = x - Math.floor(x); // 0-1 range
    return min + rand * (max - min);
  };
  
  // Create the comet nucleus (dirty snowball)
  const nucleusGeometry = new THREE.SphereGeometry(1, 24, 24);
  
  // Distort the nucleus to make it irregular
  const positions = nucleusGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Calculate normalized position
    const length = Math.sqrt(x * x + y * y + z * z);
    const nx = x / length;
    const ny = y / length;
    const nz = z / length;
    
    // Add irregular bumps and craters
    const displacement = 
      0.2 * seededRandom(-1, 1, i + 1100) + 
      0.1 * seededRandom(-1, 1, i + 1200);
    
    positions[i] = nx * (1 + displacement);
    positions[i + 1] = ny * (1 + displacement);
    positions[i + 2] = nz * (1 + displacement);
  }
  
  // Dirty ice material - mix of ice and dust
  const nucleusMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(
      seededRandom(0.5, 0.7, 1300),
      seededRandom(0.5, 0.7, 1301),
      seededRandom(0.6, 0.8, 1302)
    ),
    roughness: seededRandom(0.6, 0.9, 1303),
    metalness: seededRandom(0.1, 0.3, 1304)
  });
  
  const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
  group.add(nucleus);
  
  // Create the comet tail (particles)
  const tailLength = seededRandom(3, 8, 1400);
  const tailParticleCount = Math.floor(seededRandom(100, 300, 1401));
  
  const tailGeometry = new THREE.BufferGeometry();
  const tailPositions = new Float32Array(tailParticleCount * 3);
  const tailColors = new Float32Array(tailParticleCount * 3);
  
  // Create the tail particles with distance-based opacity
  for (let i = 0; i < tailParticleCount; i++) {
    const i3 = i * 3;
    
    // Position along the tail - more particles near the nucleus
    const distanceFromNucleus = Math.pow(seededRandom(0, 1, i + 1500), 0.5) * tailLength;
    
    // Spread increases with distance from nucleus
    const spreadFactor = distanceFromNucleus * 0.2;
    const xOffset = seededRandom(-spreadFactor, spreadFactor, i + 1600);
    const yOffset = seededRandom(-spreadFactor, spreadFactor, i + 1700);
    
    // Tail extends in -z direction (assuming comet is moving in +z)
    tailPositions[i3] = xOffset;
    tailPositions[i3 + 1] = yOffset;
    tailPositions[i3 + 2] = -distanceFromNucleus;
    
    // Color varies from blueish white near nucleus to blue in tail
    const colorPos = distanceFromNucleus / tailLength;
    tailColors[i3] = 0.7 - colorPos * 0.5; // R: decreases along tail
    tailColors[i3 + 1] = 0.8 - colorPos * 0.3; // G: decreases along tail
    tailColors[i3 + 2] = 1.0; // B: stays blue throughout
  }
  
  tailGeometry.setAttribute('position', new THREE.BufferAttribute(tailPositions, 3));
  tailGeometry.setAttribute('color', new THREE.BufferAttribute(tailColors, 3));
  
  const tailMaterial = new THREE.PointsMaterial({
    size: 0.1,
    transparent: true,
    opacity: 0.7,
    vertexColors: true
  });
  
  const tail = new THREE.Points(tailGeometry, tailMaterial);
  group.add(tail);
  
  // Add some sublimation jets from the nucleus surface
  const jetCount = Math.floor(seededRandom(2, 5, 1800));
  
  for (let i = 0; i < jetCount; i++) {
    // Random position on the surface
    const phi = seededRandom(0, Math.PI, 1801 + i * 10);
    const theta = seededRandom(0, Math.PI * 2, 1802 + i * 10);
    
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);
    
    // Create a conical jet of particles
    const jetLength = seededRandom(0.5, 1.5, 1803 + i * 10);
    const jetParticleCount = Math.floor(seededRandom(20, 50, 1804 + i * 10));
    const jetAngle = seededRandom(0.1, 0.3, 1805 + i * 10);
    
    const jetGeometry = new THREE.BufferGeometry();
    const jetPositions = new Float32Array(jetParticleCount * 3);
    
    for (let j = 0; j < jetParticleCount; j++) {
      const j3 = j * 3;
      
      // Distance from nucleus along jet
      const distance = seededRandom(0.1, jetLength, j + 1900 + i * 100);
      
      // Spread increases with distance
      const spread = distance * jetAngle;
      const offsetX = seededRandom(-spread, spread, j + 2000 + i * 100);
      const offsetY = seededRandom(-spread, spread, j + 2100 + i * 100);
      
      // Calculate position along jet direction
      jetPositions[j3] = x * 1.01 + offsetX + x * distance;
      jetPositions[j3 + 1] = y * 1.01 + offsetY + y * distance;
      jetPositions[j3 + 2] = z * 1.01 + z * distance;
    }
    
    jetGeometry.setAttribute('position', new THREE.BufferAttribute(jetPositions, 3));
    
    const jetMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(0xaaddff),
      size: 0.05,
      transparent: true,
      opacity: 0.8
    });
    
    const jet = new THREE.Points(jetGeometry, jetMaterial);
    group.add(jet);
  }
}

/**
 * Creates a dust cloud model
 */
function createDustCloud(group: THREE.Group, seed: number): void {
  // Use deterministic random from seed
  const seededRandom = (min: number, max: number, offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    const rand = x - Math.floor(x); // 0-1 range
    return min + rand * (max - min);
  };
  
  // Create a cloud of dust particles
  const particleCount = Math.floor(seededRandom(100, 300, 2200));
  const cloudRadius = seededRandom(1, 2, 2201);
  
  const cloudGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Create a spherical cloud with higher density in center
    const theta = seededRandom(0, Math.PI * 2, i + 2300);
    const phi = Math.acos(2 * seededRandom(0, 1, i + 2400) - 1);
    const r = cloudRadius * Math.pow(seededRandom(0, 1, i + 2500), 0.5); // sqrt for uniform distribution
    
    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);
    
    // Dust color varies from reddish brown to gray
    const dustType = seededRandom(0, 1, i + 2600);
    if (dustType < 0.7) {
      // Brownish dust
      colors[i3] = seededRandom(0.4, 0.6, i + 2700); // R
      colors[i3 + 1] = seededRandom(0.3, 0.5, i + 2800); // G
      colors[i3 + 2] = seededRandom(0.2, 0.4, i + 2900); // B
    } else {
      // Grayish dust
      const gray = seededRandom(0.4, 0.7, i + 3000);
      colors[i3] = gray; // R
      colors[i3 + 1] = gray; // G
      colors[i3 + 2] = gray; // B
    }
    
    // Random particle sizes
    sizes[i] = seededRandom(0.05, 0.15, i + 3100);
  }
  
  cloudGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  cloudGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  cloudGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  // Create a shader material for better-looking particles
  const cloudMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true
  });
  
  const dustCloud = new THREE.Points(cloudGeometry, cloudMaterial);
  group.add(dustCloud);
  
  // Add some larger dust grains/small rocks
  const largerGrainCount = Math.floor(seededRandom(5, 15, 3200));
  
  for (let i = 0; i < largerGrainCount; i++) {
    // Create small irregular rocks
    const grainGeometry = new THREE.SphereGeometry(seededRandom(0.05, 0.2, i + 3300), 8, 8);
    
    // Distort the geometry for irregular shape
    const grainPositions = grainGeometry.attributes.position.array;
    for (let j = 0; j < grainPositions.length; j += 3) {
      grainPositions[j] *= seededRandom(0.8, 1.2, j + i * 1000 + 3400);
      grainPositions[j + 1] *= seededRandom(0.8, 1.2, j + i * 1000 + 3500);
      grainPositions[j + 2] *= seededRandom(0.8, 1.2, j + i * 1000 + 3600);
    }
    
    const dustColor = new THREE.Color(
      seededRandom(0.3, 0.6, i + 3700),
      seededRandom(0.2, 0.5, i + 3800),
      seededRandom(0.1, 0.4, i + 3900)
    );
    
    const grainMaterial = new THREE.MeshStandardMaterial({
      color: dustColor,
      roughness: 0.9,
      metalness: 0.1
    });
    
    const grain = new THREE.Mesh(grainGeometry, grainMaterial);
    
    // Position within the cloud
    const theta = seededRandom(0, Math.PI * 2, i + 4000);
    const phi = Math.acos(2 * seededRandom(0, 1, i + 4100) - 1);
    const r = cloudRadius * 0.7 * seededRandom(0, 1, i + 4200);
    
    grain.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    
    // Random rotation
    grain.rotation.set(
      seededRandom(0, Math.PI * 2, i + 4300),
      seededRandom(0, Math.PI * 2, i + 4400),
      seededRandom(0, Math.PI * 2, i + 4500)
    );
    
    group.add(grain);
  }
}

/**
 * Creates space junk/debris from spacecraft/satellites
 */
function createSpaceJunk(group: THREE.Group, seed: number): void {
  // Use deterministic random from seed
  const seededRandom = (min: number, max: number, offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    const rand = x - Math.floor(x); // 0-1 range
    return min + rand * (max - min);
  };
  
  // Determine what type of space junk to create
  const junkType = Math.floor(seededRandom(0, 4, 5000));
  
  if (junkType === 0) {
    // Satellite panel/solar array
    createSatellitePanel(group, seededRandom);
  } else if (junkType === 1) {
    // Rocket stage/fuel tank
    createRocketDebris(group, seededRandom);
  } else if (junkType === 2) {
    // Satellite dish/antenna
    createSatelliteAntenna(group, seededRandom);
  } else {
    // Generic spacecraft fragment
    createSpacecraftFragment(group, seededRandom);
  }
}

/**
 * Creates a broken satellite panel/solar array
 */
function createSatellitePanel(group: THREE.Group, seededRandom: (min: number, max: number, offset: number) => number): void {
  // Create solar panel base
  const panelWidth = seededRandom(0.8, 1.5, 5100);
  const panelHeight = seededRandom(0.05, 0.1, 5101);
  const panelDepth = seededRandom(1.2, 2, 5102);
  
  const panelGeometry = new THREE.BoxGeometry(panelWidth, panelHeight, panelDepth);
  
  // Break off a corner of the panel for damage
  const positions = panelGeometry.attributes.position.array;
  const cornerToBreak = Math.floor(seededRandom(0, 4, 5103));
  
  const cornerIndices = [
    [0, 1, 2], // corner 0
    [3, 4, 5], // corner 1
    [6, 7, 8], // corner 2
    [9, 10, 11] // corner 3
  ];
  
  const selectedCorner = cornerIndices[cornerToBreak];
  for (let i = 0; i < selectedCorner.length; i++) {
    const index = selectedCorner[i] * 3;
    positions[index] *= seededRandom(0.5, 0.8, 5104 + i);
    positions[index + 1] *= seededRandom(0.5, 0.8, 5105 + i);
    positions[index + 2] *= seededRandom(0.5, 0.8, 5106 + i);
  }
  
  // Solar panel material - blue photovoltaic cells
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x2244aa),
    roughness: 0.5,
    metalness: 0.7
  });
  
  const panel = new THREE.Mesh(panelGeometry, panelMaterial);
  group.add(panel);
  
  // Add solar cell grid pattern
  const cellRows = Math.floor(panelDepth / 0.2);
  const cellCols = Math.floor(panelWidth / 0.2);
  
  for (let r = 0; r < cellRows; r++) {
    for (let c = 0; c < cellCols; c++) {
      // Skip some cells for damage
      if (seededRandom(0, 1, 5200 + r * 100 + c) < 0.2) continue;
      
      // Skip cells near the broken corner
      const isNearBrokenCorner = 
        (cornerToBreak === 0 && c < cellCols/3 && r < cellRows/3) ||
        (cornerToBreak === 1 && c > cellCols*2/3 && r < cellRows/3) ||
        (cornerToBreak === 2 && c < cellCols/3 && r > cellRows*2/3) ||
        (cornerToBreak === 3 && c > cellCols*2/3 && r > cellRows*2/3);
      
      if (isNearBrokenCorner && seededRandom(0, 1, 5300 + r * 100 + c) < 0.7) continue;
      
      const cellWidth = panelWidth / cellCols * 0.9;
      const cellDepth = panelDepth / cellRows * 0.9;
      
      const cellGeometry = new THREE.PlaneGeometry(cellWidth, cellDepth);
      const cellMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x1133aa),
        roughness: 0.4,
        metalness: 0.8
      });
      
      const cell = new THREE.Mesh(cellGeometry, cellMaterial);
      
      // Position cell on panel
      const xPos = -panelWidth/2 + cellWidth/2 + c * (panelWidth / cellCols);
      const zPos = -panelDepth/2 + cellDepth/2 + r * (panelDepth / cellRows);
      
      cell.position.set(xPos, panelHeight/2 + 0.001, zPos);
      cell.rotation.x = -Math.PI/2;
      
      group.add(cell);
    }
  }
  
  // Add support structure/arm
  const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
  const armMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x888888),
    roughness: 0.5,
    metalness: 0.8
  });
  
  const arm = new THREE.Mesh(armGeometry, armMaterial);
  arm.rotation.z = Math.PI/2;
  arm.position.set(-panelWidth/2 - 0.25, 0, 0);
  
  group.add(arm);
  
  // Add broken wires/cables
  const wireCount = Math.floor(seededRandom(3, 7, 5400));
  
  for (let i = 0; i < wireCount; i++) {
    const wireGeometry = new THREE.CylinderGeometry(0.01, 0.01, seededRandom(0.1, 0.3, 5401 + i * 10), 4);
    
    const wireColor = [0xff0000, 0xffff00, 0x0000ff][Math.floor(seededRandom(0, 3, 5402 + i * 10))];
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(wireColor)
    });
    
    const wire = new THREE.Mesh(wireGeometry, wireMaterial);
    
    // Position wires at the damaged part
    let wireX, wireY, wireZ;
    
    if (cornerToBreak === 0) {
      wireX = -panelWidth/2 + seededRandom(0, panelWidth/3, 5403 + i * 10);
      wireZ = -panelDepth/2 + seededRandom(0, panelDepth/3, 5404 + i * 10);
    } else if (cornerToBreak === 1) {
      wireX = panelWidth/2 - seededRandom(0, panelWidth/3, 5405 + i * 10);
      wireZ = -panelDepth/2 + seededRandom(0, panelDepth/3, 5406 + i * 10);
    } else if (cornerToBreak === 2) {
      wireX = -panelWidth/2 + seededRandom(0, panelWidth/3, 5407 + i * 10);
      wireZ = panelDepth/2 - seededRandom(0, panelDepth/3, 5408 + i * 10);
    } else {
      wireX = panelWidth/2 - seededRandom(0, panelWidth/3, 5409 + i * 10);
      wireZ = panelDepth/2 - seededRandom(0, panelDepth/3, 5410 + i * 10);
    }
    
    wireY = 0;
    
    wire.position.set(wireX, wireY, wireZ);
    
    // Random orientation for broken wires
    wire.rotation.set(
      seededRandom(0, Math.PI * 2, 5411 + i * 10),
      seededRandom(0, Math.PI * 2, 5412 + i * 10),
      seededRandom(0, Math.PI * 2, 5413 + i * 10)
    );
    
    group.add(wire);
  }
}

/**
 * Creates rocket stage/fuel tank debris
 */
function createRocketDebris(group: THREE.Group, seededRandom: (min: number, max: number, offset: number) => number): void {
  // Create cylindrical fuel tank/rocket body
  const radius = seededRandom(0.3, 0.5, 5500);
  const height = seededRandom(1.5, 2.5, 5501);
  const tankGeometry = new THREE.CylinderGeometry(radius, radius, height, 16);
  
  // Deform part of it for damage
  const positions = tankGeometry.attributes.position.array;
  const damageSide = Math.floor(seededRandom(0, 4, 5502));
  const damageCenter = seededRandom(0, 0.8, 5503) - 0.4; // -0.4 to 0.4 along height
  const damageRadius = seededRandom(0.3, 0.6, 5504);
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Check if this vertex is in the damage area
    // Target one side of the cylinder for damage
    let angle = Math.atan2(z, x);
    if (angle < 0) angle += Math.PI * 2;
    
    const targetAngle = damageSide * Math.PI / 2;
    const angleDiff = Math.abs(angle - targetAngle);
    const withinAngle = angleDiff < Math.PI / 4 || angleDiff > Math.PI * 7 / 4;
    
    // Check if within damage height range
    const heightDiff = Math.abs(y - damageCenter * height/2);
    const withinHeight = heightDiff < height * 0.3;
    
    if (withinAngle && withinHeight) {
      // Calculate damage factor based on distance from damage center
      const distFromCenter = Math.sqrt(
        Math.pow(angle - targetAngle, 2) * radius + 
        Math.pow(heightDiff, 2)
      );
      
      if (distFromCenter < damageRadius) {
        // Push in for dent effect
        const dentFactor = 0.5 * (1 - distFromCenter / damageRadius);
        
        // Push toward opposite direction of damage
        positions[i] = x - Math.cos(targetAngle) * radius * dentFactor;
        positions[i + 2] = z - Math.sin(targetAngle) * radius * dentFactor;
      }
    }
  }
  
  // Metallic material for the tank
  const tankMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(
      seededRandom(0.7, 0.9, 5505),
      seededRandom(0.7, 0.9, 5506),
      seededRandom(0.7, 0.9, 5507)
    ),
    roughness: 0.3,
    metalness: 0.8
  });
  
  const tank = new THREE.Mesh(tankGeometry, tankMaterial);
  group.add(tank);
  
  // Add some pipes, valves, and fixtures
  const fixtureCount = Math.floor(seededRandom(3, 8, 5600));
  
  for (let i = 0; i < fixtureCount; i++) {
    // Determine fixture type
    const fixtureType = Math.floor(seededRandom(0, 3, 5601 + i * 10));
    let fixture;
    
    if (fixtureType === 0) {
      // Pipe
      const pipeGeometry = new THREE.CylinderGeometry(
        seededRandom(0.03, 0.06, 5602 + i * 10),
        seededRandom(0.03, 0.06, 5603 + i * 10),
        seededRandom(0.3, 0.7, 5604 + i * 10),
        8
      );
      
      const pipeMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x888888),
        roughness: 0.4,
        metalness: 0.7
      });
      
      fixture = new THREE.Mesh(pipeGeometry, pipeMaterial);
    } else if (fixtureType === 1) {
      // Valve/junction
      const valveGeometry = new THREE.SphereGeometry(
        seededRandom(0.05, 0.1, 5605 + i * 10),
        8, 8
      );
      
      const valveMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x444444),
        roughness: 0.5,
        metalness: 0.8
      });
      
      fixture = new THREE.Mesh(valveGeometry, valveMaterial);
    } else {
      // Box-shaped component
      const boxGeometry = new THREE.BoxGeometry(
        seededRandom(0.1, 0.2, 5606 + i * 10),
        seededRandom(0.1, 0.2, 5607 + i * 10),
        seededRandom(0.1, 0.2, 5608 + i * 10)
      );
      
      const boxMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x333333),
        roughness: 0.6,
        metalness: 0.6
      });
      
      fixture = new THREE.Mesh(boxGeometry, boxMaterial);
    }
    
    // Position around the cylinder surface - avoid the damaged area
    let angle;
    do {
      angle = seededRandom(0, Math.PI * 2, 5609 + i * 10);
      // Check if not in damaged area
      const angleDiff = Math.abs(angle - damageSide * Math.PI / 2);
      const notInDamage = !(angleDiff < Math.PI / 4 || angleDiff > Math.PI * 7 / 4);
      
      if (notInDamage) break;
    } while (true);
    
    const heightPos = seededRandom(-height/2 + 0.1, height/2 - 0.1, 5610 + i * 10);
    
    fixture.position.set(
      Math.cos(angle) * (radius + 0.05),
      heightPos,
      Math.sin(angle) * (radius + 0.05)
    );
    
    // Orient to face outward from cylinder
    fixture.lookAt(new THREE.Vector3(
      fixture.position.x * 2,
      fixture.position.y,
      fixture.position.z * 2
    ));
    
    group.add(fixture);
  }
  
  // Add scorch marks or damage decals
  const scorchGeometry = new THREE.PlaneGeometry(
    seededRandom(0.3, 0.7, 5700),
    seededRandom(0.3, 0.7, 5701)
  );
  
  const scorchMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x000000),
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  
  const scorch = new THREE.Mesh(scorchGeometry, scorchMaterial);
  
  // Position near the damaged area
  const scorchAngle = damageSide * Math.PI / 2 + seededRandom(-Math.PI/8, Math.PI/8, 5702);
  scorch.position.set(
    Math.cos(scorchAngle) * radius,
    damageCenter * height/2 + seededRandom(-0.2, 0.2, 5703),
    Math.sin(scorchAngle) * radius
  );
  
  // Orient to conform to cylinder surface
  scorch.lookAt(new THREE.Vector3(
    scorch.position.x * 2,
    scorch.position.y,
    scorch.position.z * 2
  ));
  
  // Move slightly above surface to prevent z-fighting
  scorch.position.set(
    scorch.position.x * 1.01,
    scorch.position.y,
    scorch.position.z * 1.01
  );
  
  group.add(scorch);
}

/**
 * Creates a satellite dish/antenna
 */
function createSatelliteAntenna(group: THREE.Group, seededRandom: (min: number, max: number, offset: number) => number): void {
  // Create dish base
  const dishRadius = seededRandom(0.5, 1, 5800);
  const dishDepth = seededRandom(0.2, 0.4, 5801);
  
  // Create a parabolic dish shape
  const dishSegments = 32;
  const dishShape = new THREE.Shape();
  
  for (let i = 0; i <= dishSegments; i++) {
    const t = i / dishSegments;
    const x = dishRadius * (1 - 2 * t);
    const y = -4 * dishDepth * t * (t - 1); // Parabola equation
    
    if (i === 0) {
      dishShape.moveTo(x, y);
    } else {
      dishShape.lineTo(x, y);
    }
  }
  
  // Revolve the shape to create a dish
  const dishGeometry = new THREE.LatheGeometry(
    dishShape.getPoints(),
    16 // Radial segments
  );
  
  // Damage part of the dish
  const positions = dishGeometry.attributes.position.array;
  const damageAngle = seededRandom(0, Math.PI * 2, 5802);
  const damageWidth = seededRandom(Math.PI/4, Math.PI/2, 5803);
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Calculate angle around the dish
    let angle = Math.atan2(z, x);
    if (angle < 0) angle += Math.PI * 2;
    
    // Check if this part should be damaged
    const angleDiff = Math.abs(angle - damageAngle);
    const inDamageZone = angleDiff < damageWidth / 2 || angleDiff > Math.PI * 2 - damageWidth / 2;
    
    if (inDamageZone) {
      // How far from the edge of the dish
      const distFromCenter = Math.sqrt(x * x + z * z);
      const edgeFactor = distFromCenter / dishRadius;
      
      if (edgeFactor > 0.7) {
        // Damage is more severe near the edge
        const damageFactor = (edgeFactor - 0.7) / 0.3;
        
        // Distort the vertex
        positions[i] = x * (1 - damageFactor * 0.5);
        positions[i + 1] = y * (1 - damageFactor * 0.7);
        positions[i + 2] = z * (1 - damageFactor * 0.5);
      }
    }
  }
  
  const dishMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(
      seededRandom(0.8, 0.9, 5804),
      seededRandom(0.8, 0.9, 5805),
      seededRandom(0.8, 0.9, 5806)
    ),
    roughness: 0.5,
    metalness: 0.7,
    side: THREE.DoubleSide
  });
  
  const dish = new THREE.Mesh(dishGeometry, dishMaterial);
  
  // Rotate to standard orientation (dish facing up)
  dish.rotation.x = Math.PI;
  
  group.add(dish);
  
  // Add feed arm/receiver
  const armLength = dishRadius * 0.8;
  const armGeometry = new THREE.CylinderGeometry(0.02, 0.02, armLength, 8);
  const armMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x888888),
    roughness: 0.5,
    metalness: 0.8
  });
  
  const arm = new THREE.Mesh(armGeometry, armMaterial);
  arm.position.set(0, dishDepth / 2 + armLength / 2, 0);
  
  group.add(arm);
  
  // Add receiver at the focal point
  const receiverGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
  const receiverMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x333333),
    roughness: 0.6,
    metalness: 0.7
  });
  
  const receiver = new THREE.Mesh(receiverGeometry, receiverMaterial);
  receiver.position.set(0, dishDepth / 2 + armLength, 0);
  receiver.rotation.x = Math.PI / 2;
  
  group.add(receiver);
  
  // Add some broken/hanging wires
  const wireCount = Math.floor(seededRandom(2, 5, 5900));
  
  for (let i = 0; i < wireCount; i++) {
    // Create a segmented wire with a curve
    const points = [];
    const wireLength = seededRandom(0.2, 0.5, 5901 + i * 10);
    const segments = 10;
    
    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      
      // Create a hanging wire curve
      const x = t * wireLength;
      const y = -Math.sin(t * Math.PI) * wireLength * 0.2;
      points.push(new THREE.Vector3(x, y, 0));
    }
    
    const wireCurve = new THREE.CatmullRomCurve3(points);
    const wireGeometry = new THREE.TubeGeometry(wireCurve, 20, 0.005, 8, false);
    
    // Choose red, blue, or yellow for wire color
    const wireColors = [0xff0000, 0x0000ff, 0xffff00];
    const wireColor = wireColors[Math.floor(seededRandom(0, wireColors.length, 5902 + i * 10))];
    
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(wireColor)
    });
    
    const wire = new THREE.Mesh(wireGeometry, wireMaterial);
    
    // Position near the damage area
    const wireAngle = damageAngle + seededRandom(-damageWidth/4, damageWidth/4, 5903 + i * 10);
    
    // Start at the dish edge
    wire.position.set(
      Math.cos(wireAngle) * dishRadius * 0.9,
      0,
      Math.sin(wireAngle) * dishRadius * 0.9
    );
    
    // Rotate to hang from the damage point
    wire.lookAt(new THREE.Vector3(0, 0, 0));
    wire.rotateX(-Math.PI/2);
    
    group.add(wire);
  }
  
  // Add support/mount structure
  const mountGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.2);
  const mountMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x444444),
    roughness: 0.6,
    metalness: 0.7
  });
  
  const mount = new THREE.Mesh(mountGeometry, mountMaterial);
  mount.position.set(0, -dishDepth - 0.05, 0);
  
  group.add(mount);
}

/**
 * Creates generic spacecraft fragment
 */
function createSpacecraftFragment(group: THREE.Group, seededRandom: (min: number, max: number, offset: number) => number): void {
  // Create an irregular fragment shape
  const fragmentShape = Math.floor(seededRandom(0, 3, 6000));
  
  let fragmentGeometry;
  if (fragmentShape === 0) {
    // Irregular box fragment
    fragmentGeometry = new THREE.BoxGeometry(
      seededRandom(0.5, 1, 6001),
      seededRandom(0.2, 0.5, 6002),
      seededRandom(0.5, 1, 6003)
    );
  } else if (fragmentShape === 1) {
    // Irregular cylinder fragment
    fragmentGeometry = new THREE.CylinderGeometry(
      seededRandom(0.2, 0.4, 6004),
      seededRandom(0.2, 0.4, 6005),
      seededRandom(0.5, 1, 6006),
      8
    );
  } else {
    // Irregular cone fragment
    fragmentGeometry = new THREE.ConeGeometry(
      seededRandom(0.3, 0.6, 6007),
      seededRandom(0.5, 1, 6008),
      8
    );
  }
  
  // Distort the geometry to make it more irregular and damaged
  const positions = fragmentGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    // Irregular distortion
    positions[i] += seededRandom(-0.1, 0.1, 6100 + i);
    positions[i + 1] += seededRandom(-0.1, 0.1, 6200 + i);
    positions[i + 2] += seededRandom(-0.1, 0.1, 6300 + i);
  }
  
  // Fragment material - choose between hull material or internal component
  const materialType = Math.floor(seededRandom(0, 3, 6400));
  let fragmentMaterial;
  
  if (materialType === 0) {
    // Spacecraft hull material (metallic)
    fragmentMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(
        seededRandom(0.7, 0.9, 6401),
        seededRandom(0.7, 0.9, 6402),
        seededRandom(0.7, 0.9, 6403)
      ),
      roughness: 0.4,
      metalness: 0.8
    });
  } else if (materialType === 1) {
    // Interior component (darker, complex)
    fragmentMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(
        seededRandom(0.2, 0.4, 6404),
        seededRandom(0.2, 0.4, 6405),
        seededRandom(0.2, 0.4, 6406)
      ),
      roughness: 0.6,
      metalness: 0.5
    });
  } else {
    // Heat shield or special material
    fragmentMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(
        seededRandom(0.1, 0.3, 6407),
        seededRandom(0.1, 0.3, 6408),
        seededRandom(0.1, 0.3, 6409)
      ),
      roughness: 0.8,
      metalness: 0.2
    });
  }
  
  const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
  group.add(fragment);
  
  // Add details appropriate to the fragment type
  const detailCount = Math.floor(seededRandom(3, 8, 6500));
  
  for (let i = 0; i < detailCount; i++) {
    // Determine detail type
    const detailType = Math.floor(seededRandom(0, 3, 6501 + i * 10));
    let detail;
    
    if (detailType === 0) {
      // Broken pipe/wire
      const pipeGeometry = new THREE.CylinderGeometry(
        seededRandom(0.01, 0.03, 6502 + i * 10),
        seededRandom(0.01, 0.03, 6503 + i * 10),
        seededRandom(0.1, 0.3, 6504 + i * 10),
        6
      );
      
      const pipeColor = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xaaaaaa][
        Math.floor(seededRandom(0, 5, 6505 + i * 10))
      ];
      
      const pipeMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(pipeColor),
        roughness: 0.5,
        metalness: 0.6
      });
      
      detail = new THREE.Mesh(pipeGeometry, pipeMaterial);
    } else if (detailType === 1) {
      // Small component/box
      const boxGeometry = new THREE.BoxGeometry(
        seededRandom(0.05, 0.15, 6506 + i * 10),
        seededRandom(0.05, 0.15, 6507 + i * 10),
        seededRandom(0.05, 0.15, 6508 + i * 10)
      );
      
      const boxMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x444444),
        roughness: 0.6,
        metalness: 0.5
      });
      
      detail = new THREE.Mesh(boxGeometry, boxMaterial);
    } else {
      // Panel/grid
      const gridGeometry = new THREE.PlaneGeometry(
        seededRandom(0.1, 0.3, 6509 + i * 10),
        seededRandom(0.1, 0.3, 6510 + i * 10)
      );
      
      const gridMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(
          seededRandom(0.2, 0.8, 6511 + i * 10),
          seededRandom(0.2, 0.8, 6512 + i * 10),
          seededRandom(0.2, 0.8, 6513 + i * 10)
        ),
        roughness: 0.7,
        metalness: 0.3,
        side: THREE.DoubleSide
      });
      
      detail = new THREE.Mesh(gridGeometry, gridMaterial);
    }
    
    // Position randomly on the fragment
    detail.position.set(
      seededRandom(-0.3, 0.3, 6514 + i * 10),
      seededRandom(-0.3, 0.3, 6515 + i * 10),
      seededRandom(-0.3, 0.3, 6516 + i * 10)
    );
    
    // Random rotation
    detail.rotation.set(
      seededRandom(0, Math.PI * 2, 6517 + i * 10),
      seededRandom(0, Math.PI * 2, 6518 + i * 10),
      seededRandom(0, Math.PI * 2, 6519 + i * 10)
    );
    
    group.add(detail);
  }
  
  // Add scorch/burn marks from reentry or explosion
  if (seededRandom(0, 1, 6600) > 0.3) {
    const scorchGeometry = new THREE.PlaneGeometry(
      seededRandom(0.2, 0.4, 6601),
      seededRandom(0.2, 0.4, 6602)
    );
    
    const scorchMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x000000),
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    const scorch = new THREE.Mesh(scorchGeometry, scorchMaterial);
    
    // Position on a random side
    const scorchSide = Math.floor(seededRandom(0, 6, 6603));
    let scorchPos = new THREE.Vector3();
    let scorchRot = new THREE.Euler();
    
    switch (scorchSide) {
      case 0: // +X
        scorchPos.set(0.3, 0, 0);
        scorchRot.set(0, Math.PI/2, 0);
        break;
      case 1: // -X
        scorchPos.set(-0.3, 0, 0);
        scorchRot.set(0, -Math.PI/2, 0);
        break;
      case 2: // +Y
        scorchPos.set(0, 0.3, 0);
        scorchRot.set(-Math.PI/2, 0, 0);
        break;
      case 3: // -Y
        scorchPos.set(0, -0.3, 0);
        scorchRot.set(Math.PI/2, 0, 0);
        break;
      case 4: // +Z
        scorchPos.set(0, 0, 0.3);
        scorchRot.set(0, 0, 0);
        break;
      case 5: // -Z
        scorchPos.set(0, 0, -0.3);
        scorchRot.set(0, Math.PI, 0);
        break;
    }
    
    // Add small random offset
    scorchPos.x += seededRandom(-0.1, 0.1, 6604);
    scorchPos.y += seededRandom(-0.1, 0.1, 6605);
    scorchPos.z += seededRandom(-0.1, 0.1, 6606);
    
    scorch.position.copy(scorchPos);
    scorch.rotation.copy(scorchRot);
    
    group.add(scorch);
  }
}