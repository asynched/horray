import { Context, Hono } from 'hono'
import fs from 'node:fs/promises'
import { join } from 'node:path'

export type File = {
  type: 'file'
  name: string
  path: string
}

export type Directory = {
  type: 'directory'
  name: string
  path: string
  children: Array<Directory | File>
}

type Tree = Directory

type Page = (ctx: Context) => Promise<JSX.Element>

export class FileSystemRouter {
  constructor(private readonly rootPath: string) {}

  private sanitize(path: string) {
    const sanitized = path
      .replace(this.rootPath, '')
      .replace(/(index)?.ts(x)?/, '')

    if (sanitized.endsWith('/') && sanitized.length > 1) {
      return sanitized.slice(0, -1)
    }

    return sanitized
  }

  private async walkPath(path: string): Promise<Array<Directory | File>> {
    const dir = await fs.opendir(path)
    const children: Array<File | Directory> = []

    for await (const dirent of dir) {
      if (dirent.isDirectory()) {
        children.push({
          type: 'directory',
          name: dirent.name,
          path: join(path, dirent.name),
          children: await this.walkPath(join(path, dirent.name)),
        })
      } else {
        children.push({
          type: 'file',
          name: dirent.name,
          path: join(path, dirent.name),
        })
      }
    }

    return children
  }

  private addRoutes(router: Hono, entry: File | Directory) {
    if (entry.type === 'directory') {
      for (const child of entry.children) {
        this.addRoutes(router, child)
      }
    }

    if (entry.type === 'file') {
      const route = this.sanitize(entry.path)
      const page = require(entry.path).default as Page

      // console.log({
      //   method: 'GET',
      //   route: route,
      //   handler: page,
      //   file: entry.path,
      //   name: entry.name,
      // })

      router.get(route, async (ctx) => {
        const element = await page(ctx)
        return ctx.html(element)
      })
    }
  }

  private async makeFileTree(path: string): Promise<Tree> {
    const [name] = path.split('/').slice(-1)

    return {
      type: 'directory',
      name,
      path,
      children: await this.walkPath(path),
    }
  }

  async build(router: Hono) {
    const tree = await this.makeFileTree(this.rootPath)

    this.addRoutes(router, tree)
  }
}
