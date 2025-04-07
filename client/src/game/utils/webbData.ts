import * as THREE from 'three';
import { 
  GalaxyType, 
  GalaxyData, 
  Star,
  StellarObjectType,
  NebulaType,
  WebbObservationData 
} from '../types';

// Real Webb telescope-inspired data for galaxy generation
// Based on actual observations and astronomical parameters

// Approximate colors of stellar objects based on their temperature class
export const stellarColors = {
  O: new THREE.Color(0.5, 0.5, 1.0),    // 30,000+ K, blue
  B: new THREE.Color(0.6, 0.6, 1.0),    // 10,000-30,000 K, blue-white
  A: new THREE.Color(0.8, 0.8, 1.0),    // 7,500-10,000 K, white
  F: new THREE.Color(1.0, 1.0, 0.8),    // 6,000-7,500 K, yellow-white
  G: new THREE.Color(1.0, 1.0, 0.0),    // 5,000-6,000 K, yellow (sun-like)
  K: new THREE.Color(1.0, 0.8, 0.0),    // 3,500-5,000 K, orange
  M: new THREE.Color(1.0, 0.5, 0.0),    // 2,500-3,500 K, red
  L: new THREE.Color(0.8, 0.2, 0.0),    // 1,300-2,500 K, dark red
  T: new THREE.Color(0.5, 0.3, 0.0),    // 700-1,300 K, brown
  Y: new THREE.Color(0.3, 0.3, 0.3),    // <700 K, infrared
  // Special objects
  'neutron_star': new THREE.Color(0.9, 0.9, 1.0),
  'black_hole': new THREE.Color(0.0, 0.0, 0.0),
  'white_dwarf': new THREE.Color(1.0, 1.0, 1.0),
  'red_giant': new THREE.Color(1.0, 0.3, 0.0),
  'supergiant': new THREE.Color(1.0, 0.1, 0.0),
};

// Webb deep field observation-inspired nebula colors
export const nebulaColors = {
  'emission': [
    new THREE.Color(0.9, 0.2, 0.3),    // H-alpha (red)
    new THREE.Color(0.5, 1.0, 0.5),    // OIII (green/teal)
    new THREE.Color(0.1, 0.4, 1.0),    // Hydrogen (blue)
  ],
  'reflection': [
    new THREE.Color(0.5, 0.7, 1.0),    // Blue reflection
    new THREE.Color(0.7, 0.7, 1.0),    // Blue-white reflection
    new THREE.Color(0.3, 0.5, 0.8),    // Dusty blue
  ],
  'dark': [
    new THREE.Color(0.05, 0.05, 0.1),  // Dark dust
    new THREE.Color(0.1, 0.05, 0.05),  // Dark carbon
    new THREE.Color(0.05, 0.1, 0.1),   // Dark molecular
  ],
  'planetary': [
    new THREE.Color(0.2, 1.0, 0.6),    // Green-blue
    new THREE.Color(0.5, 0.8, 1.0),    // Blue
    new THREE.Color(1.0, 0.2, 0.5),    // Magenta
  ],
  'supernova_remnant': [
    new THREE.Color(1.0, 0.5, 0.0),    // Orange
    new THREE.Color(1.0, 0.3, 0.3),    // Red
    new THREE.Color(0.8, 0.2, 0.5),    // Purple-red
  ],
};

// Galaxy shape and structure parameters inspired by real Webb observations
export const galaxyShapeParameters = {
  'spiral': {
    armCount: [2, 4, 6, 8],
    armTightness: [0.2, 0.5, 0.8, 1.0],
    diskThickness: [0.05, 0.1, 0.15, 0.2], 
    bulgeSize: [0.1, 0.2, 0.3],
    starConcentration: [0.5, 0.7, 0.8],
    dustLaneProminence: [0.2, 0.4, 0.6],
  },
  'elliptical': {
    eccentricity: [0.1, 0.3, 0.5, 0.7, 0.9],
    concentration: [0.5, 0.7, 0.9],
    stars: {
      ageDistribution: 'old',
      colorDistribution: 'red',
    },
  },
  'irregular': {
    clumpiness: [0.3, 0.5, 0.7, 0.9],
    asymmetry: [0.4, 0.6, 0.8],
    starFormation: 'active',
  },
  'lenticular': {
    diskThickness: [0.05, 0.1, 0.15],
    bulgeRatio: [0.4, 0.5, 0.6],
    dust: 'minimal',
  },
  'dwarf': {
    size: 'small',
    starCount: 'low',
    metalicity: 'low',
  },
  'quasar': {
    coreSize: [0.2, 0.3, 0.4],
    coreIntensity: [3.0, 5.0, 8.0],
    jetPresent: true,
    hostGalaxyVisible: false,
  },
  'active_galactic_nucleus': {
    coreSize: [0.2, 0.3],
    coreIntensity: [2.0, 3.0, 4.0],
    jetPresent: [true, false],
    dustTorus: true,
  },
};

