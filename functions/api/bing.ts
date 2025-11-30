export async function onRequest({ request }: { request: Request }) {
  try {
    const url = new URL(request.url)
    const count = Math.min(Math.max(parseInt(url.searchParams.get('count') || '20', 10) || 20, 1), 50)
    const mkt = url.searchParams.get('mkt') || 'zh-CN'

    const tasks = Array.from({ length: count }).map((_, i) =>
      fetch(`https://www.bing.com/HPImageArchive.aspx?format=js&idx=${i}&n=1&mkt=${encodeURIComponent(mkt)}`)
        .then(r => (r.ok ? r.json() : { images: [] }))
        .catch(() => ({ images: [] }))
    )
    const results = await Promise.all(tasks)
    const urls: string[] = results
      .flatMap(d => (d.images || []))
      .map((img: any) => `https://www.bing.com${img.url}`)

    return new Response(JSON.stringify({ urls }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ urls: [] }), {
      headers: { 'content-type': 'application/json' },
      status: 200
    })
  }
}

