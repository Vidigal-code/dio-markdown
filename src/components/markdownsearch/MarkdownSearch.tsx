import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import "./MarkdownSearch.scss";
import { useDarkMode } from "../button/DarkModeProvider";

interface GitHubUser {
  avatar_url: string;
  name: string;
}

const MarkdownSearch: React.FC = () => {

  const [username, setUsername] = useState("");
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<GitHubUser | null>(null);
  const { darkMode } = useDarkMode();

  const handleSearch = () => {
    setLoadingProfile(true);
    setLoadingStats(true);
    setError(null);

    fetch(`https://api.github.com/users/${username}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Perfil não encontrado.");
        }
        return response.json();
      })
      .then((data) => {
        setUserProfile({ avatar_url: data.avatar_url, name: data.name });
        setLoadingProfile(false);
        return fetch(
          `https://raw.githubusercontent.com/${username}/${username}/master/README.md`
        );
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("README.md não disponível.");
        }
        return response.text();
      })
      .then((text) => {
        setMarkdownContent(text);
        setLoadingStats(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoadingProfile(false);
        setLoadingStats(false);
      });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      handleSearch();
    }
  };
  

  useEffect(() => {
    if (username.length > 2) {
      const delaySearch = setTimeout(() => {
        handleSearch();
      }, 900);
  
      return () => clearTimeout(delaySearch);
    }
  }, [username]);
  

  return (
    <div className={`markdown-search ${darkMode ? "dark-mode" : ""}`}>
      <div className={`markdown-search-inner ${darkMode ? "dark-mode" : ""}`}>
        <div className="input-button-wrapper">
          <input
            type="text"
            placeholder="Digite o nome de usuário do GitHub..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className={`button-markdown ${darkMode ? "dark-mode" : ""}`}
            onClick={handleSearch}
          >
            Buscar
          </button>
        </div>
        {loadingProfile && <p className="text-loading">Carregando perfil...</p>}
        {loadingStats && <p className="text-loading">Carregando stats...</p>}
        {error && <p className="error">{error}</p>}
        {userProfile && (
          <div className="github-profile">
            <img
              src={userProfile.avatar_url}
              alt="User avatar"
              className="profile-avatar"
            />
            <div className="profile-info">
              <p className="profile-name">{userProfile.name}</p>
            </div>
          </div>
        )}
        <div className="markdown-content">
          <ReactMarkdown
              rehypePlugins={[remarkGfm, rehypeRaw, rehypeSanitize]}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MarkdownSearch;
