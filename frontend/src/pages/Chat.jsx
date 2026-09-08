import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, ArrowLeft, Users, UserPlus, X, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import GlassCard from "../components/GlassCard.jsx";
import MessageBubble from "../components/MessageBubble.jsx";
import ChatComposer from "../components/ChatComposer.jsx";
import api from "../lib/api";
import { getSocket } from "../lib/socket";
import { useAuth } from "../context/AuthContext.jsx";

function NewGroupModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]); // array of user objects
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = async (q) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await api.get(`/users/search?email=${encodeURIComponent(q)}`);
      setResults(data.users.filter((u) => !selected.some((s) => s._id === u._id)));
    } finally {
      setSearching(false);
    }
  };

  const toggleUser = (u) => {
    setSelected((prev) =>
      prev.some((s) => s._id === u._id) ? prev.filter((s) => s._id !== u._id) : [...prev, u]
    );
    setResults((prev) => prev.filter((r) => r._id !== u._id));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please name your group.");
      return;
    }
    if (selected.length === 0) {
      toast.error("Add at least one member.");
      return;
    }
    setCreating(true);
    try {
      const { data } = await api.post("/chat/groups", {
        name: name.trim(),
        participantIds: selected.map((u) => u._id),
      });
      onCreated(data.conversation);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not create group.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink">New group</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5">
            <X size={16} className="text-muted" />
          </button>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-electric-blue mb-3"
        />

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selected.map((u) => (
              <span
                key={u._id}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-electric-blue/10 text-electric-blue text-xs"
              >
                {u.name}
                <button onClick={() => toggleUser(u)}>
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative mb-2">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search people by email..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-line text-sm outline-none focus:border-electric-blue"
          />
        </div>

        {query && (
          <div className="max-h-40 overflow-y-auto rounded-xl border border-line/60 mb-3">
            {searching && <p className="text-xs text-muted p-3">Searching...</p>}
            {!searching && results.length === 0 && (
              <p className="text-xs text-muted p-3">No matching users.</p>
            )}
            {results.map((u) => (
              <button
                key={u._id}
                onClick={() => toggleUser(u)}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-black/5 text-left"
              >
                <div className="h-7 w-7 rounded-full bg-electric-blue/10 flex items-center justify-center overflow-hidden shrink-0">
                  {u.avatar ? <img src={u.avatar} className="h-full w-full object-cover" alt="" /> : <User size={12} className="text-electric-blue" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{u.name}</p>
                  <p className="text-xs text-muted truncate">{u.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={creating}
          className="w-full py-2.5 rounded-xl bg-streamly-gradient text-white text-sm font-semibold shadow-md shadow-electric-blue/20 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {creating && <Loader2 size={14} className="animate-spin" />}
          Create group
        </button>
      </motion.div>
    </div>
  );
}

function ConfirmDeleteConversationModal({ label, onCancel, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
               className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-xs p-5"
      >
        <p className="text-sm text-ink mb-1.5 font-semibold">Delete conversation?</p>
        <p className="text-sm text-muted mb-5">
          This removes <span className="font-medium text-ink">{label}</span> from your
          inbox. It won't be deleted for other participants, and it'll reappear here if they
          message you again.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl text-sm text-muted hover:bg-black/5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-70 flex items-center gap-1.5"
          >
            {deleting && <Loader2 size={14} className="animate-spin" />}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // conversation object pending delete confirm
  const [deletingConvo, setDeletingConvo] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // userId -> true
  const [msgSearchOpen, setMsgSearchOpen] = useState(false);
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [msgSearchResults, setMsgSearchResults] = useState([]);
  const [msgSearching, setMsgSearching] = useState(false);
  const bottomRef = useRef(null);
  const socket = getSocket();

  const loadConversations = useCallback(async () => {
    const { data } = await api.get("/chat/conversations");
    setConversations(data.conversations);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const handleIncoming = (message) => {
      if (active && message.conversationId === active.conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };
    const handleNotification = () => loadConversations();
    const handleTyping = ({ conversationId, userId: typerId, isTyping }) => {
      if (!active || conversationId !== active.conversationId || typerId === user.id) return;
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (isTyping) next[typerId] = true;
        else delete next[typerId];
        return next;
      });
    };
    const handleReactionUpdate = ({ messageId, reactions }) => {
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, reactions } : m)));
    };
    const handleMessageUpdated = ({ messageId, content, edited }) => {
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, content, edited } : m)));
    };
    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, deleted: true } : m)));
    };

    socket.on("chat:message", handleIncoming);
    socket.on("chat:notification", handleNotification);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:reaction-update", handleReactionUpdate);
    socket.on("chat:message-updated", handleMessageUpdated);
    socket.on("chat:message-deleted", handleMessageDeleted);
    return () => {
      socket.off("chat:message", handleIncoming);
      socket.off("chat:notification", handleNotification);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:reaction-update", handleReactionUpdate);
      socket.off("chat:message-updated", handleMessageUpdated);
      socket.off("chat:message-deleted", handleMessageDeleted);
    };
  }, [active, loadConversations, socket, user.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleSearch = async (q) => {
    setSearch(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await api.get(`/users/search?email=${encodeURIComponent(q)}`);
      setResults(data.users);
    } finally {
      setSearching(false);
    }
  };

  const openConversationWithUser = async (otherUser) => {
    try {
      const { data } = await api.post("/chat/conversations", { userId: otherUser._id });
      const conv = {
        conversationId: data.conversation._id,
        isGroup: false,
        user: otherUser,
        lastMessage: "",
        unreadCount: 0,
      };
      setActive(conv);
      setMobileShowThread(true);
      setResults([]);
      setSearch("");
      socket.emit("chat:join", { conversationId: conv.conversationId });
      const msgs = await api.get(`/chat/conversations/${conv.conversationId}/messages`);
      setMessages(msgs.data.messages);
      loadConversations();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not start conversation.");
    }
  };

  const openExisting = async (conv) => {
    setActive(conv);
    setMobileShowThread(true);
    setTypingUsers({});
    socket.emit("chat:join", { conversationId: conv.conversationId });
    const { data } = await api.get(`/chat/conversations/${conv.conversationId}/messages`);
    setMessages(data.messages);
    loadConversations();
  };

  const handleGroupCreated = (conversation) => {
    setGroupModalOpen(false);
    toast.success("Group created!");
    const conv = {
      conversationId: conversation._id,
      isGroup: true,
      name: conversation.name,
      participants: conversation.participants,
      lastMessage: "",
      unreadCount: 0,
    };
    setActive(conv);
    setMobileShowThread(true);
    socket.emit("chat:join", { conversationId: conv.conversationId });
    setMessages([]);
    loadConversations();
  };

  const handleSend = ({ content, attachments }) => {
    if (!active) return;
    socket.emit(
      "chat:message",
      {
        conversationId: active.conversationId,
        receiverId: active.isGroup ? null : active.user._id,
        content,
        attachments,
      },
      (response) => {
        // The message itself arrives separately via the "chat:message"
        // broadcast (handled above) — this callback exists purely so a
        // real failure (bad conversation, server error, etc.) surfaces
        // immediately instead of silently vanishing.
        if (response && response.success === false) {
          toast.error(response.message || "Failed to send message.");
        }
      }
    );
  };

  const handleTypingChange = (isTyping) => {
    if (!active) return;
    socket.emit("chat:typing", { conversationId: active.conversationId, isTyping });
  };

  const handleReact = (messageId, emoji) =>
    socket.emit("chat:react", { messageId, emoji }, (response) => {
      if (response && response.success === false) {
        toast.error(response.message || "Failed to react to message.");
      }
    });

  const handleEditMessage = (messageId, content) =>
    socket.emit("chat:edit-message", { messageId, content }, (response) => {
      if (response && response.success === false) {
        toast.error(response.message || "Failed to edit message.");
      }
    });

  const handleDeleteMessage = (messageId) =>
    socket.emit("chat:delete-message", { messageId }, (response) => {
      if (response && response.success === false) {
        toast.error(response.message || "Failed to delete message.");
      }
    });

  const handleMessageSearch = async (q) => {
    setMsgSearchQuery(q);
    if (!q.trim()) {
      setMsgSearchResults([]);
      return;
    }
    setMsgSearching(true);
    try {
      const { data } = await api.get(`/chat/search?q=${encodeURIComponent(q)}`);
      setMsgSearchResults(data.messages);
    } finally {
      setMsgSearching(false);
    }
  };

  const openFromSearchResult = (result) => {
    const conv = conversations.find((c) => c.conversationId === result.conversationId);
    setMsgSearchOpen(false);
    setMsgSearchQuery("");
    setMsgSearchResults([]);
    if (conv) openExisting(conv);
    else toast("Open that conversation from the list to see it in context.");
  };

  const conversationLabel = (c) => (c.isGroup ? c.name : c.user?.name);

  const handleDeleteConversation = async () => {
    if (!deleteTarget) return;
    setDeletingConvo(true);
    try {
      await api.delete(`/chat/conversations/${deleteTarget.conversationId}`);
      // Update the list immediately rather than waiting on a refetch.
      setConversations((prev) =>
        prev.filter((c) => c.conversationId !== deleteTarget.conversationId)
      );
      if (active?.conversationId === deleteTarget.conversationId) {
        setActive(null);
        setMessages([]);
        setMobileShowThread(false);
      }
      toast.success("Conversation deleted.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not delete conversation.");
    } finally {
      setDeletingConvo(false);
    }
  };

  // Group messages don't carry a sender name from the server — derive it
  // from the group's already-populated participant list instead.
  const getSenderName = (senderId) => {
    if (!active?.isGroup) return undefined;
    const participant = active.participants?.find((p) => p._id === senderId);
    return participant?.name;
  };

  const typingLabel = () => {
    const ids = Object.keys(typingUsers);
    if (ids.length === 0) return null;
    if (!active?.isGroup) return `${active?.user?.name || "They"} is typing...`;
    return "Someone is typing...";
  };

  return (
    <div className="streamly-bg min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-0 sm:px-4 md:px-6 py-0 sm:py-8">
        <div className="grid md:grid-cols-[320px,1fr] gap-0 sm:gap-5 h-[calc(100vh-64px)] sm:h-[calc(100vh-160px)]">
          {/* Sidebar */}
          <div
            className={`${
              mobileShowThread ? "hidden md:flex" : "flex"
                       } flex-col overflow-hidden sm:rounded-2xl sm:glass-panel sm:shadow-glass bg-white/70 sm:bg-white/65 dark:bg-slate-900/70 sm:dark:bg-slate-900/65 h-full`}
          >
            <div className="p-3 sm:p-4 border-b border-line/40 sm:border-none space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-8 pr-3 py-2 sm:py-2.5 rounded-xl border border-line text-xs sm:text-sm outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/15 transition-all"
                  />
                </div>
                <button
                  onClick={() => setGroupModalOpen(true)}
                  title="New group"
                  className="h-9 w-9 rounded-xl border border-line flex items-center justify-center text-muted hover:bg-black/5 shrink-0"
                >
                  <UserPlus size={15} />
                </button>
                <button
                  onClick={() => setMsgSearchOpen((v) => !v)}
                  title="Search messages"
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                    msgSearchOpen ? "bg-electric-blue text-white border-electric-blue" : "border-line text-muted hover:bg-black/5"
                  }`}
                >
                  <Search size={15} />
                </button>
              </div>

              {msgSearchOpen && (
                <div>
                  <input
                    value={msgSearchQuery}
                    onChange={(e) => handleMessageSearch(e.target.value)}
                    placeholder="Search your message history..."
                    className="w-full px-3 py-2 rounded-xl border border-line text-sm outline-none focus:border-electric-blue"
                  />
                  {msgSearchQuery && (
                                      <div className="mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-line/60 bg-white dark:bg-slate-900">
                      {msgSearching && <p className="text-xs text-muted p-3">Searching...</p>}
                      {!msgSearching && msgSearchResults.length === 0 && (
                        <p className="text-xs text-muted p-3">No messages found.</p>
                      )}
                      {msgSearchResults.map((r) => (
                        <button
                          key={r._id}
                          onClick={() => openFromSearchResult(r)}
                          className="w-full text-left px-3 py-2 hover:bg-black/5 border-b border-line/30 last:border-none"
                        >
                          <p className="text-xs font-medium text-ink">{r.senderName}</p>
                          <p className="text-xs text-muted truncate">{r.content}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {search && (
                <div className="max-h-52 overflow-y-auto rounded-xl border border-line/60">
                  {searching && <p className="text-xs text-muted p-3">Searching...</p>}
                  {!searching && results.length === 0 && (
                    <p className="text-xs text-muted p-3">No matching users.</p>
                  )}
                  {results.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => openConversationWithUser(u)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-black/5 text-left transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-electric-blue/10 flex items-center justify-center overflow-hidden shrink-0">
                        {u.avatar ? (
                          <img src={u.avatar} className="h-full w-full object-cover" alt="" />
                        ) : (
                          <User size={14} className="text-electric-blue" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{u.name}</p>
                        <p className="text-xs text-muted truncate">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
              {conversations.length === 0 && !search && (
                <p className="text-sm text-muted text-center mt-10 px-4">No conversations yet</p>
              )}
              {conversations.map((c) => (
                <div
                  key={c.conversationId}
                  role="button"
                  tabIndex={0}
                  onClick={() => openExisting(c)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openExisting(c)}
                  className={`group w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    active?.conversationId === c.conversationId
                      ? "bg-gradient-to-r from-electric-blue/10 to-cyan/10"
                      : "hover:bg-black/5"
                  }`}
                >
                  <div className="relative h-10 w-10 sm:h-9 sm:w-9 rounded-full bg-electric-blue/10 flex items-center justify-center overflow-hidden shrink-0">
                    {c.isGroup ? (
                      <Users size={15} className="text-electric-blue" />
                    ) : c.user?.avatar ? (
                      <img src={c.user.avatar} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <User size={14} className="text-electric-blue" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{conversationLabel(c)}</p>
                    <p className="text-xs text-muted truncate">{c.lastMessage || "Say hello 👋"}</p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="h-5 min-w-5 px-1 rounded-full bg-gradient-to-br from-cyan to-violet text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {c.unreadCount}
                    </span>
                  )}
                  {/* Always visible (not hover-gated) so it works identically
                      on mobile/touch and desktop. */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(c);
                    }}
                    title="Delete conversation"
                    className="h-7 w-7 rounded-full flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

          </div>

          {/* Thread */}
          <div
            className={`${
              mobileShowThread ? "flex" : "hidden md:flex"
                        } flex-col overflow-hidden sm:rounded-2xl sm:glass-panel sm:shadow-glass bg-white/70 dark:bg-slate-900/70 h-full`}
          >
            {!active ? (
              <div className="flex-1 flex items-center justify-center text-muted text-sm px-6 text-center">
                Select a conversation or search for a user to begin chatting.
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 h-14 sm:h-16 border-b border-line/60 shrink-0">
                  <button
                    onClick={() => setMobileShowThread(false)}
                    className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-black/5"
                  >
                    <ArrowLeft size={18} className="text-muted" />
                  </button>
                  <div className="h-9 w-9 rounded-full bg-electric-blue/10 flex items-center justify-center overflow-hidden shrink-0">
                    {active.isGroup ? (
                      <Users size={15} className="text-electric-blue" />
                    ) : active.user?.avatar ? (
                      <img src={active.user.avatar} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <User size={14} className="text-electric-blue" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink text-sm truncate">{conversationLabel(active)}</p>
                    <p className="text-xs text-muted truncate">
                      {active.isGroup ? `${active.participants?.length || ""} members` : active.user?.email}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-sm text-muted text-center mt-10">No messages yet</p>
                  )}
                  {messages.map((m) => (
                    <MessageBubble
                      key={m._id}
                      message={m}
                      isSelf={m.senderId === user.id}
                      currentUserId={user.id}
                      showSenderName={active.isGroup}
                      senderName={getSenderName(m.senderId)}
                      onReact={handleReact}
                      onEdit={handleEditMessage}
                      onDelete={handleDeleteMessage}
                    />
                  ))}
                  {typingLabel() && (
                    <p className="text-xs text-muted italic px-1">{typingLabel()}</p>
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="p-3 sm:p-4 border-t border-line/60 shrink-0">
                  <ChatComposer onSend={handleSend} onTyping={handleTypingChange} />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {groupModalOpen && (
          <NewGroupModal onClose={() => setGroupModalOpen(false)} onCreated={handleGroupCreated} />
        )}
        {deleteTarget && (
          <ConfirmDeleteConversationModal
            label={conversationLabel(deleteTarget)}
            deleting={deletingConvo}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDeleteConversation}
          />
        )}
      </AnimatePresence>
    </div>
  );
}