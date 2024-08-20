import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite';

declare namespace NodeJS {
    interface ProcessEnv {
        VITE_BASE_DIR: string;
        VITE_API_URL: string;
        VITE_PROXY_TARGET: string | undefined;
    }
}

// https://vitejs.dev/config/
export default ({ mode }: { mode: any }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    const { VITE_BASE_DIR, VITE_API_URL, VITE_PROXY_TARGET } = process.env;

    return defineConfig({
        base: VITE_BASE_DIR,
        plugins: [ react() ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 3000,
            ...VITE_PROXY_TARGET && {
                proxy: {
                    [process.env.VITE_API_URL as string]: {
                        target: VITE_PROXY_TARGET,
                        changeOrigin: true,
                        rewrite: (path) => path.replace(VITE_API_URL as string, VITE_PROXY_TARGET as string),
                    },
                },
            },
        },
    });
}
