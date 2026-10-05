import { Search, Settings, LogOut, UserCircle, X } from "lucide-react";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  searchUserByUsername,
  createOrGetChat,
  subscribeToUserChats,
  getUserById,
} from "../firebase/firestore";

import { logoutUser } from "../firebase/auth";

import { setActiveChat } from "../redux/slices/chatSlice";

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);

  // ==========================================
  // FORMAT CHAT TIME
  // ==========================================

  const formatChatTime = (timestamp) => {
    if (!timestamp) {
      return "";
    }

    const messageDate = new Date(timestamp);
    const now = new Date();

    const isToday =
      messageDate.getDate() === now.getDate() &&
      messageDate.getMonth() === now.getMonth() &&
      messageDate.getFullYear() === now.getFullYear();

    if (isToday) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isYesterday =
      messageDate.getDate() === yesterday.getDate() &&
      messageDate.getMonth() === yesterday.getMonth() &&
      messageDate.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return "Yesterday";
    }

    return messageDate.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
    });
  };

  // ==========================================
  // LOAD REAL CHATS
  // ==========================================

  useEffect(() => {
    if (!user?.uid) {
      setChats([]);
      return;
    }

    setLoadingChats(true);

    const unsubscribe = subscribeToUserChats(
      user.uid,

      async (userChats) => {
        try {
          const chatsWithUsers = await Promise.all(
            userChats.map(async (chat) => {
              // Don't show empty conversations
              if (!chat.lastMessage?.trim()) {
                return null;
              }

              const otherUserId = chat.participants?.find(
                (participantId) => participantId !== user.uid,
              );

              if (!otherUserId) {
                return null;
              }

              const otherUser = await getUserById(otherUserId);

              if (!otherUser) {
                return null;
              }

              return {
                ...chat,
                otherUser,
              };
            }),
          );

          const validChats = chatsWithUsers.filter(Boolean);

          // Newest message first
          validChats.sort(
            (a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0),
          );

          setChats(validChats);
        } catch (error) {
          console.error("Failed to process chat updates:", error);
        } finally {
          setLoadingChats(false);
        }
      },

      (error) => {
        console.error("Failed to listen for chats:", error);

        setLoadingChats(false);
      },
    );

    return () => {
      console.log("Unsubscribing from chat updates");
      unsubscribe();
    };
  }, [user?.uid]);

  /*
 * =====================================================
 * AUTO SCROLL TO LATEST MESSAGE
 * =====================================================
 */



  // ==========================================
  // SEARCH USER
  // ==========================================

  const handleSearch = async (e) => {
    e.preventDefault();

    const username = search.trim();

    if (!username) {
      setSearchResult(null);
      setSearchError("");
      return;
    }

    setSearching(true);
    setSearchError("");
    setSearchResult(null);

    try {
      const result = await searchUserByUsername(username);

      if (!result) {
        setSearchError("No user found with that username.");
        return;
      }

      // Don't allow searching yourself
      if (result.uid === user?.uid) {
        setSearchError("That's your own username.");
        return;
      }

      setSearchResult(result);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchError("Unable to search right now.");
    } finally {
      setSearching(false);
    }
  };

  // ==========================================
  // OPEN CHAT FROM SEARCH
  // ==========================================

  const handleOpenChat = async (selectedUser) => {
    try {
      if (!user?.uid || !selectedUser?.uid) {
        return;
      }

      console.log("Opening chat with:", selectedUser);

      const chat = await createOrGetChat(user.uid, selectedUser.uid);

      console.log("Chat created/found:", chat);

      const serializableChat = {
        ...chat,

        createdAt: chat.createdAt?.toMillis
          ? chat.createdAt.toMillis()
          : chat.createdAt,

        updatedAt: chat.updatedAt?.toMillis
          ? chat.updatedAt.toMillis()
          : chat.updatedAt,

        otherUser: selectedUser,
      };

      dispatch(setActiveChat(serializableChat));

      // Clear search
      setSearch("");
      setSearchResult(null);
      setSearchError("");
    } catch (error) {
      console.error("Failed to open chat:", error);

      setSearchError("Unable to open chat right now.");
    }
  };

  // ==========================================
  // OPEN EXISTING CHAT
  // ==========================================

  const handleOpenExistingChat = (chat) => {
    if (!chat?.otherUser) {
      return;
    }

    const serializableChat = {
      ...chat,

      createdAt: chat.createdAt?.toMillis
        ? chat.createdAt.toMillis()
        : chat.createdAt,

      lastMessageAt: chat.lastMessageAt?.toMillis
        ? chat.lastMessageAt.toMillis()
        : chat.lastMessageAt,

      otherUser: chat.otherUser,
    };

    dispatch(setActiveChat(serializableChat));
  };

  // ==========================================
  // CLEAR SEARCH
  // ==========================================

  const clearSearch = () => {
    setSearch("");
    setSearchResult(null);
    setSearchError("");
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    try {
      await logoutUser();

      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside
      className="
        w-full
        md:w-[340px]
        lg:w-[380px]
        h-full
        bg-white
        border-r
        border-[#BFC7DE]
        flex
        flex-col
      "
    >
      {/* =================================
          HEADER
      ================================= */}

      <div className="p-5 border-b border-[#BFC7DE]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#010101]">Chatter</h1>

            <p className="text-xs text-[#75708C] mt-1">Messages</p>
          </div>

          <div
            className="
              w-10
              h-10
              rounded-xl
              bg-[#C7DBF7]
              flex
              items-center
              justify-center
            "
          >
            <UserCircle size={22} className="text-[#75708C]" />
          </div>
        </div>

        {/* =================================
            SEARCH
        ================================= */}

        <form onSubmit={handleSearch} className="relative mt-5">
          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-[#75708C]
            "
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username..."
            className="
              w-full
              h-11
              pl-11
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

          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                w-7
                h-7
                rounded-lg
                flex
                items-center
                justify-center
                hover:bg-[#C7DBF7]
              "
            >
              <X size={15} />
            </button>
          )}
        </form>
      </div>

      {/* =================================
          SEARCH RESULTS
      ================================= */}

      {search && (
        <div className="px-4 pt-4">
          {searching && (
            <div className="px-3 py-4 text-sm text-[#75708C]">Searching...</div>
          )}

          {searchError && !searching && (
            <div className="px-3 py-4 rounded-xl bg-[#C59594]/20">
              <p className="text-sm text-[#010101]">{searchError}</p>
            </div>
          )}

          {searchResult && !searching && (
            <button
              type="button"
              onClick={() => handleOpenChat(searchResult)}
              className="
                w-full
                p-3
                rounded-xl
                bg-[#C7DBF7]/50
                hover:bg-[#C7DBF7]
                transition
                flex
                items-center
                gap-3
                text-left
              "
            >
              <div
                className="
                  w-11
                  h-11
                  shrink-0
                  rounded-full
                  bg-[#75708C]
                  text-white
                  flex
                  items-center
                  justify-center
                "
              >
                {searchResult.displayName?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">
                  {searchResult.displayName}
                </p>

                <p className="text-xs text-[#75708C] truncate">
                  @{searchResult.username}
                </p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* =================================
          REAL CONVERSATIONS
      ================================= */}

      <div className="flex-1 overflow-y-auto">
        {!search && (
          <>
            <div className="px-5 pt-5 pb-2">
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-[#75708C]
                "
              >
                Conversations
              </p>
            </div>

{loadingChats ? (
  <div className="px-5 py-6 text-sm text-[#75708C]">
    Loading conversations...
  </div>
) : chats.length === 0 ? (
  <div className="px-5 py-10 text-center">
    <p className="text-sm font-medium text-[#010101]">
      No conversations yet
    </p>

    <p className="text-xs text-[#75708C] mt-1">
      Search for a username to start chatting.
    </p>
  </div>
) : (
  chats.map((chat) => (
    <button
      key={chat.id}
      onClick={() => {
        dispatch(
          setActiveChat({
            ...chat,
            otherUser: chat.otherUser,
          }),
        );
      }}
      className="
        w-full
        px-5
        py-3
        flex
        items-center
        gap-3
        text-left
        hover:bg-[#C7DBF7]/40
        transition
      "
    >
      {/* Avatar */}

      <div
        className="
          w-12
          h-12
          shrink-0
          rounded-full
          bg-[#BFC7DE]
          flex
          items-center
          justify-center
        "
      >
        {chat.otherUser?.photoURL ? (
          <img
            src={chat.otherUser.photoURL}
            alt={chat.otherUser.displayName}
            className="
              w-full
              h-full
              rounded-full
              object-cover
            "
          />
        ) : (
          <span className="font-semibold text-[#010101]">
            {chat.otherUser?.displayName
              ?.charAt(0)
              .toUpperCase() || "U"}
          </span>
        )}
      </div>

      {/* Chat information */}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm truncate">
            {chat.otherUser?.displayName ||
              chat.otherUser?.username ||
              "User"}
          </h3>

          <span className="text-[11px] text-[#75708C] shrink-0">
            {chat.lastMessageAt
              ? new Date(
                  chat.lastMessageAt,
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>

        <p className="text-xs text-[#75708C] truncate mt-1">
          {chat.lastMessage}
        </p>
      </div>
    </button>
  ))
)}
          </>
        )}
      </div>

      {/* =================================
          BOTTOM USER SECTION
      ================================= */}

      <div className="p-4 border-t border-[#BFC7DE]">
        <div className="flex items-center gap-3">
          <div
            className="
              w-10
              h-10
              rounded-full
              bg-[#C59594]
              flex
              items-center
              justify-center
            "
          >
            <span className="font-semibold">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {user?.email || "User"}
            </p>

            <p className="text-xs text-[#75708C]">Online</p>
          </div>

          <button
            className="
              w-9
              h-9
              rounded-lg
              hover:bg-[#C7DBF7]
              flex
              items-center
              justify-center
            "
            title="Settings"
          >
            <Settings size={18} />
          </button>

          <button
            onClick={handleLogout}
            className="
              w-9
              h-9
              rounded-lg
              hover:bg-[#C7DBF7]
              flex
              items-center
              justify-center
            "
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
