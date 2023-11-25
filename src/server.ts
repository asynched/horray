import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { join } from 'node:path'
import { FileSystemRouter } from '@/fs-router'

export async function main() {
  const rootPath = join(__dirname, 'routes')

  const server = new Hono()
  const router = new FileSystemRouter(rootPath)

  await router.build(server)

  serve(
    {
      fetch: server.fetch,
      port: 1234,
      hostname: '127.0.0.1',
    },
    ({ address, port }) => {
      console.log(`Server started on http://${address}:${port} `)
    },
  )
}

main()
