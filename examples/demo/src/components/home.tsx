import { MetaTitle, createAsync } from '@rouage/core/client'
import { For, createSignal } from 'solid-js'
import { Menu } from './menu'

export const Home = () => {
  const todos = createAsync(() =>
    fetch('https://jsonplaceholder.typicode.com/todos').then((response) => response.json()),
  )

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
