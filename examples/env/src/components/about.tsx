import { Menu } from './menu'

export const aboutPreload = () => {
  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log('about preload')
}

export const About = () => (
  <>
    <div>About</div>
    <Menu />
  </>
)
