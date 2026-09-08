// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { ShieldCheck, Loader2 } from "lucide-react";
// import toast from "react-hot-toast";
// import api from "../lib/api";
// import { useAuth } from "../context/AuthContext.jsx";

// export default function AdminLogin() {
//   const navigate = useNavigate();
//   const { setUser } = useAuth();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const { data } = await api.post("/admin/login", form);
//       setUser(data.user);
//       toast.success("Welcome back, admin.");
//       navigate("/admin");
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Invalid admin credentials.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-midnight-navy flex items-center justify-center px-4">
//       <motion.div
//         initial={{ opacity: 0, y: 16 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-sm bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8"
//       >
//         <div className="flex flex-col items-center mb-8">
//           <div className="h-11 w-11 rounded-xl bg-cyan/20 flex items-center justify-center mb-3">
//             <ShieldCheck size={20} className="text-cyan" />
//           </div>
//           <h1 className="text-xl font-bold text-white">Admin Login</h1>
//           <p className="text-sm text-white/50 mt-1">Restricted access</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="text-sm font-medium text-white/80">Admin email</label>
//             <input
//               type="email"
//               required
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               className="mt-1.5 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan/60"
//             />
//           </div>
//           <div>
//             <label className="text-sm font-medium text-white/80">Password</label>
//             <input
//               type="password"
//               required
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//               className="mt-1.5 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan/60"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 rounded-xl text-ink font-semibold bg-cyan hover:bg-cyan/90 flex items-center justify-center gap-2 disabled:opacity-70"
//           >
//             {loading && <Loader2 size={16} className="animate-spin" />}
//             {loading ? "Signing in..." : "Sign in"}
//           </button>
//         </form>
//       </motion.div>
//     </div>
//   );
// }

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/admin/login", form);

      setUser(data.user);

      toast.success("Welcome back, admin.");

      navigate("/admin");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
      relative
      min-h-screen
      overflow-hidden
      bg-[#070b14]
      flex
      items-center
      justify-center
      px-4
      py-10
      sm:px-6
    "
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      {/* Red ambient glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          -top-48
          left-1/2
          h-[550px]
          w-[550px]
          -translate-x-1/2
          rounded-full
          bg-red-600/20
          blur-[130px]
        "
      />

      {/* Left glow */}
      <motion.div
        animate={{
          x: [0, 45, 0],
          y: [0, -25, 0],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          -bottom-40
          -left-40
          h-[420px]
          w-[420px]
          rounded-full
          bg-rose-500/10
          blur-[120px]
        "
      />

      {/* Right glow */}
      <motion.div
        animate={{
          x: [0, -35, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          -right-40
          top-1/3
          h-[400px]
          w-[400px]
          rounded-full
          bg-red-700/10
          blur-[120px]
        "
      />

      {/* Grid */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.055]
        "
        style={{
          backgroundImage:
            "linear-gradient(rgba(239,68,68,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.7) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Vignette */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_25%,rgba(7,11,20,0.75)_100%)]
        "
      />

      {/* =====================================================
          CARD
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.75,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="
          relative
          z-10
          w-full
          max-w-[450px]
        "
      >
        {/* Red outer glow */}
        <div
          className="
            absolute
            -inset-[1px]
            rounded-[30px]
            bg-gradient-to-br
            from-red-500/40
            via-red-500/5
            to-rose-600/30
            blur-sm
          "
        />

        {/* Main card */}
        <div
          className="
            relative
            overflow-hidden
            rounded-[30px]
            border
            border-white/[0.09]
            bg-white/[0.045]
            backdrop-blur-2xl
            shadow-[0_35px_100px_rgba(0,0,0,0.45)]
          "
        >
          {/* Top red accent */}
          <div
            className="
              absolute
              left-0
              right-0
              top-0
              h-[2px]
              bg-gradient-to-r
              from-transparent
              via-red-500
              to-transparent
            "
          />

          {/* Decorative red circle */}
          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-56
              w-56
              rounded-full
              bg-red-500/[0.07]
              blur-3xl
            "
          />

          <div
            className="
            relative
            px-6
            py-8
            sm:px-9
            sm:py-9
          "
          >
            {/* =================================================
                HEADER
            ================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                y: -12,
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
              {/* Security icon */}
              <motion.div
                whileHover={{
                  scale: 1.07,
                  rotate: 3,
                }}
                className="relative mb-5"
              >
                {/* Icon glow */}
                <motion.div
                  animate={{
                    scale: [1, 1.18, 1],
                    opacity: [0.2, 0.38, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    absolute
                    -inset-4
                    rounded-3xl
                    bg-red-500/25
                    blur-xl
                  "
                />

                {/* Icon box */}
                <div
                  className="
                  relative
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-red-400/20
                  bg-gradient-to-br
                  from-red-500/20
                  via-red-500/10
                  to-transparent
                  shadow-[0_0_35px_rgba(239,68,68,0.15)]
                "
                >
                  <ShieldCheck
                    size={30}
                    strokeWidth={1.8}
                    className="text-red-400"
                  />

                  {/* Status dot */}
                  <motion.span
                    animate={{
                      scale: [1, 1.25, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="
                      absolute
                      right-1.5
                      top-1.5
                      h-2
                      w-2
                      rounded-full
                      bg-red-400
                      shadow-[0_0_10px_rgba(248,113,113,0.9)]
                    "
                  />
                </div>
              </motion.div>

              {/* Admin badge */}
              <div
                className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-red-400/15
                bg-red-500/[0.07]
                px-3
                py-1.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-red-400
              "
              >
                <Activity size={11} className="animate-pulse" />
                Secure Admin Portal
              </div>

              <h1
                className="
                mt-4
                text-2xl
                sm:text-[27px]
                font-bold
                tracking-tight
                text-white
                text-center
              "
              >
                Admin Login
              </h1>

              <p
                className="
                mt-1.5
                text-sm
                text-white/40
                text-center
              "
              >
                Restricted access to the Streamly control center
              </p>
            </motion.div>

            {/* =================================================
                FORM
            ================================================== */}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: -12,
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
                  htmlFor="admin-email"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-white/60
                  "
                >
                  Admin email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-white/25
                      transition-colors
                      duration-300
                    "
                  />

                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    className="
                      peer
                      w-full
                      rounded-2xl
                      border
                      border-white/[0.09]
                      bg-white/[0.035]
                      py-3.5
                      pl-11
                      pr-4
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-white/20
                      hover:border-white/[0.15]
                      focus:border-red-500/50
                      focus:bg-white/[0.055]
                      focus:ring-4
                      focus:ring-red-500/[0.08]
                      transition-all
                      duration-300
                    "
                  />

                  {/* Focus line */}
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
                    from-red-600
                    via-red-400
                    to-rose-500
                    peer-focus:w-[88%]
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
                  x: -12,
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
                  htmlFor="admin-password"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-white/60
                  "
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-white/25
                    "
                  />

                  <input
                    id="admin-password"
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                    className="
                      peer
                      w-full
                      rounded-2xl
                      border
                      border-white/[0.09]
                      bg-white/[0.035]
                      py-3.5
                      pl-11
                      pr-4
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-white/20
                      hover:border-white/[0.15]
                      focus:border-red-500/50
                      focus:bg-white/[0.055]
                      focus:ring-4
                      focus:ring-red-500/[0.08]
                      transition-all
                      duration-300
                    "
                  />

                  {/* Focus line */}
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
                    from-red-600
                    via-red-400
                    to-rose-500
                    peer-focus:w-[88%]
                    transition-all
                    duration-300
                  "
                  />
                </div>
              </motion.div>

              {/* =================================================
                  BUTTON
              ================================================== */}

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
                  mt-2
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  overflow-hidden
                  rounded-2xl
                  border
                  border-red-400/20
                  bg-gradient-to-r
                  from-red-600
                  via-red-500
                  to-rose-500
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-red-900/30
                  hover:shadow-xl
                  hover:shadow-red-500/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  transition-all
                  duration-300
                "
              >
                {/* Moving shine */}
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

                {/* Button content */}
                <span
                  className="
                  relative
                  z-10
                  flex
                  items-center
                  gap-2
                "
                >
                  {loading && <Loader2 size={17} className="animate-spin" />}

                  {loading ? "Signing in..." : "Sign in"}

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

            {/* =================================================
                SECURITY FOOTER
            ================================================== */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.55,
                duration: 0.6,
              }}
              className="
                mt-6
                flex
                items-center
                justify-center
                gap-2
                border-t
                border-white/[0.06]
                pt-5
                text-[11px]
                text-white/30
              "
            >
              <ShieldCheck size={14} className="text-red-400/80" />
              Authorized personnel only
            </motion.div>

            {/* Tiny status */}
            <div
              className="
              mt-4
              flex
              items-center
              justify-center
              gap-2
              text-[10px]
              uppercase
              tracking-[0.15em]
              text-white/20
            "
            >
              <span
                className="
                h-1.5
                w-1.5
                rounded-full
                bg-red-400
                shadow-[0_0_8px_rgba(248,113,113,0.8)]
              "
              />
              Streamly secure environment
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
