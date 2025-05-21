#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout } from 'node:timers/promises'
import { cancel, group, intro, log, note, outro, select, spinner, text } from '@clack/prompts'
import color from 'picocolors'

const TEMPLATES = [
  { value: 'h3-v2', label: 'H3 v2', hint: 'Modern JavaScript Web Framework' },
  { value: 'hono', label: 'Hono', hint: 'Small & Fast Web Framework' },
  { value: 'elysia', label: 'Elysia', hint: 'Fast TypeScript Framework for Bun' },
]

const main = async () => {
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.clear()

  await setTimeout(300)

  intro(`${color.bgCyan(color.black(' create-rouage '))}`)

  const projectInput = await group(
    {
      name: () =>
        text({
          message: 'Project name:',
          placeholder: 'rouage-project',
          validate: (value) => {
            if (!value) {
              return undefined
            }
            if (existsSync(value)) {
              return 'A directory with this name already exists.'
            }
            // biome-ignore lint/performance/useTopLevelRegex: <explanation>
            if (!/^[a-z0-9-]+$/.test(value)) {
              return 'Project name can only contain lowercase letters, numbers, and hyphens.'
            }
          },
        }),
      template: () =>
        select({
          message: 'Select a template:',
          options: TEMPLATES,
        }),
    },
    {
      onCancel: () => {
        cancel('Operation cancelled.')
        process.exit(0)
      },
    },
  )

  const projectName = projectInput.name ?? 'rouage-project'
  const projectTemplate = projectInput.template ?? TEMPLATES[0].value

  const loading = spinner()
  loading.start('Creating your project...')

  await setTimeout(300)

  try {
    // Create project directory
    mkdirSync(projectName)
    process.chdir(projectName)

    // Create a temporary directory within project
    const repositoryDir = join(process.cwd(), '.rouage')

    // Clone the template into temporary directory
    execSync(`git clone --depth 1 https://github.com/quentindutot/rouage.git ${repositoryDir}`, { stdio: 'ignore' })

    // Copy only the selected template contents
    const templatePath = join(repositoryDir, 'examples', projectTemplate)
    cpSync(templatePath, '.', { recursive: true, force: true })

    // Cleanup temporary directory
    rmSync(repositoryDir, { recursive: true, force: true })

    // Update package.json with the project name
    const packageJsonPath = join(process.cwd(), 'package.json')
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      packageJson.name = projectName
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    }

    loading.stop('Project created successfully!')
  } catch (error: unknown) {
    loading.stop('Failed to create project')

    if (error instanceof Error) {
      log.error(error.message)
    } else {
      log.error('An unknown error occurred')
    }

    process.exit(1)
  }

  const nextSteps = `cd ${projectName}\nnpm install\nnpm run dev`

  note(nextSteps, 'Next steps.')

  await setTimeout(300)

  outro(`Problems? ${color.underline(color.cyan('https://github.com/quentindutot/rouage/issues'))}`)
}

main().catch(console.error)
