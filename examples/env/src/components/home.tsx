import { Title } from '@solidjs/meta'
import { createSignal } from 'solid-js'
import { Menu } from './menu'

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
