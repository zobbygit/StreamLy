import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { MicOff, VideoOff, User, Hand, Sparkles } from "lucide-react";

export default function VideoTile({
  stream,
  name,
  isSelf,
  micOn,
  cameraOn,
  isSpeaking,
  connectionState,
  videoRef,
  fill,
  blurred,
  handRaised,
  reactionEmoji,
}) {

useEffect(() => {
  if (!videoRef?.current || !stream || !cameraOn) return;

  videoRef.current.srcObject = stream;

  videoRef.current.play().catch((err) => {
    console.warn("Video autoplay failed:", err);
  });

  return () => {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
}, [stream, cameraOn, videoRef]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative rounded-2xl overflow-hidden bg-gradient-to-br from-midnight-navy to-[#0a1830] border transition-all ${
        fill ? "w-full h-full" : "aspect-video w-full"
      } ${
        isSpeaking
          ? "border-cyan shadow-[0_0_0_3px_rgba(6,182,212,0.35),0_0_30px_rgba(6,182,212,0.25)]"
          : "border-white/10 shadow-lg shadow-black/20"
      }`}
    >
      {cameraOn && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isSelf}
          className={`h-full w-full object-cover transition-[filter] ${blurred ? "blur-md" : ""}`}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-midnight-navy via-[#0d1b2e] to-[#131c33]">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-electric-blue/30 to-violet/30 flex items-center justify-center ring-1 ring-white/10">
            <User size={28} className="text-white/80" />
          </div>
        </div>
      )}

      {/* Floating reaction burst */}
      <AnimatePresence>
        {reactionEmoji && (
          <motion.div
            key={reactionEmoji.id}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: 1, y: -40, scale: 1.3 }}
            exit={{ opacity: 0, y: -70 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="absolute inset-x-0 bottom-1/3 flex justify-center text-4xl pointer-events-none select-none"
          >
            {reactionEmoji.emoji}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 max-w-[85%]">
        <span className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur text-white text-xs font-medium truncate">
          {name} {isSelf && "(You)"}
        </span>
        <AnimatePresence>
          {!micOn && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="h-6 w-6 rounded-lg bg-red-500/80 backdrop-blur flex items-center justify-center shrink-0"
            >
              <MicOff size={12} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {handRaised && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="h-6 w-6 rounded-lg bg-yellow-500/85 backdrop-blur flex items-center justify-center shrink-0"
            >
              <Hand size={12} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        {blurred && (
          <div className="h-6 w-6 rounded-lg bg-black/50 backdrop-blur flex items-center justify-center" title="Background blur on">
            <Sparkles size={12} className="text-cyan" />
          </div>
        )}
        {!cameraOn && (
          <div className="h-6 w-6 rounded-lg bg-black/50 backdrop-blur flex items-center justify-center">
            <VideoOff size={12} className="text-white/70" />
          </div>
        )}
      </div>

      <div
        className={`absolute top-2 left-2 h-2 w-2 rounded-full ${
          connectionState === "connected"
            ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]"
            : "bg-yellow-400 animate-pulse"
        }`}
      />
    </motion.div>
  );
}