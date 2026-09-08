import { useRef, useState, useEffect } from "react";
import { Send, Paperclip, Mic, Square, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { uploadChatFile } from "../lib/chatUpload";

export default function ChatComposer({ onSend, onTyping }) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!onTyping) return;
    onTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 1500);
  };

  const handleSendText = () => {
    if (!text.trim()) return;
    onSend({ content: text.trim(), attachments: [] });
    setText("");
    if (onTyping) onTyping(false);
    clearTimeout(typingTimeoutRef.current);
  };

  const handleFilePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;
    setUploading(true);
    try {
      const attachment = await uploadChatFile(file);
      onSend({ content: "", attachments: [attachment] });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) return;
        setUploading(true);
        try {
          const file = new File([blob], "voice-note.webm", { type: "audio/webm" });
          const attachment = await uploadChatFile(file);
          onSend({ content: "", attachments: [attachment] });
        } catch (err) {
          toast.error(err?.response?.data?.message || err.message || "Upload failed.");
        } finally {
          setUploading(false);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      toast.error("Microphone access is required to record a voice note.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFilePick}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip,.txt"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || recording}
        title="Attach a file"
        className="h-9 w-9 rounded-xl border border-line flex items-center justify-center text-muted hover:bg-black/5 transition-colors disabled:opacity-40 shrink-0"
      >
        <Paperclip size={16} />
      </button>

      <input
        value={text}
        onChange={handleTextChange}
        onKeyDown={(e) => e.key === "Enter" && handleSendText()}
        disabled={recording}
        placeholder={recording ? "Recording voice note..." : "Type a message..."}
        className="flex-1 rounded-xl border border-line px-3.5 py-2 text-sm outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/15 transition-all disabled:opacity-50 min-w-0"
      />

      <button
        onClick={recording ? stopRecording : startRecording}
        disabled={uploading}
        title={recording ? "Stop recording" : "Record a voice note"}
        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          recording
            ? "bg-red-500 text-white animate-pulse"
            : "border border-line text-muted hover:bg-black/5"
        }`}
      >
        {recording ? <Square size={14} /> : <Mic size={16} />}
      </button>

      <button
        onClick={handleSendText}
        disabled={uploading || recording || !text.trim()}
        className="h-9 w-9 rounded-xl bg-streamly-gradient text-white flex items-center justify-center shadow-md shadow-electric-blue/25 disabled:opacity-40 transition-shadow shrink-0"
      >
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
      </button>
    </div>
  );
}