import { AnimatePresence, motion } from "framer-motion";
import {
  VideoOff as CamOffIcon,
  Crown,
  Mic,
  MicOff,
  MicOff as MuteAllIcon,
  User,
  UserX,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { useState } from "react";

export default function ParticipantsSidebar({
  open,
  onClose,
  participants,
  isHost,
  onMuteAll,
  onCameraOffAll,
  onRemoveParticipant,
}) {
  const [confirmRemove, setConfirmRemove] = useState(null); // participant object awaiting confirmation

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          className="fixed right-0 top-0 bottom-0 w-full sm:w-[340px] z-40 glass-panel bg-white/90 border-l border-line flex flex-col"
        >
          <div className="flex items-center justify-between px-4 h-14 border-b border-line/60 shrink-0">
            <h3 className="font-semibold text-ink">
              Participants ({participants.length})
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/5"
            >
              <X size={18} className="text-muted" />
            </button>
          </div>

          {/* Host controls — hidden entirely for non-hosts. The server also
              independently verifies host status before acting on these, so
              this is a convenience UI, not the actual enforcement point. */}
          {isHost && (
            <div className="flex items-center gap-2 px-4 py-3 border-b border-line/60 shrink-0">
              <button
                onClick={onMuteAll}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-line text-xs font-medium text-ink hover:bg-black/5 transition-colors"
              >
                <MuteAllIcon size={13} /> Mute all
              </button>
              <button
                onClick={onCameraOffAll}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-line text-xs font-medium text-ink hover:bg-black/5 transition-colors"
              >
                <CamOffIcon size={13} /> Cameras off
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {participants.map((p) => (
              <div
                key={p.socketId || p.userId}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-black/5"
              >
                <div className="relative h-9 w-9 rounded-full bg-electric-blue/10 flex items-center justify-center overflow-hidden shrink-0">
                  {p.avatar ? (
                    <img
                      src={p.avatar}
                      className="h-full w-full object-cover"
                      alt={p.name}
                    />
                  ) : (
                    <User size={16} className="text-electric-blue" />
                  )}
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-400 border border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate flex items-center gap-1">
                    {p.name} {p.isSelf && "(You)"}
                    {p.isHost && <Crown size={12} className="text-cyan" />}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {p.micOn ? (
                    <Mic size={14} className="text-muted" />
                  ) : (
                    <MicOff size={14} className="text-red-500" />
                  )}
                  {p.cameraOn ? (
                    <Video size={14} className="text-muted" />
                  ) : (
                    <VideoOff size={14} className="text-red-500" />
                  )}
                  {isHost && !p.isSelf && (
                    <button
                      onClick={() => setConfirmRemove(p)}
                      title="Remove from meeting"
                      className="p-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <UserX size={14} className="text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Confirm-remove modal — a destructive action deserves one extra step */}
          <AnimatePresence>
            {confirmRemove && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 px-6"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl"
                >
                  <p className="text-sm text-ink mb-4">
                    Remove{" "}
                    <span className="font-semibold">{confirmRemove.name}</span>{" "}
                    from this meeting?
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setConfirmRemove(null)}
                      className="px-3.5 py-2 rounded-xl text-sm text-muted hover:bg-black/5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onRemoveParticipant(confirmRemove.socketId);
                        setConfirmRemove(null);
                      }}
                      className="px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
