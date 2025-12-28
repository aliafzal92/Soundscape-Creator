import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { useSound } from '../context/SoundContext';

const SoundCard = ({ sound }) => {
  const { toggleSound, setSoundVolume, toggleMute } = useSound();

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setSoundVolume(sound.id, newVolume);
  };

  return (
    <div className={`sound-card ${sound.isPlaying ? 'playing' : ''}`}>
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
            className={`mute-btn ${sound.isMuted ? 'muted' : ''}`}
            onClick={() => toggleMute(sound.id)}
            title={sound.isMuted ? "Unmute" : "Mute"}
          >
            <FontAwesomeIcon icon={sound.isMuted ? faVolumeMute : faVolumeUp} />
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={sound.volume}
            onChange={handleVolumeChange}
            disabled={sound.isMuted}
            className="volume-slider"
          />
          <span className="volume-value">
            {Math.round(sound.volume * 100)}%
          </span>
        </div>
      </div>
       {sound.isPlaying && (
          <div className="waveform-container">
            {/* Visual placeholder for playing state */}
            <div className="playing-indicator"></div>
          </div>
        )}
    </div>
  );
};

export default SoundCard;
