let socket = null;

export function connectWebSocket(userId, onMessage) {
  if (!userId) {
    console.error("Missing userId");
    return null;
  }

  /*
   * Close old connection if one exists.
   */

  if (socket) {
    socket.close();
    socket = null;
  }

  /*
   * Use the same hostname that opened the React app.
   *
   * localhost -> localhost
   * 192.168.x.x -> 192.168.x.x
   */

  const wsUrl = `ws://${window.location.hostname}:5000`;

  console.log("Connecting to WebSocket:", wsUrl);

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket connected");

    /*
     * Register the logged-in user.
     */

    socket.send(
      JSON.stringify({
        type: "register",
        userId,
      }),
    );

    console.log("User registered:", userId);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      console.log("WebSocket received:", data);

      if (onMessage) {
        onMessage(data);
      }
    } catch (error) {
      console.error("Invalid WebSocket message:", error);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");

    socket = null;
  };

  return socket;
}

export function sendWebSocketMessage(message) {
  if (!socket) {
    console.error("WebSocket is not connected");

    return false;
  }

  if (socket.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not open. State:", socket.readyState);

    return false;
  }

  socket.send(JSON.stringify(message));

  console.log("WebSocket message sent:", message);

  return true;
}

export function disconnectWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
