import { createSignal } from 'solid-js'

export const Counter = () => {
  const [count, setCount] = createSignal(0)

  const increment = () => setCount(count() + 1)
  const decrement = () => setCount(count() - 1)

  return (
    <div class="flex flex-col items-center p-4 border rounded shadow-sm">
      <h2 class="text-xl font-bold mb-4">Counter</h2>
      <div class="text-3xl font-bold mb-4">{count()}</div>
      <div class="flex gap-4">
        <button type="button" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={decrement}>
          -
        </button>
        <button type="button" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={increment}>
          +
        </button>
      </div>
    </div>
  )
}
