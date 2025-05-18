import { rouage } from '@rouage/core/server'
import { Elysia } from 'elysia'

const server = new Elysia().get('/health', 'OK').all('*', rouage())

// biome-ignore lint/style/noDefaultExport: <explanation>
export default server
