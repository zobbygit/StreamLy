import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SmilePlus,
  Pencil,
  Trash2,
  Check,
  X,
  FileText,
  Download,
} from "lucide-react";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export function Attachment({ a }) {
  if (a.type === "image") {
    return (
      <a href={a.url} target="_blank" rel="noreferrer" className="block mt-1.5">
        <img
          src={a.url}
          alt={a.name}
          className="max-w-[220px] max-h-[220px] rounded-xl object-cover border border-black/5"
        />
      </a>
    );
  }
  if (a.type === "video") {
    return (
      <video
        src={a.url}
        controls
        className="mt-1.5 max-w-[240px] rounded-xl border border-black/5"
      />
    );
  }
  if (a.type === "audio") {
    return (
      <audio src={a.url} controls className="mt-1.5 max-w-[240px] h-9" />
    );
  }
  return (
    <a
      href={a.url}
      target="_blank"
      rel="noreferrer"
      className="mt-1.5 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-black/10 transition-colors text-xs"
    >
      <FileText size={14} className="shrink-0" />
      <span className="truncate max-w-[160px]">{a.name}</span>
      <Download size={12} className="shrink-0 opacity-60" />
    </a>
  );
}

export default function MessageBubble({
  message,
  isSelf,
  currentUserId,
  onReact,
  onEdit,
  onDelete,
  showSenderName,
  senderName,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  // Aggregate raw reaction rows (one per user+emoji) into emoji -> count,
  // plus whether the current user is one of the reactors (for highlight).
  const reactionCounts = {};
  (message.reactions || []).forEach((r) => {
    if (!reactionCounts[r.emoji]) reactionCounts[r.emoji] = { count: 0, mine: false };
    reactionCounts[r.emoji].count += 1;
    if (r.userId === currentUserId || r.userId?._id === currentUserId) {
      reactionCounts[r.emoji].mine = true;
    }
  });

  const handleSaveEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== message.content) onEdit(message._id, trimmed);
    setEditing(false);
  };

  if (message.deleted) {
    return (
      <div className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
        <div className="max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm italic text-muted bg-black/[0.03] border border-black/5">
          Message deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex ${isSelf ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-end gap-1.5 max-w-[85%] sm:max-w-[70%] ${isSelf ? "flex-row-reverse" : ""}`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm relative ${
            isSelf
              ? "bg-streamly-gradient text-white rounded-br-sm shadow-md shadow-electric-blue/20"
              : "bg-black/5 text-ink rounded-bl-sm"
          }`}
        >
          {showSenderName && !isSelf && senderName && (
            <p className="text-[11px] font-semibold mb-0.5 opacity-70">{senderName}</p>
          )}

          {editing ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                className="bg-white/20 rounded-lg px-2 py-1 text-sm outline-none w-40"
              />
              <button onClick={handleSaveEdit} className="p-1 rounded hover:bg-white/20">
                <Check size={14} />
              </button>
              <button onClick={() => setEditing(false)} className="p-1 rounded hover:bg-white/20">
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
              {(message.attachments || []).map((a, i) => (
                <Attachment key={i} a={a} />
              ))}
              <p className={`text-[10px] mt-1 ${isSelf ? "text-white/70" : "text-muted"}`}>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {message.edited && " · edited"}
              </p>
            </>
          )}

          {/* Reaction pills */}
          {Object.keys(reactionCounts).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {Object.entries(reactionCounts).map(([emoji, info]) => (
                <button
                  key={emoji}
                  onClick={() => onReact(message._id, emoji)}
                  className={`text-xs px-1.5 py-0.5 rounded-full border transition-colors ${
                    info.mine
                      ? "bg-white/25 border-white/40"
                      : "bg-black/5 border-black/10 hover:bg-black/10"
                  }`}
                >
                  {emoji} {info.count}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hover actions: react / edit / delete */}
        {!editing && (
        <div className="relative flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
  {/* Always visible on touch devices (below sm) since CSS :hover
      never fires on tap — only fades in on hover for mouse/desktop. */}
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="p-1.5 rounded-full hover:bg-black/5 text-muted"
              title="React"
            >
              <SmilePlus size={14} />
            </button>
            {isSelf && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 rounded-full hover:bg-black/5 text-muted"
                  title="Edit"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => onDelete(message._id)}
                  className="p-1.5 rounded-full hover:bg-red-50 text-red-400"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}

            <AnimatePresence>
              {pickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  className={`absolute bottom-full mb-1 ${isSelf ? "right-0" : "left-0"} flex gap-1 px-2 py-1.5 rounded-full bg-white shadow-lg border border-line z-10`}
                >
                  {QUICK_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => {
                        onReact(message._id, e);
                        setPickerOpen(false);
                      }}
                      className="text-base hover:scale-125 transition-transform"
                    >
                      {e}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}