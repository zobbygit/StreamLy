import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Loader2, MessageSquare, Users, Timer, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { getSocket } from "../lib/socket";
import { useAuth } from "../context/AuthContext.jsx";
import VideoTile from "../components/VideoTile.jsx";
import ControlBar from "../components/ControlBar.jsx";
import ChatSidebar from "../components/ChatSidebar.jsx";
import ParticipantsSidebar from "../components/ParticipantsSidebar.jsx";
import FeedbackModal from "../components/FeedbackModal.jsx";

const COUNTDOWN_PRESETS = [5, 10, 15, 30];

// Formats a millisecond duration as "12:34" (mm:ss) or "1:02:33" (h:mm:ss).
function formatClock(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export default function MeetingRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = getSocket();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [peers, setPeers] = useState({}); // socketId -> { name, avatar, isHost, micOn, cameraOn, stream }
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  // Meeting timer: `nowMs` ticks once a second and is the single shared clock
  // both the elapsed-time display and the countdown display derive from.
  // The elapsed time is anchored to meeting.startedAt, which is set from the
  // server (REST response, then reconfirmed via the "meeting:timer-sync"
  // socket event) — so every participant computes elapsed time from the same
  // fixed point, keeping displays consistent even if a device's own clock is
  // slightly off.
  const [nowMs, setNowMs] = useState(Date.now());
  const [countdownEndsAt, setCountdownEndsAt] = useState(null); // epoch ms or null
  const [countdownMenuOpen, setCountdownMenuOpen] = useState(false);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionsRef = useRef({}); // socketId -> RTCPeerConnection
  const iceServersRef = useRef([{ urls: "stun:stun.l.google.com:19302" }]);
  const remoteVideoRefs = useRef({});
  // Whichever video track is currently being SENT to peers (camera, blurred
  // canvas, or screen-share) — kept separate from localStreamRef's original
  // camera track so any peer connection created later (someone joining
  // mid-blur or mid-screen-share) picks up the right one, not the raw camera.
  const activeVideoTrackRef = useRef(null);
  const blurCanvasRef = useRef(null);
  const blurRafRef = useRef(null);
  const [bgBlurOn, setBgBlurOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [reactions, setReactions] = useState([]); // [{ id, socketId, emoji }] — floating, self-clearing
  const [showFeedback, setShowFeedback] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const isHost = meeting && meeting.hostId?._id === user.id;

  // ---- Fetch ICE server config ----
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/config/ice-servers");
        iceServersRef.current = data.iceServers;
      } catch {
        /* fall back to default STUN */
      }
    })();
  }, []);

  // ---- Timer tick (drives both elapsed-time and countdown displays) ----
  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ---- Load meeting info + local media, then join the socket room ----
  useEffect(() => {
    let cancelled = false;

    async function setup() {
      // Step 1: verify the meeting exists / is joinable. Kept separate from the
      // media step below so a failure here reports "meeting not found", not a
      // generic camera error.
      let meetingData;
      try {
        const { data } = await api.get(`/meetings/${meetingId}`);
        if (cancelled) return;
        meetingData = data.meeting;
        setMeeting(meetingData);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Meeting not found or you don't have access.");
        navigate("/dashboard");
        return;
      }

      // Step 2: request camera/mic. Reported separately so permission/device
      // errors are distinguishable from meeting-lookup errors.
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (err) {
        console.error("[getUserMedia]", err.name, err.message);
        const reasons = {
          NotAllowedError: "Camera/microphone permission was denied. Allow access in your browser's site settings and reload.",
          NotFoundError: "No camera or microphone was found on this device.",
          NotReadableError: "Your camera/microphone is already in use by another app or browser tab.",
          OverconstrainedError: "No camera/microphone matched the requested settings.",
          SecurityError: "Camera/microphone access requires HTTPS (or localhost). This page isn't served securely.",
        };
        toast.error(reasons[err.name] || `Could not access camera/microphone (${err.name || "unknown error"}).`);
        navigate("/dashboard");
        return;
      }

      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      try {
        localStreamRef.current = stream;
        activeVideoTrackRef.current = stream.getVideoTracks()[0] || null;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        if (!socket.connected) socket.connect();
        socket.emit("meeting:join", { meetingId, mediaState: { micOn: true, cameraOn: true } });
        setConnectionStatus("connected");
      } catch (err) {
        console.error("[meeting setup]", err);
        toast.error("Something went wrong joining the meeting room.");
        navigate("/dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    setup();

    return () => {
      cancelled = true;
      Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
      peerConnectionsRef.current = {};
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (blurRafRef.current) cancelAnimationFrame(blurRafRef.current);
      socket.emit("meeting:leave", { meetingId });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  // ---- WebRTC peer connection helpers ----
  const createPeerConnection = useCallback(
    (remoteSocketId) => {
      const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });

      // Audio always comes straight from the mic. Video comes from whatever
      // is CURRENTLY active (plain camera, blurred canvas, or screen share)
      // — this matters for peers who join partway through a blur/share.
      const audioTrack = localStreamRef.current?.getAudioTracks()[0];
      if (audioTrack) pc.addTrack(audioTrack, localStreamRef.current);
      if (activeVideoTrackRef.current) {
        pc.addTrack(activeVideoTrackRef.current, localStreamRef.current);
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("meeting:signal", {
            to: remoteSocketId,
            signal: { type: "candidate", candidate: event.candidate },
          });
        }
      };

      pc.ontrack = (event) => {
        setPeers((prev) => ({
          ...prev,
          [remoteSocketId]: {
            ...prev[remoteSocketId],
            stream: event.streams[0],
          },
        }));
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          setPeers((prev) => ({
            ...prev,
            [remoteSocketId]: { ...prev[remoteSocketId], connectionState: "connecting" },
          }));
        } else if (pc.connectionState === "connected") {
          setPeers((prev) => ({
            ...prev,
            [remoteSocketId]: { ...prev[remoteSocketId], connectionState: "connected" },
          }));
        }
      };

      peerConnectionsRef.current[remoteSocketId] = pc;
      return pc;
    },
    [socket]
  );

  const callPeer = useCallback(
    async (remoteSocketId) => {
      const pc = createPeerConnection(remoteSocketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("meeting:signal", { to: remoteSocketId, signal: { type: "offer", sdp: offer } });
    },
    [createPeerConnection, socket]
  );

  // ---- Forced mute/camera-off, triggered by a host control (see the socket
  // listeners below). These only ever turn things OFF, never on — a host
  // can't force someone's mic on, only mute them. ----
  const forceMicOff = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) track.enabled = false;
    setMicOn(false);
    socket.emit("meeting:media-state", { meetingId, micOn: false });
  }, [socket, meetingId]);

  const forceCameraOff = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) track.enabled = false;
    setCameraOn(false);
    socket.emit("meeting:media-state", { meetingId, cameraOn: false });
  }, [socket, meetingId]);

  // ---- Socket event wiring for signaling + presence + chat ----
  useEffect(() => {
    const handleExistingPeers = (existingPeers) => {
      const map = {};
      existingPeers.forEach((p) => {
        map[p.socketId] = {
          name: p.name,
          avatar: p.avatar,
          isHost: p.isHost,
          micOn: p.micOn,
          cameraOn: p.cameraOn,
          userId: p.userId,
          connectionState: "connecting",
        };
      });
      setPeers((prev) => ({ ...prev, ...map }));
      existingPeers.forEach((p) => callPeer(p.socketId));
    };

    const handlePeerJoined = (p) => {
      setPeers((prev) => ({
        ...prev,
        [p.socketId]: {
          name: p.name,
          avatar: p.avatar,
          isHost: p.isHost,
          micOn: p.micOn,
          cameraOn: p.cameraOn,
          userId: p.userId,
          connectionState: "connecting",
        },
      }));
    };

    const handleSignal = async ({ from, signal }) => {
      let pc = peerConnectionsRef.current[from];
      if (!pc) pc = createPeerConnection(from);

      if (signal.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("meeting:signal", { to: from, signal: { type: "answer", sdp: answer } });
      } else if (signal.type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      } else if (signal.type === "candidate") {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } catch {
          /* ignore benign candidate errors */
        }
      }
    };

    const handlePeerLeft = ({ socketId }) => {
      peerConnectionsRef.current[socketId]?.close();
      delete peerConnectionsRef.current[socketId];
      setPeers((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    };

    const handleMediaState = ({ socketId, micOn: m, cameraOn: c }) => {
      setPeers((prev) => ({
        ...prev,
        [socketId]: {
          ...prev[socketId],
          ...(typeof m === "boolean" ? { micOn: m } : {}),
          ...(typeof c === "boolean" ? { cameraOn: c } : {}),
        },
      }));
    };

    const handleChat = (msg) => setMessages((prev) => [...prev, msg]);

    const handleTimerSync = ({ startedAt }) => {
      setMeeting((prev) => (prev ? { ...prev, startedAt } : prev));
    };

    const handleCountdown = ({ endsAt }) => {
      setCountdownEndsAt(endsAt);
      if (endsAt) {
        toast("Host started a countdown timer.", { icon: "⏳" });
      }
    };

    const handleForceMute = () => {
      forceMicOff();
      toast("You were muted by the host.", { icon: "🔇" });
    };

    const handleForceCameraOff = () => {
      forceCameraOff();
      toast("Your camera was turned off by the host.", { icon: "📷" });
    };

    const handleRemoved = ({ message }) => {
      toast.error(message || "You were removed from the meeting.");
      navigate("/dashboard");
    };

    const handleEnded = () => {
      toast("The host ended this meeting.", { icon: "📞" });
      setShowFeedback(true);
    };

    const handleMeetingError = ({ message }) => {
      toast.error(message);
      navigate("/dashboard");
    };

    const handleReaction = ({ socketId, emoji }) => {
      const entry = { id: `${Date.now()}-${Math.random()}`, socketId, emoji };
      setReactions((prev) => [...prev, entry]);
      // Self-clearing — no need to track timers, just filter it back out.
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== entry.id));
      }, 2200);
    };

