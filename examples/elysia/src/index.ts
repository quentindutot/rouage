import { Elysia } from 'elysia'
import { serveElysia, solidElysia } from 'solid-rouage/server'

// https://github.com/elysiajs/elysia/issues/1143

const app = new Elysia().get('/health', 'OK').all('*', solidElysia())

export default serveElysia(app)
