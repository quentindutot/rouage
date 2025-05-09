import { RPCHandler } from '@orpc/server/fetch'
import { router } from './router'

export const rpcHandler = new RPCHandler(router, {})
