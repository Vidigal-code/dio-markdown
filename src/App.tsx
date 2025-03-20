import React from "react";
import DioSearch from "./components/dio/DioSearch";
import { DarkModeProvider } from "./components/button/DarkModeProvider";

const App: React.FC = () => {
  return (
    <DarkModeProvider>
        <DioSearch />
    </DarkModeProvider>
  );
};

export default App;
