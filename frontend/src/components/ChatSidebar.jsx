import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import ChatComposer from "./ChatComposer.jsx";
import { Attachment } from "./MessageBubble.jsx";

export default function ChatSidebar({
  open,
  onClose,
  messages,
  onSend,
  currentUserId,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          className="fixed right-0 top-0 bottom-0 w-full sm:w-[360px] z-40 glass-panel bg-white/90 border-l border-line flex flex-col"
        >
          <div className="flex items-center justify-between px-4 h-14 border-b border-line/60 shrink-0">
            <h3 className="font-semibold text-ink">Meeting chat</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/5"
            >
              <X size={18} className="text-muted" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-muted text-center mt-10">
                No messages yet
              </p>
            )}
            {messages.map((m) => {
              const isSelf = m.senderId === currentUserId;
              return (
                <div
                  key={m._id || m.tempId}
                  className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      isSelf
                        ? "bg-streamly-gradient text-white rounded-br-sm shadow-md shadow-electric-blue/20"
                        : "bg-black/5 text-ink rounded-bl-sm"
                    }`}
                  >
                    {!isSelf && (
                      <p className="text-[11px] font-semibold mb-0.5 opacity-70">
                        {m.senderName}
                      </p>
                    )}
                    {m.content && (
                      <p className="whitespace-pre-wrap break-words">
                        {m.content}
                      </p>
                    )}
                    {(m.attachments || []).map((a, i) => (
                      <Attachment key={i} a={a} />
                    ))}
                    <p
                      className={`text-[10px] mt-1 ${isSelf ? "text-white/70" : "text-muted"}`}
                    >
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-line/60 shrink-0">
            <ChatComposer onSend={onSend} />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
