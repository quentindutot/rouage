#!/usr/bin/env node

console.log('Welcome to Rouage!')

const exit = () => process.exit(0)
process.on('SIGINT', exit)
process.on('SIGTERM', exit)