// Real Webb discovery-inspired phenomena
export const specialFeatures = [
  'dust_lanes',           // Observed in edge-on spiral galaxies
  'star_forming_regions', // Identified in Webb IR observations
  'stellar_jet',          // Jets from young stellar objects
  'planetary_system',     // Exoplanet systems detected by Webb
  'ionization_front',     // Boundaries between ionized and neutral gas
  'molecular_cloud',      // Star-forming gas clouds
  'globular_cluster',     // Dense cluster of old stars
  'protoplanetary_disk',  // Disk of material around young stars
  'interacting_galaxies', // Colliding or merging galaxies
  'gravitational_lensing', // Bending of light by massive objects
  'supernova_remnant',     // Remains of exploded star
  'Wolf_Rayet_stars',      // Hot, massive stars losing mass rapidly
  'cosmic_web_filament',   // Large-scale structure connections
  'gamma_ray_burst_afterglow', // GRB observed in infrared
  'tidal_stream',          // Stars stripped from satellite galaxies
  'active_galactic_nucleus', // Bright galaxy center with supermassive black hole
  'galactic_bar',          // Bar structure in spiral galaxy
  'microlensing_event',    // Temporary brightening by passing object
  'missing_satellites',    // Lack of expected dwarf galaxies
  'high_redshift_source',  // Very distant objects from early universe
];

// Real Webb instrument-based observation parameters
export const webbInstruments = [
  {
    name: 'NIRCam',
    wavelengthRange: [0.6, 5.0],  // microns
    resolution: 'high',
    primaryUse: 'imaging',
  },
  {
    name: 'MIRI',
    wavelengthRange: [5.0, 28.0], // microns
    resolution: 'medium',
    primaryUse: 'imaging/spectroscopy',
  },
  {
    name: 'NIRSpec',
    wavelengthRange: [0.6, 5.0],  // microns
    resolution: 'medium',
    primaryUse: 'spectroscopy',
  },
  {
    name: 'FGS/NIRISS',
    wavelengthRange: [0.8, 5.0],  // microns
    resolution: 'low',
    primaryUse: 'guidance/parallel observation',
  },
];

// Stellar temperature to spectral class mapping (approximate)
function temperatureToSpectralClass(temperature: number): string {
  if (temperature > 30000) return 'O';
  if (temperature > 10000) return 'B';
  if (temperature > 7500) return 'A';
  if (temperature > 6000) return 'F';
  if (temperature > 5000) return 'G';
  if (temperature > 3500) return 'K';
  if (temperature > 2500) return 'M';
  if (temperature > 1300) return 'L';
  if (temperature > 700) return 'T';
  return 'Y';
}

