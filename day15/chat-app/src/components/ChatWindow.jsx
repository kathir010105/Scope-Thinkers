import {
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
} from "lucide-react";

import { useEffect, useState, useRef } from "react";

import { useSelector, useDispatch } from "react-redux";

import { getChatMessages, sendMessageToFirestore } from "../firebase/firestore";

import {
  setMessages,
  clearMessages,
  addMessage,
  insertMessage,
} from "../redux/slices/messageSlice";

import {
  connectWebSocket,
  sendWebSocketMessage,
  disconnectWebSocket,
} from "../services/websocket";

function ChatWindow() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const { activeChat } = useSelector((state) => state.chat);

  const { messages } = useSelector((state) => state.message);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  /*
   * =====================================================
   * CURRENT CHAT ID
   * =====================================================
   *
   * Your chat object currently has both:
   *
   * activeChat.id
   * activeChat.chatId
   *
   * We normalize them here so the rest of the component
   * always uses ONE value.
   */

  const chatId = activeChat?.id || activeChat?.chatId;

  const receiverId = activeChat?.otherUser?.uid;

  // Ref to always have current chatId in WebSocket callback
  const chatIdRef = useRef(chatId);
  chatIdRef.current = chatId;

  /*
   * =====================================================
   * WEBSOCKET CONNECTION
   * =====================================================
   *
   * Connect when the logged-in user enters the app/chat.
   *
   * The WebSocket is used for receiving real-time messages.
   *
   * The selected chat only determines whether we display
   * the incoming message.
   */

  useEffect(() => {
    if (!messagesEndRef.current) {
      return;
    }

    messagesEndRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  useEffect(() => {
    console.log("ChatWindow WebSocket effect running:", {
      hasUser: !!user,
      userUid: user?.uid,
      authLoading: false, // We don't have authLoading here directly
    });

    if (!user?.uid) {
      console.log("Skipping WebSocket connect - no user.uid");
      return;
    }

    console.log("Connecting WebSocket for user:", user.uid);

    const socket = connectWebSocket(user.uid, (data) => {
      console.log("WebSocket data received:", data);

      /*
       * Only handle actual chat messages
       */

      if (data.type !== "message") {
        console.log("Ignoring non-message type:", data.type);
        return;
      }

      /*
       * Make sure we actually received a message
       */

      if (!data.message) {
        console.log("Received message with no message payload");
        return;
      }

      /*
       * Message belongs to the currently open chat
       */

      const currentChatId = chatIdRef.current;
      if (data.chatId !== currentChatId) {
        console.log(
          "Received message for another chat:",
          data.chatId,
          "Current chat:",
          currentChatId,
        );

        return;
      }

      /*
       * Add incoming message to Redux in correct timestamp order
       */

      console.log("Inserting incoming message:", data.message);

      dispatch(insertMessage(data.message));
    });

    return () => {
      console.log("Disconnecting WebSocket");

      if (socket) {
        socket.close();
      }

      disconnectWebSocket();
    };
  }, [user?.uid, dispatch]); // Remove chatId from dependencies - WebSocket should persist across chat switches

  /*
   * =====================================================
   * LOAD CHAT HISTORY
   * =====================================================
   */

  useEffect(() => {
    if (!chatId) {
      dispatch(clearMessages());
      return;
    }

    const loadMessages = async () => {
      try {
        console.log("Loading messages for chat:", chatId);

        dispatch(clearMessages());

        const result = await getChatMessages(chatId);

        console.log("Messages loaded:", result);

        // Ensure messages are sorted by createdAt ascending (oldest first)
        const sortedMessages = [...result].sort(
          (a, b) => (a.createdAt || 0) - (b.createdAt || 0),
        );

        dispatch(setMessages(sortedMessages));
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    loadMessages();
  }, [chatId, dispatch]);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];

    // Reset input so the same file can be selected again
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!user?.uid) {
      console.error("No logged-in user");
      return;
    }

    if (!chatId) {
      console.error("Chat ID is missing");
      return;
    }

    if (!receiverId) {
      console.error("Receiver ID is missing");
      return;
    }

    try {
      setSending(true);

      console.log("Uploading file:", file.name);

      const formData = new FormData();

      formData.append("file", file);
      formData.append("uploadedBy", user.uid);
      formData.append("chatId", chatId);

      const response = await fetch("http://localhost:5000/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const result = await response.json();

      console.log("File uploaded:", result);

      /*
       * Save file information as a Firestore message
       */

      const savedMessage = await sendMessageToFirestore(chatId, {
        senderId: user.uid,
        receiverId: receiverId,

        text: "",

        type: "image",

        fileId: result.fileId,
        fileName: result.fileName,
        fileType: result.fileType,
        fileSize: result.fileSize,
      });

      console.log("Image message saved:", savedMessage);

      /*
       * Show immediately for sender
       */

      dispatch(addMessage(savedMessage));

      /*
       * Send to receiver through WebSocket
       */

      const wsMessage = {
        type: "message",

        senderId: user.uid,
        receiverId: receiverId,
        chatId: chatId,

        message: savedMessage,
      };

      sendWebSocketMessage(wsMessage);
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setSending(false);
    }
  };
  /*
   * =====================================================
   * SEND MESSAGE
   * =====================================================
   */

  const handleSend = async () => {
    const messageText = text.trim();

    console.log("=================================");
    console.log("SEND MESSAGE");
    console.log("=================================");

    console.log("Text:", messageText);
    console.log("User:", user?.uid);
    console.log("Chat ID:", chatId);
    console.log("Receiver:", receiverId);

    /*
     * Validate message
     */

    if (!messageText) {
      console.log("Message is empty");
      return;
    }

    if (!user?.uid) {
      console.error("No logged-in user");
      return;
    }

    if (!chatId) {
      console.error("Chat ID is missing");
      console.log("Active chat:", activeChat);
      return;
    }

    if (!receiverId) {
      console.error("Receiver ID is missing");
      console.log("Active chat:", activeChat);
      return;
    }

    if (sending) {
      return;
    }

    setSending(true);

    try {
      /*
       * =================================================
       * 1. SAVE MESSAGE TO FIRESTORE
       * =================================================
       */

      const savedMessage = await sendMessageToFirestore(chatId, {
        senderId: user.uid,
        receiverId: receiverId,
        text: messageText,
        type: "text",
      });

      console.log("Message saved to Firestore:", savedMessage);

      /*
       * =================================================
       * 2. SHOW MESSAGE IMMEDIATELY FOR SENDER
       * =================================================
       */

      dispatch(addMessage(savedMessage));

      /*
       * =================================================
       * 3. SEND REAL-TIME MESSAGE
       * =================================================
       */

      const wsMessage = {
        type: "message",

        senderId: user.uid,

        receiverId: receiverId,

        chatId: chatId,

        message: savedMessage,
      };
      console.log("Sending WebSocket message:", wsMessage);

      const sent = sendWebSocketMessage(wsMessage);

      console.log("WebSocket send result:", sent);

      /*
       * The message is already safely stored in Firestore.
       *
       * So even if the receiver is offline or WebSocket
       * temporarily fails, the message is not lost.
       */

      /*
       * =================================================
       * 4. CLEAR INPUT
       * =================================================
       */

      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  /*
   * =====================================================
   * ENTER KEY
   * =====================================================
   */

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      handleSend();
    }
  };

  /*
   * =====================================================
   * NO CHAT SELECTED
   * =====================================================
   */

  if (!activeChat) {
    return (
      <div className="flex-1 h-full bg-[#F8FAFE] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#C7DBF7] flex items-center justify-center mx-auto mb-3">
            <span className="text-[#75708C] font-semibold">C</span>
          </div>

          <h2 className="font-semibold">Welcome to Chatter</h2>

          <p className="text-xs text-[#75708C] mt-1">
            Search for a username to start chatting.
          </p>
        </div>
      </div>
    );
  }

  /*
   * =====================================================
   * CHAT WINDOW
   * =====================================================
   */

  return (
    <div className="flex-1 h-full bg-[#F8FAFE] flex flex-col">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="h-[76px] shrink-0 bg-white border-b border-[#BFC7DE] px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#BFC7DE] flex items-center justify-center">
            <span className="font-semibold">
              {activeChat.otherUser?.displayName?.charAt(0)?.toUpperCase() ||
                "U"}
            </span>
          </div>

          <div>
            <h2 className="font-semibold text-[#010101]">
              {activeChat.otherUser?.displayName}
            </h2>

            <p className="text-xs text-[#75708C]">
              @{activeChat.otherUser?.username}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="
              w-10
              h-10
              rounded-xl
              hover:bg-[#C7DBF7]
              flex
              items-center
              justify-center
            "
          >
            <Phone size={19} />
          </button>

          <button
            className="
              w-10
              h-10
              rounded-xl
              hover:bg-[#C7DBF7]
              flex
              items-center
              justify-center
            "
          >
            <Video size={19} />
          </button>

          <button
            className="
              w-10
              h-10
              rounded-xl
              hover:bg-[#C7DBF7]
              flex
              items-center
              justify-center
            "
          >
            <MoreVertical size={19} />
          </button>
        </div>
      </header>

      {/* =================================================
          MESSAGES
      ================================================= */}

      <main className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.map((message) => {
          const isMine = message.senderId === user?.uid;

          return (
            <div
              key={message.id}
              className={isMine ? "flex justify-end" : "flex"}
            >
              <div className="max-w-[70%]">
                <div
                  className={
                    isMine
                      ? `
        bg-[#75708C]
        text-white
        rounded-2xl
        rounded-br-md
        px-3
        py-3
        shadow-sm
      `
                      : `
        bg-white
        border
        border-[#BFC7DE]
        rounded-2xl
        rounded-bl-md
        px-3
        py-3
        shadow-sm
      `
                  }
                >
                  {message.type === "image" ? (
                    <img
                      src={`http://localhost:5000/api/files/${message.fileId}`}
                      alt={message.fileName || "Image"}
                      className="max-w-[280px] max-h-[350px] rounded-xl object-cover"
                    />
                  ) : (
                    <p className="text-sm">{message.text}</p>
                  )}
                </div>

                <span
                  className={
                    isMine
                      ? `
                  text-[10px]
                  text-[#75708C]
                  mr-2
                  mt-1
                  block
                  text-right
                `
                      : `
                  text-[10px]
                  text-[#75708C]
                  ml-2
                  mt-1
                  block
                `
                  }
                >
                  {message.createdAt
                    ? new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
            </div>
          );
        })}

        {/* Invisible element used for auto-scrolling */}
        <div ref={messagesEndRef} />
      </main>

      {/* =================================================
          INPUT
      ================================================= */}

      <div className="p-4 bg-white border-t border-[#BFC7DE]">
        <div className="flex items-center gap-2">
          <label
            className="
    w-10
    h-10
    shrink-0
    rounded-xl
    hover:bg-[#C7DBF7]
    flex
    items-center
    justify-center
    cursor-pointer
  "
          >
            <Paperclip size={20} />

            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={sending}
            />
          </label>

          <div className="flex-1 relative">
            <input
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message..."
              className="
                w-full
                h-11
                px-4
                pr-11
                rounded-xl
                bg-[#F8FAFE]
                border
                border-[#BFC7DE]
                outline-none
                text-sm
                focus:border-[#75708C]
                focus:ring-2
                focus:ring-[#75708C]/20
              "
            />

            <button
              className="
                absolute
                right-2
                top-1/2
                -translate-y-1/2
                w-8
                h-8
                rounded-lg
                hover:bg-[#C7DBF7]
                flex
                items-center
                justify-center
              "
            >
              <Smile size={18} />
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="
              w-11
              h-11
              shrink-0
              rounded-xl
              bg-[#75708C]
              text-white
              flex
              items-center
              justify-center
              hover:bg-[#010101]
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            <Send size={19} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
