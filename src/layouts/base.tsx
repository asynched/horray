import { type Child } from 'hono/jsx'

type HtmlProps = {
  children: Child
}

export default function Html({ children }: HtmlProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Horray | Build server side apps</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}
