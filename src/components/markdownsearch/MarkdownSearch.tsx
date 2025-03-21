import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import "./MarkdownSearch.scss";
import { useDarkMode } from "../button/DarkModeProvider";

interface GitHubUser {
  avatar_url: string;
  name: string;
  login: string;
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

    if (!username.trim()) return;

    setLoadingProfile(true);
    setLoadingStats(true);
    setError(null);
    setMarkdownContent("");
    setUserProfile(null);

    fetch(`https://api.github.com/users/${username}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Perfil não encontrado.");
          }
          return response.json();
        })
        .then((data) => {
          setUserProfile({
            avatar_url: data.avatar_url,
            name: data.name || data.login,
            login: data.login
          });
          setLoadingProfile(false);

          return fetch(
              `https://raw.githubusercontent.com/${username}/${username}/main/README.md`
          );
        })
        .then((response) => {
          if (!response.ok) {
            return fetch(
                `https://raw.githubusercontent.com/${username}/${username}/master/README.md`
            );
          }
          return response;
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
    if (e.key === "Enter") {
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
      <div className="markdown-search-container">
        <div className={`markdown-search ${darkMode ? "dark-mode" : ""}`}>
          <div className={`markdown-search-inner ${darkMode ? "dark-mode" : ""}`}>
            <div className="input-button-wrapper">
              <input
                  type="text"
                  placeholder="Digite o nome de usuário do GitHub..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  aria-label="Nome de usuário do GitHub"
              />
              <button
                  className={`button-markdown ${darkMode ? "dark-mode" : ""}`}
                  onClick={handleSearch}
              >
                Buscar
              </button>
            </div>

            {loadingProfile && <div className="text-loading">Carregando perfil...</div>}
            {loadingStats && !loadingProfile && <div className="text-loading">Carregando README...</div>}
            {error && <div className="error">{error}</div>}

            {userProfile && (
                <div className="github-profile">
                  <img
                      src={userProfile.avatar_url}
                      alt={`Avatar de ${userProfile.name || userProfile.login}`}
                      className="profile-avatar"
                  />
                  <div className="profile-info">
                    <p className="profile-name">{userProfile.name}</p>
                    {userProfile.login && userProfile.name !== userProfile.login && (
                        <p className="profile-username">@{userProfile.login}</p>
                    )}
                  </div>
                </div>
            )}

            <div className="markdown-content-wrapper">
              {markdownContent ? (
                  <div className="markdown-content">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                      {markdownContent}
                    </ReactMarkdown>
                  </div>
              ) : (
                  !loadingStats && !error && username.length > 2 && (
                      <div className="no-readme">
                        Nenhum README.md encontrado para este usuário.
                      </div>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default MarkdownSearch;