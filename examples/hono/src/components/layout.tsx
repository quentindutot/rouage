import { Html, Link, Meta, type RouteSectionProps } from 'solid-rouage/client'

export const Layout = (props: RouteSectionProps) => (
  <>
    <Html lang="en" />
    <Meta charset="utf-8" />
    <Meta name="viewport" content="width=device-width, initial-scale=1" />
    <Link rel="icon" href="/favicon.ico" />

    <nav class="flex items-center gap-4">
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>

    {props.children}
  </>
)
