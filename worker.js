addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const target = 'https://www.peddygist.com'
  const url = new URL(request.url)
  const targetUrl = target + url.pathname + url.search

  const modifiedHeaders = new Headers(request.headers)
  modifiedHeaders.set('Host', 'www.peddygist.com')
  modifiedHeaders.set('User-Agent', 'Mozilla/5.0 (Linux; Android 14; SM-A245F Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/133.0.6943.122 Mobile Safari/537.36 [FBAN/InternetOrgApp;FBAV/166.0.0.0.169;]')
  modifiedHeaders.set('Referer', 'https://free.facebook.com/')
  modifiedHeaders.set('X-Forwarded-For', '102.0.0.1') // spoof IP
  modifiedHeaders.set('X-Requested-With', 'com.facebook.katana')

  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: modifiedHeaders,
    body: request.method === 'GET' || request.method === 'HEAD' ? null : request.body,
    redirect: 'follow'
  })

  try {
    const response = await fetch(modifiedRequest)

    const newHeaders = new Headers(response.headers)
    newHeaders.set('Access-Control-Allow-Origin', '*')
    newHeaders.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS')
    newHeaders.set('Access-Control-Allow-Headers', '*')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    })
  } catch (err) {
    return new Response('⚠️ Error connecting to www.peddygist.com: ' + err.message, {
      status: 502
    })
  }
}
