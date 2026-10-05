let socket = null;

// Use the same host as the current page for WebSocket connection
// This works for both localhost and network IPs
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname || 'localhost';
  // Use port 5000 for WebSocket server
  return `${protocol}//${host}:5000`;
};

export function connectWebSocket(userId, onMessage) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("WebSocket already connected, reusing existing connection");
    return socket;
  }

  const WS_URL = getWebSocketUrl();
  console.log("Connecting to WebSocket at:", WS_URL);
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("WebSocket connected, readyState:", socket.readyState);
    console.log("Sending register for userId:", userId);

    const registerMsg = JSON.stringify({
      type: "register",
      userId,
    });
    console.log("Register message:", registerMsg);
    socket.send(registerMsg);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("WebSocket received:", data);

      if (onMessage) {
        onMessage(data);
      }
    } catch (error) {
      console.error("Invalid WebSocket message:", error, "Raw:", event.data);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = (event) => {
    console.log("WebSocket disconnected, code:", event.code, "reason:", event.reason, "wasClean:", event.wasClean);
    socket = null;
  };

  return socket;
}

export function sendWebSocketMessage(data) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket is not connected");
    return false;
  }

  socket.send(JSON.stringify(data));

  return true;
}

export function disconnectWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
