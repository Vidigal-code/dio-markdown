export interface GitHubUser {
    avatar_url: string;
    name: string;
    login: string;
}

export interface MarkdownEditorProps {
    darkMode: boolean;
    initialContent?: string;
}

export interface MarkdownDarkModeProps {
    darkMode: boolean;
}

export interface File {
    name: string;
    path: string;
}