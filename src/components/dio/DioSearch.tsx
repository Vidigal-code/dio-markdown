import React, {useState, useEffect, useCallback} from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import "./DioSearch.scss";
import {useDarkMode} from "../provide/DarkModeProvider";
import logoFull from "../../assets/logo-full.svg";
import {File} from "../../api/interface.ts";
import {USERNAME, REPO, PATH, API_GITHUB_COM, API_GITHUB, GITHUB_SITE_WEB} from "../../api/api.ts";
import {marked} from "marked";
import DOMPurify from "dompurify";


const DioSearch: React.FC = () => {

    const [username, setUsername] = useState(USERNAME);
    const [repo, setRepo] = useState(REPO);
    const [path, setPath] = useState(PATH);
    const [files, setFiles] = useState<File[]>([]);
    const [filteredFiles, setFilteredFiles] = useState<File[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [markdownContent, setMarkdownContent] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {darkMode} = useDarkMode();

    const fetchFiles = useCallback(() => {

        setLoading(true);
        setError(null);

        const url: string = `${API_GITHUB_COM}repos/${username}/${repo}/contents/${path}`;

        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Repository or path not found.");
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
    }, [username, repo, path]);

    const filterFiles = useCallback(async () => {
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
    }, [files, searchTerm]);


    const fetchMarkdown = useCallback((filePath: string) => {
        setLoading(true);
        setError(null);

        const url: string = `${API_GITHUB}${username}/${repo}/main/${filePath}`;

        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("README.md file not available.");
                }
                return response.text();
            })
            .then((text) => {
                if (text) {
                    const htmlContent = marked.parse(text) as string;
                    const sanitizedHTML = DOMPurify.sanitize(htmlContent);
                    setMarkdownContent(sanitizedHTML);
                    setLoading(false);
                }
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, [username, repo]);

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0 && filteredFiles.length > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            fetchMarkdown(filteredFiles[newIndex].path);
        }
    }, [currentIndex, filteredFiles, fetchMarkdown]);

    const handleNext = useCallback(() => {
        if (currentIndex < filteredFiles.length - 1 && filteredFiles.length > 0) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            fetchMarkdown(filteredFiles[newIndex].path);
        }
    }, [currentIndex, filteredFiles, fetchMarkdown]);

    const handleRandom = useCallback(() => {
        if (filteredFiles.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredFiles.length);
            setCurrentIndex(randomIndex);
            fetchMarkdown(filteredFiles[randomIndex].path);
        }
    }, [filteredFiles, fetchMarkdown]);


    const downloadFile = useCallback((filePath: string, fileName: string) => {
        setLoading(true);
        setError(null);

        const url: string = `${API_GITHUB}${username}/${repo}/main/${filePath}`;

        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error downloading file.");
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
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, [username, repo]);

    const handleDownload = useCallback(() => {
        if (filteredFiles[currentIndex]) {
            const filePath = filteredFiles[currentIndex].path;
            const fileName = filteredFiles[currentIndex].name;
            downloadFile(filePath, fileName);
        }
    }, [filteredFiles, currentIndex, downloadFile]);

    const openRepositoryMD = useCallback(() => {
        if (filteredFiles[currentIndex]) {
            const filePath = filteredFiles[currentIndex].path;
            const url: string = `${GITHUB_SITE_WEB}${username}/${repo}/blob/main/${filePath}`;
            window.open(url, "_blank");
        }
    }, [filteredFiles, currentIndex, username, repo]);

    const openGitUser = useCallback(() => {
        if (filteredFiles[currentIndex]) {
            let filePath = filteredFiles[currentIndex].path;
            filePath = filePath.replace(/\d+/g, "");
            filePath = filePath.replace(/\.md$/, "");
            filePath = filePath.replace(/community\//, "");
            const url: string = `${GITHUB_SITE_WEB}${filePath}`;
            window.open(url, "_blank");
        }
    }, [filteredFiles, currentIndex]);


    const search = useCallback(() => {
        if (!searchTerm) {
            setError("Search term not provided.");
            return;
        }

        setLoading(true);
        setError(null);

        const url: string = `${API_GITHUB}${username}/${repo}/main/${path}/${searchTerm}.md`;

        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Repository or path not found.');
                }
                return response.text();
            })
            .then((text) => {
                if (text) {
                    const htmlContent = marked.parse(text) as string;
                    const sanitizedHTML = DOMPurify.sanitize(htmlContent);
                    setMarkdownContent(sanitizedHTML);
                    fetchMarkdown(`${path}/${searchTerm}.md`);
                }
            })
            .catch((error) => {
                setError(`Error fetching markdown: ${error.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [username, repo, path, searchTerm, fetchMarkdown]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            search();
        }
    };


    const cleanSearchTerm = useCallback((term: string): string | null => {
        if (!term) return null;

        return term
            .replace(/\d+/g, "")
            .replace(/\.md$/, "")
            .replace(/community\//, "")
            .trim();
    }, []);

    const openGitUserSearch = useCallback(() => {
        const cleanedTerm = cleanSearchTerm(searchTerm.trim());

        if (cleanedTerm) {
            const url: string = `${GITHUB_SITE_WEB}${encodeURIComponent(cleanedTerm)}`;
            window.open(url, "_blank");
        } else {
            setError("Please enter a valid GitHub username.");
        }
    }, [searchTerm, cleanSearchTerm]);


    const openRepositoryMDSearch = useCallback(() => {
        if (username && repo && path && searchTerm) {
            const url = `${GITHUB_SITE_WEB}${username}/${repo}/blob/main/${path}/${searchTerm}.md`;
            window.open(url, "_blank");
        } else {
            setError("Make sure all fields are filled in correctly.");
        }
    }, [username, repo, path, searchTerm]);


    const downloadFileSearch = useCallback((fileName: string) => {
        if (!fileName) {
            setError("File name is required for download.");
            return;
        }

        setLoading(true);
        setError(null);
        const url: string = `${API_GITHUB}${username}/${repo}/main/${path}/${searchTerm}.md`;

        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error downloading file: ${response.statusText} (${url})`);
                }
                return response.blob();
            })
            .then((blob) => {
                const objectUrl = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = objectUrl;
                a.download = fileName + '.md';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(objectUrl);
                setLoading(false);
            })
            .catch((error) => {
                setError(`Failed to download file: ${error.message}`);
                setLoading(false);
            });
    }, [username, repo, path, searchTerm]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    useEffect(() => {
        filterFiles();
    }, [filterFiles, searchTerm, files]);

    const fileName = filteredFiles[currentIndex]?.name || '';
    const displayName = searchTerm.length > 0 ? `${searchTerm}` : fileName;

    return (
        <div className={`dio-search ${darkMode ? "dark-mode" : ""}`}>
            <div className={`dio-search-inner ${darkMode ? "dark-mode" : ""}`}>
                <div className="dio-header">
                    <div className="image-dio-right">
                        <img src={logoFull} alt="dio-image" className="dio-image"/>
                    </div>
                    <h2 className="dio-title">GitHub Markdown Explorer</h2>
                </div>

                <div className="dio-form">
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Enter the full path to GitHub..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            aria-label="GitHub username"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Enter repository name..."
                            value={repo}
                            onChange={(e) => setRepo(e.target.value)}
                            aria-label="Repository name"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Enter the file path..."
                            value={path}
                            onChange={(e) => setPath(e.target.value)}
                            aria-label="File path"
                        />
                    </div>
                    <div className="form-group">
                        <button
                            className={`dio-button ${darkMode ? "dark-mode" : ""}`}
                            type="button"
                            onClick={fetchFiles}
                            aria-label="Search repository"
                        >
                            Search repository
                        </button>
                    </div>
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search for .md file..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search for markdown file"
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        className={`dio-button ${darkMode ? "dark-mode" : ""}`}
                        onClick={search}
                        aria-label="Search file"
                    >
                        Search
                    </button>
                </div>

                <div className="navigation">
                    {loading && <p className="text-loading">Loading...</p>}
                    {error && <p className="error">{error}</p>}

                    <div className="file-info">
                        <span className="file-label">File:</span>
                        <span className="file-name">{displayName}</span>
                    </div>

                    <div className="button-container">
                        {searchTerm.length === 0 ? (
                            <>
                                <button
                                    className={`dio-button ${darkMode ? "dark-mode" : ""}`}
                                    onClick={handlePrevious}
                                    disabled={currentIndex === 0 || loading}
                                    aria-label="Previous file"
                                >
                                    Previous
                                </button>
                                <button
                                    className={`dio-button ${darkMode ? "dark-mode" : ""}`}
                                    onClick={handleNext}
                                    disabled={currentIndex === filteredFiles.length - 1 || loading}
                                    aria-label="Next file"
                                >
                                    Next
                                </button>
                                <button
                                    className={`dio-button ${darkMode ? "dark-mode" : ""}`}
                                    onClick={handleRandom}
                                    disabled={filteredFiles.length === 0 || loading}
                                    aria-label="Random file"
                                >
                                    Random
                                </button>
                                <button
                                    className={`dio-button ${darkMode ? "dark-mode" : ""}`}
                                    onClick={openRepositoryMD}
                                    disabled={!filteredFiles[currentIndex] || loading}
                                    aria-label="View in repository"
                                >
                                    View in repo
                                </button>
                                <button
                                    className={`dio-button ${darkMode ? "dark-mode" : ""}`}
                                    onClick={openGitUser}
                                    disabled={!filteredFiles[currentIndex] || loading}
                                    aria-label="View user profile"
                                >
                                    View Profile
                                </button>
                                <button
                                    className={`dio-button ${darkMode ? "dark-mode" : ""}`}
                                    onClick={handleDownload}
                                    disabled={!filteredFiles[currentIndex] || loading}
                                    aria-label="Download file"
                                >
                                    Download
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className={`dio-button ${darkMode ? "dark-mode" : ""}`}
                                    onClick={openRepositoryMDSearch}
                                    aria-label="View in repository"
                                >
                                    View in repo
                                </button>
                                <button
                                    className={`dio-button ${darkMode ? "dark-mode" : ""}`}
                                    onClick={openGitUserSearch}
                                    aria-label="View user profile"
                                >
                                    View Profile
                                </button>
                                <button
                                    className={`dio-button ${darkMode ? "dark-mode" : ""}`}
                                    onClick={() => downloadFileSearch(searchTerm)}
                                    aria-label="Download file"
                                >
                                    Download
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="markdown-content">
                    <ReactMarkdown
                        rehypePlugins={[remarkGfm, rehypeRaw]}
                    >
                        {markdownContent}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default DioSearch;