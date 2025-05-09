import { Title } from '@solidjs/meta'
import { createSignal, For, sharedConfig } from 'solid-js'
import { Menu } from './menu'
import { rpcClient } from '../orpc/client'
import { createAsync } from '@solidjs/router'
import { isServer } from 'solid-js/web'

export const Home = () => {
  const planets = createAsync(async () => {
    if (isServer) {
      const data = await rpcClient.planet.list()
      sharedConfig.context.datum = {
        listPlanets: data,
      }
      return data
    }

    console.log('client -- data', window.__INITIAL_DATA__)
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
