export default {
  async fetch(req) {
    const upgradeHeader = req.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected websocket", { status: 400 });
    }

    const backendWs = "wss://www.peddygist.com/ray";
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    const wsResponse = await fetch(backendWs, {
      headers: req.headers,
      method: "GET",
    });

    const { webSocket } = wsResponse;

    if (!webSocket) {
      return new Response("Failed to connect to backend", { status: 502 });
    }

    webSocket.accept();
    server.accept();

    webSocket.addEventListener("message", (msg) => server.send(msg.data));
    webSocket.addEventListener("close", () => server.close());
    webSocket.addEventListener("error", (e) => server.close(1011, e.message));
    server.addEventListener("message", (msg) => webSocket.send(msg.data));
    server.addEventListener("close", () => webSocket.close());
    server.addEventListener("error", (e) => webSocket.close(1011, e.message));

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  },
};

