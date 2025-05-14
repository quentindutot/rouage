export const setupFetch = () => {
  const fetch = window.fetch

  window.fetch = (url, options) => {
    // @ts-ignore - Property '__initial_data__' does not exist on type 'Window & typeof globalThis'
    const cached = window.__initial_data__[url]
    if (cached) {
      return Promise.resolve(
        new Response(JSON.stringify(cached), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      )
    }

    return fetch(url, options)
  }
}
