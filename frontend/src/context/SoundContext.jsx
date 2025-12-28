import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Howl, Howler } from 'howler';

const SoundContext = createContext();

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

export const SoundProvider = ({ children }) => {
  const [sounds, setSounds] = useState([]);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Timer State
  const [timerDuration, setTimerDuration] = useState(null); // in minutes
  const [timerEndTime, setTimerEndTime] = useState(null);

  // Mixes State
  const [savedMixes, setSavedMixes] = useState([]);

  // Ref to store Howl instances
  const howlsRef = useRef({});
  const timerRef = useRef(null);

  // Load Saved Mixes from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('soundscape_mixes');
    if (saved) {
      try {
        setSavedMixes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved mixes", e);
      }
    }
  }, []);

  // Fetch sounds on mount
  useEffect(() => {
    fetch('http://localhost:3001/api/sounds')
      .then(response => response.json())
      .then(data => {
        const initialSounds = data.map(sound => ({
          ...sound,
          isPlaying: false,
          volume: 0.5,
          isMuted: false
        }));
        setSounds(initialSounds);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch sounds:", err);
        setIsLoading(false);
      });

    return () => {
      // Cleanup all sounds on unmount
      Object.values(howlsRef.current).forEach(howl => howl.unload());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Update Master Volume
  useEffect(() => {
    Howler.volume(masterVolume);
  }, [masterVolume]);

  // Timer Logic
  const startTimer = useCallback((minutes) => {
    if (timerRef.current) clearInterval(timerRef.current);

    setTimerDuration(minutes);
    const endTime = Date.now() + minutes * 60 * 1000;
    setTimerEndTime(endTime);

    timerRef.current = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        stopAll();
        cancelTimer();
      }
    }, 1000);
  }, []);

  const cancelTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerDuration(null);
    setTimerEndTime(null);
    timerRef.current = null;
  }, []);

  // Mix Saving Logic
  const saveMix = useCallback((name) => {
    const activeSounds = sounds.filter(s => s.isPlaying).map(s => ({
      id: s.id,
      volume: s.volume,
      isMuted: s.isMuted
    }));

    if (activeSounds.length === 0) return;

    const newMix = {
      id: Date.now().toString(),
      name,
      sounds: activeSounds,
      date: new Date().toISOString()
    };

    const newMixes = [...savedMixes, newMix];
    setSavedMixes(newMixes);
    localStorage.setItem('soundscape_mixes', JSON.stringify(newMixes));
  }, [sounds, savedMixes]);

  const deleteMix = useCallback((mixId) => {
    const newMixes = savedMixes.filter(m => m.id !== mixId);
    setSavedMixes(newMixes);
    localStorage.setItem('soundscape_mixes', JSON.stringify(newMixes));
  }, [savedMixes]);

  const getSoundUrl = (file) => {
    const audioPath = file.startsWith('/audio/') ? file : `/audio/${file}`;
    return `http://localhost:3001${audioPath}`;
  };

  const playSound = useCallback((soundId, options = {}) => {
    setSounds(prev => prev.map(s => {
      if (s.id !== soundId) return s;

      const targetVolume = options.volume !== undefined ? options.volume : s.volume;
      const targetMute = options.isMuted !== undefined ? options.isMuted : s.isMuted;

      let howl = howlsRef.current[soundId];
      if (!howl) {
        howl = new Howl({
          src: [getSoundUrl(s.file)],
          loop: true,
          volume: targetVolume,
          mute: targetMute,
          html5: true,
        });
        howlsRef.current[soundId] = howl;
      } else {
          // Update existing howl if passed options
          howl.volume(targetVolume);
          howl.mute(targetMute);
      }

      if (!howl.playing()) {
        howl.play();
        howl.fade(0, targetVolume, 1000);
      }

      return { ...s, isPlaying: true, volume: targetVolume, isMuted: targetMute };
    }));
  }, []);

  const stopSound = useCallback((soundId) => {
    setSounds(prev => prev.map(s => {
      if (s.id !== soundId) return s;

      const howl = howlsRef.current[soundId];
      if (howl) {
        howl.fade(howl.volume(), 0, 500);
        setTimeout(() => {
          howl.stop();
        }, 500);
      }

      return { ...s, isPlaying: false };
    }));
  }, []);

  const toggleSound = useCallback((soundId) => {
    const sound = sounds.find(s => s.id === soundId);
    if (sound?.isPlaying) {
      stopSound(soundId);
    } else {
      playSound(soundId);
    }
  }, [sounds, playSound, stopSound]);

  const setSoundVolume = useCallback((soundId, volume) => {
    const howl = howlsRef.current[soundId];
    if (howl) {
      howl.volume(volume);
    }
    setSounds(prev => prev.map(s =>
      s.id === soundId ? { ...s, volume } : s
    ));
  }, []);

  const toggleMute = useCallback((soundId) => {
    setSounds(prev => prev.map(s => {
      if (s.id !== soundId) return s;
      const newMuted = !s.isMuted;

      const howl = howlsRef.current[soundId];
      if (howl) {
        howl.mute(newMuted);
      }

      return { ...s, isMuted: newMuted };
    }));
  }, []);

  const stopAll = useCallback(() => {
    Object.values(howlsRef.current).forEach(howl => {
        if (howl.playing()) {
             howl.fade(howl.volume(), 0, 1000);
             setTimeout(() => howl.stop(), 1000);
        }
    });
    setSounds(prev => prev.map(s => ({ ...s, isPlaying: false })));
    setIsPlayingAll(false);
  }, []);

  const playAll = useCallback(() => {
    sounds.forEach(s => {
      if (!s.isPlaying) playSound(s.id);
    });
    setIsPlayingAll(true);
  }, [sounds, playSound]);

  // Load a preset (list of sound IDs)
  const loadPreset = useCallback((presetSoundIds) => {
    stopAll();
    setTimeout(() => {
        presetSoundIds.forEach(id => {
            playSound(id);
        });
        setIsPlayingAll(true);
    }, 1100);
  }, [stopAll, playSound]);

  // Load a saved mix
  const loadMix = useCallback((mix) => {
      stopAll();
      setTimeout(() => {
          mix.sounds.forEach(s => {
              playSound(s.id, { volume: s.volume, isMuted: s.isMuted });
          });
          setIsPlayingAll(true);
      }, 1100);
  }, [stopAll, playSound]);

  const value = {
    sounds,
    masterVolume,
    setMasterVolume,
    isPlayingAll,
    toggleSound,
    setSoundVolume,
    toggleMute,
    stopAll,
    playAll,
    loadPreset,
    isLoading,
    // Timer
    timerDuration,
    timerEndTime,
    startTimer,
    cancelTimer,
    // Mixes
    savedMixes,
    saveMix,
    deleteMix,
    loadMix
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};
