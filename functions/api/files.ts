export async function onRequest({ request, env }: { request: Request; env: { BUCKET?: R2Bucket } }) {
  try {
    const bucket = env.BUCKET
    if (!bucket) {
      return new Response(JSON.stringify({ files: [] }), {
        headers: { 'content-type': 'application/json' }
      })
    }

    const url = new URL(request.url)
    const prefix = url.searchParams.get('prefix') || undefined
    const prune = url.searchParams.get('prune') === '1'
    const dry = url.searchParams.get('dry') === '1'
    const retain = Math.max(parseInt(url.searchParams.get('retain') || '1', 10) || 1, 1)

    const listing = await bucket.list({ limit: 1000, prefix })
    const objects = listing.objects || []

    const files = objects.map((obj) => ({
      id: obj.key,
      name: (obj.key?.split('/')?.pop()) || obj.key,
      size: obj.size ?? 0,
      path: obj.key,
      created_at: new Date().toISOString()
    }))

    if (prune) {
      const parseVersion = (name: string): number[] | null => {
        const m = name.toLowerCase().match(/(?:v)?(\d+(?:\.\d+)+)/)
        if (!m) return null
        return m[1].split('.').map(n => parseInt(n, 10))
      }
      const compareVersions = (a: number[], b: number[]): number => {
        const len = Math.max(a.length, b.length)
        for (let i = 0; i < len; i++) {
          const ai = a[i] ?? 0
          const bi = b[i] ?? 0
          if (ai !== bi) return ai - bi
        }
        return 0
      }
      const normalizeName = (name: string): string => {
        return name
          .toLowerCase()
          .replace(/(?:v)?\d+(?:\.\d+)+/g, '')
          .replace(/[-_.]+/g, ' ')
          .trim()
      }

      const groups = new Map<string, Array<{ key: string; name: string; ver: number[] | null }>>()
      for (const f of files) {
        const ver = parseVersion(f.name)
        const base = normalizeName(f.name)
        const arr = groups.get(base) || []
        arr.push({ key: f.path, name: f.name, ver })
        groups.set(base, arr)
      }

      const toDelete: string[] = []
      for (const [, arr] of groups) {
        const withVer = arr.filter(x => Array.isArray(x.ver))
        if (withVer.length <= retain) continue
        withVer.sort((a, b) => compareVersions(a.ver!, b.ver!))
        const keep = withVer.slice(-retain)
        const keepKeys = new Set(keep.map(k => k.key))
        for (const item of withVer) {
          if (!keepKeys.has(item.key)) toDelete.push(item.key)
        }
      }

      if (!dry && toDelete.length > 0) {
        for (const key of toDelete) {
          try { await bucket.delete(key) } catch (e) { console.error('delete failed', key, e) }
        }
      }

      return new Response(JSON.stringify({ files, deleted: toDelete, dry }), {
        headers: { 'content-type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(files), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ files: [] }), {
      headers: { 'content-type': 'application/json' },
      status: 200
    })
  }
}

interface R2Bucket {
  list(options?: { prefix?: string; limit?: number }): Promise<{ objects: Array<{ key: string; size: number }> }>
  delete(key: string): Promise<void>
}
