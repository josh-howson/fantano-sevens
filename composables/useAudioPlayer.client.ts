type SoundKey = 'tick'; // Extend this with more default sounds

export default function useAudioPlayer() {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffers: Map<string, AudioBuffer> = new Map();

  // Default sounds map
  const defaultSounds: Record<SoundKey, string> = {
    tick: '/sounds/tick.wav',
  };

  // Preload an audio file
  const preloadAudio = async (keyOrPath: SoundKey | string) => {
    const audioPath = defaultSounds[keyOrPath as SoundKey] || keyOrPath;

    if (audioBuffers.has(audioPath)) {
      return; // Already preloaded
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

  // Play a preloaded sound
  const playSound = async (keyOrPath: SoundKey | string) => {
    const audioPath = defaultSounds[keyOrPath as SoundKey] || keyOrPath;

    if (!audioBuffers.has(audioPath)) {
      console.warn(`Audio not preloaded: ${keyOrPath}. Attempting to preload and play.`);
      await preloadAudio(audioPath); // Preload if not already loaded
    }

    const audioBuffer = audioBuffers.get(audioPath);
    if (audioBuffer) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0); // Play immediately
    } else {
      console.error(`Failed to play sound: ${keyOrPath}`);
    }
  };

  return {
    preloadAudio,
    playSound,
  };
}
