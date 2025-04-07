import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGalaxyHopping } from '../lib/stores/useGalaxyHopping';
import { useAudio } from '../lib/stores/useAudio';

export function Menu() {
  const { setGameState, resetGame } = useGalaxyHopping();
  const { backgroundMusic, isMuted, toggleMute } = useAudio();
  
  // Handle play button click
  const handlePlay = () => {
    console.log("Play button clicked - starting game");
    
    try {
      // Reset game state and set to playing
      resetGame();
      setGameState('playing');
      
      // Play background music if it exists
      if (backgroundMusic && !isMuted) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(error => {
          console.log("Background music play prevented:", error);
          // Try unmuting if playing was prevented (autoplay policy)
          if (isMuted) {
            toggleMute();
            backgroundMusic.play().catch(err => {
              console.error("Second attempt to play background music failed:", err);
            });
          }
        });
      }
      
      console.log("Game starting - state set to playing");
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };
  
  // Handle options button click
  const handleOptions = () => {
    setGameState('options');
  };
  
  // Handle high scores button click
  const handleHighScores = () => {
    setGameState('highScores');
  };
  
  // Toggle sound on/off
  const toggleSound = () => {
    toggleMute();
  };
  
  useEffect(() => {
    // Ensure game is fully loaded
    const timer = setTimeout(() => {
      // Initialize background music (paused)
      if (backgroundMusic) {
        backgroundMusic.volume = 0.5;
        backgroundMusic.loop = true;
        
        // Preload
        backgroundMusic.load();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [backgroundMusic]);
  
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Game logo/title */}
        <h1 className="text-5xl font-bold text-blue-500 mb-2 text-center">
          Galaxy Hopping
        </h1>
        <p className="text-gray-400 mb-10 text-center">
          A Space Shooter Adventure
        </p>
        
        {/* Menu buttons */}
        <div className="space-y-4 w-full">
          <button
            className="w-full py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded transition-colors"
            onClick={handlePlay}
          >
            Play Game
          </button>
          
          <button
            className="w-full py-3 px-8 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-colors"
            onClick={handleOptions}
          >
            Options
          </button>
          
          <button
            className="w-full py-3 px-8 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-colors"
            onClick={handleHighScores}
          >
            High Scores
          </button>
          
          <button
            className="w-full py-3 px-8 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-colors"
            onClick={toggleSound}
          >
            {isMuted ? "Sound: Off" : "Sound: On"}
          </button>
          
          <Link to="/ships" className="block w-full">
            <button className="w-full py-3 px-8 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-colors">
              Ship Viewer
            </button>
          </Link>
          
          <Link to="/environment" className="block w-full">
            <button className="w-full py-3 px-8 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-colors">
              Environment Viewer
            </button>
          </Link>
        </div>
        
        {/* Instructions */}
        <div className="mt-10 bg-gray-900 p-4 rounded text-gray-300 text-sm">
          <h3 className="font-bold text-white mb-2">Controls:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>WASD or Arrow Keys: Move ship</li>
            <li>Space: Fire weapon</li>
            <li>Esc: Pause game</li>
            <li>Mobile: Virtual joystick and buttons</li>
          </ul>
        </div>
        
        <p className="text-gray-500 mt-8 text-sm">
          &copy; {new Date().getFullYear()} Galaxy Hopping - All rights reserved
        </p>
      </div>
    </div>
  );
}
