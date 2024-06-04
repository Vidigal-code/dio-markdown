import React from 'react';
import { useDarkMode } from '../button/DarkModeProvider'; // Verifique o caminho correto aqui
import './Header.scss';

const Header: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <header className={`header ${darkMode ? 'dark-mode' : ''}`}>
      <h1 className="header-text">Editor Markdown</h1>
      <button onClick={toggleDarkMode} className={`header-button ${darkMode ? 'dark-mode' : ''}`}>
        Alternar Modo
      </button>
    </header>
  );
};

export default Header;