// Generate random Webb-inspired galaxy data
export function generateGalaxyData(galaxyNumber: number): GalaxyData {
  // Use galaxy number as seed for consistent generation but add chaos elements
  // Prime multipliers make the distribution more chaotic
  const seed = galaxyNumber * 1327 + (galaxyNumber % 13) * 97;
  const seededRandom = (min: number, max: number, offset: number = 0) => {
    // For more chaotic results, use multiple sine waves with different frequencies
    // This creates more natural-looking randomness that still remains deterministic
    const x1 = Math.sin(seed + offset * 17.39) * 10000;
    const x2 = Math.cos(seed * 0.37 + offset * 5.13) * 10000;
    const x3 = Math.sin((seed + offset) * 0.71) * 10000;
    
    // Combine the waves for more chaotic but still deterministic randomness
    const rand = (
      (x1 - Math.floor(x1)) * 0.5 + 
      (x2 - Math.floor(x2)) * 0.3 + 
      (x3 - Math.floor(x3)) * 0.2
    );
    
    return rand * (max - min) + min;
  };
  
  // For galaxy type, use a weighted distribution to mimic real universe distribution
  // But for higher galaxy numbers, make exotic types more common
  const types: GalaxyType[] = ['spiral', 'elliptical', 'irregular', 'lenticular', 'dwarf', 'quasar', 'active_galactic_nucleus'];
  
  // Dynamic weights that change based on galaxy number to create an evolving universe
  // The deeper the player goes, the more exotic the galaxies become
  const exoticFactor = Math.min(0.6, galaxyNumber * 0.05); // Increases with galaxy number
  const weights = [
    0.6 - exoticFactor * 0.5, // spiral decreases 
    0.2 - exoticFactor * 0.1, // elliptical decreases
    0.1 + exoticFactor * 0.1, // irregular increases
    0.05, // lenticular stays the same
    0.03 + exoticFactor * 0.1, // dwarf increases
    0.01 + exoticFactor * 0.2, // quasar increases significantly
    0.01 + exoticFactor * 0.2  // AGN increases significantly
  ];
  
  // Add chaos with perturbed weights - slight randomization to keep things interesting
  const perturbedWeights = weights.map((w, i) => {
    // More perturbation for exotic types
    const perturbationAmount = i < 3 ? 0.05 : 0.1;
    return Math.max(0, w + seededRandom(-perturbationAmount, perturbationAmount, i * 100));
  });
  
  // Normalize weights to ensure they still sum to 1
  const sum = perturbedWeights.reduce((a, b) => a + b, 0);
  const normalizedWeights = perturbedWeights.map(w => w / sum);
  
  // Select type based on weights
  const randomValue = seededRandom(0, 1, 7331); // Large offset for more independence
  let cumulativeWeight = 0;
  let selectedTypeIndex = 0;
  
  for (let i = 0; i < normalizedWeights.length; i++) {
    cumulativeWeight += normalizedWeights[i];
    if (randomValue <= cumulativeWeight) {
      selectedTypeIndex = i;
      break;
    }
  }
  
  const galaxyType = types[selectedTypeIndex];
  
  // Higher galaxy numbers = more redshift (more distant, earlier universe)
  const redshift = Math.min(10, (0.1 + (galaxyNumber / 10))) * seededRandom(0.8, 1.2);
  
  // Higher galaxy numbers = higher chance of active features
  const baseActiveChance = 0.1 + (galaxyNumber * 0.05);
  
  // Scale up star count with galaxy number
  const baseStarCount = 500 + (galaxyNumber * 50);
  
  // Random special features
  const featureCount = Math.min(5, Math.floor(1 + seededRandom(0, galaxyNumber / 2)));
  const shuffled = [...specialFeatures].sort(() => seededRandom(-0.5, 0.5) - 0.5);
  const selectedFeatures = shuffled.slice(0, featureCount);
  
  return {
    type: galaxyType,
    radius: 50 + galaxyNumber * 5 * seededRandom(0.8, 1.2),
    starCount: baseStarCount * seededRandom(0.8, 1.2),
    age: 13.8 - (redshift * 0.8) * seededRandom(0.9, 1.1), // Age in billions of years
    redshift,
    hasActiveCenter: seededRandom(0, 1) < baseActiveChance,
    hasSupernovae: seededRandom(0, 1) < (0.2 + galaxyNumber * 0.03),
    hasBlackHole: seededRandom(0, 1) < (0.5 + galaxyNumber * 0.05),
    hasWormhole: seededRandom(0, 1) < (0.05 + galaxyNumber * 0.01),
    stellarDensity: (0.2 + galaxyNumber * 0.1) * seededRandom(0.8, 1.2),
    darkMatterRatio: (5 + seededRandom(0, 5)) * seededRandom(0.9, 1.1),
    interstellarMedium: {
      density: 1e6 * seededRandom(0.5, 2.0),
      temperature: 10000 * seededRandom(0.5, 1.5),
      metalicity: (0.02 + galaxyNumber * 0.002) * seededRandom(0.8, 1.2),
    },
    specialFeatures: selectedFeatures,
    // Only assign a connection if there's a wormhole
    connectsTo: seededRandom(0, 1) < 0.05 ? Math.floor(seededRandom(1, galaxyNumber * 2)) : undefined,
    // Simple spectral signature (simplified emission/absorption lines)
    spectralSignature: Array.from({ length: 5 }, () => seededRandom(0.5, 10.0)),
  };
}

