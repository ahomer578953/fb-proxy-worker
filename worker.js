export default {
  async fetch(request) {
    const upgradeHeader = request.headers.get("Upgrade") || "";

    // إذا الاتصال WebSocket
    if (upgradeHeader.toLowerCase() === "websocket") {
      const url = new URL(request.url);

      // إعداد عنوان الوجهة (سيرفرك الحقيقي)
      const upstream = "www.peddygist.com";
      const upstreamUrl = `wss://${upstream}/ray`;

      const wsHeaders = new Headers(request.headers);
      wsHeaders.set("Host", upstream);
      wsHeaders.set("User-Agent", "Mozilla/5.0 (Linux; Android 14; SM-A245F Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/133.0.6943.122 Mobile Safari/537.36 [FBAN/InternetOrgApp;FBAV/166.0.0.0.169;]");
      wsHeaders.set("X-IORG-BSID", "@FreeMode");

      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      const upstreamResponse = await fetch(upstreamUrl, {
        headers: wsHeaders,
        method: "GET"
      });

      const upgradeWebSocket = upstreamResponse.webSocket;
      if (!upgradeWebSocket) {
        return new Response("Failed to upgrade WebSocket", { status: 500 });
      }

      upgradeWebSocket.accept();
      server.accept();

      // ربط WebSocket المحلي مع البعيد
      server.addEventListener("message", (msg) => upgradeWebSocket.send(msg.data));
      upgradeWebSocket.addEventListener("message", (msg) => server.send(msg.data));

      server.addEventListener("close", () => upgradeWebSocket.close());
      upgradeWebSocket.addEventListener("close", () => server.close());

      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }

    // إذا ليس WebSocket، إرجاع رسالة فقط
    return new Response("✅ Free Basics Proxy Active", {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  }
};

