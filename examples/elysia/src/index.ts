import { Elysia } from 'elysia'
import { rouageElysia } from 'solid-rouage/server'

// https://github.com/elysiajs/elysia/issues/1143

const server = new Elysia().get('/health', 'OK').all('*', rouageElysia())

export default server
