import React, { useState } from 'react';
import { useSound } from '../context/SoundContext';
import { PRESETS } from '../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash, faMusic } from '@fortawesome/free-solid-svg-icons';

const PresetList = ({ activeCategory, setActiveCategory, activePreset, setActivePreset }) => {
  const { loadPreset, sounds, stopAll, saveMix, savedMixes, loadMix, deleteMix } = useSound();
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [mixName, setMixName] = useState('');

  // Get unique categories
  const categories = ['all', ...new Set(sounds.map(sound => sound.category?.toLowerCase()).filter(Boolean))];

  const handleLoadPreset = (id) => {
    setActivePreset(id);
    loadPreset(PRESETS[id].sounds);
  };

  const handleLoadMix = (mix) => {
      setActivePreset(null); // Clear active preset as we are loading a custom mix
      loadMix(mix);
  };

  const clearPreset = () => {
    setActivePreset(null);
    stopAll();
  };

  const handleSaveMix = () => {
      if (mixName.trim()) {
          saveMix(mixName.trim());
          setMixName('');
          setShowSaveInput(false);
      }
  };

  const getDisplayCategory = (category) => {
    if (!category) return '';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  return (
    <div className="filters-container">
      {/* Presets Section */}
      <div className="filter-section">
        <span className="filter-title">Presets</span>
        <div className="filter-buttons">
          {Object.entries(PRESETS).map(([id, preset]) => (
            <button
              key={id}
              className={`preset-btn filter-btn ${activePreset === id ? 'active' : ''}`}
              onClick={() => handleLoadPreset(id)}
              title={preset.name}
            >
              {preset.icon} {preset.name}
            </button>
          ))}
          {activePreset && (
            <button
              className="filter-btn clear-preset-btn"
              onClick={clearPreset}
              title="Clear Preset"
            >
              ❌ Clear Preset
            </button>
          )}
        </div>
      </div>

      {/* My Mixes Section */}
      <div className="filter-section">
          <div className="filter-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
             <span className="filter-title" style={{ marginBottom: 0 }}>My Mixes</span>
             {!showSaveInput ? (
                 <button
                    className="btn-small"
                    onClick={() => setShowSaveInput(true)}
                    title="Save current mix"
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}
                 >
                     <FontAwesomeIcon icon={faSave} />
                 </button>
             ) : (
                 <div className="save-mix-input" style={{ display: 'flex', gap: '5px' }}>
                     <input
                        type="text"
                        value={mixName}
                        onChange={(e) => setMixName(e.target.value)}
                        placeholder="Mix Name"
                        className="mix-input"
                     />
                     <button onClick={handleSaveMix} className="btn-save">Save</button>
                     <button onClick={() => setShowSaveInput(false)} className="btn-cancel">Cancel</button>
                 </div>
             )}
          </div>

          <div className="filter-buttons">
              {savedMixes.length === 0 && <span className="no-mixes">No saved mixes yet.</span>}
              {savedMixes.map(mix => (
                  <div key={mix.id} className="mix-btn-wrapper" style={{ display: 'flex', gap: '5px' }}>
                      <button
                        className="preset-btn filter-btn"
                        onClick={() => handleLoadMix(mix)}
                        title={`Load ${mix.name}`}
                      >
                          <FontAwesomeIcon icon={faMusic} /> {mix.name}
                      </button>
                      <button
                        className="delete-mix-btn"
                        onClick={() => deleteMix(mix.id)}
                        title="Delete Mix"
                      >
                          <FontAwesomeIcon icon={faTrash} />
                      </button>
                  </div>
              ))}
          </div>
      </div>

      {/* Categories Section */}
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
  );
};

export default PresetList;
