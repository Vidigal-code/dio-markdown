import React from "react";

interface MenuProps {
  onSelect: (option: string) => void;
  activeItem: string;
}

const Menu: React.FC<MenuProps> = ({ onSelect, activeItem }) => {
  return (
    <ul className="menu">
      <li>
        <a
          href="#"
          onClick={() => onSelect("load")}
          className={activeItem === "load" ? "active" : ""}
        >
          Load Markdown
        </a>
      </li>
      <li>
        <a
          href="#"
          onClick={() => onSelect("git-search")}
          className={activeItem === "git-search" ? "active" : ""}
        >
          Buscar Markdown
        </a>
      </li>
      <li>
        <a
          href="#"
          onClick={() => onSelect("dio-search")}
          className={activeItem === "dio-search" ? "active" : ""}
        >
          Pesquisar Dio
        </a>
      </li>
    </ul>
  );
};

export default Menu;