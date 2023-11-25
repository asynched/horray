import { Context } from 'hono'
import Html from '@/layouts/base'

export default function Index(ctx: Context) {
  return (
    <Html>
      <h1>Hello, world!</h1>
    </Html>
  )
}
