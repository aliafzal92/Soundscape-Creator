import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faTree, faWater, faGhost } from '@fortawesome/free-solid-svg-icons';

const ThemeSwitcher = ({ activeTheme, changeTheme }) => {
  return (
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
          <div className="preview-description">Elegant black & white aesthetic</div>
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
  );
};

export default ThemeSwitcher;
