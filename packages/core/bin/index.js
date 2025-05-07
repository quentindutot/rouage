#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { exit } from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const target = resolve(__dirname, 'index.ts')

const child = spawn('tsx', ['watch', target], {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code) => exit(code ?? 0))
