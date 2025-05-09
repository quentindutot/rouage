import { Title } from '@solidjs/meta'
import { createSignal, For } from 'solid-js'
import { Menu } from './menu'
import { rpcClient } from '../orpc/client'
import { createAsync } from '@solidjs/router'

export const Home = () => {
  const planets = createAsync(() => rpcClient.planet.list())

  const [count, setCount] = createSignal(0)

  return (
    <>
      <div>Home</div>
      <Title>Home</Title>
      <Menu />
      <button type="button" onClick={() => setCount((count) => count + 1)}>
        count is {count()}
      </button>
      <For each={planets()}>{(planet) => <div>{planet.name}</div>}</For>
    </>
  )
}
