import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop, faClock, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useSound } from '../context/SoundContext';

const MasterControls = () => {
  const {
    playAll,
    stopAll,
    masterVolume,
    setMasterVolume,
    isPlayingAll,
    timerEndTime,
    startTimer,
    cancelTimer
  } = useSound();

  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (timerEndTime) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);

        if (remaining <= 0) {
            setTimeLeft(null);
            setShowTimerMenu(false);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
        setTimeLeft(null);
    }
  }, [timerEndTime]);

  const handleTimerSelect = (minutes) => {
    startTimer(minutes);
    setShowTimerMenu(false);
  };

  return (
    <div className="master-controls">
      <div className="button-group">
        <button
          onClick={playAll}
          className="btn btn-primary"
        >
          <span className="btn-icon">
            <FontAwesomeIcon icon={faPlay} />
          </span>
          Play All
        </button>
        <button
          onClick={stopAll}
          className="btn btn-secondary"
          disabled={!isPlayingAll}
        >
          <span className="btn-icon">
            <FontAwesomeIcon icon={faStop} />
          </span>
          Stop All
        </button>

        {/* Timer Button */}
        <div className="timer-wrapper" style={{ position: 'relative' }}>
            <button
                className={`btn btn-secondary ${timerEndTime ? 'active' : ''}`}
                onClick={() => timerEndTime ? cancelTimer() : setShowTimerMenu(!showTimerMenu)}
                title={timerEndTime ? `Stop Timer (${timeLeft})` : "Sleep Timer"}
            >
                <span className="btn-icon">
                    <FontAwesomeIcon icon={timerEndTime ? faTimes : faClock} />
                </span>
                {timerEndTime ? timeLeft : 'Timer'}
            </button>

            {showTimerMenu && !timerEndTime && (
                <div className="timer-menu">
                    <button onClick={() => handleTimerSelect(15)}>15 min</button>
                    <button onClick={() => handleTimerSelect(30)}>30 min</button>
                    <button onClick={() => handleTimerSelect(60)}>60 min</button>
                </div>
            )}
        </div>
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
          onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
        />
        <span className="volume-value">{Math.round(masterVolume * 100)}%</span>
      </div>
    </div>
  );
};

export default MasterControls;
