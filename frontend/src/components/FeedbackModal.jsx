import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Loader2 } from "lucide-react";

export default function FeedbackModal({ onSubmit, onSkip, submitting }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
      >
        <h3 className="text-lg font-bold text-midnight-navy mb-1">How was your call?</h3>
        <p className="text-sm text-slate-500 mb-5">Your feedback helps us improve Streamly.</p>

        <div className="flex items-center justify-center gap-1.5 mb-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={30}
                className={
                  n <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300"
                }
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Anything you'd like to share? (optional)"
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-electric-blue resize-none mb-4 text-left"
        />

        <div className="flex gap-2">
          <button
            onClick={onSkip}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={() => onSubmit({ rating, comment })}
            disabled={!rating || submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-streamly-gradient shadow-md shadow-electric-blue/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Submit
          </button>
        </div>
      </motion.div>
    </div>
  );
}