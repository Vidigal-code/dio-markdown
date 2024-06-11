import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import "react-tabs/style/react-tabs.css";
import "./DioSearch.scss";
import { useDarkMode } from "../button/DarkModeProvider";
import logoFull from "../../assets/logo-full.svg"; 

interface File {
  name: string;
  path: string;
}

const DioSearch: React.FC = () => {
  const [username, setUsername] = useState("digitalinnovationone");
  const [repo, setRepo] = useState("dio-lab-open-source");
  const [path, setPath] = useState("community");
  const [files, setFiles] = useState<File[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    fetchFiles();
  }, [username, repo, path]);

  useEffect(() => {
    filterFiles();
  }, [searchTerm, files]);

  const fetchFiles = () => {
    setLoading(true);
    setError(null);

    fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Repositório ou caminho não encontrado.");
        }
        return response.json();
      })
      .then((data: File[]) => {
        const mdFiles = data
          .filter((file) => file.name.endsWith(".md"))
          .map((file) => file.path);
        setFiles(data);
        setFilteredFiles(data);
        if (mdFiles.length > 0) {
          fetchMarkdown(mdFiles[0]);
        }
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  const fetchMarkdown = (filePath: string) => {
    setLoading(true);
    setError(null);

    fetch(`https://raw.githubusercontent.com/${username}/${repo}/main/${filePath}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Arquivo README.md não disponível.");
        }
        return response.text();
      })
      .then((text) => {
        setMarkdownContent(text);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      fetchMarkdown(filteredFiles[newIndex].path);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredFiles.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      fetchMarkdown(filteredFiles[newIndex].path);
    }
  };

  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * filteredFiles.length);
    setCurrentIndex(randomIndex);
    fetchMarkdown(filteredFiles[randomIndex].path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles();
  };

  const handleFileSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await filterFiles();
    setCurrentIndex(0); 
  };
  
  const filterFiles = async () => {
    const filtered = files.filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFiles(filtered);
    if (filtered.length > 0) {
      setCurrentIndex(0); 
      await fetchMarkdown(filtered[0].path); 
    } else {
      setMarkdownContent(""); 
    }
  };
  
  

  const handleDownload = () => {
    if (filteredFiles[currentIndex]) {
      const filePath = filteredFiles[currentIndex].path;
      const fileName = filteredFiles[currentIndex].name;
      downloadFile(filePath, fileName);
    }
  };

  const downloadFile = (filePath: string, fileName: string) => {
    setLoading(true);
    setError(null);

    fetch(`https://raw.githubusercontent.com/${username}/${repo}/main/${filePath}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao baixar o arquivo.");
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  const openRepositoryMD = () => {
    if (filteredFiles[currentIndex]) {
      const filePath = filteredFiles[currentIndex].path;
      const url = `https://github.com/${username}/${repo}/blob/main/${filePath}`;
      window.open(url, "_blank");
    }
  };

  const openGitUser = () => {
    if (filteredFiles[currentIndex]) {
      let filePath = filteredFiles[currentIndex].path;
      filePath = filePath.replace(/\d+/g, '');
      filePath = filePath.replace(/\.md$/, '');
      filePath = filePath.replace(/community\//, '');
      const url = `https://github.com/${filePath}`;
      window.open(url, "_blank");
    }
  };
  
  
  

  return (
    <div className={`dio-search ${darkMode ? "dark-mode" : ""}`}>
      <div className={`dio-search-inner ${darkMode ? "dark-mode" : ""}`}>
        <div className="image-dio-right">
          <img src={logoFull} alt="dio-image" className="dio-image" />
        </div>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Digite o caminho completo do GitHub..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Digite o nome do repositório..."
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Digite o caminho do arquivo..."
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
          <button
            className={`button-markdown ${darkMode ? "dark-mode" : ""}`}
            type="submit"
          >
            Buscar
          </button>
        </form>
        {loading && <p className="text-loading">Carregando...</p>}
        {error && <p className="error">{error}</p>}
        <div className="navigation">
          <div className="text-md">Nome : {filteredFiles[currentIndex]?.name}</div>
          <button
            className={`button-markdown-next ${darkMode ? "dark-mode" : ""}`}
            onClick={handlePrevious}
            disabled={currentIndex === 0 || loading}
          >
            Anterior
          </button>
          <button
            className={`button-markdown-next ${darkMode ? "dark-mode" : ""}`}
            onClick={handleNext}
            disabled={currentIndex === filteredFiles.length - 1 || loading}
          >
            Próximo
          </button>
          <button
            className={`button-markdown-next ${darkMode ? "dark-mode" : ""}`}
            onClick={handleRandom}
            disabled={currentIndex === filteredFiles.length - 1 || loading}
          >
            Aleatório
          </button>
          <button
            className={`button-markdown-next ${darkMode ? "dark-mode" : ""}`}
            onClick={openRepositoryMD}
            disabled={!filteredFiles[currentIndex] || loading}
          >
            Perfil-repo
          </button>
          <button
            className={`button-markdown-next ${darkMode ? "dark-mode" : ""}`}
            onClick={openGitUser}
            disabled={!filteredFiles[currentIndex] || loading}
          >
            Github-User
          </button>
          <button
            className={`button-markdown-next ${darkMode ? "dark-mode" : ""}`}
            onClick={handleDownload}
            disabled={!filteredFiles[currentIndex] || loading}
          >
            Download
          </button>
        </div>
        <form onSubmit={handleFileSearch}>
          <input
            type="text"
            placeholder="Buscar arquivo .md..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`button-markdown ${darkMode ? "dark-mode" : ""}`}
            type="submit"
          >
            Buscar
          </button>
        </form>
        <div className="markdown-content">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {markdownContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default DioSearch;