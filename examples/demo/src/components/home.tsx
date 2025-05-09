import { Title } from '@solidjs/meta'
import { createAsync } from '@solidjs/router'
import { For, createSignal, sharedConfig } from 'solid-js'
import { isServer } from 'solid-js/web'
import { rpcClient } from '../orpc/client'
import { Menu } from './menu'

export const Home = () => {
  const planets = createAsync(async () => {
    if (isServer) {
      const data = await rpcClient.planet.list()
      // @ts-expect-error
      sharedConfig.context.datum = {
        listPlanets: data,
      }
      return data
    }

    // @ts-expect-error
    const data = window.__INITIAL_DATA__.listPlanets ?? (await rpcClient.planet.list())
    return data
  })

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
