import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'



// https://vitejs.dev/config/
export default defineConfig(() => {
    return {
        base: '/app/',
        plugins: [react()],
        build: {
            outDir: 'dist',
            sourcemap: true,
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@shared': path.resolve(__dirname, '../shared'),
                // // Force Vite to resolve React to the project's single copy
                // react: path.resolve(__dirname, './node_modules/react'),
                // 'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
                // 'react-dom/client': path.resolve(__dirname, './node_modules/react-dom/client')
            }
            ,
            // Dedupe React to avoid multiple copies (fixes ReactCurrentDispatcher issues)
            dedupe: ['react', 'react-dom']
        },
        server: {
            proxy: {
                '/api': {
                    target: 'http://localhost:3000', // Sostituisci con la porta del tuo server API
                    changeOrigin: true,
                    //rewrite: (path) => path.replace(/^\/api/, ''), // Opzionale: riscrivi il percorso se necessario
                },
            },
        }
    }
})
