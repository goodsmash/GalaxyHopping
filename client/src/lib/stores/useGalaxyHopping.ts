import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useAudio } from "./useAudio";
import { getLocalStorage, setLocalStorage } from "../utils";

export type GameState = 'loading' | 'mainMenu' | 'playing' | 'paused' | 'gameOver' | 'options' | 'highScores';

interface HighScore {
  name: string;
  score: number;
  galaxy: number;
  date: string;
}

interface GalaxyHoppingState {
  // Game state
  gameState: GameState;
  score: number;
  playerHealth: number;
  currentGalaxy: number;
  lives: number;
  selectedShipType: 'standard' | 'scout' | 'heavy' | 'explorer' | 'stealth';
  
  // Game settings
  musicVolume: number;
  soundEffectsVolume: number;
  difficulty: 'easy' | 'normal' | 'hard';
  controlSensitivity: number;
  
  // High scores
  highScores: HighScore[];
  
  // Audio context
  audioEnabled: boolean;
  
  // Actions
  setGameState: (state: GameState) => void;
  incrementScore: (points: number) => void;
  setPlayerHealth: (health: number) => void;
  decrementPlayerHealth: (amount: number) => void;
  incrementGalaxy: () => void;
  decrementLives: () => void;
  resetGame: () => void;
  setSelectedShipType: (shipType: 'standard' | 'scout' | 'heavy' | 'explorer' | 'stealth') => void;
  
  // Settings actions
  setMusicVolume: (volume: number) => void;
  setSoundEffectsVolume: (volume: number) => void;
  setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') => void;
  setControlSensitivity: (sensitivity: number) => void;
  
  // High score actions
  addHighScore: (name: string) => void;
  loadGame: () => void;
  saveGame: () => void;
}

// Default game settings
const defaultSettings = {
  musicVolume: 0.5,
  soundEffectsVolume: 0.7,
  difficulty: 'normal' as const,
  controlSensitivity: 0.5,
};

export const useGalaxyHopping = create<GalaxyHoppingState>()(
  subscribeWithSelector((set, get) => ({
    // Game state
    gameState: 'loading',
    score: 0,
    playerHealth: 100,
    currentGalaxy: 1,
    lives: 3,
    selectedShipType: 'standard',
    
    // Game settings
    ...defaultSettings,
    
    // High scores
    highScores: [],
    
    // Audio context
    audioEnabled: true,
    
    // Actions
    setGameState: (state) => set({ gameState: state }),
    
    incrementScore: (points) => set((state) => ({ 
      score: state.score + points 
    })),
    
    setPlayerHealth: (health) => set({ playerHealth: health }),
    
    decrementPlayerHealth: (amount) => set((state) => {
      const newHealth = Math.max(0, state.playerHealth - amount);
      
      // If health reaches 0, decrement lives or end game
      if (newHealth === 0) {
        const newLives = state.lives - 1;
        
        if (newLives <= 0) {
          return { 
            playerHealth: 0, 
            lives: 0,
            gameState: 'gameOver' 
          };
        }
        
        return { 
          playerHealth: 100, 
          lives: newLives 
        };
      }
      
      return { playerHealth: newHealth };
    }),
    
    incrementGalaxy: () => set((state) => ({ 
      currentGalaxy: state.currentGalaxy + 1 
    })),
    
    decrementLives: () => set((state) => {
      const newLives = state.lives - 1;
      if (newLives <= 0) {
        return { 
          lives: 0,
          gameState: 'gameOver' 
        };
      }
      return { lives: newLives };
    }),
    
    resetGame: () => set({ 
      score: 0,
      playerHealth: 100,
      currentGalaxy: 1,
      lives: 3,
      gameState: 'playing'
    }),
    
    // Settings actions
    setMusicVolume: (volume) => {
      set({ musicVolume: volume });
      // Use a safer approach to access store state from another store
      try {
        const audioState = useAudio.getState();
        const backgroundMusic = audioState?.backgroundMusic;
        if (backgroundMusic) {
          backgroundMusic.volume = volume;
        }
      } catch (error) {
        console.error("Error adjusting music volume:", error);
      }
    },
    
    setSoundEffectsVolume: (volume) => {
      set({ soundEffectsVolume: volume });
    },
    
    setDifficulty: (difficulty) => set({ difficulty }),
    
    setControlSensitivity: (sensitivity) => set({ controlSensitivity: sensitivity }),
    
    // Ship selection action
    setSelectedShipType: (shipType) => set({ selectedShipType: shipType }),
    
    // High score actions
    addHighScore: (name) => set((state) => {
      const { score, currentGalaxy, highScores } = state;
      
      const newHighScore: HighScore = {
        name,
        score,
        galaxy: currentGalaxy,
        date: new Date().toISOString()
      };
      
      // Add new score and sort by score (highest first)
      const newHighScores = [...highScores, newHighScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Keep only top 10
      
      // Save to localStorage
      setLocalStorage('galaxyHopping.highScores', newHighScores);
      
      return { highScores: newHighScores };
    }),
    
    // Load game settings and high scores from localStorage
    loadGame: () => {
      const settings = getLocalStorage('galaxyHopping.settings');
      const highScores = getLocalStorage('galaxyHopping.highScores');
      
      set((state) => ({
        ...state,
        ...(settings || {}),
        highScores: highScores || [],
        gameState: 'mainMenu'
      }));
    },
    
    // Save game settings to localStorage
    saveGame: () => {
      const { 
        musicVolume, 
        soundEffectsVolume, 
        difficulty, 
        controlSensitivity,
        selectedShipType
      } = get();
      
      setLocalStorage('galaxyHopping.settings', {
        musicVolume,
        soundEffectsVolume,
        difficulty,
        controlSensitivity,
        selectedShipType
      });
    }
  }))
);
