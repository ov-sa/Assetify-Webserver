let cache = {}
let getIP = (ip) => ip ? ip?.replace(/^.*:/, '') : false

Assetify.rest.create("post", "onSetConnection", (request, response) => {
    const requestIP = getIP(request.ip)
    request = request.body[0]
    if (request) cache[requestIP] = {token: vKit.vid.create(), peer: {}, content: {}}
    else delete cache[requestIP]
    response.status(200).send({status: true, token: cache[requestIP] ? cache[requestIP].token : null})
    vKit.print(`\x1b[33m━ Assetify (Server) | \x1b[32mServer: ${requestIP} ${cache[requestIP] ? "connected" : "disconnected"}.\x1b[37m`)
})

Assetify.rest.create("post", "onSyncPeer", (request, response) => {
    const requestIP = getIP(request.ip)
    request = request.body[0]
    if (!cache[requestIP] || !request.token || (request.token != cache[requestIP].token) || !request.peer) return response.status(401).send({status: false})
    if (request.state) cache[requestIP].peer[(request.peer)] = true
    else delete cache[requestIP].peer[(request.peer)]
    response.status(200).send({status: true})
    vKit.print(`\x1b[33m━ Assetify (Server) | \x1b[32mPeer: ${request.peer} ${request.state ? "connected" : "disconnected"}. \x1b[33m[Server: ${requestIP}]\x1b[37m`)
})

Assetify.rest.create("post", "onSyncContent", (request, response) => {
    const requestIP = getIP(request.ip)
    request = request.body[0]
    if (!cache[requestIP] || !request.token || (request.token != cache[requestIP].token) || !request.path || !request.content) return response.status(401).send({status: false})
    cache[requestIP].content[(request.path)] = cache[requestIP].content[(request.path)] || {}
    cache[requestIP].content[(request.path)].sync = new Promise((resolve) => cache[requestIP].content[(request.path)].sync_resolve = resolve)
    cache[requestIP].content[(request.path)].buffer = (cache[requestIP].content[(request.path)].buffer ? "" : cache[requestIP].content[(request.path)].buffer) + request.content
    if (request.chunk[0] == request.chunk[1]) {
        cache[requestIP].content[(request.path)].sync_resolve()
        delete cache[requestIP].content[(request.path)].sync_resolve
        vKit.print(`\x1b[33m━ Assetify (Server) | \x1b[32mContent: ${request.path} synced. \x1b[33m[Server: ${requestIP}]\x1b[37m`)
    }
    response.status(200).send({status: true})
})

Assetify.rest.create("get", "onFetchContent", async (request, response) => {
    request = request.body[0]
    let requestIP = false
    if (request.token) {
        for (let i in cache) {
            if (request.token == cache.token) {
                requestIP = i
                break
            }
        }
    }
    if (!requestIP || !request.peer || !cache[requestIP].peer[(request.peer)] || !request.path || !cache[requestIP].content[(request.path)]) return response.status(401).send({status: false})
    await cache[requestIP].content[(request.path)].sync
    response.status(200).send(cache[requestIP].content[(request.path)].buffer)
})