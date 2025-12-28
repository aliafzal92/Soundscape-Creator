import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';

const Header = ({ activeTheme, changeTheme }) => {
  return (
    <header className="header">
      <h1 className="title">Soundscape Creator</h1>
      <p className="subtitle">Mix ambient sounds for focus, relaxation, or immersion</p>
      <ThemeSwitcher activeTheme={activeTheme} changeTheme={changeTheme} />
    </header>
  );
};

export default Header;
