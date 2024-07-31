import { useDarkMode } from '../button/DarkModeProvider';
import './Footer.scss';

const Footer: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <footer className={`footer ${darkMode ? 'dark-mode' : ''}`}>
      <p>&copy; CREATED BY KAUAN VIDIGAL</p>
     <div className="buttons-footers">
     <a href="https://github.com/Vidigal-code" className={`footer-link${darkMode ? " dark-mode" : ""}`} onClick={toggleDarkMode} target="_blank">Vidigal-code</a>
     <a href="https://github.com/Vidigal-code/dio-markdown/" className={`footer-link${darkMode ? " dark-mode" : ""}`} onClick={toggleDarkMode} target="_blank">Link-Project</a>
     </div>
    </footer>
  );
};

export default Footer;
