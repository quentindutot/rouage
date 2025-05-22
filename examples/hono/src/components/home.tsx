import { createSignal } from 'solid-js'
import { Title } from 'solid-rouage/client'

export default function Home() {
  const [count, setCount] = createSignal(0)

  return (
    <main>
      <Title>Home</Title>

      <h1 class="font-semibold text-lg">Home</h1>

      <button
        type="button"
        onClick={() => setCount(count() + 1)}
        class="bg-neutral-100 text-sm border border-neutral-200 rounded-md cursor-pointer px-4 py-2"
      >
        Clicks: {count()}
      </button>
    </main>
  )
}
