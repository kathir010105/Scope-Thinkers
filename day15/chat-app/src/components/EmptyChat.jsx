import { MessageCircle } from "lucide-react";

function EmptyChat() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#F8FAFE]">
      <div className="text-center max-w-sm px-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#C7DBF7] flex items-center justify-center">
          <MessageCircle size={30} className="text-[#75708C]" />
        </div>

        <h2 className="mt-5 text-xl font-bold text-[#010101]">
          Welcome to Chatter
        </h2>

        <p className="mt-2 text-sm text-[#75708C] leading-6">
          Select a conversation from the sidebar or search for someone by their
          username to start chatting.
        </p>
      </div>
    </div>
  );
}

export default EmptyChat;
