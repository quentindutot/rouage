import { createSignal } from 'solid-js'
import { Title } from 'solid-rouage'

export default function Home() {
  const [count, setCount] = createSignal(0)

  return (
    <main class="max-w-4xl flex flex-col gap-8 text-center px-6 py-28 mx-auto">
      <Title>Home</Title>

      <h1 class="font-bold text-4xl text-gray-700 tracking-wide">HOME</h1>

      <button
        type="button"
        onClick={() => setCount(count() + 1)}
        class="w-fit bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-full cursor-pointer transition-colors px-8 py-4 mx-auto"
      >
        count is {count()}
      </button>
    </main>
  )
}
