
import { useState, useEffect, useCallback, useRef } from 'react';

export const useAudioLoader = (soundFiles: { [key: string]: string }) => {
  const [audioBuffers, setAudioBuffers] = useState<{ [key: string]: AudioBuffer }>({});
  const [loading, setLoading] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  useEffect(() => {
    const loadSounds = async () => {
      const context = initAudioContext();
      if (!context) {
        setLoading(false);
        return;
      }

      const bufferMap: { [key: string]: AudioBuffer } = {};
      for (const key in soundFiles) {
        try {
          const response = await fetch(soundFiles[key]);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await context.decodeAudioData(arrayBuffer);
          bufferMap[key] = audioBuffer;
        } catch (error) {
          console.error(`Failed to load sound: ${key}`, error);
        }
      }
      setAudioBuffers(bufferMap);
      setLoading(false);
    };

    loadSounds();
  }, [soundFiles, initAudioContext]);

  return { audioBuffers, loading, audioContext: audioContextRef.current, initAudioContext };
};
