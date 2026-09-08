import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  MessageSquare,
  MonitorUp,
  Newspaper,
  ScreenShare,
  ShieldCheck,
  Sparkles,
  Twitter,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Testimonial } from "../components/Testimonial";
import Faq from "../components/Faq";
const socialLinks = [
  {
    icon: Twitter,
    href: "/home",
    label: "Twitter",
  },
  {
    icon: Github,
    href: "https://github.com/zobbygit",
    label: "GitHub",
  },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/zohaib-aslam-245a40253",
    label: "LinkedIn",
  },
];
const features = [
  {
    icon: Video,
    title: "Crystal-clear video",
    desc: "Ultra-low-latency peer-to-peer video powered by WebRTC, built for teams of any size.",
    gradient: "from-electric-blue to-royal-blue",
  },
  {
    icon: MessageSquare,
    title: "Real-time chat",
    desc: "In-meeting chat and private one-to-one messaging, synced instantly with Socket.IO.",
    gradient: "from-cyan to-electric-blue",
  },
  {
    icon: ScreenShare,
    title: "Screen sharing",
    desc: "Share your screen instantly during any meeting for seamless collaboration.",
    gradient: "from-violet to-royal-blue",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    desc: "End-to-end session security, hashed credentials, and HttpOnly cookies protect every call.",
    gradient: "from-royal-blue to-cyan",
  },
  {
    icon: Users,
    title: "Multi-user meetings",
    desc: "Responsive video grids that scale gracefully from 2 to 9+ participants.",
    gradient: "from-cyan to-violet",
  },
  {
    icon: Zap,
    title: "Instant meetings",
    desc: "Spin up a meeting in one click, or join with a simple, memorable meeting code.",
    gradient: "from-electric-blue to-violet",
  },
];
const footerInfo = {
  "Video Meetings": {
    title: "Video Meetings",
    icon: Video,
    description:
      "Connect face-to-face with your team, friends, and clients through simple and reliable video calls.",
    details:
      "Streamly makes starting a video meeting effortless. Create a meeting, share the link, and start talking without complicated setup.",
  },

  "Real-time Chat": {
    title: "Real-time Chat",
    icon: MessageCircle,
    description:
      "Stay connected before, during, and after your meetings with instant messaging.",
    details:
      "Send messages, share ideas, and keep conversations moving without leaving Streamly.",
  },

  "Screen Sharing": {
    title: "Screen Sharing",
    icon: MonitorUp,
    description:
      "Share your screen instantly when you need to present, explain, or collaborate.",
    details:
      "Whether you're presenting a project or helping someone troubleshoot an issue, Streamly keeps screen sharing simple.",
  },

  Security: {
    title: "Security",
    icon: ShieldCheck,
    description:
      "Your conversations should stay private and your meetings should feel secure.",
    details:
      "Streamly is designed with secure communication in mind, helping keep your meetings and conversations protected.",
  },

  About: {
    title: "About Streamly",
    icon: Video,
    description:
      "Streamly is a modern communication platform built to make video conversations simple.",
    details:
      "We're building a clean and intuitive way for people and teams to connect through video, chat, and collaboration.",
  },

  Careers: {
    title: "Careers",
    icon: Briefcase,
    description:
      "We're always looking for people who love building great products.",
    details:
      "This is currently a demo careers section. Future opportunities at Streamly will be listed here.",
  },

  Blog: {
    title: "Streamly Blog",
    icon: Newspaper,
    description:
      "Ideas, product updates, communication tips, and stories from Streamly.",
    details:
      "Our blog is currently being prepared. Check back soon for product announcements and useful guides.",
  },

  Contact: {
    title: "Contact Streamly",
    icon: Mail,
    description: "Have a question, suggestion, or just want to say hello?",
    details:
      "You can reach us directly through email. We'd love to hear from you.",
    email: "iamzohaib777@gmail.com",
  },
};

