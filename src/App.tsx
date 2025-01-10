import React, { useState } from "react";
import MarkdownLoadGithub from "./components/markdownloadgithub/MarkdownLoadGithub";
import DioSearch from "./components/dio/DioSearch";
import MarkdownSearch from "./components/markdownsearch/MarkdownSearch";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Menu from "./components/Menu";
import "./App.css";
import { DarkModeProvider } from "./components/button/DarkModeProvider";

const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>("dio-search");

  const handleMenuSelect = (option: string) => {
    setActiveMenu(option);
  };

  return (
    <DarkModeProvider>
      <Header />
      <Menu onSelect={handleMenuSelect} activeItem={activeMenu} />
      {activeMenu === "load" ? (
        <MarkdownLoadGithub />
      ) : activeMenu === "git-search" ? (
        <MarkdownSearch />
      ) : activeMenu === "dio-search" ? (
        <DioSearch />
      ) : null}
      <Footer />
    </DarkModeProvider>
  );
};

export default App;
