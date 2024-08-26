export type AppConfig = {
    baseDir: string;
    apiUrl: string;
}

export const CONFIG: AppConfig = {
    baseDir: import.meta.env.VITE_BASE_DIR,
    apiUrl: import.meta.env.VITE_API_URL,
}