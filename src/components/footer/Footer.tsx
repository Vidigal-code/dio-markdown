import './Footer.scss';
import React from "react";

interface FooterProps {
    darkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ darkMode }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`footer-container ${darkMode ? 'dark-mode' : ''}`}>
            <div className="footer-left">
                <span className="footer-text">
                    © {currentYear} Editor Markdown
                    <span className="footer-author">
                        By
                        <a
                            className={`footer-link ${darkMode ? 'dark-mode' : ''}`}
                            href="https://github.com/Vidigal-code"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Vidigal-code
                        </a>
                    </span>
                </span>
            </div>
            <div className="footer-right">
                <span className="footer-text">
                    <a
                        className={`footer-link ${darkMode ? 'dark-mode' : ''}`}
                        href="https://github.com/Vidigal-code/dio-markdown"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Documentation
                    </a>
                </span>
            </div>
        </footer>
    );
}

export default Footer;