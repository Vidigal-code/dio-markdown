import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import "./MarkdownLoadGithub.scss";
import { useDarkMode } from "../button/DarkModeProvider";


const MarkdownEditor: React.FC = () => {
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { darkMode } = useDarkMode();
  const [fileName, setFileName] = useState<string>("README.md");
  const [liveMarkdown, setLiveMarkdown] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const inputFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/${username}/${username}/master/README.md`
        );
        if (!response.ok) {
          throw new Error("README.md não disponível.");
        }
        const text = await response.text();
        setMarkdownContent(text);
        setLiveMarkdown(text);
        setError(null);
        saveToHistory(text);
      } catch (error) {
        setError("Erro ao carregar README.md.");
      }
    };
    fetchData();
  }, [username]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setMarkdownContent(inputValue);
    setLiveMarkdown(inputValue);
    saveToHistory(inputValue);
  };

  const loadMarkdown = async () => {
    setError(null);
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${username}/${username}/master/README.md`
      );
      if (!response.ok) {
        throw new Error("README.md não disponível.");
      }
      const text = await response.text();
      setMarkdownContent(text);
      setLiveMarkdown(text);
      setError(null);
      saveToHistory(text);
    } catch (error) {
      setError("Erro ao carregar README.md.");
    }
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
        if (event.target) {
          const content = event.target.result as string;
          setMarkdownContent(content);
          setLiveMarkdown(content);
          saveToHistory(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const useBaseMarkdown = async () => {
    try {
      const response = await fetch(`/src/example/example.md`);
      if (!response.ok) {
        throw new Error("Base Markdown não disponível.");
      }
      const text = await response.text();
      setMarkdownContent(text);
      setLiveMarkdown(text);
      setError(null);
      saveToHistory(text);
    } catch (error) {
      setError("Erro ao carregar base Markdown.");
    }
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

  const saveToHistory = (content: string) => {
    let newHistory = [...history.slice(0, historyIndex + 1), content];
    if (newHistory.length > 10) {
      newHistory = newHistory.slice(newHistory.length - 250);
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  return (
    <div className={`markdown-load-github ${darkMode ? "dark-mode" : ""}`}>
      <div className="markdown-inner">
        <div className="input-button-wrapper">
          <input
            type="text"
            placeholder="Digite o nome de usuário do GitHub..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className="button-markdown" onClick={loadMarkdown}>
            Carregar .md
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="editor-wrapper">
          <textarea
            className={`markdown-editor ${darkMode ? "dark-mode" : ""}`}
            placeholder="Escreva seu markdown aqui..."
            value={markdownContent}
            onChange={handleInputChange}
          />
          <div className={`markdown-preview ${darkMode ? "dark-mode" : ""}`}>
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
            >
              {liveMarkdown}
            </ReactMarkdown>
          </div>
        </div>
        <div className="button-download">
          <button className="button-markdown-bottom" onClick={undoMarkdown}>
            Desfazer
          </button>
          <button className="button-markdown-bottom" onClick={redoMarkdown}>
            Refazer
          </button>
          <button
            className="button-markdown-bottom"
            onClick={() => inputFileRef.current?.click()}
          >
            Enviar MD
          </button>
          <button className="button-markdown-bottom" onClick={useBaseMarkdown}>
            Usar MD Base
          </button>
          <button
            className="button-markdown-bottom-del"
            onClick={() => {
              setMarkdownContent("");
              setLiveMarkdown("");
              saveToHistory("");
            }}
          >
            Apagar
          </button>
          <div className="input-button-wrapper">
            <input
              type="text"
              placeholder="Nome do arquivo..."
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
            <button className="button-markdown" onClick={downloadMarkdown}>
              Download
            </button>
          </div>
          <input
            type="file"
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
