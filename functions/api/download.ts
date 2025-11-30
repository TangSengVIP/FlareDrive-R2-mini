export async function onRequest({ request, env }: { request: Request; env: { BUCKET?: R2Bucket } }) {
  try {
    const url = new URL(request.url)
    const key = url.searchParams.get('key')
    if (!key) return new Response('Missing key', { status: 400 })

    const bucket = env.BUCKET
    if (!bucket) return new Response('R2 bucket not bound', { status: 500 })

    const obj = await bucket.get(key)
    if (!obj) return new Response('Not found', { status: 404 })

    const headers = new Headers()
    const ct = obj.httpMetadata?.contentType || 'application/octet-stream'
    headers.set('content-type', ct)
    const size = obj.size
    if (size != null) headers.set('content-length', String(size))

    const filename = key.split('/').pop() || 'download'
    headers.set('content-disposition', `attachment; filename="${filename}"`)

    return new Response(obj.body, { headers })
  } catch (e) {
    console.error(e)
    return new Response('Server error', { status: 500 })
  }
}

interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>
}

interface R2ObjectBody {
  body: ReadableStream
  size?: number
  httpMetadata?: { contentType?: string }
}
