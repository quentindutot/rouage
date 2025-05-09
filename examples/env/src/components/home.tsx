import { Title } from '@solidjs/meta'
import { createSignal } from 'solid-js'
import { Menu } from './menu'

export const homePreload = () => {
  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log('home preload')
}

export const Home = () => {
  const [count, setCount] = createSignal(0)

  return (
    <>
      <div>Home</div>
      <Title>Home</Title>
      <Menu />
      <button type="button" onClick={() => setCount((count) => count + 1)}>
        count is {count()}
      </button>
    </>
  )
}
