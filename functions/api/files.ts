export async function onRequest({ env }: { env: { BUCKET?: R2Bucket } }) {
  try {
    const bucket = env.BUCKET
    if (!bucket) {
      return new Response(JSON.stringify({ files: [] }), {
        headers: { 'content-type': 'application/json' }
      })
    }

    const listing = await bucket.list({ limit: 1000 })
    const files = (listing.objects || []).map((obj) => ({
      id: obj.key,
      name: (obj.key?.split('/')?.pop()) || obj.key,
      size: obj.size ?? 0,
      path: obj.key,
      created_at: new Date().toISOString()
    }))

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
}
