import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState, Component, ReactNode } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useGalaxyHopping } from "./lib/stores/useGalaxyHopping";
import { useAudio } from "./lib/stores/useAudio";
import { GameScene } from "./game/GameScene";
import { UI } from "./game/UI";
import { Menu } from "./game/Menu";
import { OptionsMenu } from "./game/OptionsMenu";
import { HighScores } from "./game/HighScores";
import { ShipViewer } from "./game/ShipViewer";
import { EnvironmentViewer } from "./game/EnvironmentViewer";
import { FallbackRenderer } from "./game/FallbackRenderer";
import { Controls } from "./game/types";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import "@fontsource/inter";

// ErrorBoundary component to catch rendering errors
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error("ErrorBoundary caught an error:", error);
    return { 
      hasError: true,
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error details:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Helper function to check WebGL support
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const hasWebGL = !!(
      window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
    
    // Additional check for WebGL2 if possible
    const hasWebGL2 = !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
    
    console.log(`WebGL Support: WebGL1=${hasWebGL}, WebGL2=${hasWebGL2}`);
    return hasWebGL || hasWebGL2;
  } catch (e) {
    console.error("Error detecting WebGL support:", e);
    return false;
  }
}

function App() {
  const { gameState, loadGame, setGameState } = useGalaxyHopping();
  const [showCanvas, setShowCanvas] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true); // Optimistically assume support
  
  // Initialize the game when component loads
  useEffect(() => {
    console.log("App mounted, initializing game...");
    
    try {
      // Check WebGL support first
      const hasWebGL = isWebGLAvailable();
      setWebGLSupported(hasWebGL);
      
      if (!hasWebGL) {
        console.warn("WebGL not supported - game will use fallback mode");
        setGameState('mainMenu'); // Ensure we're in a good state for the fallback renderer
      }
      
      // Load game state from storage
      loadGame();
      
      // Set up sounds
      const shoot = new Audio('/sounds/hit.mp3');
      const explosion = new Audio('/sounds/success.mp3');
      const background = new Audio('/sounds/background.mp3');
      const warp = new Audio('/sounds/warp.mp3');
      
      // Configure audio
      background.loop = true;
      background.volume = 0.5;
      
      // Force preload the audio files
      shoot.load();
      explosion.load();
      background.load();
      warp.load();
      
      // Set up audio in the useAudio store directly
      const audioStore = useAudio.getState();
      audioStore.setHitSound(shoot);
      audioStore.setSuccessSound(explosion);
      audioStore.setBackgroundMusic(background);
      audioStore.setWarpSound(warp);
      
      // Add other sound effects
      audioStore.addSoundEffect('galaxy_transition', warp);
      
      // Toggle mute to unmute audio if needed
      if (audioStore.isMuted) {
        audioStore.toggleMute();
      }
      
      // Show the canvas once initialization is complete
      setTimeout(() => {
        setShowCanvas(true);
        console.log("Game canvas now visible");
      }, 500);
      
      console.log("Game initialized successfully, gameState:", gameState);
    } catch (error) {
      console.error("Error initializing game:", error);
      setWebGLSupported(false); // Fallback if initialization fails
    }
    
    // Cleanup when component unmounts
    return () => {
      try {
        const audioStore = useAudio.getState();
        if (audioStore.backgroundMusic) {
          audioStore.backgroundMusic.pause();
        }
      } catch (error) {
        console.error("Error cleaning up audio:", error);
      }
    };
  }, [loadGame, setGameState]);
  
  // Define control keys for the game
  const controls = [
    { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
    { name: Controls.backward, keys: ["KeyS", "ArrowDown"] },
    { name: Controls.left, keys: ["KeyA", "ArrowLeft"] },
    { name: Controls.right, keys: ["KeyD", "ArrowRight"] },
    { name: Controls.fire, keys: ["Space"] },
    { name: Controls.pause, keys: ["Escape", "KeyP"] },
  ];

  // Loading screen when canvas is not yet ready
  if (!showCanvas) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Loading Galaxy Hopping</h1>
          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="animate-pulse h-full bg-blue-500 rounded-full" style={{width: '90%'}}></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Use fallback renderer if WebGL is not supported - skip Canvas entirely
  if (!webGLSupported) {
    // Return interface with FallbackRenderer directly
    return (
      <Router>
        <div className="w-full h-full relative overflow-hidden">
          <Routes>
            <Route path="/" element={
              <div className="w-full h-full relative overflow-hidden">
                <KeyboardControls map={controls}>
                  <FallbackRenderer />
                </KeyboardControls>
              </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="w-full h-full relative overflow-hidden">
        <Routes>
          {/* Main Game */}
          <Route path="/" element={
            <div className="w-full h-full relative overflow-hidden">
              <KeyboardControls map={controls}>
                <ErrorBoundary key="main-canvas-error-boundary" fallback={
                  <FallbackRenderer />
                }>
                  <Canvas 
                    shadows
                    camera={{
                      position: [0, 20, 50],
                      fov: 60,
                      near: 0.1,
                      far: 2000
                    }}
                    gl={{
                      antialias: true,
                      powerPreference: "high-performance",
                      failIfMajorPerformanceCaveat: false,
                      preserveDrawingBuffer: true
                    }}
                    onCreated={({ gl }) => {
                      console.log("Canvas created successfully!");
                      // Set renderer parameters for better performance
                      gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                      gl.setClearColor(0x020209, 1);
                    }}
                  >
                    <fog attach="fog" args={['#020209', 100, 400]} />
                    <color attach="background" args={["#020209"]} />
                    
                    <Suspense fallback={null}>
                      <GameScene />
                    </Suspense>
                  </Canvas>
                </ErrorBoundary>
                
                {/* UI overlay */}
                <UI />
                
                {/* Menus */}
                {gameState === 'mainMenu' && <Menu />}
                {gameState === 'options' && <OptionsMenu />}
                {gameState === 'highScores' && <HighScores />}
              </KeyboardControls>
            </div>
          } />
          
          {/* Ship Viewer */}
          <Route path="/ships" element={
            <div className="w-full h-full bg-gray-900 text-white">
              <div className="p-4 flex justify-between items-center bg-gray-800">
                <h1 className="text-2xl font-bold">Galaxy Hopping - Ship Viewer</h1>
                <div className="flex space-x-4">
                  <Link to="/environment" className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded">
                    Environment Objects
                  </Link>
                  <Link to="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
                    Back to Game
                  </Link>
                </div>
              </div>
              <div className="h-[calc(100%-4rem)]">
                <ErrorBoundary key="ship-viewer-error-boundary" fallback={
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                    <div className="text-center max-w-md p-6 bg-gray-800 rounded-lg">
                      <h2 className="text-2xl mb-4 text-red-500">WebGL Error</h2>
                      <p className="mb-4">Could not load the Ship Viewer.</p>
                      <Link to="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded inline-block">
                        Back to Main Menu
                      </Link>
                    </div>
                  </div>
                }>
                  <ShipViewer />
                </ErrorBoundary>
              </div>
            </div>
          } />
          
          {/* Environment Objects Viewer */}
          <Route path="/environment" element={
            <div className="w-full h-full bg-gray-900 text-white">
              <div className="p-4 flex justify-between items-center bg-gray-800">
                <h1 className="text-2xl font-bold">Galaxy Hopping - Environment Viewer</h1>
                <div className="flex space-x-4">
                  <Link to="/ships" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded">
                    Ship Models
                  </Link>
                  <Link to="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
                    Back to Game
                  </Link>
                </div>
              </div>
              <div className="h-[calc(100%-4rem)]">
                <ErrorBoundary key="environment-viewer-error-boundary" fallback={
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                    <div className="text-center max-w-md p-6 bg-gray-800 rounded-lg">
                      <h2 className="text-2xl mb-4 text-red-500">WebGL Error</h2>
                      <p className="mb-4">Could not load the Environment Viewer.</p>
                      <Link to="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded inline-block">
                        Back to Main Menu
                      </Link>
                    </div>
                  </div>
                }>
                  <EnvironmentViewer />
                </ErrorBoundary>
              </div>
            </div>
          } />
          
          {/* Catch-all for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
