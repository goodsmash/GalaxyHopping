import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useGalaxyHopping } from '../lib/stores/useGalaxyHopping';

interface MobileControlsProps {
  onPause: () => void;
}

declare global {
  interface Window {
    nipplejs: any;
  }
}

export function MobileControls({ onPause }: MobileControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickManagerRef = useRef<any>(null);
  const { audioContext } = useGalaxyHopping();
  
  // Reference for tracking joystick values
  const joystickState = useRef({
    forward: 0,
    side: 0,
  });
  
  // Create virtual joystick once component is mounted
  useEffect(() => {
    if (!joystickRef.current || !window.nipplejs) return;
    
    // Create joystick
    joystickManagerRef.current = window.nipplejs.create({
      zone: joystickRef.current,
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: 'white',
      size: 120,
    });
    
    // Add event listeners
    joystickManagerRef.current.on('move', (_, data: any) => {
      if (data.vector) {
        // Forward/backward is inverted from joystick
        joystickState.current.forward = -data.vector.y;
        joystickState.current.side = data.vector.x;
      }
    });
    
    joystickManagerRef.current.on('end', () => {
      joystickState.current.forward = 0;
      joystickState.current.side = 0;
    });
    
    return () => {
      if (joystickManagerRef.current) {
        joystickManagerRef.current.destroy();
      }
    };
  }, []);
  
  // Handle virtual key presses based on joystick input
  useEffect(() => {
    // Create a map to track which keys are "pressed"
    const keys = new Map<string, boolean>();
    
    // Animation frame for updating key state based on joystick
    let animationFrame: number;
    
    const updateKeyState = () => {
      const { forward, side } = joystickState.current;
      
      // Update keyboard simulation based on joystick state
      document.dispatchEvent(
        new KeyboardEvent(forward > 0.3 ? 'keydown' : 'keyup', { code: 'KeyW' })
      );
      
      document.dispatchEvent(
        new KeyboardEvent(forward < -0.3 ? 'keydown' : 'keyup', { code: 'KeyS' })
      );
      
      document.dispatchEvent(
        new KeyboardEvent(side < -0.3 ? 'keydown' : 'keyup', { code: 'KeyA' })
      );
      
      document.dispatchEvent(
        new KeyboardEvent(side > 0.3 ? 'keydown' : 'keyup', { code: 'KeyD' })
      );
      
      animationFrame = requestAnimationFrame(updateKeyState);
    };
    
    // Start the update loop
    animationFrame = requestAnimationFrame(updateKeyState);
    
    return () => {
      cancelAnimationFrame(animationFrame);
      
      // Make sure to "release" all keys when component unmounts
      ['KeyW', 'KeyS', 'KeyA', 'KeyD'].forEach(code => {
        document.dispatchEvent(new KeyboardEvent('keyup', { code }));
      });
    };
  }, []);
  
  // Handle fire button
  const handleFire = () => {
    // Simulate spacebar for firing
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    
    // Play sound
    if (audioContext?.hitSound) {
      audioContext.playHit();
    }
    
    // Release key after a short delay
    setTimeout(() => {
      document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    }, 100);
  };
  
  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-between items-end p-6 pointer-events-none">
      {/* Virtual joystick */}
      <div 
        ref={joystickRef} 
        className="w-32 h-32 relative bg-black/30 rounded-full pointer-events-auto"
      />
      
      {/* Action buttons */}
      <div className="flex gap-4 pointer-events-auto">
        <button
          className="w-20 h-20 bg-red-600/70 rounded-full flex items-center justify-center text-white border-2 border-white/50 active:bg-red-800/70"
          onTouchStart={handleFire}
          aria-label="Fire"
        >
          🔥
        </button>
        
        <button
          className="w-16 h-16 bg-blue-600/70 rounded-full flex items-center justify-center text-white border-2 border-white/50"
          onClick={onPause}
          aria-label="Pause"
        >
          ⏸️
        </button>
      </div>
    </div>
  );
}
