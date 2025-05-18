import { MetaTitle, createAsync, createServerFunction } from '@rouage/core/client'
import { For, createSignal } from 'solid-js'
import { Menu } from './menu'

export const getTodos = createServerFunction(async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos')
  return response.json() as Promise<
    {
      id: number
      userId: number
      title: string
      completed: boolean
    }[]
  >
})

export const logIncrement = createServerFunction(() => {
  // biome-ignore lint/correctness/noConstantCondition: <explanation>
  if (true) {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log('server increment logging')
  }
})

export const preloadHome = () => getTodos()

export const Home = () => {
  const todos = createAsync(() => getTodos())

  const [count, setCount] = createSignal(0)

  const onIncrement = () => {
    setCount((count) => count + 1)
    logIncrement()
  }

  return (
    <>
      <div>Home</div>
      <MetaTitle>Home</MetaTitle>
      <Menu />
      <button type="button" onClick={onIncrement}>
        count is {count()}
      </button>
      <For each={todos()}>{(todo) => <div>{todo.title}</div>}</For>
    </>
  )
}
