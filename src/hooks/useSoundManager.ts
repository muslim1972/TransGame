
import { useCallback, useRef } from 'react';
import { useAudioLoader } from './useAudioLoader';

const soundFiles = {
  bomb: '/sounds/bomb_botton.wav',
  newRow: '/sounds/New_row_appears.wav',
  gameOver: '/sounds/player-losing-or-failing.wav',
  replace: '/sounds/replease_half_letter_botton.wav',
  click: '/sounds/select-click.wav',
  match: '/sounds/match.wav',
  // TODO: Add sound for levelUp
  // levelUp: '/sounds/level-up.wav',
};

export const useSoundManager = () => {
  const { audioBuffers, loading, audioContext, initAudioContext } = useAudioLoader(soundFiles);
  const isMutedRef = useRef(false);

  const playSound = useCallback((soundName: keyof typeof soundFiles) => {
    if (isMutedRef.current || loading || !audioContext || !audioBuffers[soundName]) {
      return;
    }

    // Resume context if it's suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers[soundName];
    source.connect(audioContext.destination);
    source.start(0);
  }, [audioBuffers, loading, audioContext]);

  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    if (!isMutedRef.current) {
      initAudioContext();
    }
    return isMutedRef.current;
  }, [initAudioContext]);

  const isMuted = useCallback(() => {
    return isMutedRef.current;
  }, []);

  return {
    playSound,
    toggleMute,
    isMuted,
    initAudioContext
  };
};
