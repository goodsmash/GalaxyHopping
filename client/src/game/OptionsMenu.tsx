import { useState, useEffect } from 'react';
import { useGalaxyHopping } from '../lib/stores/useGalaxyHopping';
import { useAudio } from '../lib/stores/useAudio';

export function OptionsMenu() {
  const { 
    setGameState, 
    musicVolume, 
    soundEffectsVolume, 
    difficulty, 
    controlSensitivity,
    setMusicVolume,
    setSoundEffectsVolume,
    setDifficulty,
    setControlSensitivity,
    saveGame
  } = useGalaxyHopping();
  
  const { hitSound, isMuted, playHit } = useAudio();
  
  // Local state for option values (before saving)
  const [localMusicVolume, setLocalMusicVolume] = useState(musicVolume);
  const [localSoundVolume, setLocalSoundVolume] = useState(soundEffectsVolume);
  const [localDifficulty, setLocalDifficulty] = useState(difficulty);
  const [localSensitivity, setLocalSensitivity] = useState(controlSensitivity);
  
  // Sync local state with global state
  useEffect(() => {
    setLocalMusicVolume(musicVolume);
    setLocalSoundVolume(soundEffectsVolume);
    setLocalDifficulty(difficulty);
    setLocalSensitivity(controlSensitivity);
  }, [musicVolume, soundEffectsVolume, difficulty, controlSensitivity]);
  
  // Save changes and return to previous screen
  const handleSave = () => {
    // Update global state
    setMusicVolume(localMusicVolume);
    setSoundEffectsVolume(localSoundVolume);
    setDifficulty(localDifficulty);
    setControlSensitivity(localSensitivity);
    
    // Save to localStorage
    saveGame();
    
    // Return to previous screen
    setGameState('mainMenu');
  };
  
  // Cancel changes and return to previous screen
  const handleCancel = () => {
    setGameState('mainMenu');
  };
  
  // Play test sound
  const playTestSound = () => {
    if (hitSound) {
      // Temporarily set volume for test
      const originalVolume = hitSound.volume;
      hitSound.volume = localSoundVolume;
      
      // Play test sound
      playHit();
      
      // Restore original volume
      hitSound.volume = originalVolume;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Options</h2>
        
        <div className="space-y-6">
          {/* Music Volume */}
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Music Volume: {Math.round(localMusicVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localMusicVolume}
              onChange={(e) => setLocalMusicVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          {/* Sound Effects Volume */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-300 text-sm font-bold">
                Sound Effects: {Math.round(localSoundVolume * 100)}%
              </label>
              <button
                className="bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700"
                onClick={playTestSound}
              >
                Test
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localSoundVolume}
              onChange={(e) => setLocalSoundVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          {/* Difficulty */}
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Difficulty
            </label>
            <div className="flex gap-2">
              {['easy', 'normal', 'hard'].map((diff) => (
                <button
                  key={diff}
                  className={`flex-1 py-2 px-4 rounded-md uppercase font-bold text-sm ${
                    localDifficulty === diff
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setLocalDifficulty(diff as 'easy' | 'normal' | 'hard')}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
          
          {/* Control Sensitivity */}
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Control Sensitivity: {Math.round(localSensitivity * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.01"
              value={localSensitivity}
              onChange={(e) => setLocalSensitivity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="mt-8 flex gap-4">
          <button
            className="flex-1 py-3 px-6 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition"
            onClick={handleSave}
          >
            Save
          </button>
          
          <button
            className="flex-1 py-3 px-6 bg-gray-700 text-white font-bold rounded hover:bg-gray-600 transition"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
