import React, { useState } from "react";
import MarkdownLoadGithub from "./components/markdownloadgithub/MarkdownLoadGithub";
import DioSearch from "./components/dio/DioSearch";
import MarkdownSearch from "./components/markdownsearch/MarkdownSearch";
import Header from "./components/header/Header";
import { DarkModeProvider, useDarkMode } from "./components/provide/DarkModeProvider";
import Footer from "./components/footer/Footer.tsx";

const AppContent: React.FC = () => {

    const [activeMenu, setActiveMenu] = useState<string>("dio-search");
    const { darkMode, toggleDarkMode } = useDarkMode();

    const handleMenuSelect = (option: string) => {
        setActiveMenu(option);
    };

    return (
        <>
            <Header
                onSelect={handleMenuSelect}
                activeItem={activeMenu}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
            />
            {activeMenu === "load" ? (
                <MarkdownLoadGithub/>
            ) : activeMenu === "git-search" ? (
                <MarkdownSearch/>
            ) : activeMenu === "dio-search" ? (
                <DioSearch/>
            ) : null}
            <div className="content-spacer">
                <Footer darkMode={darkMode}/>
            </div>
        </>
    );
};

const App: React.FC = () => {
    return (
        <DarkModeProvider>
            <AppContent />
        </DarkModeProvider>
    );
};

export default App;