import type { RouterClient } from '@orpc/server'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { router } from './router'

const rpcLink = new RPCLink({
  url: 'http://localhost:5173/rpc',
})

export const rpcClient: RouterClient<typeof router> = createORPCClient(rpcLink)
