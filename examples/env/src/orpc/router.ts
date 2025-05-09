import { os } from '@orpc/server'
import { array, number, object, string, void_ } from 'valibot'

export const listPlanet = os
  .input(void_())
  .output(array(object({ id: number(), name: string() })))
  .handler(async () => {
    // console.log('server stuff being called')

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null)
      }, 1000)
    })

    return [{ id: 1, name: 'name' }]
  })

export const router = {
  planet: {
    list: listPlanet,
  },
}
