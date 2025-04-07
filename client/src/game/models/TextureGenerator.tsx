import * as THREE from 'three';

/**
 * Utility class for generating procedural textures for space game objects
 */
export class TextureGenerator {
  /**
   * Generates a star texture with a glow effect
   * @param size Texture size (width and height in pixels)
   * @param color Core color of the star
   * @param intensity Brightness of the star (0-1)
   * @returns A THREE.Texture object
   */
  static generateStarTexture(
    size: number = 128, 
    color: THREE.Color | string | number = 0xffffff,
    intensity: number = 1
  ): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Could not get canvas context for texture generation');
      return new THREE.Texture();
    }
    
    // Convert color input to THREE.Color object
    const starColor = color instanceof THREE.Color 
      ? color 
      : new THREE.Color(color);
    
    // Create a radial gradient for the glow effect
    const gradient = context.createRadialGradient(
      size / 2, size / 2, 0,           // Inner circle center and radius
      size / 2, size / 2, size / 2     // Outer circle center and radius
    );
    
    // Add color stops for a realistic star glow
    gradient.addColorStop(0, `rgba(${Math.floor(starColor.r * 255)}, ${Math.floor(starColor.g * 255)}, ${Math.floor(starColor.b * 255)}, ${intensity})`);
    gradient.addColorStop(0.2, `rgba(${Math.floor(starColor.r * 255)}, ${Math.floor(starColor.g * 255)}, ${Math.floor(starColor.b * 255)}, ${intensity * 0.8})`);
    gradient.addColorStop(0.5, `rgba(${Math.floor(starColor.r * 255)}, ${Math.floor(starColor.g * 255)}, ${Math.floor(starColor.b * 255)}, ${intensity * 0.3})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    // Draw the gradient
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    
    // Create and return the texture
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  }
  
  /**
   * Generates a nebula texture with cloud-like patterns
   * @param size Texture size (width and height in pixels)
   * @param color Primary color of the nebula
   * @param secondaryColor Secondary color for variation
   * @param density Density of the nebula clouds (0-1)
   * @param seed Random seed for consistent generation
   * @returns A THREE.Texture object
   */
  static generateNebulaTexture(
    size: number = 512,
    color: THREE.Color | string | number = 0xff3366,
    secondaryColor: THREE.Color | string | number = 0x3366ff,
    density: number = 0.7,
    seed: number = Math.random() * 1000
  ): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Could not get canvas context for texture generation');
      return new THREE.Texture();
    }
    
    // Convert colors to THREE.Color objects
    const primaryColor = color instanceof THREE.Color 
      ? color 
      : new THREE.Color(color);
    
    const secColor = secondaryColor instanceof THREE.Color
      ? secondaryColor
      : new THREE.Color(secondaryColor);
    
    // Fill background with black
    context.fillStyle = 'black';
    context.fillRect(0, 0, size, size);
    
    // Create a deterministic random function based on seed
    const seededRandom = (min: number, max: number, offset = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      const rand = x - Math.floor(x); // 0-1 range
      return min + rand * (max - min);
    };
    
    // Generate cloud-like noise using multiple octaves of perlin-like noise
    // We'll simulate it with overlapping semi-transparent circles
    const cloudCount = Math.floor(size * size * density * 0.01);
    
    // Draw larger base clouds with primary color
    for (let i = 0; i < cloudCount; i++) {
      const x = seededRandom(0, size, i * 10);
      const y = seededRandom(0, size, i * 20);
      const radius = seededRandom(size * 0.05, size * 0.2, i * 30);
      const opacity = seededRandom(0.01, 0.1, i * 40);
      
      // Create a radial gradient for each cloud
      const gradient = context.createRadialGradient(
        x, y, 0,
        x, y, radius
      );
      
      gradient.addColorStop(0, `rgba(${Math.floor(primaryColor.r * 255)}, ${Math.floor(primaryColor.g * 255)}, ${Math.floor(primaryColor.b * 255)}, ${opacity})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    
    // Add detail clouds with secondary color
    for (let i = 0; i < cloudCount * 2; i++) {
      const x = seededRandom(0, size, i * 50 + 1000);
      const y = seededRandom(0, size, i * 60 + 1000);
      const radius = seededRandom(size * 0.02, size * 0.1, i * 70 + 1000);
      const opacity = seededRandom(0.01, 0.05, i * 80 + 1000);
      
      // Create a radial gradient for each cloud
      const gradient = context.createRadialGradient(
        x, y, 0,
        x, y, radius
      );
      
      gradient.addColorStop(0, `rgba(${Math.floor(secColor.r * 255)}, ${Math.floor(secColor.g * 255)}, ${Math.floor(secColor.b * 255)}, ${opacity})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    
    // Add some "stars" as small bright dots
    const starCount = size / 2;
    for (let i = 0; i < starCount; i++) {
      const x = seededRandom(0, size, i * 90 + 2000);
      const y = seededRandom(0, size, i * 100 + 2000);
      const radius = seededRandom(0.5, 1.5, i * 110 + 2000);
      const opacity = seededRandom(0.2, 0.8, i * 120 + 2000);
      
      context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    
    // Create and return the texture
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  }
  
  /**
   * Generates a planet texture with terrain-like details
   * @param size Texture size (width and height in pixels)
   * @param type Type of planet (e.g. 'earth', 'mars', 'gas', etc.)
   * @param seed Random seed for consistent generation
   * @returns A THREE.Texture object
   */
  static generatePlanetTexture(
    size: number = 512,
    type: 'earth' | 'mars' | 'gas' | 'ice' | 'lava' | 'alien' = 'earth',
    seed: number = Math.random() * 1000
  ): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Could not get canvas context for texture generation');
      return new THREE.Texture();
    }
    
    // Create a deterministic random function based on seed
    const seededRandom = (min: number, max: number, offset = 0) => {
      const x = Math.sin(seed + offset) * 10000;
      const rand = x - Math.floor(x); // 0-1 range
      return min + rand * (max - min);
    };
    
    // Define color palettes for different planet types
    const colors = {
      earth: {
        water: new THREE.Color(0x1155aa),
        land: new THREE.Color(0x33aa55),
        mountain: new THREE.Color(0x996633),
        pole: new THREE.Color(0xffffff)
      },
      mars: {
        base: new THREE.Color(0xdd5533),
        crater: new THREE.Color(0xbb4422),
        highland: new THREE.Color(0xee6644),
        pole: new THREE.Color(0xffffee)
      },
      gas: {
        base: new THREE.Color(0x997766),
        band1: new THREE.Color(0xbb9988),
        band2: new THREE.Color(0x775544),
        spot: new THREE.Color(0xddaa88)
      },
      ice: {
        base: new THREE.Color(0xaaddff),
        crack: new THREE.Color(0x88bbdd),
        surface: new THREE.Color(0xccecff),
        pole: new THREE.Color(0xffffff)
      },
      lava: {
        base: new THREE.Color(0x332222),
        lava: new THREE.Color(0xff3300),
        crust: new THREE.Color(0x663322),
        bright: new THREE.Color(0xff8844)
      },
      alien: {
        base: new THREE.Color(0x22aa66),
        feature: new THREE.Color(0x55dd88),
        spot: new THREE.Color(0x66ffaa),
        dark: new THREE.Color(0x115533)
      }
    };
    
    // Fill the background with base color for the chosen planet type
    const palette = colors[type];
    if (type === 'earth') {
      // Earth-like planet: oceans and continents
      // Start with water background
      context.fillStyle = `rgb(${Math.floor(palette.water.r * 255)}, ${Math.floor(palette.water.g * 255)}, ${Math.floor(palette.water.b * 255)})`;
      context.fillRect(0, 0, size, size);
      
      // Create continents using noise-like patterns
      const continentCount = Math.floor(seededRandom(4, 8, 1000));
      for (let i = 0; i < continentCount; i++) {
        const centerX = seededRandom(0, size, i * 10 + 100);
        const centerY = seededRandom(0, size, i * 20 + 100);
        const continentSize = seededRandom(size * 0.1, size * 0.3, i * 30 + 100);
        
        // Draw the continent with irregular edges
        const landColor = palette.land;
        const points = [];
        const vertexCount = Math.floor(seededRandom(10, 20, i * 40 + 100));
        
        for (let j = 0; j < vertexCount; j++) {
          const angle = (j / vertexCount) * Math.PI * 2;
          const radius = continentSize * (0.7 + seededRandom(0, 0.6, i * 50 + j + 100));
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          points.push({ x, y });
        }
        
        // Draw the continent
        context.fillStyle = `rgb(${Math.floor(landColor.r * 255)}, ${Math.floor(landColor.g * 255)}, ${Math.floor(landColor.b * 255)})`;
        context.beginPath();
        if (points.length > 0) {
          context.moveTo(points[0].x, points[0].y);
          for (let j = 1; j < points.length; j++) {
            context.lineTo(points[j].x, points[j].y);
          }
          context.closePath();
          context.fill();
        }
        
        // Add some mountain ranges
        const mountainCount = Math.floor(seededRandom(2, 5, i * 60 + 200));
        for (let j = 0; j < mountainCount; j++) {
          const mountainX = centerX + seededRandom(-continentSize * 0.5, continentSize * 0.5, i * 70 + j + 200);
          const mountainY = centerY + seededRandom(-continentSize * 0.5, continentSize * 0.5, i * 80 + j + 200);
          const mountainSize = seededRandom(continentSize * 0.1, continentSize * 0.3, i * 90 + j + 200);
          
          const mountainColor = palette.mountain;
          context.fillStyle = `rgb(${Math.floor(mountainColor.r * 255)}, ${Math.floor(mountainColor.g * 255)}, ${Math.floor(mountainColor.b * 255)})`;
          context.beginPath();
          context.arc(mountainX, mountainY, mountainSize, 0, Math.PI * 2);
          context.fill();
        }
      }
      
      // Add ice caps at the poles
      const poleColor = palette.pole;
      context.fillStyle = `rgb(${Math.floor(poleColor.r * 255)}, ${Math.floor(poleColor.g * 255)}, ${Math.floor(poleColor.b * 255)})`;
      
      // Top pole
      context.beginPath();
      context.ellipse(size / 2, 0, size / 2, size / 6, 0, 0, Math.PI * 2);
      context.fill();
      
      // Bottom pole
      context.beginPath();
      context.ellipse(size / 2, size, size / 2, size / 6, 0, 0, Math.PI * 2);
      context.fill();
      
    } else if (type === 'mars') {
      // Mars-like planet: reddish with craters
      // Start with base color
      context.fillStyle = `rgb(${Math.floor(palette.base.r * 255)}, ${Math.floor(palette.base.g * 255)}, ${Math.floor(palette.base.b * 255)})`;
      context.fillRect(0, 0, size, size);
      
      // Add some highland regions
      const highlandCount = Math.floor(seededRandom(3, 7, 2000));
      for (let i = 0; i < highlandCount; i++) {
        const centerX = seededRandom(0, size, i * 10 + 2000);
        const centerY = seededRandom(0, size, i * 20 + 2000);
        const highlandSize = seededRandom(size * 0.15, size * 0.4, i * 30 + 2000);
        
        // Create irregular highland shape
        const highlandColor = palette.highland;
        context.fillStyle = `rgb(${Math.floor(highlandColor.r * 255)}, ${Math.floor(highlandColor.g * 255)}, ${Math.floor(highlandColor.b * 255)})`;
        
        context.beginPath();
        context.arc(centerX, centerY, highlandSize, 0, Math.PI * 2);
        context.fill();
      }
      
      // Add craters
      const craterCount = Math.floor(seededRandom(20, 50, 3000));
      for (let i = 0; i < craterCount; i++) {
        const centerX = seededRandom(0, size, i * 10 + 3000);
        const centerY = seededRandom(0, size, i * 20 + 3000);
        const craterSize = seededRandom(size * 0.01, size * 0.05, i * 30 + 3000);
        
        // Draw crater
        const craterColor = palette.crater;
        
        // Crater rim (slightly lighter)
        context.fillStyle = `rgb(${Math.floor(palette.highland.r * 255)}, ${Math.floor(palette.highland.g * 255)}, ${Math.floor(palette.highland.b * 255)})`;
        context.beginPath();
        context.arc(centerX, centerY, craterSize * 1.2, 0, Math.PI * 2);
        context.fill();
        
        // Crater interior
        context.fillStyle = `rgb(${Math.floor(craterColor.r * 255)}, ${Math.floor(craterColor.g * 255)}, ${Math.floor(craterColor.b * 255)})`;
        context.beginPath();
        context.arc(centerX, centerY, craterSize, 0, Math.PI * 2);
        context.fill();
      }
      
      // Add small ice caps
      const poleColor = palette.pole;
      context.fillStyle = `rgb(${Math.floor(poleColor.r * 255)}, ${Math.floor(poleColor.g * 255)}, ${Math.floor(poleColor.b * 255)})`;
      
      // Top pole (smaller than Earth's)
      context.beginPath();
      context.ellipse(size / 2, 0, size / 3, size / 12, 0, 0, Math.PI * 2);
      context.fill();
      
      // Bottom pole
      context.beginPath();
      context.ellipse(size / 2, size, size / 4, size / 15, 0, 0, Math.PI * 2);
      context.fill();
      
    } else if (type === 'gas') {
      // Gas giant: bands of different colors
      // Start with base color
      context.fillStyle = `rgb(${Math.floor(palette.base.r * 255)}, ${Math.floor(palette.base.g * 255)}, ${Math.floor(palette.base.b * 255)})`;
      context.fillRect(0, 0, size, size);
      
      // Add horizontal bands
      const bandCount = Math.floor(seededRandom(5, 12, 4000));
      const bandWidth = size / bandCount;
      
      for (let i = 0; i < bandCount; i++) {
        // Alternate between two band colors
        const bandColor = i % 2 === 0 ? palette.band1 : palette.band2;
        context.fillStyle = `rgb(${Math.floor(bandColor.r * 255)}, ${Math.floor(bandColor.g * 255)}, ${Math.floor(bandColor.b * 255)})`;
        
        // Make bands wavy
        context.beginPath();
        const y = i * bandWidth;
        context.moveTo(0, y);
        
        for (let x = 0; x <= size; x += size / 20) {
          const waveHeight = seededRandom(-bandWidth * 0.2, bandWidth * 0.2, i * 100 + x + 4000);
          context.lineTo(x, y + waveHeight);
        }
        
        context.lineTo(size, y + bandWidth);
        context.lineTo(0, y + bandWidth);
        context.closePath();
        context.fill();
      }
      
      // Add a giant storm spot (like Jupiter's Great Red Spot)
      if (seededRandom(0, 1, 5000) > 0.3) {
        const spotX = seededRandom(size * 0.2, size * 0.8, 5100);
        const spotY = seededRandom(size * 0.3, size * 0.7, 5200);
        const spotWidth = seededRandom(size * 0.1, size * 0.3, 5300);
        const spotHeight = seededRandom(size * 0.05, size * 0.15, 5400);
        
        context.fillStyle = `rgb(${Math.floor(palette.spot.r * 255)}, ${Math.floor(palette.spot.g * 255)}, ${Math.floor(palette.spot.b * 255)})`;
        context.beginPath();
        context.ellipse(spotX, spotY, spotWidth, spotHeight, seededRandom(0, Math.PI, 5500), 0, Math.PI * 2);
        context.fill();
      }
      
    } else if (type === 'ice') {
      // Ice planet: white-blue with cracks
      // Start with base color
      context.fillStyle = `rgb(${Math.floor(palette.base.r * 255)}, ${Math.floor(palette.base.g * 255)}, ${Math.floor(palette.base.b * 255)})`;
      context.fillRect(0, 0, size, size);
      
      // Add surface features (slight color variations)
      const surfaceFeatureCount = Math.floor(seededRandom(10, 30, 6000));
      for (let i = 0; i < surfaceFeatureCount; i++) {
        const featureX = seededRandom(0, size, i * 10 + 6000);
        const featureY = seededRandom(0, size, i * 20 + 6000);
        const featureSize = seededRandom(size * 0.05, size * 0.2, i * 30 + 6000);
        
        context.fillStyle = `rgb(${Math.floor(palette.surface.r * 255)}, ${Math.floor(palette.surface.g * 255)}, ${Math.floor(palette.surface.b * 255)})`;
        context.beginPath();
        context.arc(featureX, featureY, featureSize, 0, Math.PI * 2);
        context.fill();
      }
      
      // Add cracks in the ice
      const crackCount = Math.floor(seededRandom(5, 15, 7000));
      for (let i = 0; i < crackCount; i++) {
        const startX = seededRandom(0, size, i * 10 + 7000);
        const startY = seededRandom(0, size, i * 20 + 7000);
        const length = seededRandom(size * 0.1, size * 0.5, i * 30 + 7000);
        const angle = seededRandom(0, Math.PI * 2, i * 40 + 7000);
        
        context.strokeStyle = `rgb(${Math.floor(palette.crack.r * 255)}, ${Math.floor(palette.crack.g * 255)}, ${Math.floor(palette.crack.b * 255)})`;
        context.lineWidth = seededRandom(1, 3, i * 50 + 7000);
        
        // Draw a zigzag line for the crack
        context.beginPath();
        context.moveTo(startX, startY);
        
        let x = startX;
        let y = startY;
        const segments = Math.floor(seededRandom(3, 8, i * 60 + 7000));
        
        for (let j = 0; j < segments; j++) {
          const segmentLength = length / segments;
          const segmentAngle = angle + seededRandom(-0.5, 0.5, i * 70 + j + 7000);
          
          x += Math.cos(segmentAngle) * segmentLength;
          y += Math.sin(segmentAngle) * segmentLength;
          
          context.lineTo(x, y);
        }
        
        context.stroke();
      }
      
    } else if (type === 'lava') {
      // Lava planet: dark with glowing lava flows
      // Start with base color (dark)
      context.fillStyle = `rgb(${Math.floor(palette.base.r * 255)}, ${Math.floor(palette.base.g * 255)}, ${Math.floor(palette.base.b * 255)})`;
      context.fillRect(0, 0, size, size);
      
      // Add lava flows
      const flowCount = Math.floor(seededRandom(5, 15, 8000));
      for (let i = 0; i < flowCount; i++) {
        const startX = seededRandom(0, size, i * 10 + 8000);
        const startY = seededRandom(0, size, i * 20 + 8000);
        const length = seededRandom(size * 0.1, size * 0.6, i * 30 + 8000);
        const width = seededRandom(size * 0.02, size * 0.1, i * 40 + 8000);
        const angle = seededRandom(0, Math.PI * 2, i * 50 + 8000);
        
        // Create a gradient for the lava flow
        const gradient = context.createLinearGradient(
          startX, startY,
          startX + Math.cos(angle) * length,
          startY + Math.sin(angle) * length
        );
        
        gradient.addColorStop(0, `rgb(${Math.floor(palette.bright.r * 255)}, ${Math.floor(palette.bright.g * 255)}, ${Math.floor(palette.bright.b * 255)})`);
        gradient.addColorStop(0.5, `rgb(${Math.floor(palette.lava.r * 255)}, ${Math.floor(palette.lava.g * 255)}, ${Math.floor(palette.lava.b * 255)})`);
        gradient.addColorStop(1, `rgb(${Math.floor(palette.crust.r * 255)}, ${Math.floor(palette.crust.g * 255)}, ${Math.floor(palette.crust.b * 255)})`);
        
        context.fillStyle = gradient;
        
        // Draw a curved path for the lava flow
        context.beginPath();
        context.moveTo(startX, startY);
        
        let x = startX;
        let y = startY;
        const segments = Math.floor(seededRandom(4, 10, i * 60 + 8000));
        
        const points = [];
        points.push({ x, y });
        
        for (let j = 1; j <= segments; j++) {
          const segmentLength = length / segments;
          const segmentAngle = angle + seededRandom(-0.5, 0.5, i * 70 + j + 8000);
          
          x += Math.cos(segmentAngle) * segmentLength;
          y += Math.sin(segmentAngle) * segmentLength;
          
          points.push({ x, y });
        }
        
        // Draw the lava flow with width
        for (let j = 0; j < points.length - 1; j++) {
          const segmentAngle = Math.atan2(points[j+1].y - points[j].y, points[j+1].x - points[j].x);
          const perpAngle = segmentAngle + Math.PI / 2;
          
          const p1 = {
            x: points[j].x + Math.cos(perpAngle) * width / 2,
            y: points[j].y + Math.sin(perpAngle) * width / 2
          };
          
          const p2 = {
            x: points[j].x - Math.cos(perpAngle) * width / 2,
            y: points[j].y - Math.sin(perpAngle) * width / 2
          };
          
          const p3 = {
            x: points[j+1].x - Math.cos(perpAngle) * width / 2,
            y: points[j+1].y - Math.sin(perpAngle) * width / 2
          };
          
          const p4 = {
            x: points[j+1].x + Math.cos(perpAngle) * width / 2,
            y: points[j+1].y + Math.sin(perpAngle) * width / 2
          };
          
          context.beginPath();
          context.moveTo(p1.x, p1.y);
          context.lineTo(p2.x, p2.y);
          context.lineTo(p3.x, p3.y);
          context.lineTo(p4.x, p4.y);
          context.closePath();
          context.fill();
        }
      }
      
      // Add some glowing spots (volcanic hotspots)
      const spotCount = Math.floor(seededRandom(5, 15, 9000));
      for (let i = 0; i < spotCount; i++) {
        const spotX = seededRandom(0, size, i * 10 + 9000);
        const spotY = seededRandom(0, size, i * 20 + 9000);
        const spotSize = seededRandom(size * 0.01, size * 0.05, i * 30 + 9000);
        
        // Create a gradient for the glow
        const gradient = context.createRadialGradient(
          spotX, spotY, 0,
          spotX, spotY, spotSize
        );
        
        gradient.addColorStop(0, `rgb(${Math.floor(palette.bright.r * 255)}, ${Math.floor(palette.bright.g * 255)}, ${Math.floor(palette.bright.b * 255)})`);
        gradient.addColorStop(0.5, `rgb(${Math.floor(palette.lava.r * 255)}, ${Math.floor(palette.lava.g * 255)}, ${Math.floor(palette.lava.b * 255)})`);
        gradient.addColorStop(1, `rgba(${Math.floor(palette.crust.r * 255)}, ${Math.floor(palette.crust.g * 255)}, ${Math.floor(palette.crust.b * 255)}, 0)`);
        
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
        context.fill();
      }
      
    } else if (type === 'alien') {
      // Alien planet: unusual colors and patterns
      // Start with base color
      context.fillStyle = `rgb(${Math.floor(palette.base.r * 255)}, ${Math.floor(palette.base.g * 255)}, ${Math.floor(palette.base.b * 255)})`;
      context.fillRect(0, 0, size, size);
      
      // Add strange geometric patterns
      const patternCount = Math.floor(seededRandom(3, 8, 10000));
      for (let i = 0; i < patternCount; i++) {
        const centerX = seededRandom(0, size, i * 10 + 10000);
        const centerY = seededRandom(0, size, i * 20 + 10000);
        const patternSize = seededRandom(size * 0.1, size * 0.4, i * 30 + 10000);
        
        // Choose a geometric pattern type
        const patternType = Math.floor(seededRandom(0, 3, i * 40 + 10000));
        
        context.fillStyle = `rgb(${Math.floor(palette.feature.r * 255)}, ${Math.floor(palette.feature.g * 255)}, ${Math.floor(palette.feature.b * 255)})`;
        
        if (patternType === 0) {
          // Hexagonal pattern
          context.beginPath();
          for (let j = 0; j < 6; j++) {
            const angle = (j / 6) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * patternSize;
            const y = centerY + Math.sin(angle) * patternSize;
            
            if (j === 0) {
              context.moveTo(x, y);
            } else {
              context.lineTo(x, y);
            }
          }
          context.closePath();
          context.fill();
        } else if (patternType === 1) {
          // Circular pattern with inner circles
          context.beginPath();
          context.arc(centerX, centerY, patternSize, 0, Math.PI * 2);
          context.fill();
          
          // Inner circle with different color
          context.fillStyle = `rgb(${Math.floor(palette.spot.r * 255)}, ${Math.floor(palette.spot.g * 255)}, ${Math.floor(palette.spot.b * 255)})`;
          context.beginPath();
          context.arc(centerX, centerY, patternSize * 0.6, 0, Math.PI * 2);
          context.fill();
          
          // Center dot
          context.fillStyle = `rgb(${Math.floor(palette.dark.r * 255)}, ${Math.floor(palette.dark.g * 255)}, ${Math.floor(palette.dark.b * 255)})`;
          context.beginPath();
          context.arc(centerX, centerY, patternSize * 0.2, 0, Math.PI * 2);
          context.fill();
        } else {
          // Strange linear pattern
          const lineCount = Math.floor(seededRandom(3, 8, i * 50 + 10000));
          
          for (let j = 0; j < lineCount; j++) {
            const angle = (j / lineCount) * Math.PI * 2;
            const x1 = centerX + Math.cos(angle) * patternSize;
            const y1 = centerY + Math.sin(angle) * patternSize;
            const x2 = centerX + Math.cos(angle + Math.PI) * patternSize;
            const y2 = centerY + Math.sin(angle + Math.PI) * patternSize;
            
            context.strokeStyle = `rgb(${Math.floor(palette.spot.r * 255)}, ${Math.floor(palette.spot.g * 255)}, ${Math.floor(palette.spot.b * 255)})`;
            context.lineWidth = seededRandom(2, 8, i * 60 + j + 10000);
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(centerX, centerY);
            context.lineTo(x2, y2);
            context.stroke();
          }
        }
      }
      
      // Add some unusual spots
      const spotCount = Math.floor(seededRandom(10, 30, 11000));
      for (let i = 0; i < spotCount; i++) {
        const spotX = seededRandom(0, size, i * 10 + 11000);
        const spotY = seededRandom(0, size, i * 20 + 11000);
        const spotSize = seededRandom(size * 0.01, size * 0.05, i * 30 + 11000);
        
        context.fillStyle = `rgb(${Math.floor(palette.dark.r * 255)}, ${Math.floor(palette.dark.g * 255)}, ${Math.floor(palette.dark.b * 255)})`;
        context.beginPath();
        context.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
        context.fill();
      }
    }
    
    // Create and return the texture
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  }
}