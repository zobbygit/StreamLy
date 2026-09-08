import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  MinusCircle,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const faqsData = [
  {
    question: "What is Streamly?",
    answer:
      "Streamly is a video conferencing and real-time chat platform that lets you connect with others through video calls, audio, messaging, and collaborative communication in one place.",
  },
  {
    question: "Can I use Streamly for video meetings?",
    answer:
      "Yes. Streamly lets you create and join video meetings with other participants, with features such as camera and microphone controls, participant management, and real-time communication.",
  },
  {
    question: "Does Streamly support real-time chat?",
    answer:
      "Yes. Streamly includes real-time chat so participants can exchange messages during conversations and stay connected without leaving the platform.",
  },
  {
    question: "Can I control my microphone and camera during a call?",
    answer:
      "Yes. You can easily turn your microphone and camera on or off during a meeting, giving you control over your audio and video whenever you need it.",
  },
  {
    question: "Can I rate a call after it ends?",
    answer:
      "Yes. Streamly includes a call rating section where you can rate your call experience and leave remarks. Your rating and feedback help provide valuable insight into the quality of the meeting experience.",
  },
{
  question: "What details are available for each call?",
  answer:
    "Streamly keeps details about each call, including call information and activity. The call initiator also has access to the available meeting controls to manage the call and participants effectively.",
},
{
  question: "Can I manage participants during a call?",
  answer:
    "Yes. The call initiator can use the available controls to manage the meeting and participants, helping keep the call organized and under control.",
},
{
  question: "Can I access my previous calls?",
  answer:
    "Yes. Streamly provides details for each call, allowing you to keep track of your meeting history and review important call information when needed.",
},
];

