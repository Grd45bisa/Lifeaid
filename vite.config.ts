import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
// import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // visualizer({
    //   filename: 'stats.html',
    //   open: false,
    //   gzipSize: true,
    //   brotliSize: true,
    //   template: 'treemap',
    // }),
  ],

  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/Components'),
      '@pages': path.resolve(__dirname, './src/Pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },

  build: {
    // Build target - esnext for modern browsers
    target: 'esnext',

    // Enable CSS minification with esbuild (built-in, fast)
    cssMinify: 'esbuild',

    // Use esbuild for faster minification (default)
    // For more aggressive minification, use 'terser'
    minify: 'esbuild',

    // Disable source maps in production for smaller bundles
    sourcemap: false,

    // Warn when chunks exceed 500KB
    chunkSizeWarningLimit: 500,

    // CSS code splitting
    cssCodeSplit: true,

    // Rollup-specific options
    rollupOptions: {
      output: {
        // Optimal file naming with content hash for caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name || ''
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(info)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(info)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          if (/\.css$/i.test(info)) {
            return 'assets/css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },

        // Advanced code splitting strategy
        manualChunks: (id) => {
          // React core - rarely changes, great for caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react'
            }
            // React Router
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            // Supabase - larger dependency
            if (id.includes('@supabase')) {
              return 'vendor-supabase'
            }
            // EmailJS
            if (id.includes('@emailjs')) {
              return 'vendor-emailjs'
            }
            // Other vendor modules
            return 'vendor'
          }

          // Utils - shared utilities
          if (id.includes('/src/utils/')) {
            return 'utils'
          }

          // Admin components - separate chunk for lazy loading
          if (id.includes('/src/Components/Admin/')) {
            return 'admin'
          }

          // Large components get their own chunks
          if (id.includes('/src/Components/')) {
            if (id.includes('WhatsAppBubbleChat') || id.includes('smart-care-section')) {
              return 'components-large'
            }
          }
        },
      },

      // Tree shaking configuration
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },

    // Performance reporting
    reportCompressedSize: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },

  // Development server
  server: {
    allowedHosts: true,
    port: 5200,
  },

  // Preview server (production build)
  preview: {
    port: 4173,
  },

  // Enable JSON tree shaking
  json: {
    stringify: true,
  },

  // Esbuild options for faster transforms
  esbuild: {
    legalComments: 'none', // Remove license comments
    drop: ['console', 'debugger'], // Remove console.log in production
  },
})
