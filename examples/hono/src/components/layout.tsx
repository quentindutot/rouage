import type { JSX } from 'solid-js'
import { MetaLink } from 'solid-rouage/client'

export const Layout = (props: { children: JSX.Element }) => (
  <>
    <MetaLink rel="icon" href="/favicon.ico" />

    <nav class="flex items-center gap-4">
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>

    {props.children}
  </>
)