// Generate a list of stars based on real stellar distribution patterns
export function generateStars(
  count: number, 
  galaxyType: GalaxyType, 
  galaxyRadius: number, 
  seed: number
): Star[] {
  // Limit the count to improve performance
  const optimizedCount = Math.min(count, 500);
  const stars: Star[] = [];
  
  // Faster seeded random function
  const seededRandom = (min: number, max: number, offset: number = 0) => {
    // Simple but fast seeded random
    const x = Math.sin(seed + offset) * 10000;
    const rand = x - Math.floor(x);
    return min + rand * (max - min);
  };
  
  // Simplified clustering function for better performance
  const createNoise = (x: number, y: number, z: number) => {
    // Use a simpler hash-based approach instead of full 3D noise
    const hash = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed) * 43758.5453;
    return hash - Math.floor(hash);
  };
  
  // Dynamically adjust stellar type distribution based on galaxy type
  // Different galaxy types have different distributions of stellar objects
  const getStarType = (rand: number, galaxyType: GalaxyType): StellarObjectType => {
    // Base distribution thresholds
    let thresholds = {
      main_sequence: 0.80,
      red_giant: 0.90,
      white_dwarf: 0.94,
      brown_dwarf: 0.96,
      protostar: 0.98,
      supergiant: 0.992,
      neutron_star: 0.998,
      black_hole: 1.0
    };
    
    // Adjust thresholds based on galaxy type
    if (galaxyType === 'spiral') {
      // Spirals have more diverse star formation
      thresholds.main_sequence = 0.78;
      thresholds.protostar = 0.99; // More star formation
    } else if (galaxyType === 'elliptical') {
      // Ellipticals have mostly old stars
      thresholds.main_sequence = 0.75;
      thresholds.red_giant = 0.92; // More red giants
      thresholds.white_dwarf = 0.97; // More white dwarfs
      thresholds.protostar = 0.975; // Less star formation
    } else if (galaxyType === 'irregular') {
      // Irregulars have more active star formation
      thresholds.main_sequence = 0.75;
      thresholds.protostar = 0.99; // More star formation
    } else if (galaxyType === 'quasar' || galaxyType === 'active_galactic_nucleus') {
      // Active galaxies have more exotic objects
      thresholds.main_sequence = 0.70;
      thresholds.neutron_star = 0.99;
      thresholds.black_hole = 1.0; // More black holes
    }
    
    // Determine star type based on adjusted thresholds
    if (rand < thresholds.main_sequence) return 'main_sequence';
    if (rand < thresholds.red_giant) return 'red_giant';
    if (rand < thresholds.white_dwarf) return 'white_dwarf';
    if (rand < thresholds.brown_dwarf) return 'brown_dwarf';
    if (rand < thresholds.protostar) return 'protostar';
    if (rand < thresholds.supergiant) return 'supergiant';
    if (rand < thresholds.neutron_star) return 'neutron_star';
    return 'black_hole';
  };
  
  for (let i = 0; i < count; i++) {
    // Get star type with appropriate distribution using our enhanced type distribution function
    const randomValue = seededRandom(0, 1, i);
    const starType = getStarType(randomValue, galaxyType);
    
    // Generate temperature based on star type (simplified)
    let temperature = 0;
    let mass = 0;
    let luminosity = 0;
    let size = 1;
    
    switch (starType) {
      case 'main_sequence':
        // Main sequence stars have a range of temperatures
        temperature = seededRandom(2500, 40000, i + 1000);
        mass = temperature / 5000; // Approximation
        luminosity = Math.pow(mass, 3.5); // Approximation of mass-luminosity relation
        size = Math.sqrt(luminosity) * 0.1; // Size scales with sqrt of luminosity
        break;
        
      case 'red_giant':
        temperature = seededRandom(3000, 5000, i + 2000);
        mass = seededRandom(0.8, 8.0, i + 3000);
        luminosity = seededRandom(100, 1000, i + 4000);
        size = seededRandom(1.5, 3.0, i + 5000);
        break;
        
      case 'white_dwarf':
        temperature = seededRandom(8000, 40000, i + 6000);
        mass = seededRandom(0.5, 1.0, i + 7000);
        luminosity = seededRandom(0.001, 0.1, i + 8000);
        size = 0.3;
        break;
        
      case 'brown_dwarf':
        temperature = seededRandom(700, 2500, i + 9000);
        mass = seededRandom(0.01, 0.08, i + 10000);
        luminosity = seededRandom(0.00001, 0.001, i + 11000);
        size = 0.2;
        break;
        
      case 'protostar':
        temperature = seededRandom(2000, 5000, i + 12000);
        size = seededRandom(1.0, 2.0, i + 13000);
        break;
        
      case 'supergiant':
        temperature = seededRandom(3500, 30000, i + 14000);
        mass = seededRandom(10, 70, i + 15000);
        luminosity = seededRandom(30000, 500000, i + 16000);
        size = seededRandom(3.0, 5.0, i + 17000);
        break;
        
      case 'neutron_star':
        temperature = seededRandom(500000, 1000000, i + 18000);
        mass = seededRandom(1.4, 2.2, i + 19000);
        size = 0.4;
        break;
        
      case 'black_hole':
        mass = seededRandom(5, 100, i + 20000);
        size = 0.8; // Visual representation size only
        break;
    }
    
    // Position based on galaxy type with enhanced chaotic distribution
    let x = 0, y = 0, z = 0;
    let angle = 0;
    let radius = 0;
    
    // Get base density from a simplified noise function
    // This creates areas of higher and lower star density
    const noiseDensity = (Math.sin(i * 13.37) * Math.cos(i * 7.89) + Math.sin(i * 42.73)) * 0.25 + 0.5;
    const densityFactor = noiseDensity * 2.5; // Scale up the effect
    
    if (galaxyType === 'spiral') {
      // Enhanced spiral pattern with more natural variation
      // Dynamic arm count based on galaxy properties
      const armCount = 2 + Math.floor(seededRandom(0, 6, i + seed % 97));
      const armTightness = seededRandom(0.2, 1.2, i + seed % 113);
      
      // Radius with more variation - some stars extend beyond expected bounds
      radius = Math.pow(seededRandom(0, 1, i + 22000), 0.7) * galaxyRadius;
      
      // Add some perturbation to create denser spiral arms with fuzziness
      const armOffset = Math.floor(seededRandom(0, armCount, i + 23000));
      const armAngle = (armOffset / armCount) * Math.PI * 2;
      
      // Apply logarithmic spiral formula with perturbation
      const spiralAngle = armAngle + radius * armTightness;
      
      // Add turbulence that increases with radius (outer parts more chaotic)
      const turbulence = radius / galaxyRadius * seededRandom(0.05, 0.3, i + seed * 0.37);
      const turbX = seededRandom(-1, 1, i + 25973) * turbulence * radius;
      const turbZ = seededRandom(-1, 1, i + 31753) * turbulence * radius;
      
      // Base spiral coordinates
      x = Math.cos(spiralAngle) * radius + turbX;
      z = Math.sin(spiralAngle) * radius + turbZ;
      
      // Height varies with distance from center (thicker in the middle)
      const heightFactor = Math.min(1.0, 0.2 + 0.8 * (1 - radius / galaxyRadius));
      const heightVariation = seededRandom(-0.2, 0.2, i + 24000) * heightFactor * radius;
      y = heightVariation * (1 + densityFactor * 0.3); // Use noise to vary height more
      
    } else if (galaxyType === 'elliptical') {
      // Enhanced elliptical distribution with density variations
      const phi = seededRandom(0, Math.PI * 2, i + 25000);
      const theta = seededRandom(0, Math.PI, i + 26000);
      
      // Power distribution creates more central concentration
      // Use noise to create regions of higher density
      const centralityFactor = seededRandom(0.2, 0.4, i + seed % 43) * (1 + densityFactor);
      radius = Math.pow(seededRandom(0, 1, i + 27000), centralityFactor) * galaxyRadius;
      
      // Create elliptical shape with varying axis ratios
      const axisRatioY = seededRandom(0.5, 0.9, seed + 13579);
      const axisRatioZ = seededRandom(0.5, 0.9, seed + 97531);
      
      x = radius * Math.sin(theta) * Math.cos(phi);
      y = radius * Math.sin(theta) * Math.sin(phi) * axisRatioY;
      z = radius * Math.cos(theta) * axisRatioZ;
      
      // Add some wobble to the elliptical shape
      const wobble = seededRandom(0, 0.15, i * seed % 137) * radius;
      x += seededRandom(-wobble, wobble, i + 28731);
      y += seededRandom(-wobble, wobble, i + 35791);
      z += seededRandom(-wobble, wobble, i + 42013);
      
    } else if (galaxyType === 'irregular') {
      // Truly chaotic distribution with filaments and voids
      // Create clusters using the noise function
      const clusterX = Math.floor(i / 100) * 50;
      const clusterY = Math.floor((i % 100) / 10) * 50;
      const clusterZ = (i % 10) * 50;
      
      // Base random position
      x = seededRandom(-1, 1, i + 28000) * galaxyRadius;
      y = seededRandom(-0.7, 0.7, i + 29000) * galaxyRadius;
      z = seededRandom(-1, 1, i + 30000) * galaxyRadius;
      
      // Apply filamentary structure - stars tend to align in filaments
      const filamentStrength = 0.4;
      const filamentAngle = seededRandom(0, Math.PI * 2, seed + 12345);
      const filamentPull = seededRandom(0, 1, i + seed % 222) * filamentStrength;
      
      x = x * (1 - filamentPull) + Math.cos(filamentAngle) * galaxyRadius * filamentPull;
      z = z * (1 - filamentPull) + Math.sin(filamentAngle) * galaxyRadius * filamentPull;
      
      // Add influence from density noise
      x += seededRandom(-0.3, 0.3, i + 31111) * galaxyRadius * densityFactor;
      y += seededRandom(-0.2, 0.2, i + 32222) * galaxyRadius * densityFactor;
      z += seededRandom(-0.3, 0.3, i + 33333) * galaxyRadius * densityFactor;
      
    } else if (galaxyType === 'quasar' || galaxyType === 'active_galactic_nucleus') {
      // Central concentration with jets
      // Central black hole with accretion disk
      const isInJet = seededRandom(0, 1, i + 40000) < 0.15; // 15% chance for jet
      
      if (isInJet) {
        // Create bipolar jets along the y-axis
        const jetSide = seededRandom(0, 1, i + 41000) < 0.5 ? 1 : -1;
        const jetDistance = seededRandom(0.3, 1.0, i + 42000) * galaxyRadius;
        const jetWidth = 0.15 * galaxyRadius * (1 - jetDistance / galaxyRadius); // Narrower further out
        
        x = seededRandom(-jetWidth, jetWidth, i + 43000);
        y = jetSide * jetDistance * seededRandom(0.8, 1.2, i + 44000);
        z = seededRandom(-jetWidth, jetWidth, i + 45000);
      } else {
        // Create spherical/disk distribution around center
        const phi = seededRandom(0, Math.PI * 2, i + 46000);
        const diskHeight = seededRandom(0, 0.1, i + 47000) * galaxyRadius;
        radius = Math.pow(seededRandom(0, 1, i + 48000), 0.2) * galaxyRadius * 0.6; // Concentrated
        
        x = radius * Math.cos(phi);
        y = seededRandom(-diskHeight, diskHeight, i + 49000);
        z = radius * Math.sin(phi);
      }
    } else {
      // For other exotic galaxy types
      // Create interesting but chaotic distribution 
      const distributionType = Math.floor(seededRandom(0, 4, seed + i * 0.1));
      
      if (distributionType === 0) {
        // Ring-like structure
        const ringRadius = seededRandom(0.4, 0.9, i + 50000) * galaxyRadius;
        const ringAngle = seededRandom(0, Math.PI * 2, i + 51000);
        const ringThickness = seededRandom(0.05, 0.2, i + 52000) * galaxyRadius;
        
        const ringR = ringRadius + seededRandom(-ringThickness, ringThickness, i + 53000);
        x = ringR * Math.cos(ringAngle);
        z = ringR * Math.sin(ringAngle);
        y = seededRandom(-0.1, 0.1, i + 54000) * galaxyRadius;
        
      } else if (distributionType === 1) {
        // Shell-like structure
        const shellRadius = seededRandom(0.3, 1.0, i + 55000) * galaxyRadius;
        const phi = seededRandom(0, Math.PI * 2, i + 56000);
        const theta = seededRandom(0, Math.PI, i + 57000);
        
        x = shellRadius * Math.sin(theta) * Math.cos(phi);
        y = shellRadius * Math.sin(theta) * Math.sin(phi);
        z = shellRadius * Math.cos(theta);
        
      } else if (distributionType === 2) {
        // Dual nucleus structure
        const nucleusSide = seededRandom(0, 1, i + 58000) < 0.5 ? -1 : 1;
        const nucleusDistance = galaxyRadius * 0.2;
        radius = Math.pow(seededRandom(0, 1, i + 59000), 0.3) * galaxyRadius * 0.4;
        
        const phi = seededRandom(0, Math.PI * 2, i + 60000);
        const theta = seededRandom(0, Math.PI, i + 61000);
        
        x = nucleusSide * nucleusDistance + radius * Math.sin(theta) * Math.cos(phi);
        y = radius * Math.sin(theta) * Math.sin(phi) * 0.7;
        z = radius * Math.cos(theta) * 0.7;
        
      } else {
        // Chaotic distribution
        x = (seededRandom(-1, 1, i + 62000) * galaxyRadius) * (1 + densityFactor * 0.5);
        y = (seededRandom(-0.5, 0.5, i + 63000) * galaxyRadius) * (1 + densityFactor * 0.3);
        z = (seededRandom(-1, 1, i + 64000) * galaxyRadius) * (1 + densityFactor * 0.5);
      }
    }
    
    // Color based on temperature or star type
    let color: THREE.Color;
    
    if (starType === 'black_hole') {
      color = stellarColors['black_hole'];
    } else if (starType === 'neutron_star') {
      color = stellarColors['neutron_star'];
    } else if (starType === 'white_dwarf') {
      color = stellarColors['white_dwarf'];
    } else if (starType === 'red_giant') {
      color = stellarColors['red_giant'];
    } else if (starType === 'supergiant') {
      color = stellarColors['supergiant'];
    } else if (temperature > 0) {
      // For stars with temperature, use spectral class
      const spectralClass = temperatureToSpectralClass(temperature);
      color = stellarColors[spectralClass as keyof typeof stellarColors] || stellarColors['G'];
    } else {
      // Default to sun-like
      color = stellarColors['G'];
    }
    
    // Add some random variation to colors
    const colorJitter = 0.1;
    color = new THREE.Color(
      color.r + seededRandom(-colorJitter, colorJitter, i + 31000),
      color.g + seededRandom(-colorJitter, colorJitter, i + 32000),
      color.b + seededRandom(-colorJitter, colorJitter, i + 33000)
    );
    
    stars.push({
      position: [x, y, z],
      color,
      size,
      type: starType,
      temperature,
      mass,
      luminosity,
      age: seededRandom(0, 10, i + 34000)
    });
  }
  
  return stars;
}