const handleHandRaise = ({ socketId, raised }) => {
  // The server broadcasts to everyone in the room INCLUDING the sender
  // (needed elsewhere for reactions to show on your own tile) — so we
  // get our own hand-raise echoed back too. Our own state is already
  // set optimistically in toggleHandRaise, so ignore the echo here;
  // otherwise it creates a phantom second "peers" entry for our own
  // socket id with no name/stream, which renders as a duplicate tile.
  if (socketId === socket.id) return;
  setPeers((prev) => ({
    ...prev,
    [socketId]: { ...prev[socketId], handRaised: raised },
  }));
};

    socket.on("meeting:existing-peers", handleExistingPeers);
    socket.on("meeting:peer-joined", handlePeerJoined);
    socket.on("meeting:signal", handleSignal);
    socket.on("meeting:peer-left", handlePeerLeft);
    socket.on("meeting:media-state", handleMediaState);
    socket.on("meeting:chat", handleChat);
    socket.on("meeting:timer-sync", handleTimerSync);
    socket.on("meeting:countdown", handleCountdown);
    socket.on("meeting:force-mute", handleForceMute);
    socket.on("meeting:force-camera-off", handleForceCameraOff);
    socket.on("meeting:removed", handleRemoved);
    socket.on("meeting:ended", handleEnded);
    socket.on("meeting:error", handleMeetingError);
    socket.on("meeting:reaction", handleReaction);
    socket.on("meeting:hand-raise", handleHandRaise);

    return () => {
      socket.off("meeting:existing-peers", handleExistingPeers);
      socket.off("meeting:peer-joined", handlePeerJoined);
      socket.off("meeting:signal", handleSignal);
      socket.off("meeting:peer-left", handlePeerLeft);
      socket.off("meeting:media-state", handleMediaState);
      socket.off("meeting:chat", handleChat);
      socket.off("meeting:timer-sync", handleTimerSync);
      socket.off("meeting:countdown", handleCountdown);
      socket.off("meeting:force-mute", handleForceMute);
      socket.off("meeting:force-camera-off", handleForceCameraOff);
      socket.off("meeting:removed", handleRemoved);
      socket.off("meeting:ended", handleEnded);
      socket.off("meeting:error", handleMeetingError);
      socket.off("meeting:reaction", handleReaction);
      socket.off("meeting:hand-raise", handleHandRaise);
    };
  }, [socket, createPeerConnection, callPeer, navigate, forceMicOff, forceCameraOff]);

  // ---- Attach remote streams to <video> elements ----
  useEffect(() => {
    Object.entries(peers).forEach(([socketId, p]) => {
      const el = remoteVideoRefs.current[socketId];
      if (el && p.stream && el.srcObject !== p.stream) {
        el.srcObject = p.stream;
      }
    });
  }, [peers]);

  // ---- Controls ----
  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) track.enabled = !track.enabled;
    setMicOn((v) => {
      const next = !v;
      socket.emit("meeting:media-state", { meetingId, micOn: next });
      return next;
    });
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) track.enabled = !track.enabled;
    setCameraOn((v) => {
      const next = !v;
      socket.emit("meeting:media-state", { meetingId, cameraOn: next });
      return next;
    });
  };

  const toggleScreenShare = async () => {
    if (bgBlurOn) {
      toast.error("Turn off background blur before sharing your screen.");
      return;
    }
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];

        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });
        activeVideoTrackRef.current = screenTrack;
        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

        screenTrack.onended = () => stopScreenShare();
        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch {
      /* user cancelled the picker */
    }
  };

  const stopScreenShare = () => {
    const camTrack = localStreamRef.current?.getVideoTracks()[0];
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender && camTrack) sender.replaceTrack(camTrack);
    });
    activeVideoTrackRef.current = camTrack || null;
    if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setIsScreenSharing(false);
  };

  // ---- Background blur ----
  // Simplified, dependency-free version of "virtual backgrounds": blurs the
  // WHOLE frame via <canvas> + CSS-style blur filter, then sends that
  // canvas's captured stream instead of the raw camera. True background-ONLY
  // blur (keeping your face sharp) needs a real-time person-segmentation
  // model (e.g. MediaPipe Selfie Segmentation) — a heavier addition; this is
  // the practical, lightweight version of the feature.
  const startBackgroundBlur = () => {
    if (isScreenSharing) {
      toast.error("Turn off screen sharing before enabling background blur.");
      return;
    }
    const sourceVideoEl = localVideoRef.current;
    if (!sourceVideoEl) return;

    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    blurCanvasRef.current = canvas;

    const draw = () => {
      if (sourceVideoEl.readyState >= 2) {
        ctx.filter = "blur(10px)";
        ctx.drawImage(sourceVideoEl, 0, 0, canvas.width, canvas.height);
      }
      blurRafRef.current = requestAnimationFrame(draw);
    };
    draw();

    const blurredStream = canvas.captureStream(24);
    const blurredTrack = blurredStream.getVideoTracks()[0];

    Object.values(peerConnectionsRef.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) sender.replaceTrack(blurredTrack);
    });
    activeVideoTrackRef.current = blurredTrack;
    setBgBlurOn(true);
  };

  const stopBackgroundBlur = () => {
    if (blurRafRef.current) cancelAnimationFrame(blurRafRef.current);
    blurRafRef.current = null;
    blurCanvasRef.current = null;

    const camTrack = localStreamRef.current?.getVideoTracks()[0];
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender && camTrack) sender.replaceTrack(camTrack);
    });
    activeVideoTrackRef.current = camTrack || null;
    setBgBlurOn(false);
  };

  const toggleBackgroundBlur = () => {
    if (bgBlurOn) stopBackgroundBlur();
    else startBackgroundBlur();
  };

  // ---- In-call reactions + raise hand ----
  const sendReaction = (emoji) => socket.emit("meeting:reaction", { meetingId, emoji });

  const toggleHandRaise = () => {
    const next = !handRaised;
    setHandRaised(next);
    socket.emit("meeting:hand-raise", { meetingId, raised: next });
  };

  const handleCopyLink = () => {
    // navigator.clipboard.writeText(`${window.location.origin}/meeting/${meetingId}`);
    navigator.clipboard.writeText(`${meetingId}`);
    toast.success("Meeting link copied!");
  };

  const handleSendChat = ({ content, attachments }) => {
    socket.emit("meeting:chat", { meetingId, content, attachments });
  };

  // ---- Host controls: these just ask the server to act — the server is
  // the one that verifies the caller is actually the host before doing
  // anything (see sockets/index.js isSocketHost). Hiding these buttons in
  // the UI for non-hosts is a convenience, not the security boundary. ----
  const hostMuteAll = () => socket.emit("meeting:mute-all", { meetingId });
  const hostCameraOffAll = () => socket.emit("meeting:camera-off-all", { meetingId });
  const hostRemoveParticipant = (targetSocketId) =>
    socket.emit("meeting:remove-participant", { meetingId, targetSocketId });
  const hostStartCountdown = (minutes) => {
    socket.emit("meeting:start-countdown", { meetingId, minutes });
    setCountdownMenuOpen(false);
  };
  const hostCancelCountdown = () => {
    socket.emit("meeting:cancel-countdown", { meetingId });
    setCountdownMenuOpen(false);
  };

  const handleLeave = async () => {
    try {
      await api.post(`/meetings/${meetingId}/leave`);
    } finally {
      setShowFeedback(true);
    }
  };

  const handleEndMeeting = async () => {
    try {
      await api.post(`/meetings/${meetingId}/end`);
      socket.emit("meeting:ended", { meetingId });
      setShowFeedback(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not end meeting.");
    }
  };

  const handleSubmitFeedback = async ({ rating, comment }) => {
    setSubmittingFeedback(true);
    try {
      await api.post(`/meetings/${meetingId}/feedback`, { rating, comment });
    } catch {
      /* non-critical — don't block navigation on a failed feedback submit */
    } finally {
      setSubmittingFeedback(false);
      navigate("/sessions");
    }
  };

  const handleSkipFeedback = () => navigate("/sessions");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight-navy via-[#0a1830] to-[#0e1024] flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan" size={32} />
      </div>
    );
  }

  const participantList = [
    {
      socketId: "self",
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      isHost,
      isSelf: true,
      micOn,
      cameraOn,
      handRaised,
    },
    ...Object.entries(peers).map(([socketId, p]) => ({ socketId, ...p })),
  ];

  // Reactions are keyed by the sender's REAL socket id — for our own tile
  // that's socket.id (not the "self" placeholder used in participantList).
  const activeReactionFor = (realSocketId) => {
    const matches = reactions.filter((r) => r.socketId === realSocketId);
    return matches.length ? matches[matches.length - 1] : null;
  };

  // Elapsed time is anchored to the server-provided meeting.startedAt, ticked
  // by the shared `nowMs` clock — see the timer-tick effect above.
  const startedAtMs = meeting?.startedAt ? new Date(meeting.startedAt).getTime() : null;
  const elapsedMs = startedAtMs ? Math.max(0, nowMs - startedAtMs) : 0;
  const countdownRemainingMs = countdownEndsAt ? Math.max(0, countdownEndsAt - nowMs) : null;
  const countdownRunningLow = countdownRemainingMs !== null && countdownRemainingMs <= 60000;

  const gridCols =
    participantList.length <= 1
      ? "grid-cols-1"
      : participantList.length <= 4
      ? "grid-cols-2"
      : participantList.length <= 6
      ? "grid-cols-3"
      : "grid-cols-3 md:grid-cols-4";

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-navy via-[#0a1830] to-[#0e1024] flex flex-col relative overflow-hidden">
      {/* ambient glows for a premium futuristic feel */}
      <div className="pointer-events-none fixed top-0 left-1/4 h-72 w-72 rounded-full bg-electric-blue/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-1/4 h-80 w-80 rounded-full bg-violet/10 blur-3xl" />

      <header className="relative flex items-center justify-between gap-2 px-3 sm:px-5 h-16 border-b border-white/10 bg-midnight-navy/80 backdrop-blur-xl shrink-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-semibold text-sm sm:text-base truncate">{meeting?.title}</h1>
          <p className="text-white/50 text-[11px] sm:text-xs font-mono truncate">{meetingId}</p>
        </div>
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <span
            className={`flex items-center gap-1.5 text-[11px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full shrink-0 ${
              connectionStatus === "connected"
                ? "bg-green-500/15 text-green-400"
                : "bg-yellow-500/15 text-yellow-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full bg-current shrink-0 ${
                connectionStatus === "connected" ? "shadow-[0_0_6px_rgba(74,222,128,0.8)]" : "animate-pulse"
              }`}
            />
            <span className="hidden xs:inline">
              {connectionStatus === "connected" ? "Live" : "Connecting"}
            </span>
          </span>

          {/* Elapsed meeting timer, synced from the server's startedAt */}
          <span className="flex items-center gap-1 text-[11px] sm:text-xs font-mono font-medium text-white/70 px-2 py-1 rounded-full bg-white/[0.06] shrink-0">
            <Timer size={12} />
            {formatClock(elapsedMs)}
          </span>

          {/* Optional host-controlled countdown, visible to everyone once started */}
          {countdownRemainingMs !== null && (
            <span
              className={`hidden sm:flex items-center gap-1 text-xs font-mono font-medium px-2.5 py-1 rounded-full shrink-0 ${
                countdownRunningLow ? "bg-red-500/15 text-red-400" : "bg-cyan/15 text-cyan"
              }`}
            >
              ⏳ {formatClock(countdownRemainingMs)}
            </span>
          )}

          {/* Host-only: start/cancel a countdown timer visible to everyone */}
          {isHost && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setCountdownMenuOpen((v) => !v)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Countdown timer"
              >
                {countdownMenuOpen ? <X size={15} /> : <Timer size={15} />}
              </button>
              <AnimatePresence>
                {countdownMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setCountdownMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-10 w-48 rounded-2xl bg-[#0d1526] border border-white/10 shadow-2xl z-50 p-3"
                    >
                      <p className="text-[11px] text-white/50 mb-2 px-1">Start countdown for</p>
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        {COUNTDOWN_PRESETS.map((mins) => (
                          <button
                            key={mins}
                            onClick={() => hostStartCountdown(mins)}
                            className="px-2 py-1.5 rounded-lg text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            {mins} min
                          </button>
                        ))}
                      </div>
                      {countdownRemainingMs !== null && (
                        <button
                          onClick={hostCancelCountdown}
                          className="w-full px-2 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                        >
                          Cancel countdown
                        </button>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          <button
            onClick={handleCopyLink}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white px-2.5 py-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <Copy size={13} /> Copy link
          </button>

          {/* Mobile-only quick actions — ControlBar hides these below the sm
              breakpoint so its bottom bar never needs to wrap. */}
          <div className="flex sm:hidden items-center gap-0.5">
            <button
              onClick={handleCopyLink}
              className="h-8 w-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="Copy link"
            >
              <Copy size={15} />
            </button>
            <button
              onClick={() => {
                setChatOpen((v) => !v);
                setParticipantsOpen(false);
              }}
              className="h-8 w-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="Chat"
            >
              <MessageSquare size={15} />
            </button>
            <button
              onClick={() => {
                setParticipantsOpen((v) => !v);
                setChatOpen(false);
              }}
              className="h-8 w-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="Participants"
            >
              <Users size={15} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative flex-1 p-3 sm:p-4 md:p-6 pb-32 sm:pb-28 overflow-y-auto flex flex-col min-h-0">
        {participantList.length === 1 ? (
          // Solo in the meeting: fill the available area instead of locking
          // to a 16:9 box, which used to leave a large empty gap below the
          // tile on tall mobile screens.
          <div className="flex-1 min-h-0 flex">
            <VideoTile
              videoRef={localVideoRef}
              stream={localStreamRef.current}
              name={user.name}
              isSelf
              micOn={micOn}
              cameraOn={cameraOn}
              connectionState="connected"
              fill
              blurred={bgBlurOn}
              handRaised={handRaised}
              reactionEmoji={activeReactionFor(socket.id)}
            />
          </div>
        ) : (
          <div className={`grid ${gridCols} gap-3 sm:gap-4 auto-rows-fr`}>
            <AnimatePresence>
              {participantList.map((p) =>
                p.isSelf ? (
                  <VideoTile
                    key="self"
                    videoRef={localVideoRef}
                    stream={localStreamRef.current}
                    name={user.name}
                    isSelf
                    micOn={micOn}
                    cameraOn={cameraOn}
                    connectionState="connected"
                    blurred={bgBlurOn}
                    handRaised={handRaised}
                    reactionEmoji={activeReactionFor(socket.id)}
                  />
                ) : (
                  <VideoTile
                    key={p.socketId}
                    videoRef={(el) => (remoteVideoRefs.current[p.socketId] = el)}
                    stream={p.stream}
                    name={p.name}
                    isSelf={false}
                    micOn={p.micOn}
                    cameraOn={p.cameraOn}
                    connectionState={p.connectionState}
                    handRaised={p.handRaised}
                    reactionEmoji={activeReactionFor(p.socketId)}
                  />
                )
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <ControlBar
        micOn={micOn}
        cameraOn={cameraOn}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onScreenShare={toggleScreenShare}
        isScreenSharing={isScreenSharing}
        onToggleChat={() => {
          setChatOpen((v) => !v);
          setParticipantsOpen(false);
        }}
        onToggleParticipants={() => {
          setParticipantsOpen((v) => !v);
          setChatOpen(false);
        }}
        onCopyLink={handleCopyLink}
        isHost={isHost}
        onLeave={handleLeave}
        onEndMeeting={handleEndMeeting}
        bgBlurOn={bgBlurOn}
        onToggleBlur={toggleBackgroundBlur}
        handRaised={handRaised}
        onToggleHandRaise={toggleHandRaise}
        onSendReaction={sendReaction}
      />

      <ChatSidebar
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        onSend={handleSendChat}
        currentUserId={user.id}
      />
      <ParticipantsSidebar
        open={participantsOpen}
        onClose={() => setParticipantsOpen(false)}
        participants={participantList}
        isHost={isHost}
        onMuteAll={hostMuteAll}
        onCameraOffAll={hostCameraOffAll}
           onRemoveParticipant={hostRemoveParticipant}
      />

      {showFeedback && (
        <FeedbackModal
          submitting={submittingFeedback}
          onSubmit={handleSubmitFeedback}
          onSkip={handleSkipFeedback}
        />
      )}
    </div>
  );
}