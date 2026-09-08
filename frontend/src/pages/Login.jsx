

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Video,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="streamly-bg relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-8 sm:px-6">

      {/* Background glow - top */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          -top-40
          left-1/2
          h-[500px]
          w-[500px]
          -translate-x-1/2
          rounded-full
          bg-blue-400/20
          blur-[120px]
        "
      />

      {/* Background glow - bottom left */}
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          -bottom-40
          -left-32
          h-[400px]
          w-[400px]
          rounded-full
          bg-cyan-400/15
          blur-[110px]
        "
      />

      {/* Background glow - right */}
      <motion.div
        animate={{
          x: [0, -35, 0],
          y: [0, 25, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          -right-32
          top-1/3
          h-[350px]
          w-[350px]
          rounded-full
          bg-indigo-400/10
          blur-[110px]
        "
      />

      {/* Background grid */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.035]
        "
        style={{
          backgroundImage:
            "linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      {/* Main wrapper */}
      <motion.div
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.97,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative w-full max-w-[460px]"
      >

        {/* Outer glow */}
        <div
          className="
            absolute
            -inset-[1px]
            rounded-[30px]
            bg-gradient-to-br
            from-blue-400/40
            via-cyan-400/10
            to-indigo-500/30
            blur-sm
          "
        />

        {/* Card */}
 <div
  className="
    relative
    overflow-hidden
    rounded-[30px]
    border
    border-slate-200/80
    dark:border-slate-700/60
    bg-white/80
    dark:bg-slate-900/65
    backdrop-blur-2xl
    shadow-[0_30px_90px_rgba(30,64,175,0.14)]
    dark:shadow-[0_30px_90px_rgba(0,0,0,0.35)]
  "
>

          {/* Top gradient line */}
          <div
            className="
              absolute
              left-0
              right-0
              top-0
              h-1
              bg-gradient-to-r
              from-blue-600
              via-cyan-400
              to-indigo-600
            "
          />

          {/* Card decoration */}
          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-48
              w-48
              rounded-full
              bg-blue-500/[0.06]
              blur-2xl
            "
          />

          <div className="relative px-6 py-8 sm:px-10 sm:py-10">

            {/* ================= BRAND ================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.15,
                duration: 0.5,
              }}
              className="flex flex-col items-center"
            >

              {/* Logo */}
              <motion.button
                type="button"
                onClick={() => navigate("/")}
                whileHover={{
                  scale: 1.07,
                  rotate: -3,
                }}
                whileTap={{
                  scale: 0.94,
                }}
                className="
                  relative
                  mb-4
                  h-14
                  w-14
                  rounded-2xl
                  bg-gradient-to-br
                  from-blue-600
                  via-blue-500
                  to-cyan-500
                  flex
                  items-center
                  justify-center
                  shadow-xl
                  shadow-blue-500/25
                  ring-1
                  ring-white/80
                  overflow-hidden
                "
              >

                {/* Logo glow */}
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.2, 0.35, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    pointer-events-none
                    absolute
                    -inset-3
                    rounded-2xl
                    bg-blue-500/30
                    blur-xl
                  "
                />

                {/* Logo shine */}
                <motion.div
                  animate={{
                    x: ["-130%", "160%"],
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut",
                  }}
                  className="
                    pointer-events-none
                    absolute
                    inset-y-0
                    w-1/2
                    bg-gradient-to-r
                    from-transparent
                    via-white/30
                    to-transparent
                    skew-x-[-20deg]
                  "
                />

                <Video
                  size={25}
                  strokeWidth={2}
                  className="relative z-10 text-white"
                />
              </motion.button>

              {/* Streamly wordmark */}
              <div
                className="
                  flex
                  items-center
                  text-2xl
                  font-black
                  tracking-[-0.06em]
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
                    ml-1.5
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-cyan-400
                    shadow-[0_0_10px_rgba(34,211,238,0.9)]
                  "
                />
              </div>

              <h1
                className="
                  mt-4
                  text-2xl
                  sm:text-[27px]
                  font-bold
                  tracking-tight
                  text-ink
                  text-center
                "
              >
                Welcome back
              </h1>

              <p className="mt-1.5 text-sm text-muted text-center">
                Log in to continue to Streamly
              </p>
            </motion.div>

            {/* ================= FORM ================= */}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Email */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.25,
                  duration: 0.5,
                }}
              >
          <label
  htmlFor="email"
  className="
    block
    mb-2
    text-xs
    font-bold
    uppercase
    tracking-wider
    text-slate-600
    dark:text-slate-300
  "
>
                  Email address
                </label>

                <div className="relative">
                 <input
  id="email"
  type="email"
  required
  value={form.email}
  onChange={(e) =>
    setForm({
      ...form,
      email: e.target.value,
    })
  }
  placeholder="you@example.com"
  className="
    peer
    w-full
    rounded-2xl
    border
    border-slate-200
    dark:border-slate-700
    bg-slate-50/70
    dark:bg-slate-800/70
    px-4
    py-3.5
    text-sm
    text-slate-800
    dark:text-slate-100
    outline-none
    placeholder:text-slate-400
    dark:placeholder:text-slate-500
    hover:border-slate-300
    dark:hover:border-slate-600
    focus:border-blue-500
    focus:bg-white
    dark:focus:bg-slate-800
    focus:ring-4
    focus:ring-blue-500/10
    transition-all
    duration-300
  "
/>

                  <div
                    className="
                      pointer-events-none
                      absolute
                      bottom-0
                      left-1/2
                      h-[2px]
                      w-0
                      -translate-x-1/2
                      rounded-full
                      bg-gradient-to-r
                      from-blue-500
                      to-cyan-400
                      peer-focus:w-[90%]
                      transition-all
                      duration-300
                    "
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.32,
                  duration: 0.5,
                }}
              >
            <label
  htmlFor="password"
  className="
    block
    mb-2
    text-xs
    font-bold
    uppercase
    tracking-wider
    text-slate-600
    dark:text-slate-300
  "
>
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                className="
  peer
  w-full
  rounded-2xl
  border
  border-slate-200
  dark:border-slate-700
  bg-slate-50/70
  dark:bg-slate-800/70
  px-4
  py-3.5
  pr-12
  text-sm
  text-slate-800
  dark:text-slate-100
  outline-none
  placeholder:text-slate-400
  dark:placeholder:text-slate-500
  hover:border-slate-300
  dark:hover:border-slate-600
  focus:border-blue-500
  focus:bg-white
  dark:focus:bg-slate-800
  focus:ring-4
  focus:ring-blue-500/10
  transition-all
  duration-300
"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((s) => !s)
                    }
                    className="
       absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                     text-muted
hover:bg-blue-500/10
hover:text-blue-400
                      transition-all
                      duration-200
                    "
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
<div
                    className="
                      pointer-events-none
                      absolute
                      bottom-0
                      left-1/2
                      h-[2px]
                      w-0
                      -translate-x-1/2
                      rounded-full
                      bg-gradient-to-r
                      from-blue-500
                      to-cyan-400
                      peer-focus:w-[90%]
                      transition-all
                      duration-300
                    "
                  />
                 
                </div>
              </motion.div>

              {/* Login button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{
                  scale: 1.015,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="
                  group
                  relative
                  mt-1
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  overflow-hidden
                  rounded-2xl
                  bg-gradient-to-r
                  from-blue-600
                  via-blue-500
                  to-cyan-500
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-blue-500/25
                  hover:shadow-xl
                  hover:shadow-blue-500/35
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                  transition-all
                  duration-300
                "
              >

                {/* Button shine */}
                <span
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    -translate-x-full
                    bg-gradient-to-r
                    from-transparent
                    via-white/20
                    to-transparent
                    skew-x-[-20deg]
                    group-hover:translate-x-full
                    transition-transform
                    duration-700
                  "
                />

                <span className="relative z-10 flex items-center gap-2">
                  {loading && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {loading
                    ? "Logging in..."
                    : "Log in"}

                  {!loading && (
                    <motion.span
                      animate={{
                        x: [0, 3, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    >
                      <ArrowRight size={17} />
                    </motion.span>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Security */}
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.5,
                duration: 0.6,
              }}
           className="
  mt-5
  flex
  items-center
  justify-center
  gap-2
  text-[11px]
  text-slate-400
  dark:text-slate-500
"
            >
              <ShieldCheck
                size={14}
                className="text-blue-500"
              />

              Secure access to your Streamly account
            </motion.div>

            {/* Sign up */}
            <p
         className="
  mt-6
  border-t
  border-slate-100
  dark:border-slate-700/60
  pt-5
  text-center
  text-sm
  text-muted
"
            >
              Don't have an account?{" "}

              <Link
                to="/signup"
                className="
                  group
                  inline-flex
                  items-center
                  gap-1
                  font-semibold
                  text-electric-blue
                  hover:text-blue-700
                  transition-colors
                "
              >
                Sign up

                <span
                  className="
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                >
                  →
                </span>
              </Link>
            </p>

          </div>
        </div>
      </motion.div>
    </div>
  );
}