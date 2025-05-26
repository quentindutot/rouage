#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout } from 'node:timers/promises'
import { cancel, group, intro, log, note, outro, select, spinner, text } from '@clack/prompts'
import color from 'picocolors'

const TEMPLATES = [
  { value: 'h3', label: 'H3', hint: 'Modern JavaScript Web Framework' },
  { value: 'hono', label: 'Hono', hint: 'Small & Fast Web Framework' },
  { value: 'elysia', label: 'Elysia', hint: 'Fast TypeScript Framework for Bun' },
  { value: 'express', label: 'Express', hint: 'Widely-used Framework for Node.js' },
  { value: 'koa', label: 'Koa', hint: 'Middleware-based Framework for Node.js' },
  { value: 'tinyhttp', label: 'TinyHttp', hint: 'Modern Express-like Framework for Node.js' },
  { value: 'restana', label: 'Restana', hint: 'Fast RESTful API Framework for Node.js' },
  { value: 'polka', label: 'Polka', hint: 'Micro Express Alternative for Node.js' },
]

const promptForProjectDetails = async () => {
  const input = await group(
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

  return {
    name: input.name ?? 'rouage-project',
    template: input.template ?? TEMPLATES[0].value,
  }
}

const replaceWorkspaceDependencies = (dependencies: Record<string, string> | undefined) => {
  if (dependencies) {
    for (const [depName, depVersion] of Object.entries(dependencies)) {
      if (typeof depVersion === 'string' && depVersion.startsWith('workspace:')) {
        const output = execSync(`npm view ${depName} version`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore'], // Redirect stderr to avoid error messages
        }).trim()

        dependencies[depName] = `^${output}` // Add caret for semver compatibility
      }
    }
  }
}

const updateProjectPackageJson = (projectName: string) => {
  const packageJsonPath = join(process.cwd(), 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  packageJson.name = projectName

  // Replace workspace dependencies with real versions
  replaceWorkspaceDependencies(packageJson.dependencies)
  replaceWorkspaceDependencies(packageJson.devDependencies)

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
}

const cloneAndExtractTemplate = (templateName: string) => {
  const temporaryDir = join(process.cwd(), '.rouage')

  // Clone the template into temporary directory
  execSync(`git clone --depth 1 https://github.com/quentindutot/rouage.git ${temporaryDir}`, { stdio: 'ignore' })

  // Copy only the selected template contents
  const templatePath = join(temporaryDir, 'examples', templateName)
  cpSync(templatePath, '.', { recursive: true, force: true })

  // Cleanup temporary directory
  rmSync(temporaryDir, { recursive: true, force: true })
}

const main = async () => {
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.clear()

  await setTimeout(500)

  intro(`${color.bgCyan(color.black(' create-rouage '))}`)

  const project = await promptForProjectDetails()

  const loading = spinner()
  loading.start('Creating your project...')

  await setTimeout(500)

  try {
    mkdirSync(project.name)
    process.chdir(project.name)

    cloneAndExtractTemplate(project.template)
    updateProjectPackageJson(project.name)

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

  const nextSteps = `cd ${project.name}\nnpm install\nnpm run dev`
  note(nextSteps, 'Next steps.')

  await setTimeout(500)

  outro(`Problems? ${color.underline(color.cyan('https://github.com/quentindutot/rouage/issues'))}`)
}

main().catch(console.error)
