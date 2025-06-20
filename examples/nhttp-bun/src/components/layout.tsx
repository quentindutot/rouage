import { Suspense } from 'solid-js'
import { Body, Html, Link, Meta, type RouteSectionProps } from 'solid-rouage'
import styles from '../app.css?url'

export const Layout = (props: RouteSectionProps) => (
  <>
    <Html lang="en" />
    <Meta charset="utf-8" />
    <Meta name="viewport" content="width=device-width, initial-scale=1" />
    <Link rel="stylesheet" href={styles} />
    <Link rel="icon" href="/favicon.ico" />
    <Body class="min-h-screen antialiased" />

    <nav class="max-w-4xl flex justify-between items-center px-6 py-4 mx-auto">
      <div class="flex items-center gap-6">
        <a href="/" class="text-gray-600 hover:text-gray-900 transition-colors">
          Home
        </a>
        <a href="/about" class="text-gray-600 hover:text-gray-900 transition-colors">
          About
        </a>
      </div>

      <a href="https://rouage.dev" class="text-[#DC6557] hover:underline">
        rouage.dev
      </a>
    </nav>

    <Suspense>{props.children}</Suspense>
  </>
)
