import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    },
    plugins: [
        electron([
            {
                // Main process entry point
                entry: 'src/main/main.ts',
                vite: {
                    build: {
                        outDir: 'dist/main',
                        rollupOptions: {
                            external: ['electron']
                        }
                    }
                }
            },
            {
                // Preload scripts entry point
                entry: 'src/preload/preload.ts',
                vite: {
                    build: {
                        outDir: 'dist/preload'
                    }
                }
            }
        ]),
        renderer(
            entry: 'src/renderer/index.html',
            vite: {
            build: {
                outDir: 'dist/renderer'
            }
        }
        )
    ],
    build: {
        outDir: 'dist/renderer',
        emptyOutDir: true
    }
})