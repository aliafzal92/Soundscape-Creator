import { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop, faVolumeUp, faVolumeMute, faMoon, faSun, faWater, faTree, faGhost } from '@fortawesome/free-solid-svg-icons';
import './App.css';

// Audio manager to handle all audio elements
class AudioManager {
  constructor() {
    this.audios = new Map();
  }

  getOrCreate(id, url) {
    if (this.audios.has(id)) {
      return this.audios.get(id);
    }

    const audio = new Audio(url);
    audio.loop = true;
    audio.preload = 'auto';
    this.audios.set(id, audio);
    return audio;
  }

  play(id) {
    const audio = this.audios.get(id);
    if (audio) {
      return audio.play().catch(err => console.error(`Error playing ${id}:`, err));
    }
    return Promise.reject(`Audio ${id} not found`);
  }

  stop(id) {
    const audio = this.audios.get(id);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  setVolume(id, volume) {
    const audio = this.audios.get(id);
    if (audio) {
      audio.volume = volume;
    }
  }

  setMuted(id, muted) {
    const audio = this.audios.get(id);
    if (audio) {
      audio.muted = muted;
    }
  }

  stopAll() {
    this.audios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  clear() {
    this.stopAll();
    this.audios.clear();
  }
}

function App() {
  const [sounds, setSounds] = useState([]);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePreset, setActivePreset] = useState(null);
  const [activeTheme, setActiveTheme] = useState('default'); // 'default', 'nature', 'water', 'horror'
  const audioManager = useRef(new AudioManager());
  const volumeUpdateTimer = useRef(null);

  // Preset configurations
  const presets = {
    'rainy-day': {
      name: 'Rainy Day',
      icon: '🌧️',
      sounds: ['rain', 'thunder', 'wind']
    },
    'forest-walk': {
      name: 'Forest Walk',
      icon: '🌲',
      sounds: ['forest', 'birds', 'stream']
    },
    'ocean-storm': {
      name: 'Ocean Storm',
      icon: '🌊',
      sounds: ['ocean', 'wind', 'thunder']
    },
    'cozy-fireplace': {
      name: 'Cozy Fireplace',
      icon: '🔥',
      sounds: ['fire', 'rain']
    }
  };

  useEffect(() => {
    // Fetch sounds from the server
    fetch('http://localhost:3001/api/sounds')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched sounds:', data);
        const soundsWithState = data.map(sound => ({
          ...sound,
          isPlaying: false,
          volume: 0.5,
          isMuted: false
        }));
        setSounds(soundsWithState);
      });
  }, []);

  const toggleSound = useCallback((soundId) => {
    setSounds(prevSounds => {
      const updatedSounds = prevSounds.map(sound => {
        if (sound.id !== soundId) return sound;
        
        const shouldPlay = !sound.isPlaying;
        
        if (shouldPlay) {
          const audioPath = sound.file.startsWith('/audio/') ? sound.file : `/audio/${sound.file}`;
          const audioUrl = `http://localhost:3001${audioPath}`;
          const audio = audioManager.current.getOrCreate(soundId, audioUrl);
          
          audio.volume = sound.volume * masterVolume;
          audio.muted = sound.isMuted;
          
          audio.play().catch(err => {
            console.error('Playback failed:', err);
            return { ...sound, isPlaying: false };
          });
        } else {
          audioManager.current.stop(soundId);
        }
        
        return { ...sound, isPlaying: shouldPlay };
      });
      
      // Check if any sounds are playing after this toggle
      const hasPlayingSounds = updatedSounds.some(sound => sound.isPlaying);
      
      // Update isPlayingAll state based on whether any sounds are playing
      if (hasPlayingSounds) {
        setIsPlayingAll(true);
      } else {
        setIsPlayingAll(false);
      }
      
      return updatedSounds;
    });
  }, [masterVolume]);
  
  // Clean up audio manager on unmount
  useEffect(() => {
    return () => {
      audioManager.current.clear();
    };
  }, []);
  
  // Update volumes when master volume changes
  useEffect(() => {
    sounds.forEach(sound => {
      if (sound.isPlaying) {
        audioManager.current.setVolume(sound.id, sound.volume * masterVolume);
      }
    });
  }, [masterVolume, sounds]);

  const handleVolumeChange = useCallback((soundId, newVolume) => {
    if (typeof newVolume === 'object' && newVolume.target) {
      // Handle event object
      newVolume = parseFloat(newVolume.target.value);
    }
    const volume = typeof newVolume === 'number' ? newVolume : 0.5;
    
    setSounds(prevSounds => 
      prevSounds.map(sound => {
        if (sound.id !== soundId) return sound;
        audioManager.current.setVolume(soundId, volume * masterVolume);
        return { ...sound, volume };
      })
    );
  }, [masterVolume]);

  const toggleMute = useCallback((soundId) => {
    setSounds(prevSounds => {
      return prevSounds.map(sound => {
        if (sound.id !== soundId) return sound;
        const newMuteState = !sound.isMuted;
        audioManager.current.setMuted(soundId, newMuteState);
        return { ...sound, isMuted: newMuteState };
      });
    });
  }, []);

  const stopAllSounds = useCallback(async () => {
    audioManager.current.stopAll();
    
    setSounds(prevSounds => 
      prevSounds.map(sound => ({
        ...sound,
        isPlaying: false
      }))
    );
    
    setIsPlayingAll(false);
  }, []);

  const playAllSounds = useCallback(() => {
    setSounds(prevSounds => 
      prevSounds.map(sound => {
        if (!sound.isPlaying) {
          const audioPath = sound.file.startsWith('/audio/') ? sound.file : `/audio/${sound.file}`;
          const audioUrl = `http://localhost:3001${audioPath}`;
          const audio = audioManager.current.getOrCreate(sound.id, audioUrl);
          audio.volume = sound.volume * masterVolume;
          audio.muted = sound.isMuted;
          audio.play().catch(err => {
            console.error('Playback failed:', err);
            return { ...sound, isPlaying: false };
          });
        }
        return { ...sound, isPlaying: true };
      })
    );
    setIsPlayingAll(true);
  }, [masterVolume]);

  const toggleAllSounds = (play) => {
    if (play) {
      playAllSounds();
    } else {
      stopAllSounds();
    }
  };

  // Track which sounds are part of the active preset
  const [presetSoundIds, setPresetSoundIds] = useState([]);

  const loadPreset = useCallback(async (presetId) => {
    await stopAllSounds();
    setActivePreset(presetId);
    
    const preset = presets[presetId];
    if (!preset) return;
    
    // Store the sound IDs that are part of this preset
    setPresetSoundIds(preset.sounds);

    // Play each sound in the preset with a small delay
    for (const soundId of preset.sounds) {
      const sound = sounds.find(s => s.id === soundId);
      if (sound) {
        setSounds(prev => {
          return prev.map(s => 
            s.id === soundId ? { ...s, isPlaying: true } : s
          );
        });
        
        const audioPath = sound.file.startsWith('/audio/') ? sound.file : `/audio/${sound.file}`;
        const audioUrl = `http://localhost:3001${audioPath}`;
        const audio = audioManager.current.getOrCreate(soundId, audioUrl);
        
        audio.volume = sound.volume * masterVolume;
        audio.muted = sound.isMuted;
        
        await audio.play().catch(err => {
          console.error('Playback failed:', err);
          setSounds(prev => prev.map(s => 
            s.id === soundId ? { ...s, isPlaying: false } : s
          ));
        });
        
        // Add a small delay between starting sounds
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Set isPlayingAll to true after loading the preset
    setIsPlayingAll(true);
  }, [sounds, stopAllSounds, masterVolume]);
  
  // Clear preset and show all sounds
  const clearPreset = useCallback(() => {
    setActivePreset(null);
    setPresetSoundIds([]);
  }, []);

  // volumeUpdateTimer is already declared at the top level
  
  const handleMasterVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setMasterVolume(newVolume);
    
    // Update audio volumes directly without causing re-renders
    sounds.forEach(sound => {
      if (sound.isPlaying) {
        audioManager.current.setVolume(sound.id, sound.volume * newVolume);
      }
    });
    
    // Clear any existing timer
    if (volumeUpdateTimer.current) {
      clearTimeout(volumeUpdateTimer.current);
    }
    
    // Only update the UI when the user has stopped moving the slider for a short period
    volumeUpdateTimer.current = setTimeout(() => {
      volumeUpdateTimer.current = null;
    }, 50);
  }, [sounds]);

  // Get unique categories from sounds, preserving original case for display
  const categories = ['all', ...new Set(sounds.map(sound => sound.category?.toLowerCase()).filter(Boolean))];
  
  // Filter sounds based on active category and preset
  const filteredSounds = (() => {
    // First filter by category
    const categoryFiltered = activeCategory.toLowerCase() === 'all' 
      ? sounds 
      : sounds.filter(sound => 
          sound.category?.toLowerCase() === activeCategory.toLowerCase()
        );
    
    // Then, if a preset is active, only show sounds that are part of the preset
    if (activePreset && presetSoundIds.length > 0) {
      return categoryFiltered.filter(sound => presetSoundIds.includes(sound.id));
    }
    
    return categoryFiltered;
  })();
      
  // Function to get display name for category (capitalized)
  const getDisplayCategory = (category) => {
    if (!category) return '';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  // Function to change theme
  const changeTheme = (theme) => {
    setActiveTheme(theme);
    
    // Remove all theme classes from body
    document.body.classList.remove('theme-nature', 'theme-water', 'theme-horror');
    
    // Add the new theme class to body
    if (theme !== 'default') {
      document.body.classList.add(`theme-${theme}`);
    }
  };

  // Get theme-specific class
  const getThemeClass = () => {
    switch (activeTheme) {
      case 'nature':
        return 'theme-nature';
      case 'water':
        return 'theme-water';
      case 'horror':
        return 'theme-horror';
      default:
        return '';
    }
  };
  
  // Apply theme to body on component mount and cleanup on unmount
  useEffect(() => {
    // Apply initial theme
    if (activeTheme !== 'default') {
      document.body.classList.add(`theme-${activeTheme}`);
    }
    
    // Cleanup function to remove theme classes when component unmounts
    return () => {
      document.body.classList.remove('theme-nature', 'theme-water', 'theme-horror');
    };
  }, []);

  return (
    <div className={`container ${getThemeClass()}`}>
      {/* Particle Effects */}
      <div className="particles-container">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <header className="header">
        <h1 className="title">Soundscape Creator</h1>
        <p className="subtitle">Mix ambient sounds for focus, relaxation, or immersion</p>
        
        {/* Theme Switcher */}
        <div className="theme-switcher">
          <div className="theme-btn-container">
            <button 
              className={`theme-btn ${activeTheme === 'default' ? 'active' : ''}`} 
              onClick={() => changeTheme('default')}
              title="Default Theme"
            >
              <FontAwesomeIcon icon={faSun} />
            </button>
            <div className="theme-preview default-preview">
              <div className="preview-title">Default Theme</div>
              <div className="preview-description">Clean, modern UI with blue and green accents</div>
            </div>
          </div>
          
          <div className="theme-btn-container">
            <button 
              className={`theme-btn ${activeTheme === 'nature' ? 'active' : ''}`} 
              onClick={() => changeTheme('nature')}
              title="Nature Theme"
            >
              <FontAwesomeIcon icon={faTree} />
            </button>
            <div className="theme-preview nature-preview">
              <div className="preview-title">Nature Theme</div>
              <div className="preview-description">Earthy greens with forest-inspired elements</div>
            </div>
          </div>
          
          <div className="theme-btn-container">
            <button 
              className={`theme-btn ${activeTheme === 'water' ? 'active' : ''}`} 
              onClick={() => changeTheme('water')}
              title="Water Theme"
            >
              <FontAwesomeIcon icon={faWater} />
            </button>
            <div className="theme-preview water-preview">
              <div className="preview-title">Water Theme</div>
              <div className="preview-description">Calming blues and teals with flowing elements</div>
            </div>
          </div>
          
          <div className="theme-btn-container">
            <button 
              className={`theme-btn ${activeTheme === 'horror' ? 'active' : ''}`} 
              onClick={() => changeTheme('horror')}
              title="Horror Theme"
            >
              <FontAwesomeIcon icon={faGhost} />
            </button>
            <div className="theme-preview horror-preview">
              <div className="preview-title">Horror Theme</div>
              <div className="preview-description">Dark atmosphere with blood red and deep purple accents</div>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        {/* Master Controls */}
        <div className="master-controls">
          <div className="button-group">
            <button 
              onClick={() => toggleAllSounds(true)}
              className="btn btn-primary"
            >
              <span className="btn-icon">
                <FontAwesomeIcon icon={faPlay} />
              </span>
              Play All
            </button>
            <button 
              onClick={() => toggleAllSounds(false)}
              className="btn btn-secondary"
              disabled={!isPlayingAll}
            >
              <span className="btn-icon">
                <FontAwesomeIcon icon={faStop} />
              </span>
              Stop All
            </button>
          </div>
          <div className="master-volume">
            <label htmlFor="masterVolume">Master Volume</label>
            <input
              type="range"
              id="masterVolume"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={handleMasterVolumeChange}
            />
            <span className="volume-value">{Math.round(masterVolume * 100)}%</span>
          </div>
        </div>

        {/* Presets and Categories */}
        <div className="filters-container">
          <div className="filter-section">
            <span className="filter-title">Presets</span>
            <div className="filter-buttons">
              {Object.entries(presets).map(([id, preset]) => (
                <button
                  key={id}
                  className={`preset-btn filter-btn ${activePreset === id ? 'active' : ''}`}
                  onClick={() => loadPreset(id)}
                  title={preset.name}
                >
                  {preset.icon} {preset.name}
                </button>
              ))}
              {activePreset && (
                <button
                  className="filter-btn clear-preset-btn"
                  onClick={clearPreset}
                  title="Show all sounds"
                >
                  ❌ Clear Preset
                </button>
              )}
            </div>
          </div>
          
          <div className="filter-section">
            <span className="filter-title">Categories</span>
            <div className="filter-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-btn ${activeCategory.toLowerCase() === category.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {getDisplayCategory(category)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sounds Grid */}
        <div className="sounds-grid">
          {filteredSounds.map(sound => (
            <div key={sound.id} className={`sound-card ${sound.isPlaying ? 'playing' : ''}`}>
              <div className="sound-header">
                <span className="sound-icon">{sound.icon}</span>
                <h3 className="sound-name">{sound.name}</h3>
                <button 
                  className={`sound-toggle ${sound.isPlaying ? 'active' : ''}`}
                  onClick={() => toggleSound(sound.id)}
                >
                  {sound.isPlaying ? 'Stop' : 'Play'}
                </button>
              </div>
              
              <div className="sound-controls">

                <div className="volume-control">
                  <button 
                    className="mute-btn"
                    onClick={() => toggleMute(sound.id)}
                  >
                    <FontAwesomeIcon icon={sound.isMuted ? faVolumeMute : faVolumeUp} />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={sound.volume}
                    onChange={(e) => handleVolumeChange(sound.id, e)}
                    disabled={sound.isMuted}
                  />
                  <span className="volume-value">
                    {Math.round(sound.volume * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Soundscape Creator</p>
      </footer>
    </div>
  );
}

export default App;