// Generate Webb observation data for a particular deep-field target
export function generateWebbObservationData(targetName: string, seed: number): WebbObservationData {
  // Seeded random function
  const seededRandom = (min: number, max: number, offset: number = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    const rand = (x - Math.floor(x));
    return rand * (max - min) + min;
  };
  
  // Pick random instruments for this observation
  const instrumentCount = Math.floor(seededRandom(1, 4, 1000));
  const shuffledInstruments = [...webbInstruments].sort(() => seededRandom(-0.5, 0.5, 2000) - 0.5);
  const selectedInstruments = shuffledInstruments.slice(0, instrumentCount).map(i => i.name);
  
  // Generate wavelength range based on selected instruments
  let minWavelength = 100, maxWavelength = 0;
  shuffledInstruments.slice(0, instrumentCount).forEach(instrument => {
    minWavelength = Math.min(minWavelength, instrument.wavelengthRange[0]);
    maxWavelength = Math.max(maxWavelength, instrument.wavelengthRange[1]);
  });
  
  // Create a date for the observation
  const year = 2022 + Math.floor(seededRandom(0, 8, 3000));
  const month = Math.floor(seededRandom(1, 13, 4000));
  const day = Math.floor(seededRandom(1, 29, 5000));
  const observationDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  // Generate features based on the target
  const featureCount = Math.floor(seededRandom(3, 15, 6000));
  const features = [];
  
  for (let i = 0; i < featureCount; i++) {
    // Random position in the observation field
    const x = seededRandom(-50, 50, 7000 + i);
    const y = seededRandom(-50, 50, 8000 + i);
    const z = seededRandom(-50, 50, 9000 + i);
    
    // Randomly select feature type
    const featureTypes = ['galaxy', 'star', 'nebula', 'unknown'];
    const typeIndex = Math.floor(seededRandom(0, featureTypes.length, 10000 + i));
    const featureType = featureTypes[typeIndex];
    
    // Generate properties based on feature type
    let properties: Record<string, any> = {};
    
    if (featureType === 'galaxy') {
      properties = {
        redshift: seededRandom(0.1, 10, 11000 + i),
        apparentMagnitude: seededRandom(20, 30, 12000 + i),
        morphology: ['spiral', 'elliptical', 'irregular'][Math.floor(seededRandom(0, 3, 13000 + i))],
        size: seededRandom(0.1, 10, 14000 + i), // arcseconds
        rotationAngle: seededRandom(0, 360, 15000 + i), // degrees
      };
    } else if (featureType === 'star') {
      properties = {
        apparentMagnitude: seededRandom(15, 25, 16000 + i),
        temperature: seededRandom(2000, 30000, 17000 + i), // Kelvin
        spectralType: ['O', 'B', 'A', 'F', 'G', 'K', 'M'][Math.floor(seededRandom(0, 7, 18000 + i))],
        variability: seededRandom(0, 1, 19000 + i) < 0.2, // 20% chance to be variable
      };
    } else if (featureType === 'nebula') {
      properties = {
        type: ['emission', 'reflection', 'dark', 'planetary'][Math.floor(seededRandom(0, 4, 20000 + i))],
        size: seededRandom(1, 50, 21000 + i), // arcseconds
        brightness: seededRandom(0.1, 1.0, 22000 + i),
        ionizationLevel: seededRandom(0.1, 1.0, 23000 + i),
      };
    } else {
      properties = {
        signalToNoise: seededRandom(0.5, 10, 24000 + i),
        detectionConfidence: seededRandom(0.3, 1.0, 25000 + i),
        wavelength: seededRandom(minWavelength, maxWavelength, 26000 + i),
      };
    }
    
    features.push({
      type: featureType,
      position: [x, y, z] as [number, number, number],
      properties
    });
  }
  
  return {
    targetName,
    observationDate,
    wavelengthRange: [minWavelength, maxWavelength],
    exposureTime: Math.floor(seededRandom(1000, 10000, 27000)), // seconds
    instruments: selectedInstruments,
    features
  };
}

