export default function useAudioPlayer() {
  // Check for client-side environment
  if (typeof window === 'undefined') {
    console.warn('AudioContext is not available in a server-side environment.');
    return {
      preloadAudio: async () => {},
      playSound: async () => {},
    };
  }

  // Fallback for browser compatibility
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

  if (!AudioContextClass) {
    console.error('AudioContext is not supported in this browser.');
    return {
      preloadAudio: async () => {},
      playSound: async () => {},
    };
  }

  // Create the AudioContext instance
  const audioContext = new AudioContextClass();
  const audioBuffers: Map<string, AudioBuffer> = new Map();

  const defaultSounds: Record<string, string> = {
    tick: '/sounds/tick.mp3',
  };

  const preloadAudio = async (keyOrPath: string) => {
    const audioPath = defaultSounds[keyOrPath] || keyOrPath;

    if (audioBuffers.has(audioPath)) {
      return;
    }

    try {
      const response = await fetch(audioPath);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      audioBuffers.set(audioPath, audioBuffer);
    } catch (err) {
      console.error(`Error preloading audio: ${keyOrPath}`, err);
    }
  };

  const playSound = async (keyOrPath: string) => {
    const audioPath = defaultSounds[keyOrPath] || keyOrPath;

    if (!audioBuffers.has(audioPath)) {
      console.warn(`Audio not preloaded: ${keyOrPath}. Attempting to preload and play.`);
      await preloadAudio(audioPath);
    }

    const audioBuffer = audioBuffers.get(audioPath);
    if (audioBuffer) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } else {
      console.error(`Failed to play sound: ${keyOrPath}`);
    }
  };

  return {
    preloadAudio,
    playSound,
  };
}
