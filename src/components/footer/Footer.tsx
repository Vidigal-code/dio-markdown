import { useDarkMode } from '../button/DarkModeProvider';
import './Footer.scss';

const Footer: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <footer className={`footer ${darkMode ? 'dark-mode' : ''}`}>
      <p>&copy; CREATED BY KAUAN VIDIGAL</p>
      <a href="https://github.com/Vidigal-code" className="footer-link" onClick={toggleDarkMode} target="_blank">Vidigal-code</a>
    </footer>
  );
};

export default Footer;
