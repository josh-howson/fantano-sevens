type SoundKey = 'tick';

export default function useAudioPlayer() {
  // Default sounds map
  const defaultSounds: Record<SoundKey, string> = {
    tick: '/audio/tick.wav',
  };

  // Function to play audio
  const playSound = (keyOrPath: SoundKey | string) => {
    const audioPath = defaultSounds[keyOrPath as SoundKey] || keyOrPath;

    if (!audioPath) {
      console.warn('Invalid audio key or path:', keyOrPath);
      return;
    }

    const audio = new Audio(audioPath);
    audio.play().catch((err) => console.error('Error playing audio:', err));
  };

  return {
    playSound,
  };
}
