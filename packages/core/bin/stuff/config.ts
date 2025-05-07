import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import type { GraniteConfig } from '../../src/definitions/config-builder'

export const loadAndParseConfig = async () => {
  const configPath = resolve(cwd(), 'granite.config.ts')
  if (!existsSync(configPath)) {
    throw new Error('No granite.config.ts found in the current directory')
  }

  try {
    const configModule = await import(configPath)
    const configDefault = configModule.default as GraniteConfig
    return configDefault
  } catch (error) {
    throw new Error('Error processing granite.config.ts', { cause: error })
  }
}
