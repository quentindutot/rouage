import { MetaTitle, createAsync } from '@rouage/core'
import { For, createSignal, sharedConfig } from 'solid-js'
import { isServer } from 'solid-js/web'
import { Menu } from './menu'

export const Home = () => {
  const todos = createAsync(async () => {
    if (isServer) {
      const data = await fetch('https://jsonplaceholder.typicode.com/todos').then((response) => response.json())
      // @ts-expect-error
      sharedConfig.context.datum = {
        listTodos: data,
      }
      return data
    }

    const data =
      // @ts-expect-error
      window.__INITIAL_DATA__.listTodos ??
      (await fetch('https://jsonplaceholder.typicode.com/todos').then((response) => response.json()))
    return data
  })

  const [count, setCount] = createSignal(0)

  return (
    <>
      <div>Home</div>
      <MetaTitle>Home</MetaTitle>
      <Menu />
      <button type="button" onClick={() => setCount((count) => count + 1)}>
        count is {count()}
      </button>
      <For each={todos()}>{(todo) => <div>{todo.title}</div>}</For>
    </>
  )
}
