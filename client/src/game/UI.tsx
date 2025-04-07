import { useEffect, useState } from 'react';
import { useGalaxyHopping } from '../lib/stores/useGalaxyHopping';
import { formatNumber } from './utils';
import { MobileControls } from './MobileControls';
import { Menu } from './Menu';
import { useIsMobile } from '../hooks/use-is-mobile';

export function UI() {
  const { 
    gameState, 
    score, 
    playerHealth, 
    currentGalaxy, 
    lives,
    setGameState,
    resetGame,
    addHighScore
  } = useGalaxyHopping();
  
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const isMobile = useIsMobile();
  
  // Show game over dialog when player dies
  useEffect(() => {
    if (gameState === 'gameOver') {
      setShowNameInput(true);
    }
  }, [gameState]);
  
  // Handle pause/unpause
  const handlePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };
  
  // Handle high score submission
  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      addHighScore(playerName);
      setPlayerName('');
      setShowNameInput(false);
      setGameState('highScores');
    }
  };
  
  // Handle restart
  const handleRestart = () => {
    resetGame();
  };
  
  // Handle main menu
  const handleMainMenu = () => {
    setGameState('mainMenu');
  };
  
  return (
    <>
      {/* Game UI (HUD) - only show during gameplay */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <div className="fixed top-0 left-0 w-full pointer-events-none">
          {/* Top status bar */}
          <div className="flex justify-between items-center p-4 text-white text-shadow-lg">
            <div className="bg-black/50 p-2 rounded">
              <div className="flex items-center text-lg font-bold">
                <span className="mr-1">🏆</span>
                <span>Score: </span>
                <span className="ml-1 text-yellow-300">{formatNumber(score)}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">🌌</span>
                <span>Galaxy: </span>
                <span className="ml-1 font-semibold text-purple-300">{currentGalaxy}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">🚀</span>
                <span>Ship: </span>
                <span className="ml-1 font-semibold text-cyan-300">
                  {currentGalaxy <= 1 ? 'Standard' : 
                  currentGalaxy === 2 ? 'Scout' : 
                  currentGalaxy === 3 ? 'Heavy' : 
                  currentGalaxy === 4 ? 'Explorer' : 'Stealth'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {/* Lives indicator */}
              <div className="bg-black/50 p-2 rounded">
                <div className="flex items-center">
                  <span className="mr-1">Lives:</span>
                  <span className="text-red-500">{Array(lives).fill('❤️').join(' ')}</span>
                </div>
              </div>
              
              {/* Health bar */}
              <div className="bg-black/50 p-2 rounded w-40">
                <div className="flex items-center text-xs mb-1">
                  <span className="mr-1">🛡️</span>
                  <span>Shield: </span>
                  <span className="ml-1 font-semibold text-blue-300">{playerHealth}%</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      playerHealth > 50 ? 'bg-blue-500' : 
                      playerHealth > 25 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${playerHealth}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Pause button (desktop only) */}
            {!isMobile && (
              <div 
                className="bg-black/50 p-2 rounded cursor-pointer pointer-events-auto flex items-center hover:bg-black/70 transition-colors"
                onClick={handlePause}
              >
                <span className="mr-1">{gameState === 'paused' ? '▶️' : '⏸️'}</span>
                <span>{gameState === 'paused' ? 'Resume' : 'Pause'}</span>
              </div>
            )}
          </div>
          
          {/* Mobile controls */}
          {isMobile && <MobileControls onPause={handlePause} />}
        </div>
      )}
      
      {/* Pause menu */}
      {gameState === 'paused' && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full text-center">
            <h2 className="text-4xl font-bold text-white mb-8">Paused</h2>
            
            <div className="space-y-4">
              <button 
                className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition"
                onClick={() => setGameState('playing')}
              >
                Resume
              </button>
              
              <button 
                className="w-full py-3 px-6 bg-gray-700 text-white font-bold rounded hover:bg-gray-600 transition"
                onClick={() => setGameState('options')}
              >
                Options
              </button>
              
              <button 
                className="w-full py-3 px-6 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
                onClick={handleMainMenu}
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Game Over */}
      {gameState === 'gameOver' && showNameInput && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Game Over</h2>
            <p className="text-gray-300 mb-4">Your Score: {formatNumber(score)}</p>
            <p className="text-gray-300 mb-8">Galaxy Reached: {currentGalaxy}</p>
            
            <form onSubmit={handleSubmitScore} className="mb-6">
              <div className="mb-4">
                <label htmlFor="playerName" className="block text-gray-300 text-sm font-bold mb-2">
                  Enter Your Name:
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-gray-800 text-white p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Name"
                  required
                  maxLength={15}
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition"
              >
                Submit Score
              </button>
            </form>
            
            <div className="flex gap-4">
              <button
                className="flex-1 py-3 px-6 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition"
                onClick={handleRestart}
              >
                Play Again
              </button>
              
              <button
                className="flex-1 py-3 px-6 bg-gray-700 text-white font-bold rounded hover:bg-gray-600 transition"
                onClick={handleMainMenu}
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
