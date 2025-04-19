import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import "./MarkdownSearch.scss";
import DOMPurify from 'dompurify';
import {marked} from "marked";
import {API_GITHUB, API_GITHUB_FINAL_MASTER, API_GITHUB_USERS} from "../../api/Api.ts";
import {GitHubUser, MarkdownDarkModeProps} from "../../api/Interface.ts";



const MarkdownSearch:  React.FC<MarkdownDarkModeProps> = ({ darkMode }) => {

  const [username, setUsername] = useState("");
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<GitHubUser | null>(null);


  const handleSearch = () => {
    if (!username.trim()) return;

    setLoadingProfile(true);
    setLoadingStats(true);
    setError(null);
    setMarkdownContent("");
    setUserProfile(null);

    const url: string = `${API_GITHUB_USERS}${username}`;

    fetch(url)
        .then((response) => {
          if (!response.ok) {
            return Promise.reject(new Error("Profile not found."));
          }
          return response.json();
        })
        .then((data) => {
          setUserProfile({
            avatar_url: data.avatar_url,
            name: data.name || data.login,
            login: data.login,
          });
          setLoadingProfile(false);
          return fetchReadme(username);
        })
        .then((readmeText) => {
          if (readmeText) {
            const htmlContent = marked.parse(readmeText) as string;
            const sanitizedHTML = DOMPurify.sanitize(htmlContent);
            setMarkdownContent(sanitizedHTML);
            setLoadingStats(false);
          }
        })
        .catch((error) => {
          setError(error.message);
          setLoadingProfile(false);
          setLoadingStats(false);
        });
  };


  const fetchReadme = (username: string) => {

    const url: string = `${API_GITHUB}${username}/${username}/${API_GITHUB_FINAL_MASTER}`;

    return fetch(url)
        .then((response) => {
          if (!response.ok) {
            return fetch(url);
          }
          return response;
        })
        .then((response) => {
          if (!response.ok) {
            return Promise.reject(new Error("README.md not available."));
          }
          return response.text();
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
                  placeholder="Enter your GitHub username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  aria-label="GitHub username"
              />
              <button
                  className={`button-markdown ${darkMode ? "dark-mode" : ""}`}
                  onClick={handleSearch}
              >
                Buscar
              </button>
            </div>

            {loadingProfile && <div className="text-loading">Loading profile...</div>}
            {loadingStats && !loadingProfile && <div className="text-loading">Loading README...</div>}
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
                      <div className="error">
                        No README.md found for this user.
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