import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { MAX_CONCURRENT, createQueue } from './create-queue.js'

describe('createQueue', () => {
  it('executes tasks in order', async () => {
    const queue = createQueue()
    const results: number[] = []

    // Add some tasks
    queue.enqueue(async () => {
      results.push(1)
    })

    queue.enqueue(async () => {
      results.push(2)
    })

    await queue.wait()

    assert.strictEqual(results.length, 2, 'Should execute all tasks')
    assert.deepStrictEqual(results.sort(), [1, 2], 'Should execute all tasks')
  })

  it('limits concurrent task execution', async () => {
    const queue = createQueue()
    const executing: number[] = []
    const maxConcurrent: number[] = []
    let currentExecuting = 0

    // Create more tasks than MAX_CONCURRENT to test the limit
    const taskCount = Math.max(5, MAX_CONCURRENT + 2)
    const promises: Promise<void>[] = []

    for (let i = 0; i < taskCount; i++) {
      const promise = new Promise<void>((resolve) => {
        queue.enqueue(async () => {
          currentExecuting++
          executing.push(currentExecuting)
          maxConcurrent.push(Math.max(...executing))

          // Simulate some async work
          await new Promise((resolve) => setTimeout(resolve, 10))

          currentExecuting--
          resolve()
        })
      })
      promises.push(promise)
    }

    await queue.wait()
    await Promise.all(promises)

    const actualMaxConcurrent = Math.max(...maxConcurrent)
    assert.ok(
      actualMaxConcurrent <= MAX_CONCURRENT,
      `Max concurrent execution should not exceed ${MAX_CONCURRENT}, but was ${actualMaxConcurrent}`,
    )
  })

  it('collects errors from failed tasks', async () => {
    const queue = createQueue()
    const error1 = new Error('Task 1 failed')
    const error2 = new Error('Task 2 failed')

    queue.enqueue(async () => {
      throw error1
    })

    queue.enqueue(async () => {
      // This should succeed
    })

    queue.enqueue(async () => {
      throw error2
    })

    await assert.rejects(queue.wait(), (err: AggregateError) => {
      assert.ok(err instanceof AggregateError, 'Should throw AggregateError')
      assert.strictEqual(err.errors.length, 2, 'Should collect all errors')
      assert.strictEqual(err.errors[0], error1, 'Should include first error')
      assert.strictEqual(err.errors[1], error2, 'Should include second error')
      assert.strictEqual(err.message, 'Tasks failed', 'Should have correct message')
      return true
    })
  })

  it('completes immediately with empty queue', async () => {
    const queue = createQueue()

    // Should not throw and should complete immediately
    await queue.wait()

    assert.ok(true, 'Should handle empty queue without errors')
  })

  it('executes a single task', async () => {
    const queue = createQueue()
    let executed = false

    queue.enqueue(async () => {
      executed = true
    })

    await queue.wait()

    assert.strictEqual(executed, true, 'Should execute single task')
  })

  it('resolves multiple wait calls when tasks complete', async () => {
    const queue = createQueue()
    const results: number[] = []

    queue.enqueue(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20))
      results.push(1)
    })

    // Multiple wait calls should all resolve when tasks complete
    const waitPromises = [queue.wait(), queue.wait(), queue.wait()]

    await Promise.all(waitPromises)

    assert.strictEqual(results.length, 1, 'Task should execute only once')
    assert.strictEqual(results[0], 1, 'Task should complete successfully')
  })

  it('executes tasks added after wait starts', async () => {
    const queue = createQueue()
    const results: number[] = []

    queue.enqueue(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      results.push(1)
    })

    // Start waiting
    const waitPromise = queue.wait()

    // Add more tasks while waiting
    queue.enqueue(async () => {
      results.push(2)
    })

    await waitPromise

    assert.strictEqual(results.length, 2, 'Should execute all tasks including those added after wait')
    assert.deepStrictEqual(results.sort(), [1, 2], 'Should execute all tasks')
  })

  it('handles many concurrent tasks reliably', async () => {
    const queue = createQueue()
    const taskCount = 100
    const results: number[] = []

    // Add many tasks
    for (let i = 0; i < taskCount; i++) {
      queue.enqueue(async () => {
        // Simulate variable execution time
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 5))
        results.push(i)
      })
    }

    await queue.wait()

    assert.strictEqual(results.length, taskCount, `Should execute all ${taskCount} tasks`)

    // Verify all tasks executed (order may vary due to concurrency)
    const sortedResults = results.sort((a, b) => a - b)
    const expectedResults = Array.from({ length: taskCount }, (_, i) => i)
    assert.deepStrictEqual(sortedResults, expectedResults, 'Should execute all tasks exactly once')
  })

  it('continues executing remaining tasks when one fails', async () => {
    const queue = createQueue()
    const results: number[] = []

    queue.enqueue(async () => {
      results.push(1)
    })

    queue.enqueue(async () => {
      throw new Error('This should not stop other tasks')
    })

    queue.enqueue(async () => {
      results.push(3)
    })

    await assert.rejects(queue.wait(), AggregateError)

    // Despite error, other tasks should have completed
    assert.strictEqual(results.length, 2, 'Other tasks should complete despite error')
    assert.deepStrictEqual(results.sort(), [1, 3], 'Should execute non-failing tasks')
  })
})
