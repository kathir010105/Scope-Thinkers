import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  Bot,
  Plus,
  Send,
  Sparkles,
  UserRound,
  LoaderCircle,
  AlertCircle,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  X,
  LogOut,
  Search,
  Pencil,
  Check,
  Sun,
  Moon,
} from "lucide-react";

import { auth } from "./firebase";
import Auth from "./components/Auth";
import MessageContent from "./components/MessageContent";

import {
  getUserChats,
  createUserChat,
  getChatMessages,
  saveChatMessage,
  updateChatTitle,
  deleteUserChat,
} from "./services/firestoreChats";

const API_URL = "http://localhost:5000/api/chat";

const suggestions = [
  {
    title: "Explain a complex topic",
    description: "Make difficult concepts simple",
    prompt: "Explain how large language models work in simple terms.",
  },
  {
    title: "Write some code",
    description: "Build something with me",
    prompt: "Help me write a clean React component with Tailwind CSS.",
  },
  {
    title: "Brainstorm ideas",
    description: "Turn ideas into possibilities",
    prompt:
      "Give me five useful AI project ideas for a computer science student.",
  },
  {
    title: "Improve productivity",
    description: "Plan and organize your work",
    prompt: "Help me create a practical plan to improve my productivity.",
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("nova-theme") === "dark",
  );

  const accountRequest = useRef(0);
  const busyRef = useRef(false);

  const activeChat =
    conversations.find((chat) => chat.id === activeChatId) || null;

  // Persist the selected theme.
  useEffect(() => {
    localStorage.setItem("nova-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Firebase authentication.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // Load conversations for the signed-in user.
  useEffect(() => {
    const requestId = ++accountRequest.current;
    busyRef.current = false;

    setConversations([]);
    setActiveChatId(null);
    setInput("");
    setError("");
    setLoading(false);
    setSearchQuery("");
    setEditingChatId(null);
    setEditingTitle("");

    if (!currentUser) {
      setChatsLoading(false);
      return;
    }

    async function loadChats() {
      setChatsLoading(true);

      try {
        let chats = await getUserChats(currentUser.uid);

        if (requestId !== accountRequest.current) return;

        if (chats.length === 0) {
          const newChat = await createUserChat(currentUser.uid);
          chats = [newChat];
        }

        if (requestId !== accountRequest.current) return;

        const chatsWithMessages = await Promise.all(
          chats.map(async (chat) => ({
            ...chat,
            messages: await getChatMessages(currentUser.uid, chat.id),
            messagesLoaded: true,
          })),
        );

        if (requestId !== accountRequest.current) return;

        setConversations(chatsWithMessages);
        setActiveChatId(chatsWithMessages[0]?.id || null);
      } catch (loadError) {
        if (requestId !== accountRequest.current) return;

        console.error("Failed to load Firestore chats:", loadError);
        setError(
          "Unable to load conversations. Check your Firestore rules and connection.",
        );
      } finally {
        if (requestId === accountRequest.current) {
          setChatsLoading(false);
        }
      }
    }

    loadChats();

    return () => {
      if (accountRequest.current === requestId) {
        accountRequest.current++;
      }
    };
  }, [currentUser?.uid]);

  // Create a new conversation.
  async function createNewChat() {
    if (busyRef.current || !currentUser) return;

    setError("");

    try {
      const newChat = await createUserChat(currentUser.uid);

      setConversations((previous) => [newChat, ...previous]);
      setActiveChatId(newChat.id);
      setInput("");
      setSearchQuery("");
      setEditingChatId(null);
      setSidebarOpen(false);
    } catch (createError) {
      console.error("Failed to create chat:", createError);
      setError("Could not create a conversation.");
    }
  }

  // Switch conversations.
  async function selectChat(chatId) {
    if (busyRef.current || !currentUser) return;

    setActiveChatId(chatId);
    setInput("");
    setError("");
    setSidebarOpen(false);
    setEditingChatId(null);

    const selectedChat = conversations.find((chat) => chat.id === chatId);

    if (selectedChat?.messagesLoaded) return;

    try {
      const messages = await getChatMessages(currentUser.uid, chatId);

      setConversations((previous) =>
        previous.map((chat) =>
          chat.id === chatId
            ? { ...chat, messages, messagesLoaded: true }
            : chat,
        ),
      );
    } catch (loadError) {
      console.error("Failed to load messages:", loadError);
      setError("Could not load this conversation.");
    }
  }

  // Rename a conversation and persist its title.
  async function renameChat(chatId) {
    const title = editingTitle.trim();

    if (!title || !currentUser) return;

    try {
      await updateChatTitle(currentUser.uid, chatId, title);

      setConversations((previous) =>
        previous.map((chat) =>
          chat.id === chatId ? { ...chat, title } : chat,
        ),
      );

      setEditingChatId(null);
      setEditingTitle("");
      setError("");
    } catch (renameError) {
      console.error("Rename failed:", renameError);
      setError("Could not rename this conversation.");
    }
  }

  // Delete a conversation.
  async function removeChat(chatId) {
    if (busyRef.current || !currentUser) return;

    const previousChats = conversations;
    const remaining = previousChats.filter((chat) => chat.id !== chatId);

    setError("");

    try {
      setConversations(remaining);

      if (activeChatId === chatId) {
        setActiveChatId(remaining[0]?.id || null);
      }

      await deleteUserChat(currentUser.uid, chatId);

      if (remaining.length === 0) {
        const newChat = await createUserChat(currentUser.uid);
        setConversations([newChat]);
        setActiveChatId(newChat.id);
      }
    } catch (deleteError) {
      console.error("Delete failed:", deleteError);
      setConversations(previousChats);
      setActiveChatId(chatId);
      setError("Could not delete this conversation.");
    }
  }

  async function handleLogout() {
    if (busyRef.current) return;

    try {
      await signOut(auth);
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
      setError("Unable to sign out. Please try again.");
    }
  }

  // Send a message to Gemini and save the completed response.
  async function sendMessage(messageOverride) {
    const message = (
      typeof messageOverride === "string" ? messageOverride : input
    ).trim();

    if (!message || busyRef.current || !currentUser) return;

    busyRef.current = true;
    setLoading(true);
    setError("");
    setInput("");
    setSidebarOpen(false);

    let chatId = activeChatId;
    let userMessageSaved = false;
    let assistantId = null;

    try {
      if (!chatId) {
        const newChat = await createUserChat(currentUser.uid);
        chatId = newChat.id;
        setConversations((previous) => [newChat, ...previous]);
        setActiveChatId(chatId);
      }

      const existingChat = conversations.find((chat) => chat.id === chatId);

      const previousMessages = existingChat?.messages || [];

      const title =
        previousMessages.length === 0
          ? message.length > 36
            ? `${message.slice(0, 36)}...`
            : message
          : existingChat?.title || "New conversation";

      const localUserMessage = {
        id: crypto.randomUUID(),
        role: "user",
        text: message,
        createdAt: Date.now(),
      };

      assistantId = crypto.randomUUID();

      const assistantPlaceholder = {
        id: assistantId,
        role: "model",
        text: "",
        createdAt: Date.now(),
      };

      setConversations((previous) =>
        previous.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                title,
                messages: [
                  ...chat.messages,
                  localUserMessage,
                  assistantPlaceholder,
                ],
                updatedAt: Date.now(),
              }
            : chat,
        ),
      );

      if (previousMessages.length === 0) {
        await updateChatTitle(currentUser.uid, chatId, title);
      }

      const savedUserMessage = await saveChatMessage(
        currentUser.uid,
        chatId,
        "user",
        message,
      );

      userMessageSaved = true;

      setConversations((previous) =>
        previous.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((item) =>
                  item.id === localUserMessage.id ? savedUserMessage : item,
                ),
              }
            : chat,
        ),
      );

      const history = previousMessages.map(({ role, text }) => ({
        role,
        text,
      }));

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });

      if (!response.ok) {
        let serverMessage = "Unable to get a response from Nova AI.";

        try {
          const data = await response.json();
          serverMessage = data.error || serverMessage;
        } catch {
          // Keep the fallback error.
        }

        throw new Error(serverMessage);
      }

      if (!response.body) {
        throw new Error("The server did not provide a response stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      function processLine(line) {
        if (!line.trim()) return;

        const data = JSON.parse(line);

        if (data.error) {
          throw new Error(data.error);
        }

        if (typeof data.text === "string") {
          assistantText += data.text;

          setConversations((previous) =>
            previous.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    messages: chat.messages.map((item) =>
                      item.id === assistantId
                        ? { ...item, text: assistantText }
                        : item,
                    ),
                  }
                : chat,
            ),
          );
        }
      }

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          processLine(line);
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        processLine(buffer);
      }

      if (!assistantText.trim()) {
        throw new Error("Nova AI returned an empty response.");
      }

      const savedAssistant = await saveChatMessage(
        currentUser.uid,
        chatId,
        "model",
        assistantText,
      );

      setConversations((previous) =>
        previous
          .map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((item) =>
                    item.id === assistantId ? savedAssistant : item,
                  ),
                  updatedAt: Date.now(),
                }
              : chat,
          )
          .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)),
      );
    } catch (sendError) {
      console.error("Chat request failed:", sendError);
      setError(sendError.message || "Something went wrong.");

      // Remove only the empty assistant placeholder.
      // Keep any partial response visible.
      setConversations((previous) =>
        previous.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.filter(
                  (item) =>
                    !(
                      item.id === assistantId &&
                      item.role === "model" &&
                      !item.text
                    ),
                ),
              }
            : chat,
        ),
      );

      if (!userMessageSaved) {
        setError(
          "Your message could not be saved. Check your Firestore rules and try again.",
        );
      }
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  // Search currently loaded conversation messages.
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredConversations = conversations.filter((chat) => {
    if (!normalizedQuery) return true;

    return (
      chat.title.toLowerCase().includes(normalizedQuery) ||
      chat.messages.some((message) =>
        message.text.toLowerCase().includes(normalizedQuery),
      )
    );
  });

  const dark = darkMode;

  const theme = {
    shell: dark ? "bg-slate-950 text-slate-100" : "bg-[#edf2fa] text-slate-900",
    panel: dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100",
    muted: dark ? "text-slate-400" : "text-slate-500",
    heading: dark ? "text-slate-100" : "text-slate-900",
    input: dark
      ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
      : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400",
    iconButton: dark
      ? "text-slate-300 hover:bg-slate-800"
      : "text-slate-500 hover:bg-slate-100",
  };

  if (authLoading) {
    return (
      <div
        className={`h-screen overflow-hidden p-0 md:p-3 ${
          dark ? "bg-[#080d1d]" : "bg-[#edf2fa]"
        }`}
      >
        <div className="flex items-center gap-3 text-sm">
          <LoaderCircle className="animate-spin text-blue-600" size={22} />
          Loading Nova AI...
        </div>
      </div>
    );
  }

  if (!currentUser) return <Auth />;

  return (
    <div className={`h-screen overflow-hidden p-0 md:p-3 ${theme.shell}`}>
      <div
        className={`mx-auto flex h-full w-full max-w-[1600px] overflow-hidden rounded-none border shadow-xl md:rounded-2xl ${
          dark
            ? "border-slate-800 bg-slate-950 shadow-black/30"
            : "border-slate-200 bg-white shadow-slate-300/40"
        }`}
      >
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/50 md:hidden"
          />
        )}

        <aside
          className={`${
            sidebarCollapsed
              ? "md:w-0 md:min-w-0 md:overflow-hidden md:border-r-0"
              : "md:w-[285px] md:min-w-[285px]"
          } fixed inset-y-0 left-0 z-40 flex w-[285px] flex-col border-r transition-all duration-200 md:relative md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${theme.panel}`}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/20">
                <Sparkles size={23} />
              </div>
              <div>
                <h1
                  className={`font-display text-xl font-extrabold ${theme.heading}`}
                >
                  Nova AI
                </h1>
                <p className={`text-xs ${theme.muted}`}>Your AI workspace</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              className={`rounded-lg p-2 md:hidden ${theme.iconButton}`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-5 pb-5 pt-3">
            <button
              type="button"
              onClick={createNewChat}
              disabled={loading || chatsLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus size={19} />
              New conversation
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            <p
              className={`mb-3 px-2 text-[11px] font-bold uppercase tracking-[0.18em] ${theme.muted}`}
            >
              Conversations
            </p>

            <div className="relative mb-4">
              <Search
                size={17}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.muted}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search conversations..."
                className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 ${theme.input}`}
              />
            </div>

            {chatsLoading ? (
              <p className={`px-2 py-3 text-sm ${theme.muted}`}>
                Loading conversations...
              </p>
            ) : filteredConversations.length === 0 ? (
              <p className={`px-2 py-3 text-sm ${theme.muted}`}>
                No matching conversations.
              </p>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group flex items-center gap-1 rounded-xl transition ${
                      chat.id === activeChatId
                        ? dark
                          ? "bg-blue-950 text-blue-300"
                          : "bg-blue-50 text-blue-700"
                        : dark
                          ? "text-slate-300 hover:bg-slate-800"
                          : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {editingChatId === chat.id ? (
                      <form
                        className="flex min-w-0 flex-1 items-center gap-1 p-1"
                        onSubmit={(event) => {
                          event.preventDefault();
                          renameChat(chat.id);
                        }}
                      >
                        <input
                          autoFocus
                          maxLength={100}
                          value={editingTitle}
                          onChange={(event) =>
                            setEditingTitle(event.target.value)
                          }
                          className={`min-w-0 flex-1 rounded-lg border px-2 py-2 text-sm outline-none ${theme.input}`}
                          aria-label="New conversation title"
                        />
                        <button
                          type="submit"
                          title="Save title"
                          aria-label="Save title"
                          className="rounded-lg p-2 text-emerald-500 hover:bg-emerald-500/10"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          title="Cancel rename"
                          aria-label="Cancel rename"
                          onClick={() => {
                            setEditingChatId(null);
                            setEditingTitle("");
                          }}
                          className={`rounded-lg p-2 ${theme.iconButton}`}
                        >
                          <X size={16} />
                        </button>
                      </form>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => selectChat(chat.id)}
                          disabled={loading}
                          className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left text-sm disabled:opacity-60"
                        >
                          <MessageSquare size={17} className="shrink-0" />
                          <span className="truncate font-medium">
                            {chat.title}
                          </span>
                        </button>

                        <button
                          type="button"
                          title="Rename conversation"
                          aria-label={`Rename ${chat.title}`}
                          disabled={loading}
                          onClick={() => {
                            setEditingChatId(chat.id);
                            setEditingTitle(chat.title);
                          }}
                          className={`rounded-lg p-2 ${theme.iconButton} md:opacity-0 md:group-hover:opacity-100`}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          title="Delete conversation"
                          aria-label={`Delete ${chat.title}`}
                          disabled={loading}
                          onClick={() => removeChat(chat.id)}
                          className="mr-1 rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40 md:opacity-0 md:group-hover:opacity-100"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className={`border-t p-4 ${dark ? "border-slate-800" : "border-slate-100"}`}
          >
            <div
              className={`mb-3 flex items-center gap-3 rounded-xl p-3 ${dark ? "bg-slate-800" : "bg-slate-50"}`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${dark ? "bg-blue-950 text-blue-300" : "bg-blue-100 text-blue-700"}`}
              >
                <UserRound size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-semibold ${theme.heading}`}
                >
                  {currentUser.displayName || "Nova user"}
                </p>
                <p className={`truncate text-xs ${theme.muted}`}>
                  {currentUser.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50 ${theme.iconButton}`}
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </aside>

        <main
          className={`flex min-w-0 flex-1 flex-col ${dark ? "bg-slate-950" : "bg-white"}`}
        >
          <header
            className={`flex h-[68px] shrink-0 items-center justify-between gap-3 border-b px-4 sm:px-6 ${dark ? "border-slate-800 bg-slate-950" : "border-slate-100 bg-white"}`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                className={`rounded-xl p-2 md:hidden ${theme.iconButton}`}
              >
                <PanelLeft size={21} />
              </button>
              <button
                type="button"
                onClick={() => setSidebarCollapsed((previous) => !previous)}
                aria-label={
                  sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={`hidden rounded-lg p-2 transition md:block ${theme.iconButton}`}
              >
                {sidebarCollapsed ? (
                  <PanelLeft size={19} />
                ) : (
                  <PanelLeftClose size={19} />
                )}
              </button>
              <div className="min-w-0">
                <h2 className={`truncate text-sm font-bold ${theme.heading}`}>
                  {activeChat?.title || "New conversation"}
                </h2>
                <p className={`text-xs ${theme.muted}`}>Powered by Gemini</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setDarkMode((previous) => !previous)}
                title={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
                className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-sm transition ${
                  dark
                    ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span className="hidden sm:inline">
                  {darkMode ? "Light mode" : "Dark mode"}
                </span>
              </button>

              <div
                className={`hidden items-center gap-2 rounded-full border px-3 py-2 sm:flex ${
                  dark
                    ? "border-slate-700 bg-slate-900"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span
                  className={`text-xs font-medium ${dark ? "text-slate-300" : "text-slate-600"}`}
                >
                  AI Assistant
                </span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 py-6 sm:px-8 sm:py-9">
              {chatsLoading ? (
                <div
                  className={`flex flex-1 items-center justify-center text-sm ${theme.muted}`}
                >
                  <LoaderCircle size={20} className="mr-2 animate-spin" />
                  Loading your conversations...
                </div>
              ) : !activeChat?.messages.length ? (
                <div className="flex flex-1 flex-col justify-center py-8">
                  <div className="mx-auto w-full max-w-2xl">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/20">
                      <Sparkles size={28} />
                    </div>

                    <h2
                      className={`font-display text-3xl font-extrabold tracking-tight sm:text-4xl ${theme.heading}`}
                    >
                      What can I help you with?
                    </h2>
                    <p
                      className={`mt-3 max-w-xl text-sm leading-7 sm:text-base ${theme.muted}`}
                    >
                      Ask questions, explore ideas, learn something new, or work
                      through a problem with Nova AI.
                    </p>

                    <div className="mt-9 grid gap-3 sm:grid-cols-2">
                      {suggestions.map((suggestion) => (
                        <button
                          type="button"
                          key={suggestion.title}
                          onClick={() => sendMessage(suggestion.prompt)}
                          disabled={loading || chatsLoading}
                          className={`group rounded-2xl border p-4 text-left transition hover:border-blue-400 hover:shadow-md disabled:opacity-50 ${
                            dark
                              ? "border-slate-800 bg-slate-900 hover:bg-slate-800"
                              : "border-slate-200 bg-white hover:bg-blue-50/50"
                          }`}
                        >
                          <p
                            className={`text-sm font-bold group-hover:text-blue-500 ${theme.heading}`}
                          >
                            {suggestion.title}
                          </p>
                          <p
                            className={`mt-1.5 text-xs leading-5 ${theme.muted}`}
                          >
                            {suggestion.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-7">
                  {activeChat.messages.map((message, index) => (
                    <div
                      key={message.id || `${activeChat.id}-${index}`}
                      className={`flex gap-3 sm:gap-4 ${
                        message.role === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          message.role === "user"
                            ? dark
                              ? "bg-blue-950 text-blue-300"
                              : "bg-blue-100 text-blue-700"
                            : "bg-gradient-to-br from-blue-500 to-violet-600 text-white"
                        }`}
                      >
                        {message.role === "user" ? (
                          <UserRound size={19} />
                        ) : (
                          <Bot size={20} />
                        )}
                      </div>

                      <div
                        className={`min-w-0 max-w-[88%] rounded-2xl px-4 py-3.5 sm:max-w-[82%] ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : dark
                              ? "border border-slate-800 bg-slate-900 text-slate-200"
                              : "border border-slate-100 bg-slate-50 text-slate-800"
                        }`}
                      >
                        {message.text ? (
                          <MessageContent content={message.text} />
                        ) : loading &&
                          index === activeChat.messages.length - 1 ? (
                          <div
                            className={`flex items-center gap-2 text-sm ${theme.muted}`}
                          >
                            <LoaderCircle size={17} className="animate-spin" />
                            Thinking...
                          </div>
                        ) : (
                          <p className={`text-sm ${theme.muted}`}>
                            No response generated.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div aria-live="polite" className="h-1" />
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className={`mt-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${
                    dark
                      ? "border-red-900 bg-red-950/50 text-red-300"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <div className="flex-1 leading-6">{error}</div>
                  <button
                    type="button"
                    onClick={() => setError("")}
                    aria-label="Dismiss error"
                    className="rounded-lg p-1 hover:bg-red-500/10"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div
            className={`shrink-0 border-t px-4 pb-4 pt-4 sm:px-8 sm:pb-6 ${
              dark
                ? "border-slate-800 bg-slate-950"
                : "border-slate-100 bg-white"
            }`}
          >
            <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
              <div
                className={`rounded-2xl border p-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 ${
                  dark
                    ? "border-slate-700 bg-slate-900"
                    : "border-slate-200 bg-white"
                }`}
              >
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Message Nova AI..."
                  rows={2}
                  maxLength={10000}
                  disabled={loading || chatsLoading}
                  className={`max-h-40 min-h-[52px] w-full resize-y bg-transparent px-3 py-3 text-sm leading-6 outline-none disabled:opacity-60 ${
                    dark
                      ? "text-slate-100 placeholder:text-slate-500"
                      : "text-slate-800 placeholder:text-slate-400"
                  }`}
                />

                <div className="flex items-center justify-between px-2 pb-1">
                  <p className={`text-xs ${theme.muted}`}>
                    Shift + Enter for a new line
                  </p>
                  <button
                    type="submit"
                    disabled={loading || chatsLoading || !input.trim()}
                    aria-label="Send message"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
                  >
                    {loading ? (
                      <LoaderCircle size={19} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>

              <p
                className={`mt-3 text-center text-[11px] leading-5 ${theme.muted}`}
              >
                Nova AI can make mistakes. Verify important information.
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
