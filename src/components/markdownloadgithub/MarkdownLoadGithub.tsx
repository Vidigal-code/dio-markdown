import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useDarkMode } from "../button/DarkModeProvider";
import "./MarkdownLoadGithub.scss";

interface MarkdownEditorProps {
  initialContent?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ initialContent = "" }) => {

  const [markdownContent, setMarkdownContent] = useState<string>(initialContent);
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("README.md");
  const [liveMarkdown, setLiveMarkdown] = useState<string>(initialContent);
  const [history, setHistory] = useState<string[]>([initialContent]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isEditorActive, setIsEditorActive] = useState(true);
  const { darkMode } = useDarkMode();
  const inputFileRef = useRef<HTMLInputElement>(null);

  const saveToHistory = (content: string) => {

    if (content === history[historyIndex]) return;

    const newHistory = [...history.slice(0, historyIndex + 1), content];
    const trimmedHistory = newHistory.length > 50 ? newHistory.slice(-50) : newHistory;

    setHistory(trimmedHistory);
    setHistoryIndex(trimmedHistory.length - 1);
  };

  const fetchGithubReadme = () => {
    if (!username.trim()) {
      setError("Please enter a GitHub username");
      return;
    }

    setError(null);
    const url = `https://raw.githubusercontent.com/${username}/${username}/master/README.md`;

    fetch(url)
        .then((response) => {
          if (!response.ok) {
            return Promise.reject(new Error('README.md not available for this user.'));
          }
          return response.text();
        })
        .then((text) => {
          setMarkdownContent(text);
          setLiveMarkdown(text);
          saveToHistory(text);
        })
        .catch((error) => {
          console.error('Error loading README.md:', error);
          setError(error instanceof Error ? error.message : 'Failed to load README');
        });
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setMarkdownContent(inputValue);
    setLiveMarkdown(inputValue);
    saveToHistory(inputValue);
  };

  const fetchBaseMarkdown = () => {
    const url = "https://raw.githubusercontent.com/Vidigal-code/dio-markdown/main/src/example/example.md";

    fetch(url)
        .then((response) => {
          if (!response.ok) {
            return Promise.reject(new Error("Base Markdown template not available."));
          }
          return response.text();
        })
        .then((text) => {
          setMarkdownContent(text);
          setLiveMarkdown(text);
          saveToHistory(text);
          setError(null);
        })
        .catch((error) => {
          console.error('Error loading base Markdown:', error);
          setError(error instanceof Error ? error.message : 'Failed to load template');
        });
  };


  const downloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.endsWith(".md") ? fileName : `${fileName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const content = event.target.result as string;
          setMarkdownContent(content);
          setLiveMarkdown(content);
          saveToHistory(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const clearContent = () => {
    setMarkdownContent("");
    setLiveMarkdown("");
    saveToHistory("");
  };

  const undoMarkdown = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setMarkdownContent(history[newIndex]);
      setLiveMarkdown(history[newIndex]);
    }
  };

  const redoMarkdown = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setMarkdownContent(history[newIndex]);
      setLiveMarkdown(history[newIndex]);
    }
  };

  const toggleEditorView = () => {
    setIsEditorActive(!isEditorActive);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
      <div className={`markdown-editor-container ${darkMode ? "dark-mode" : "light-mode"}`}>
        <div className="markdown-inner">
          <div className="header-actions">
            <div className="input-group">
              <input
                  type="text"
                  placeholder="GitHub username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  aria-label="GitHub username"
              />
              <button className="primary-button" onClick={fetchGithubReadme}>
                Load README
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="editor-preview-container">
          <textarea
              className="markdown-editor"
              placeholder="Write your markdown here..."
              value={markdownContent}
              onChange={handleInputChange}
              aria-label="Markdown editor"
          />
            <div className="markdown-preview">
              <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                {liveMarkdown}
              </ReactMarkdown>
            </div>
          </div>

          <div className="mobile-view">
            <button className="toggle-view-btn" onClick={toggleEditorView}>
              {isEditorActive ? "Preview Markdown" : "Edit Markdown"}
            </button>

            {isEditorActive ? (
                <textarea
                    className="markdown-editor-mobile"
                    placeholder="Write your markdown here..."
                    value={markdownContent}
                    onChange={handleInputChange}
                    aria-label="Markdown editor mobile"
                />
            ) : (
                <div className="markdown-preview-mobile">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                    {liveMarkdown}
                  </ReactMarkdown>
                </div>
            )}
          </div>

          <div className="action-toolbar">
            <button
                className={`action-button ${canUndo ? "" : "disabled"}`}
                onClick={undoMarkdown}
                disabled={!canUndo}
            >
              Undo
            </button>
            <button
                className={`action-button ${canRedo ? "" : "disabled"}`}
                onClick={redoMarkdown}
                disabled={!canRedo}
            >
              Redo
            </button>
            <button
                className="action-button"
                onClick={() => inputFileRef.current?.click()}
            >
              Upload MD
            </button>
            <button className="action-button" onClick={fetchBaseMarkdown}>
              Use Template
            </button>
            <button
                className="action-button danger"
                onClick={clearContent}
            >
              Clear
            </button>

            <div className="file-download-group">
              <input
                  type="text"
                  placeholder="Filename"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  aria-label="Filename for download"
              />
              <button className="primary-button" onClick={downloadMarkdown}>
                Download
              </button>
            </div>

            <input
                type="file"
                accept=".md,.markdown,.txt"
                style={{ display: "none" }}
                ref={inputFileRef}
                onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>
  );
};

export default MarkdownEditor;