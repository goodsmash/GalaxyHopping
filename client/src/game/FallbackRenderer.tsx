import React from 'react';
import { useGalaxyHopping } from '../lib/stores/useGalaxyHopping';
import { Controls } from './types';

/**
 * A fallback renderer that displays when WebGL is not available
 * Provides basic game functionality without 3D rendering
 */
export function FallbackRenderer() {
  const { 
    gameState, 
    setGameState, 
    resetGame, 
    score, 
    currentGalaxy, 
    lives,
    selectedShipType
  } = useGalaxyHopping();

  // Function to handle keyboard controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (gameState !== 'playing') return;
    
    switch(e.code) {
      case 'KeyW':
      case 'ArrowUp':
        console.log('Move forward');
        break;
      case 'KeyS':
      case 'ArrowDown':
        console.log('Move backward');
        break;
      case 'KeyA':
      case 'ArrowLeft':
        console.log('Move left');
        break;
      case 'KeyD':
      case 'ArrowRight':
        console.log('Move right');
        break;
      case 'Space':
        console.log('Fire weapon');
        break;
      case 'Escape':
      case 'KeyP':
        setGameState('paused');
        break;
    }
  };

  // Simple 2D rendering of game state
  return (
    <div 
      className="w-full h-full bg-black text-white p-8 relative"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute top-0 left-0 right-0 bg-gray-900 p-4 flex justify-between">
        <div>
          <span className="mr-4">Score: {score}</span>
          <span className="mr-4">Lives: {lives}</span>
          <span>Galaxy: {currentGalaxy}</span>
        </div>
        <div>
          <span>Ship: {selectedShipType || 'Standard'}</span>
        </div>
      </div>

      {gameState === 'playing' && (
        <div className="h-full flex flex-col items-center justify-center">
          <div className="text-xl mb-4">2D Fallback Mode</div>
          <div className="bg-gray-900 p-6 rounded-lg max-w-lg text-center">
            <p className="mb-4">
              Your browser doesn't support 3D rendering, so you're seeing a simplified version of Galaxy Hopping.
            </p>
            <p>
              Use W/A/S/D or Arrow keys to move, Space to fire, and ESC to pause.
            </p>
            <button
              className="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded"
              onClick={() => setGameState('mainMenu')}
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {gameState === 'mainMenu' && (
        <div className="h-full flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-blue-500 mb-2">Galaxy Hopping</h1>
          <p className="text-gray-400 mb-8">A Space Shooter Adventure (2D Mode)</p>
          
          <div className="space-y-4 w-full max-w-md">
            <button
              className="w-full py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
              onClick={() => {
                resetGame();
                setGameState('playing');
              }}
            >
              Play Game (2D Mode)
            </button>
            
            <button
              className="w-full py-3 px-8 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded"
              onClick={() => setGameState('options')}
            >
              Options
            </button>
            
            <button
              className="w-full py-3 px-8 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded"
              onClick={() => setGameState('highScores')}
            >
              High Scores
            </button>
          </div>
          
          <div className="mt-8 bg-gray-900 p-4 rounded text-gray-300 text-sm max-w-md">
            <h3 className="font-bold text-white mb-2">WebGL Not Available</h3>
            <p>
              Your browser or device doesn't support WebGL, which is required for the 3D version of Galaxy Hopping.
              You can still play a simplified 2D version, but for the full experience, try:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>Using a different browser (Chrome, Firefox, or Edge)</li>
              <li>Updating your graphics drivers</li>
              <li>Enabling hardware acceleration in your browser settings</li>
            </ul>
          </div>
        </div>
      )}

      {gameState === 'paused' && (
        <div className="h-full flex items-center justify-center">
          <div className="bg-black/80 p-8 rounded-lg text-center">
            <h2 className="text-2xl mb-4">Game Paused</h2>
            <div className="space-y-4">
              <button
                className="w-full py-2 px-6 bg-blue-600 hover:bg-blue-700 rounded"
                onClick={() => setGameState('playing')}
              >
                Resume Game
              </button>
              <button
                className="w-full py-2 px-6 bg-gray-700 hover:bg-gray-600 rounded"
                onClick={() => setGameState('mainMenu')}
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}