import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: /\.(js|jsx|ts|tsx)$/,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/apps': path.resolve(__dirname, './src/apps'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/models': path.resolve(__dirname, './src/models'),
      '@/data': path.resolve(__dirname, './src/data'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/tests': path.resolve(__dirname, './src/tests'),
      '@/reducers': path.resolve(__dirname, './src/reducers'),
      '@/img': path.resolve(__dirname, './src/img'),
      '@/convert-lyrics': path.resolve(__dirname, './src/convert-lyrics')
    }
  },
  esbuild: {
    jsx: 'automatic',
    include: /\.(ts|tsx|js|jsx)$/,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    esbuildOptions: {
      jsx: 'automatic',
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Ensure consistent chunk naming for better caching
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: ({name}) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'static/media/[name]-[hash][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'static/css/[name]-[hash][extname]';
          }
          return 'static/[ext]/[name]-[hash][extname]';
        }
      }
    }
  },
  define: {
    // Replace process.env.NODE_ENV for compatibility with existing code
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL || ''),
    // Global polyfill
    global: 'globalThis'
  }
})