export default function Faq() {
  const [openIndices, setOpenIndices] = useState([0, 1]);
  const [email, setEmail] = useState("");

  const toggleAccordion = (index) => {
    setOpenIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await api.post("/contact", {
      email: email.trim(),
    });

    toast.success("Thanks! We'll get in touch with you soon.");
    setEmail("");
  } catch (err) {
    toast.error(
      err?.response?.data?.message ||
        "Could not submit your email. Please try again."
    );
  }
};

  return (
    <section className="streamly-bg relative min-h-screen overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      
      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.18, 0.28, 0.18],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            -top-48
            left-1/2
            h-[520px]
            w-[520px]
            -translate-x-1/2
            rounded-full
            bg-blue-500/10
            blur-[120px]
            dark:bg-blue-500/10
          "
        />

        <motion.div
          animate={{
            x: [0, 35, 0],
            y: [0, -25, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            -bottom-48
            -left-32
            h-[420px]
            w-[420px]
            rounded-full
            bg-cyan-500/10
            blur-[120px]
          "
        />

        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            right-[-120px]
            top-1/3
            h-[380px]
            w-[380px]
            rounded-full
            bg-violet-500/10
            blur-[120px]
          "
        />
      </div>

      {/* ================= MAIN ================= */}

      <div className="relative mx-auto w-full max-w-4xl">

        {/* ================= HEADER ================= */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center sm:mb-16"
        >
          <div
            className="
              mb-5
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-blue-200/70
              bg-blue-50/70
              px-3.5
              py-1.5
              shadow-sm
              backdrop-blur-md
              dark:border-blue-500/20
              dark:bg-blue-500/10
            "
          >
            <Sparkles
              size={13}
              className="text-electric-blue dark:text-cyan-400"
            />

            <span
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-electric-blue
                dark:text-blue-300
              "
            >
              General Questions
            </span>
          </div>

          <h2
            className="
              mx-auto
              max-w-3xl
              text-4xl
              font-black
              tracking-[-0.045em]
              text-ink
              sm:text-5xl
              lg:text-[56px]
              lg:leading-[1.05]
            "
          >
            Everything you need to know
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-base
              leading-7
              text-muted
              sm:text-lg
            "
          >
            Find quick answers about Streamly, your account, billing,
            and everything in between.
          </p>
        </motion.div>

        {/* ================= FAQ CARD ================= */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.15,
            duration: 0.6,
          }}
          className="
            overflow-hidden
            rounded-3xl
            border
            border-line/70
            bg-white/75
            shadow-[0_25px_80px_rgba(7,17,31,0.08)]
            backdrop-blur-2xl
            dark:bg-slate-900/65
            dark:shadow-[0_25px_80px_rgba(0,0,0,0.25)]
          "
        >

          {/* Top accent */}

          <div
            className="
              h-1
              w-full
              bg-gradient-to-r
              from-blue-600
              via-cyan-400
              to-violet-600
            "
          />

          <div className="divide-y divide-line/60">
            {faqsData.map((faq, index) => {
              const isOpen = openIndices.includes(index);

              return (
                <motion.div
                  key={index}
                  layout
                  className={`
                    px-5
                    py-5
                    transition-colors
                    duration-300
                    sm:px-7
                    sm:py-6
                    lg:px-9
                    ${isOpen ? "bg-blue-500/[0.025] dark:bg-blue-500/[0.04]" : ""}
                  `}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                    className="
                      group
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-5
                      rounded-xl
                      text-left
                      outline-none
                      focus-visible:ring-2
                      focus-visible:ring-electric-blue/50
                    "
                  >
                    <span
                      className={`
                        text-base
                        font-bold
                        leading-6
                        transition-colors
                        duration-200
                        sm:text-lg
                        ${
                          isOpen
                            ? "text-electric-blue dark:text-blue-400"
                            : "text-ink"
                        }
                      `}
                    >
                      {faq.question}
                    </span>

                    <span
                      className={`
                        flex
                        h-9
                        w-9
                        flex-shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        transition-all
                        duration-300
                        ${
                          isOpen
                            ? "border-blue-500/30 bg-blue-500/10 text-electric-blue dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400"
                            : "border-line bg-surface-base text-muted group-hover:border-blue-400/40 group-hover:text-electric-blue"
                        }
                      `}
                    >
                      {isOpen ? (
                        <MinusCircle size={18} />
                      ) : (
                        <PlusCircle size={18} />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0,
                        }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                        }}
                        transition={{
                          duration: 0.25,
                          ease: "easeOut",
                        }}
                        className="overflow-hidden"
                      >
                        <p
                          className="
                            max-w-3xl
                            pt-4
                            pr-10
                            text-sm
                            leading-7
                            text-muted
                            sm:text-base
                          "
                        >
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ================= SUPPORT CTA ================= */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.6,
          }}
          className="
            relative
            mt-10
            overflow-hidden
            rounded-3xl
            border
            border-blue-200/60
            bg-gradient-to-br
            from-blue-50
            via-white
            to-cyan-50
            p-7
            text-center
            shadow-[0_20px_60px_rgba(37,99,235,0.08)]
            dark:border-slate-700
            dark:from-slate-900
            dark:via-slate-900
            dark:to-slate-800
            dark:shadow-[0_20px_60px_rgba(0,0,0,0.2)]
            sm:p-10
          "
        >

          {/* CTA glow */}

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-48
              w-48
              rounded-full
              bg-blue-500/10
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-24
              -left-16
              h-44
              w-44
              rounded-full
              bg-cyan-500/10
              blur-3xl
            "
          />

          <div className="relative">

            {/* Avatar stack */}

            <div className="mb-5 flex justify-center -space-x-2">
              <img
                className="
                  h-10
                  w-10
                  rounded-full
                  border-2
                  border-white
                  object-cover
                  shadow-sm
                  dark:border-slate-800
                "
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                alt="Team member"
              />

              <img
                className="
                  h-10
                  w-10
                  rounded-full
                  border-2
                  border-white
                  object-cover
                  shadow-sm
                  dark:border-slate-800
                "
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                alt="Team member"
              />

              <img
                className="
                  h-10
                  w-10
                  rounded-full
                  border-2
                  border-white
                  object-cover
                  shadow-sm
                  dark:border-slate-800
                "
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
                alt="Team member"
              />

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-white
                  bg-blue-600
                  text-white
                  shadow-sm
                  dark:border-slate-800
                "
              >
                <MessageCircle size={16} />
              </div>
            </div>

            <h3
              className="
                text-2xl
                font-black
                tracking-tight
                text-ink
                sm:text-3xl
              "
            >
              Still have questions?
            </h3>

            <p
              className="
                mx-auto
                mt-2
                max-w-lg
                text-sm
                leading-6
                text-muted
                sm:text-base
              "
            >
              Can't find what you're looking for? Send us your email
              and our friendly team will get back to you.
            </p>

            {/* Contact form */}

            <form
              onSubmit={handleSubmit}
              className="
                mx-auto
                mt-7
                flex
                w-full
                max-w-lg
                flex-col
                gap-3
                sm:flex-row
              "
            >
              <div className="relative flex-1">
                <label
                  htmlFor="email-address"
                  className="sr-only"
                >
                  Email address
                </label>

                <input
                  id="email-address"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-line
                    bg-white/90
                    px-4
                    text-sm
                    text-ink
                    outline-none
                    placeholder:text-muted
                    transition-all
                    duration-200
                    focus:border-electric-blue
                    focus:ring-4
                    focus:ring-electric-blue/10
                    dark:bg-slate-800/80
                  "
                />
              </div>

              <button
                type="submit"
                className="
                  group
                  flex
                  h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-blue-700
                  to-cyan-600
                  px-6
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-blue-600/20
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:shadow-xl
                  hover:shadow-blue-500/30
                  active:translate-y-0
                  sm:w-auto
                "
              >
                Get in touch

                <ArrowRight
                  size={16}
                  className="
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                />
              </button>
            </form>

            <p className="mt-4 text-[11px] text-muted">
              We respect your inbox. No spam, ever.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}