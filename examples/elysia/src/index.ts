import { rouageElysia } from '@rouage/core/server'
import { Elysia } from 'elysia'

// https://github.com/elysiajs/elysia/issues/1143

const server = new Elysia().get('/health', 'OK').all('*', rouageElysia())

export default server
