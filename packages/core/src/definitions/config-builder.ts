import type { PluginOption } from 'vite'

export interface GraniteConfig {
  /**
   * Server port for the application.
   * If port is in use, next available port will be used.
   * @default 5173
   */
  port?: number

  /**
   * Vite plugins to use in the application.
   * Passed to the underlying Vite instance.
   */
  plugins?: PluginOption[]
}

/**
 * Helper function to make it easier to use granite.config.ts.
 */
export const defineConfig = (config: GraniteConfig): GraniteConfig => config
