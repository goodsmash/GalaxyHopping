import { create } from "zustand";

type SoundEffects = 'hit' | 'success' | 'warp' | 'explosion' | 'boss_hit' | 'boss_defeated' | 
  'boss_attack_circle' | 'boss_attack_beam' | 'boss_attack_missiles' | 'boss_phase_change' | 
  'boss_music' | 'player_hit' | 'pickup_health' | 'pickup_shield' | 'pickup_weapon' | 
  'pickup_speed' | 'pickup_crystal' | 'pickup_data' | 'galaxy_transition' | 'ui_click';

interface AudioState {
  // Sound elements
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  warpSound: HTMLAudioElement | null;
  explosionSound: HTMLAudioElement | null;
  engineSound: HTMLAudioElement | null;
  soundEffects: Map<string, HTMLAudioElement>;
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setWarpSound: (sound: HTMLAudioElement) => void;
  setExplosionSound: (sound: HTMLAudioElement) => void;
  setEngineSound: (sound: HTMLAudioElement) => void;
  addSoundEffect: (name: string, sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playWarp: () => void;
  playExplosion: () => void;
  startEngine: () => void;
  stopEngine: () => void;
  adjustEngineVolume: (throttle: number) => void;
  
  // General sound player
  playSound: (sound: string, volume?: number, loop?: boolean) => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  warpSound: null,
  explosionSound: null,
  engineSound: null,
  soundEffects: new Map<string, HTMLAudioElement>(),
  isMuted: true, // Start muted by default
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setWarpSound: (sound) => set({ warpSound: sound }),
  setExplosionSound: (sound) => set({ explosionSound: sound }),
  setEngineSound: (sound) => set({ engineSound: sound }),
  
  addSoundEffect: (name, sound) => {
    const { soundEffects } = get();
    soundEffects.set(name, sound);
    set({ soundEffects: new Map(soundEffects) });
    console.log(`Sound effect '${name}' added`);
  },
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Just update the muted state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },
  
  playWarp: () => {
    const { warpSound, isMuted } = get();
    if (warpSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Warp sound skipped (muted)");
        return;
      }
      
      // Use a higher volume for the dramatic warp effect
      warpSound.volume = 0.6;
      warpSound.currentTime = 0;
      warpSound.play().catch(error => {
        console.log("Warp sound play prevented:", error);
      });
    }
  },
  
  playExplosion: () => {
    const { explosionSound, isMuted } = get();
    if (explosionSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Explosion sound skipped (muted)");
        return;
      }
      
      // Create a new instance for overlapping explosion sounds
      const soundClone = explosionSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.5;
      soundClone.play().catch(error => {
        console.log("Explosion sound play prevented:", error);
      });
    }
  },
  
  startEngine: () => {
    const { engineSound, isMuted } = get();
    if (engineSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Engine sound skipped (muted)");
        return;
      }
      
      // Set to loop for continuous engine sound
      engineSound.loop = true;
      engineSound.volume = 0.3;
      
      // Start at low volume and will adjust based on throttle
      engineSound.play().catch(error => {
        console.log("Engine sound play prevented:", error);
      });
    }
  },
  
  stopEngine: () => {
    const { engineSound } = get();
    if (engineSound && !engineSound.paused) {
      // Fade out engine sound smoothly
      const fadeOut = () => {
        if (engineSound.volume > 0.05) {
          engineSound.volume -= 0.05;
          setTimeout(fadeOut, 50);
        } else {
          engineSound.pause();
          engineSound.currentTime = 0;
        }
      };
      
      fadeOut();
    }
  },
  
  adjustEngineVolume: (throttle) => {
    const { engineSound, isMuted } = get();
    if (engineSound && !engineSound.paused && !isMuted) {
      // Map throttle (0-1) to a good volume range (0.1-0.7)
      const newVolume = 0.1 + (throttle * 0.6);
      
      // Smooth transition
      const currentVolume = engineSound.volume;
      const volumeDiff = newVolume - currentVolume;
      
      if (Math.abs(volumeDiff) > 0.01) {
        engineSound.volume = currentVolume + (volumeDiff * 0.1);
      }
      
      // Also adjust playback rate for more immersive effect
      // Higher throttle = higher pitch
      engineSound.playbackRate = 0.8 + (throttle * 0.4);
    }
  },
  
  // General sound player for all sound effects
  playSound: (sound, volume = 0.5, loop = false) => {
    const { soundEffects, isMuted } = get();
    
    // Skip if muted
    if (isMuted) {
      console.log(`Sound '${sound}' skipped (muted)`);
      return;
    }
    
    // Look for the sound in our effects map
    const soundEffect = soundEffects.get(sound);
    
    if (soundEffect) {
      // Create a new instance for overlapping sounds
      const soundClone = soundEffect.cloneNode() as HTMLAudioElement;
      soundClone.volume = volume;
      soundClone.loop = loop;
      
      // Play the sound
      soundClone.play().catch(error => {
        console.log(`Sound '${sound}' play prevented:`, error);
      });
    } else {
      // Look for the built-in sounds - fallback mechanism
      switch (sound) {
        case 'hit':
          get().playHit();
          break;
          
        case 'success':
          get().playSuccess();
          break;
          
        case 'warp':
          get().playWarp();
          break;
          
        case 'explosion':
          get().playExplosion();
          break;
          
        default:
          console.warn(`Sound '${sound}' not found in effects library`);
          // If we're here, play a default 'beep' sound
          const beep = new Audio();
          beep.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...'; // truncated
          beep.volume = 0.2;
          beep.play().catch(e => console.log('Beep prevented:', e));
      }
    }
  }
}));
