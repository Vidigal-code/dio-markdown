import React, { useState, useEffect } from 'react';
import './Header.scss';

interface HeaderProps {
    onSelect: (item: string) => void;
    activeItem: string;
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSelect, activeItem, darkMode, toggleDarkMode }) => {

    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkScreenSize = (): void => {
            setIsMobile(window.innerWidth <= 640);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    const toggleMenu = (): void => {
        setMenuOpen(!menuOpen);
    };

    const handleMenuItemClick = (item: string): void => {
        onSelect(item);
        if (isMobile) {
            setMenuOpen(false);
        }
    };

    return (
        <header className={`header ${darkMode ? "dark-mode" : ""}`}>
            <div className="header-title">Editor Markdown</div>

            <ul className={`menu ${menuOpen ? "open" : ""}`}>
                <li>
                    <button
                        className={`dio-button ${darkMode ? "dark-mode" : ""}`}
                        onClick={toggleDarkMode}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </li>
                <li>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleMenuItemClick("load");
                        }}
                        className={activeItem === "load" ? "active" : ""}
                    >
                        Load Markdown
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleMenuItemClick("git-search");
                        }}
                        className={activeItem === "git-search" ? "active" : ""}
                    >
                        Buscar Markdown
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleMenuItemClick("dio-search");
                        }}
                        className={activeItem === "dio-search" ? "active" : ""}
                    >
                        Pesquisar Dio
                    </a>
                </li>
            </ul>

            {isMobile && (
                <button
                    className="menu-toggle"
                    onClick={toggleMenu}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                ></button>
            )}
        </header>
    );
};

export default Header;