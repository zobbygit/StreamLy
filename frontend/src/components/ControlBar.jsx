import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Users,
  ScreenShare,
  Link2,
  PhoneOff,
  LogOut,
  MoreHorizontal,
  Sparkles,
  Hand,
  X,
} from "lucide-react";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "👏", "🎉"];

function ControlButton({ onClick, active, icon: Icon, label, disabled }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`relative h-11 w-11 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-40 shrink-0 ${
        active
          ? "bg-white/[0.08] hover:bg-white/[0.18] active:bg-white/[0.24] text-white border border-white/15 hover:border-white/25"
          : "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-600 hover:shadow-lg hover:shadow-red-500/30 text-white"
      }`}
    >
      <Icon size={17} strokeWidth={2.25} />
    </motion.button>
  );
}

export default function ControlBar({
  micOn,
  cameraOn,
  onToggleMic,
  onToggleCamera,
  onToggleChat,
  onToggleParticipants,
  onScreenShare,
  isScreenSharing,
  onCopyLink,
  isHost,
  onLeave,
  onEndMeeting,
  bgBlurOn,
  onToggleBlur,
  handRaised,
  onToggleHandRaise,
  onSendReaction,
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    // IMPORTANT: centering lives on this plain (non-animated) wrapper via
    // inset-x-0 + flex justify-center — NOT via left-1/2 + -translate-x-1/2
    // on the motion.div below. Framer Motion writes its own inline
    // `transform` style onto whatever element it animates, and that inline
    // style silently overrides any Tailwind transform-based centering
    // (translate-x) placed on the SAME element — which is what was pushing
    // this bar off-center/off-screen on mobile. Keeping the animation and
    // the centering on two different elements avoids that conflict entirely.
    <div className="fixed bottom-3 sm:bottom-5 inset-x-0 z-30 flex justify-center px-2 pointer-events-none">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        className="pointer-events-auto relative flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-3xl sm:rounded-2xl bg-midnight-navy/90 border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-xl max-w-[calc(100vw-1rem)] sm:max-w-none"
      >
        <ControlButton
          onClick={onToggleMic}
          active={micOn}
          icon={micOn ? Mic : MicOff}
          label={micOn ? "Mute" : "Unmute"}
        />
        <ControlButton
          onClick={onToggleCamera}
          active={cameraOn}
          icon={cameraOn ? Video : VideoOff}
          label={cameraOn ? "Turn off camera" : "Turn on camera"}
        />
        <ControlButton
          onClick={onScreenShare}
          active={!isScreenSharing}
          icon={ScreenShare}
          label={isScreenSharing ? "Stop sharing" : "Share screen"}
        />

        {/* Blur, raise-hand, and reactions live in this "More" popover on
            EVERY screen size, so the always-visible mobile row never grows
            past the 5 buttons it already comfortably fits. */}
        <div className="relative">
          <ControlButton
            onClick={() => setMoreOpen((v) => !v)}
            active={!moreOpen}
            icon={moreOpen ? X : MoreHorizontal}
            label="More"
          />
          <AnimatePresence>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-3 right-0 w-60 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#0d1526] border border-white/10 shadow-2xl z-50 p-3"
                >
                  <p className="text-[11px] text-white/50 mb-2 px-1">Quick reactions</p>
                  <div className="flex items-center justify-between mb-3 px-1">
                    {QUICK_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onSendReaction(emoji);
                          setMoreOpen(false);
                        }}
                        className="text-2xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      onToggleHandRaise();
                      setMoreOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors mb-1.5 ${
                      handRaised
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <Hand size={15} />
                    {handRaised ? "Lower hand" : "Raise hand"}
                  </button>

                  <button
                    onClick={() => {
                      onToggleBlur();
                      setMoreOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      bgBlurOn
                        ? "bg-cyan/20 text-cyan"
                        : "bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <Sparkles size={15} />
                    {bgBlurOn ? "Turn off background blur" : "Background blur"}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Chat / Participants / Copy-link move into the meeting header on
            mobile (see MeetingRoom.jsx) so this bar never needs to wrap —
            it only shows the essential controls below the sm breakpoint. */}
        <div className="hidden sm:flex items-center gap-2">
          <ControlButton onClick={onToggleChat} active icon={MessageSquare} label="Chat" />
          <ControlButton onClick={onToggleParticipants} active icon={Users} label="Participants" />
          <ControlButton onClick={onCopyLink} active icon={Link2} label="Copy link" />
          <div className="w-px h-8 bg-white/15 mx-1 shrink-0" />
        </div>

        {isHost ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onEndMeeting}
            className="h-11 sm:h-12 px-3.5 sm:px-4 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/30 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0"
          >
            <PhoneOff size={15} />
            <span className="hidden xs:inline">End Meeting</span>
            <span className="xs:hidden">End</span>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onLeave}
            className="h-11 sm:h-12 px-3.5 sm:px-4 rounded-full bg-white/[0.08] hover:bg-white/[0.18] active:bg-white/[0.24] border border-white/15 hover:border-white/25 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-colors shrink-0"
          >
            <LogOut size={15} />
            Leave
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}