import { useSelector } from "react-redux";
import { useEffect } from "react";

import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

function ChatApp() {
  const { user, authLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("ChatApp render:", { user: user?.uid, authLoading });
  }, [user, authLoading]);

  return (
    <div className="h-screen bg-[#C7DBF7] p-0 md:p-3">
      <div className="h-full w-full max-w-[1600px] mx-auto overflow-hidden bg-white md:rounded-2xl md:shadow-xl flex">
        <Sidebar />

        <ChatWindow />
      </div>
    </div>
  );
}

export default ChatApp;
