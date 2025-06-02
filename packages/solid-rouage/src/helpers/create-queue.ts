import os from 'node:os'

const MAX_CONCURRENT = Math.max(1, (os.cpus()?.length || 1) - 1)

export const createQueue = () => {
  const queue: Array<() => Promise<void>> = []
  const errors: Error[] = []

  let running = 0

  const run = async (): Promise<void> => {
    while (running < MAX_CONCURRENT && queue.length > 0) {
      const task = queue.shift()
      if (!task) {
        break
      }

      running++

      try {
        await task()
      } catch (error) {
        errors.push(error as Error)
      } finally {
        running--
        run()
      }
    }
  }

  return {
    enqueue: (task: () => Promise<void>) => {
      queue.push(task)
      run()
    },
    wait: async () => {
      while (running > 0) {
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
      if (errors.length > 0) {
        throw new AggregateError(errors, 'Tasks failed')
      }
    },
  }
}
