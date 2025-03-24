export interface GitHubUser {
    avatar_url: string;
    name: string;
    login: string;
}

export interface MarkdownEditorProps {
    initialContent?: string;
}

export interface File {
    name: string;
    path: string;
}