// const testimonials = [
//   {
//     name: "Priya Sharma",
//     role: "Product Lead, Nimbus Labs",
//     quote:
//       "Streamly replaced three different tools for our remote team. The video quality is outstanding.",
//     initials: "PS",
//     gradient: "from-electric-blue to-cyan",
//   },
//   {
//     name: "Daniel Cho",
//     role: "Engineering Manager",
//     quote: "Setup took minutes and our standups have never been smoother.",
//     initials: "DC",
//     gradient: "from-cyan to-violet",
//   },
//   {
//     name: "Amara Okafor",
//     role: "Founder, Loop Studio",
//     quote: "The chat and meeting experience finally feel like one connected product.",
//     initials: "AO",
//     gradient: "from-violet to-royal-blue",
//   },
// ];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const navigate = useNavigate();
  const [footerModal, setFooterModal] = useState(null);

  return (
    <div className="home-page streamly-bg min-h-screen overflow-hidden">
      {/* Nav */}
      {/* <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-streamly-gradient flex items-center justify-center shadow-lg shadow-electric-blue/30">
            <Video size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-xl text-midnight-navy tracking-tight">
            Streamly
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-midnight-navy hover:bg-black/5 transition-colors"
          >
            Login
          </button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/signup")}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-streamly-gradient animate-gradient-pan shadow-lg shadow-electric-blue/30 hover:shadow-xl hover:shadow-cyan/30 transition-shadow"
          >
            Sign up free
          </motion.button>


        </div>
      </header> */}
      <header
        className="
  max-w-7xl mx-auto
  px-5 sm:px-6
  h-20
  flex items-center justify-between
  relative z-20
"
      >
        {/* ================= LOGO ================= */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          className="group flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          {/* Icon */}
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.12, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
        absolute
        -inset-2
        rounded-2xl
        bg-gradient-to-r
        from-blue-500
        via-cyan-400
        to-indigo-500
        blur-lg
      "
            />

            <motion.div
              whileHover={{
                scale: 1.08,
                rotate: -4,
              }}
              className="
        relative
        h-10 w-10
        rounded-2xl
        bg-gradient-to-br
        from-blue-600
        via-blue-500
        to-cyan-500
        flex items-center justify-center
        shadow-lg
        shadow-blue-500/30
        ring-1 ring-white/70
        overflow-hidden
      "
            >
              <motion.div
                animate={{ x: ["-120%", "150%"] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
                className="
          absolute inset-y-0
          w-1/2
          bg-gradient-to-r
          from-transparent
          via-white/30
          to-transparent
          skew-x-[-20deg]
        "
              />

              <Video
                size={20}
                strokeWidth={2.2}
                className="relative z-10 text-white"
              />
            </motion.div>
          </div>

          {/* Wordmark */}
          <div className="relative group/logo">
            <span
              className="
      relative
      flex items-center
      text-[22px]
      font-black
      tracking-[-0.055em]
      leading-none
      bg-gradient-to-r
      from-[#172554]
      via-[#2563eb]
      to-[#06b6d4]
      bg-clip-text
      text-transparent
    "
            >
              Streamly
              <motion.span
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="
          ml-1
          h-1.5 w-1.5
          rounded-full
          bg-cyan-400
          shadow-[0_0_10px_rgba(34,211,238,0.9)]
        "
              />
            </span>

            {/* Tiny brand line */}
            <div
              className="
      mt-1
      h-[2px]
      w-0
      rounded-full
      bg-gradient-to-r
      from-blue-500
      to-cyan-400
      group-hover/logo:w-full
      transition-all
      duration-500
    "
            />
          </div>
        </motion.div>

        {/* ================= AUTH BUTTONS ================= */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="
      flex items-center
      gap-2
      sm:gap-3
    "
        >
          {/* Login */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/login")}
            className="
        relative
        px-3.5 sm:px-4
        py-2
        rounded-xl
        text-sm
        font-semibold
        text-slate-600
        hover:text-electric-blue
        hover:bg-blue-50/70
        transition-all
        duration-300
      "
          >
            Login
          </motion.button>

          {/* Signup */}
          <motion.button
            whileHover={{
              scale: 1.04,
              y: -1,
            }}
            whileTap={{
              scale: 0.96,
            }}
            onClick={() => navigate("/signup")}
            className="
        group
        relative
        overflow-hidden
        px-4 sm:px-5
        py-2.5
        rounded-xl
        text-sm
        font-semibold
        text-white
        bg-gradient-to-r
        from-blue-600
        via-cyan-500
        to-indigo-600
        bg-[length:200%_200%]
        animate-gradient-pan
        shadow-lg
        shadow-blue-500/25
        hover:shadow-xl
        hover:shadow-blue-500/35
        transition-all
        duration-300
      "
          >
            {/* Button shine */}
            <span
              className="
        absolute
        inset-0
        bg-gradient-to-r
        from-transparent
        via-white/20
        to-transparent
        translate-x-[-120%]
        group-hover:translate-x-[120%]
        transition-transform
        duration-700
        skew-x-[-20deg]
      "
            />

            <span className="relative z-10 flex items-center gap-1.5">
              Sign up free
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 3 }}
                className="text-base"
              >
                →
              </motion.span>
            </span>
          </motion.button>
        </motion.div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-14 sm:pt-20 md:pt-24 pb-24 md:pb-32 text-center overflow-hidden">
        {/* Ambient glows */}
        <motion.div
          animate={{
            y: [0, -18, 0],
            x: [0, 8, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
      pointer-events-none absolute
      -top-10 left-[8%]
      h-40 w-40 sm:h-56 sm:w-56
      rounded-full
      bg-cyan-400/15
      blur-[80px]
    "
        />

        <motion.div
          animate={{
            y: [0, 18, 0],
            x: [0, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
      pointer-events-none absolute
      top-16 right-[8%]
      h-48 w-48 sm:h-64 sm:w-64
      rounded-full
      bg-violet-400/15
      blur-[90px]
    "
        />

        {/* Small decorative dots */}
        <div className="absolute top-32 left-[12%] hidden sm:block">
          <span className="block h-2 w-2 rounded-full bg-cyan-400/60 animate-pulse" />
        </div>

        <div className="absolute top-52 right-[14%] hidden sm:block">
          <span className="block h-1.5 w-1.5 rounded-full bg-violet-400/60 animate-pulse" />
        </div>

        {/* Badge */}
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.04, y: -2 }}
          className="
      relative inline-flex items-center gap-2
      px-4 py-2
      rounded-full
      bg-white/75
      backdrop-blur-xl
      border border-white/80
      shadow-[0_8px_30px_rgba(37,99,235,0.08)]
      text-xs sm:text-sm
      font-semibold
      text-electric-blue
      mb-7
      cursor-default
    "
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
          </span>
          {/* <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> */}
          <Sparkles size={14} className="text-cyan-500 animate-pulse" />
          Secure Peer-to-Peer Encryption
        </motion.span>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="
      relative
      text-[2.7rem]
      leading-[1.05]
      sm:text-5xl
      md:text-7xl
      lg:text-[5rem]
      font-extrabold
      tracking-[-0.035em]
      text-midnight-navy
    "
        >
          The 2026 way to meet
          <br />
          <span
            className="
      inline-block
      bg-streamly-gradient
      bg-clip-text
      text-transparent
      animate-gradient-pan
      pb-1
    "
          >
            and collaborate, live.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="
      relative
      mt-7
      text-base
      sm:text-lg
      leading-7
      text-muted
      max-w-2xl
      mx-auto
      px-2
    "
        >
          Streamly brings video conferencing, real-time chat, and screen sharing
          together in one premium, secure workspace — built for modern teams.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="
      relative
      mt-9 sm:mt-10
      flex flex-col
      xs:flex-row
      sm:flex-row
      items-center
      justify-center
      gap-3
    "
        >
          {/* Get Started */}
          <motion.button
            whileHover={{
              scale: 1.04,
              y: -3,
              boxShadow: "0 20px 45px -12px rgba(37,99,235,0.45)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/signup")}
            className="
        group
        w-full xs:w-auto sm:w-auto
        min-w-[175px]
        px-7 py-3.5
        rounded-2xl
        text-white
        font-semibold
        bg-streamly-gradient
        animate-gradient-pan
        shadow-xl shadow-electric-blue/25
        flex items-center justify-center gap-2
        transition-all duration-300
      "
          >
            Get started free
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </motion.button>

          {/* Login */}
          <motion.button
            whileHover={{
              scale: 1.03,
              y: -3,
              boxShadow: "0 15px 35px rgba(15,23,42,0.08)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login")}
            className="
        w-full xs:w-auto sm:w-auto
        min-w-[130px]
        px-7 py-3.5
        rounded-2xl
        font-semibold
        text-midnight-navy
        border border-slate-200/80
        bg-white/75
        backdrop-blur-xl
        shadow-sm
        hover:bg-white
        transition-all duration-300
      "
          >
            Login
          </motion.button>
        </motion.div>

        {/* Tiny trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="
      relative
      mt-7
      flex items-center justify-center
      gap-2
      text-xs
      text-slate-400
    "
        >
          <span className="text-emerald-500">✓</span>
          No complicated setup
          <span className="text-slate-300">•</span>
          Start connecting in seconds
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative max-w-7xl mx-auto px-5 sm:px-6 py-20 md:py-28 overflow-hidden">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-400/10 blur-[110px]" />
          <div className="absolute -left-20 bottom-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-[100px]" />
          <div className="absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-indigo-400/10 blur-[100px]" />
        </div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="relative text-center max-w-2xl mx-auto mb-14 md:mb-18"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="
        inline-flex items-center gap-2
        px-3.5 py-1.5 mb-5
        rounded-full
        border border-blue-200/70
        bg-blue-50/70
        backdrop-blur-md
        text-xs font-semibold
        text-electric-blue
        shadow-sm
      "
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            Built for better conversations
          </motion.div>

          <h2
            className="
      text-3xl
      sm:text-4xl
      md:text-5xl
      font-bold
      tracking-tight
      leading-[1.1]
      text-midnight-navy
    "
          >
            Everything your team needs
            <br className="hidden sm:block" />
            <span
              className="
        bg-gradient-to-r
        from-blue-600
        via-cyan-500
        to-indigo-600
        bg-clip-text
        text-transparent
      "
            >
              to stay connected.
            </span>
          </h2>

          <p
            className="
      mt-5
      text-sm
      sm:text-base
      md:text-lg
      leading-relaxed
      text-muted
      max-w-xl
      mx-auto
    "
          >
            One powerful workspace for meetings, messaging, screen sharing, and
            everything in between.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div
          className="
    grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    gap-5
    lg:gap-6
  "
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                delay: i * 0.08,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{
                y: -8,
                transition: { duration: 0.25 },
              }}
              className="
          group
          relative
          overflow-hidden
          rounded-3xl
          border border-slate-200/80
          bg-white/65
          backdrop-blur-xl
          p-6
          sm:p-7
          shadow-[0_10px_40px_rgba(30,64,175,0.06)]
          hover:border-blue-200
          hover:shadow-[0_20px_55px_rgba(37,99,235,0.13)]
          transition-all
          duration-500
        "
            >
              {/* Animated card glow */}
              <div
                className="
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-40
          w-40
          rounded-full
          bg-blue-400/0
          blur-[55px]
          group-hover:bg-blue-400/20
          transition-all
          duration-700
        "
              />

              {/* Subtle top gradient */}
              <div
                className="
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-blue-400/0
          to-transparent
          group-hover:via-blue-400/60
          transition-all
          duration-500
        "
              />

              {/* Icon */}
              <motion.div
                whileHover={{
                  scale: 1.08,
                  rotate: 3,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
                className={`
            relative
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            ${f.gradient}
            shadow-lg
            shadow-blue-500/10
            mb-6
            ring-1
            ring-white/50
            group-hover:shadow-blue-500/20
            transition-shadow
            duration-500
          `}
              >
                <f.icon size={22} strokeWidth={2} className="text-white" />

                {/* Icon shine */}
                <div
                  className="
            absolute
            inset-0
            rounded-2xl
            bg-gradient-to-br
            from-white/25
            via-transparent
            to-transparent
            opacity-60
          "
                />
              </motion.div>

              {/* Number */}
              <span
                className="
          absolute
          right-6
          top-6
          text-[11px]
          font-semibold
          tracking-widest
          text-slate-300
          group-hover:text-blue-200
          transition-colors
          duration-300
        "
              >
                0{i + 1}
              </span>

              {/* Content */}
              <div className="relative">
                <h3
                  className="
            text-lg
            sm:text-xl
            font-semibold
            tracking-tight
            text-midnight-navy
            group-hover:text-electric-blue
            transition-colors
            duration-300
          "
                >
                  {f.title}
                </h3>

                <p
                  className="
            mt-2.5
            text-sm
            leading-6
            text-muted
            max-w-sm
          "
                >
                  {f.desc}
                </p>
              </div>

              {/* Bottom arrow */}
              <div
                className="
          relative
          mt-6
          flex
          items-center
          gap-2
          text-xs
          font-semibold
          text-slate-400
          group-hover:text-electric-blue
          transition-colors
          duration-300
        "
              >
                <div>
                  <span
                    className="cursor-pointer"
                    onClick={() => navigate("/login")}
                  >
                    Explore feature
                  </span>
                </div>

                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  className="text-sm"
                >
                  →
                </motion.span>
              </div>

              {/* Bottom accent */}
              <div
                className="
          absolute
          bottom-0
          left-7
          right-7
          h-[2px]
          rounded-full
          bg-gradient-to-r
          from-transparent
          via-blue-500/0
          to-transparent
          group-hover:via-blue-500/60
          transition-all
          duration-500
        "
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="
      mt-12
      flex
      flex-wrap
      items-center
      justify-center
      gap-x-6
      gap-y-3
      text-xs
      sm:text-sm
      text-slate-400
    "
        >
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            HD video
          </span>

          <span className="hidden sm:block h-3 w-px bg-slate-200" />

          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            Real-time communication
          </span>

          <span className="hidden sm:block h-3 w-px bg-slate-200" />

          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Secure by design
          </span>
        </motion.div>
      </section>

      {/* Security */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="rounded-3xl p-10 md:p-14 bg-midnight-navy text-white text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-streamly-gradient opacity-20 animate-gradient-pan" />
          <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-cyan/20 blur-3xl" />
          <ShieldCheck
            size={40}
            className="relative mx-auto mb-4 text-cyan animate-glow-pulse"
          />
          <h2 className="relative text-2xl md:text-4xl font-bold mb-3">
            Security you can trust
          </h2>
          <p className="relative text-white/70 max-w-xl mx-auto">
            Every session is protected with hashed credentials, secure HttpOnly
            cookies, and strict server-side permission checks — so your
            conversations stay yours.
          </p>
        </motion.div>
      </section>






      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full border border-blue-200/60 bg-blue-50/70 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-700">
              Trusted by teams
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-midnight-navy leading-[1.05]">
            Loved by{" "}
            <span className="bg-gradient-to-r from-blue-500 via-teal-500 to-blue-500 bg-clip-text text-transparent">
              modern teams
            </span>
          </h2>

          {/* Description */}
          <p className="mt-5 text-base md:text-lg leading-relaxed text-slate-500 max-w-xl mx-auto">
            Simple, seamless communication that helps teams connect,
            collaborate, and get more done together.
          </p>
        </motion.div>

        <Testimonial />
       
      </section>





      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-30">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
          transition={{ duration: 0.7 }}
          className="
      relative overflow-hidden
      rounded-[2rem]
      border border-blue-200/40
      bg-gradient-to-br from-[#1e4b86] via-[#102f59] to-[#173248]
      shadow-[0_30px_100px_rgba(37,99,235,0.22)]
    "
        >
          {/* Ambient glows */}
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-blue-500/20 blur-[100px]" />
          <div className="absolute -bottom-40 -right-20 w-96 h-96 rounded-full bg-cyan-400/15 blur-[110px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-500/10 blur-[100px]" />

          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `
          linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
        `,
              backgroundSize: "42px 42px",
            }}
          />

          {/* Decorative floating circles */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-[15%] w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.8)]"
          />

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-20 left-[12%] w-2 h-2 rounded-full bg-blue-300 shadow-[0_0_15px_rgba(147,197,253,0.8)]"
          />

          {/* Content */}
          <div className="relative z-10 px-7 py-16 md:px-16 md:py-20 lg:px-24 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.07] backdrop-blur-md mb-7">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />

              <span className="text-xs sm:text-sm font-medium text-blue-100">
                Your next conversation starts here
              </span>
            </div>

            {/* Heading */}
            <h2
              className="
        text-4xl sm:text-5xl md:text-6xl lg:text-7xl
        font-extrabold
        tracking-tight
        leading-[1.02]
        text-white
        max-w-4xl
        mx-auto
      "
            >
              Meet face-to-face,
              <br />
              <span
                className="
          bg-gradient-to-r
          from-cyan-300
          via-blue-300
          to-indigo-300
          bg-clip-text
          text-transparent
        "
              >
                wherever you are.
              </span>
            </h2>

            {/* Description */}
            <p
              className="
        mt-6
        text-base sm:text-lg
        leading-7
        text-blue-100/70
        max-w-2xl
        mx-auto
      "
            >
              Create a Streamly account and start making effortless video calls,
              connecting with your team, friends, and people who matter.
            </p>

            {/* Actions */}
            <div
              className="
        mt-9
        flex flex-col sm:flex-row
        items-center justify-center
        gap-3
      "
            >
              <motion.button
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 15px 40px rgba(56,189,248,0.25)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/signup")}
                className="
             group
  relative
  inline-flex
  items-center
  justify-center
  gap-2
  w-full sm:w-auto
  rounded-xl
  bg-gradient-to-r
  from-blue-600
  via-blue-500
  to-cyan-500
  px-4
  py-3
  text-sm
  font-semibold
  text-white
  shadow-lg
  shadow-blue-500/20
  transition-all
  duration-300
  hover:-translate-y-0.5
  hover:shadow-xl
  hover:shadow-blue-500/30
          "
              >
                Start calling for free
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/login")}
                className="
            w-full sm:w-auto
            px-7 py-3.5
            rounded-xl
            border border-white/15
            bg-white/[0.06]
            backdrop-blur-md
            text-white
            font-semibold
            hover:bg-white/[0.11]
            transition-all duration-300
          "
              >
                Sign in
              </motion.button>
            </div>

            {/* Feature highlights */}
            <div
              className="
        mt-10
        flex flex-wrap
        items-center justify-center
        gap-x-6 gap-y-3
        text-xs sm:text-sm
        text-blue-100/60
      "
            >
              <div className="flex items-center gap-2">
                <span className="text-cyan-300">✓</span>
                HD video calls
              </div>

              <div className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />

              <div className="flex items-center gap-2">
                <span className="text-cyan-300">✓</span>
                Streamly Instant meetings
              </div>

              <div className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />

              <div className="flex items-center gap-2">
                <span className="text-cyan-300">✓</span>
                Easy to connect
              </div>
            </div>

            {/* Bottom mini UI */}
            <div className="mt-14 flex justify-center">
              <div
                className="
          flex items-center gap-3
          px-4 py-2.5
          rounded-2xl
          border border-white/10
          bg-black/10
          backdrop-blur-md
          shadow-inner
        "
              >
                {/* Avatars */}
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 border-2 border-[#102f59]" />
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-300 to-indigo-500 border-2 border-[#102f59]" />
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-300 to-cyan-500 border-2 border-[#102f59]" />
                </div>

                <div className="h-5 w-px bg-white/10" />

                <span className="text-xs text-blue-100/60">
                  Connect with your people on Streamly
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

       <Faq/>

      {/* Footer */}
      <footer className="relative mt-8 overflow-hidden border-t border-slate-200/70 bg-white/70 backdrop-blur-2xl">
        {/* Background glow */}
        <div className="absolute -top-24 left-1/4 w-72 h-72 rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-72 h-72 rounded-full bg-cyan-400/10 blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-7">
          {/* Brand */}
          <div className="text-center mb-10 lg:hidden">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="h-10 w-10 rounded-xl bg-streamly-gradient flex items-center justify-center shadow-lg shadow-electric-blue/20">
                <Video size={18} className="text-white" />
              </div>

              <span className="font-extrabold text-midnight-navy text-xl">Streamly</span>
            </div>

            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Simple, reliable video calling for teams, friends, and
              conversations that matter.
            </p>

            {/* Social buttons */}

            <div className="flex justify-center gap-3 mt-5">
              {/* {[Twitter, Github, Linkedin].map((Icon, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -3, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center shadow-sm hover:text-electric-blue hover:border-blue-200 hover:shadow-md transition-all duration-200"
          >
            <Icon size={16} />
          </motion.button>
        ))} */}
              <div className="flex justify-center gap-3 mt-5">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    whileHover={{ y: -3, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="
        h-10 w-10
        rounded-xl
        bg-white
        border border-slate-200
        text-slate-500
        flex items-center justify-center
        shadow-sm
        hover:text-electric-blue
        hover:border-blue-200
        hover:shadow-md
        transition-all duration-200
      "
                  >
                    <Icon size={16} />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop footer */}
          <div className="hidden lg:grid grid-cols-4 gap-16 pb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-10 w-10 rounded-xl bg-streamly-gradient flex items-center justify-center shadow-lg shadow-electric-blue/20">
                  <Video size={18} className="text-white" />
                </div>

                <span className="font-extrabold text-midnight-navy text-xl">
                  Streamly
                </span>
              </div>

              <p className="text-sm text-slate-500 leading-6 max-w-xs">
                Simple, reliable video calling for teams, friends, and
                conversations that matter.
              </p>

              <div className="flex gap-3 mt-5">
                {/* {[Twitter, Github, Linkedin].map((Icon, i) => (
            <button
              key={i}
              className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:text-electric-blue hover:border-blue-200 hover:shadow-md transition-all"
            >
              <Icon size={16} />
            </button>
          ))} */}
                <div className="flex justify-center gap-3 mt-5">
                  {socialLinks.map(({ icon: Icon, href, label }) => (
                    <motion.a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      whileHover={{ y: -3, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="
        h-10 w-10
        rounded-xl
        bg-white
        border border-slate-200
        text-slate-500
        flex items-center justify-center
        shadow-sm
        hover:text-electric-blue
        hover:border-blue-200
        hover:shadow-md
        transition-all duration-200
      "
                    >
                      <Icon size={16} />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>

            {/* Product */}
            <div className="text-center">
              <h4 className="font-bold text-midnight-navy mb-4 text-sm">Product</h4>

              <ul className="space-y-3 text-sm text-slate-500">
                {[
                  "Video Meetings",
                  "Real-time Chat",
                  "Screen Sharing",
                  "Security",
                ].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => setFooterModal(item)}
                      className="hover:text-electric-blue hover:translate-x-1 transition-all duration-200"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="text-center">
              <h4 className="font-bold text-midnight-navy mb-4 text-sm">Company</h4>

              <ul className="space-y-3 text-sm text-slate-500">
                {["About", "Careers", "Blog", "Contact"].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => setFooterModal(item)}
                      className="hover:text-electric-blue hover:translate-x-1 transition-all duration-200"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="font-bold text-midnight-navy mb-5 text-sm">Account</h4>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm hover:text-electric-blue hover:border-blue-300 hover:shadow-md transition-all"
                >
                  Login
                </button>

                <button
                  onClick={() => navigate("/signup")}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-streamly-gradient shadow-md hover:shadow-lg transition-all"
                >
                  Sign up
                </button>

                <button
                  onClick={() => navigate("/admin/login")}
                  className="group px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 group-hover:animate-pulse" />
                    Admin
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Product + Company */}
          {/* Mobile Product + Company */}
          <div className="lg:hidden grid grid-cols-2 gap-8 max-w-sm mx-auto mb-10">
            {/* Product */}
            <div className="text-center">
              <h4 className="font-bold text-midnight-navy mb-4 text-sm">Product</h4>

              <ul className="space-y-3 text-sm text-slate-500">
                {[
                  "Video Meetings",
                  "Real-time Chat",
                  "Screen Sharing",
                  "Security",
                ].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => setFooterModal(item)}
                      className="
              hover:text-electric-blue
              hover:translate-x-1
              transition-all duration-200
            "
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="text-center">
              <h4 className="font-bold text-midnight-navy mb-4 text-sm">Company</h4>

              <ul className="space-y-3 text-sm text-slate-500">
                {["About", "Careers", "Blog", "Contact"].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => setFooterModal(item)}
                      className="
              hover:text-electric-blue
              hover:translate-x-1
              transition-all duration-200
            "
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Mobile Account */}
          <div className="lg:hidden mb-10">
            <h4 className="text-center font-bold text-midnight-navy mb-4 text-sm">
              Account
            </h4>

            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm hover:text-electric-blue hover:border-blue-300 transition-all whitespace-nowrap"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-streamly-gradient shadow-md hover:shadow-lg transition-all whitespace-nowrap"
              >
                Sign up
              </button>

              <button
                onClick={() => navigate("/admin/login")}
                className="group px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all whitespace-nowrap"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 group-hover:animate-pulse" />
                  Admin
                </span>
              </button>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-200/70 pt-6 text-center">
            <p className="text-xs text-slate-400">
              © 2026 Streamly. All rights reserved.
            </p>

            <p className="text-[11px] text-slate-400 mt-2">
              Built for better conversations.
            </p>
          </div>
        </div>
      </footer>

      {/* Footer Information Modal */}
      <AnimatePresence>
        {footerModal && footerInfo[footerModal] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFooterModal(null)}
            className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        p-5
        bg-slate-950/40
        backdrop-blur-md
      "
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="
          relative
          w-full max-w-lg
          rounded-3xl
          overflow-hidden
          bg-white/95
          backdrop-blur-2xl
          border border-white
          shadow-[0_30px_100px_rgba(15,23,42,0.25)]
        "
            >
              {/* Top gradient */}
              <div
                className="
          h-2
          bg-gradient-to-r
          from-blue-500
          via-cyan-400
          to-indigo-500
        "
              />

              <div className="p-7 sm:p-9">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="
                h-12 w-12
                shrink-0
                rounded-2xl
                bg-gradient-to-br
                from-blue-500
                to-cyan-400
                flex items-center justify-center
                shadow-lg
                shadow-blue-500/20
              "
                    >
                      {(() => {
                        const Icon = footerInfo[footerModal].icon;
                        return <Icon size={21} className="text-white" />;
                      })()}
                    </div>

                    <div>
                      <h3
                        className="
                  text-xl sm:text-2xl
                  font-bold
                  text-midnight-navy
                "
                      >
                        {footerInfo[footerModal].title}
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">Streamly</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setFooterModal(null)}
                    className="
                h-9 w-9
                rounded-xl
                flex items-center justify-center
                text-slate-400
                bg-slate-100
                hover:bg-slate-200
                hover:text-slate-700
                transition-all
              "
                  >
                    <X size={17} />
                  </button>
                </div>

                {/* Description */}
                <p
                  className="
            mt-7
            text-base
            font-medium
            leading-7
            text-slate-700
          "
                >
                  {footerInfo[footerModal].description}
                </p>

                {/* Details */}
                <div
                  className="
            mt-5
            rounded-2xl
            border border-blue-100
            bg-blue-50/60
            p-5
          "
                >
                  <p
                    className="
              text-sm
              leading-6
              text-slate-600
            "
                  >
                    {footerInfo[footerModal].details}
                  </p>
                </div>

                {/* Contact email */}
                {footerInfo[footerModal].email && (
                  <a
                    href={`mailto:${footerInfo[footerModal].email}`}
                    className="
                mt-5
                flex items-center justify-center
                gap-2
                w-full
                px-5 py-3
                rounded-xl
                bg-streamly-gradient
                text-white
                text-sm
                font-semibold
                shadow-lg
                shadow-blue-500/20
                hover:shadow-xl
                transition-all
              "
                  >
                    <Mail size={16} />
                    {footerInfo[footerModal].email}
                  </a>
                )}

                {/* Close */}
                <button
                  onClick={() => setFooterModal(null)}
                  className="
              mt-4
              w-full
              py-3
              rounded-xl
              text-sm
              font-semibold
              text-slate-600
              bg-slate-100
              hover:bg-slate-200
              transition-colors
            "
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
