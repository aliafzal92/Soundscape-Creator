import React, { useState, useEffect } from 'react';
import './App.css';
import { SoundProvider, useSound } from './context/SoundContext';
import Header from './components/Header';
import MasterControls from './components/MasterControls';
import PresetList from './components/PresetList';
import SoundCard from './components/SoundCard';
import { PRESETS } from './constants';

const AppContent = () => {
  const { sounds, isLoading } = useSound();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePreset, setActivePreset] = useState(null);
  const [activeTheme, setActiveTheme] = useState('default');

  // Filter sounds
  const filteredSounds = (() => {
    const categoryFiltered = activeCategory.toLowerCase() === 'all' 
      ? sounds 
      : sounds.filter(sound => 
          sound.category?.toLowerCase() === activeCategory.toLowerCase()
        );
    
    if (activePreset) {
      const presetSoundIds = PRESETS[activePreset]?.sounds || [];
      return categoryFiltered.filter(sound => presetSoundIds.includes(sound.id));
    }
    
    return categoryFiltered;
  })();

  // Theme Management
  useEffect(() => {
    document.body.classList.remove('theme-nature', 'theme-water', 'theme-horror');
    if (activeTheme !== 'default') {
      document.body.classList.add(`theme-${activeTheme}`);
    }
  }, [activeTheme]);

  const changeTheme = (theme) => {
    setActiveTheme(theme);
  };

  const getThemeClass = () => {
     switch (activeTheme) {
      case 'nature': return 'theme-nature';
      case 'water': return 'theme-water';
      case 'horror': return 'theme-horror';
      default: return '';
    }
  };

  return (
    <div className={`container ${getThemeClass()}`}>
       {/* Particle Effects - Preserved from original */}
      <div className="particles-container">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <Header activeTheme={activeTheme} changeTheme={changeTheme} />

      <main className="main">
        <MasterControls />

        <PresetList
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activePreset={activePreset}
          setActivePreset={setActivePreset}
        />

        {isLoading ? (
          <div className="loading">Loading sounds...</div>
        ) : (
          <div className="sounds-grid">
            {filteredSounds.map(sound => (
              <SoundCard key={sound.id} sound={sound} />
            ))}
            {filteredSounds.length === 0 && (
                <div className="no-sounds">No sounds found for this category/preset.</div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Soundscape Creator</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <SoundProvider>
      <AppContent />
    </SoundProvider>
  );
}

export default App;
