import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsConfigPaths from 'vite-tsconfig-paths'
import cesium from 'vite-plugin-cesium'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 3000,
        proxy: {
            "/api/v1" : {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/v1/, '')
            }
        }
    },
  plugins: [react(), tsConfigPaths(), cesium()],
});
