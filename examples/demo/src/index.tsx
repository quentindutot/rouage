import { Counter } from './counter'

// biome-ignore lint/style/noDefaultExport: <explanation>
export default () => (
  <html lang="en">
    <head>
      <title>Granite</title>
    </head>
    <body>
      <div id="root">
        <h1>Hello World</h1>
        <Counter />
      </div>
    </body>
  </html>
)