// Function to get a color based on nebula type
// Creates a simple Perlin-like noise value for more natural distributions
export function createNoise(x: number, y: number, z: number): number {
  const p = new Uint8Array(512);
  const permutation = [151,160,137,91,90,15,
    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
    190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
    88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,
    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
    102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,
    135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
    223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
    129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,
    251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,
    49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  
  for (let i = 0; i < 256; i++) p[i] = p[i + 256] = permutation[i];
  
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);
  
  const u = fade(x);
  const v = fade(y);
  const w = fade(z);
  
  const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
  const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
  
  const result = lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z),
                                         grad(p[BA], x - 1, y, z)),
                                 lerp(u, grad(p[AB], x, y - 1, z),
                                         grad(p[BB], x - 1, y - 1, z))),
                         lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1),
                                         grad(p[BA + 1], x - 1, y, z - 1)),
                                 lerp(u, grad(p[AB + 1], x, y - 1, z - 1),
                                         grad(p[BB + 1], x - 1, y - 1, z - 1))));
  return (result + 1) / 2; // Transform from -1:1 to 0:1
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number, z: number): number {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

export function getNebulaColor(type: NebulaType, seed: number): THREE.Color {
  const colors = nebulaColors[type];
  if (!colors || colors.length === 0) {
    return new THREE.Color(1, 1, 1);
  }
  
  // Use seed to pick a consistent color
  const index = Math.floor((Math.sin(seed) * 0.5 + 0.5) * colors.length) % colors.length;
  return colors[index].clone();
}