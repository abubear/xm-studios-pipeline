"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="login-gradient noise-overlay min-h-screen flex items-center justify-center p-4 relative">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Logo */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <h1 className="font-heading text-4xl font-bold tracking-tight">
              <span className="text-amber-500">XM</span>
              <span className="text-zinc-100"> Studios</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-2 tracking-widest uppercase font-medium">
              Production Pipeline
            </p>
          </motion.div>
        </div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="glass-card rounded-2xl p-8 shadow-2xl shadow-black/20 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-7 h-7 text-amber-500" />
          </div>

          <h2 className="font-heading text-xl font-semibold text-zinc-100 mb-3">
            Access by invitation only
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            The XM Studios Production Pipeline is an internal tool. New accounts
            are created by the system administrator — there is no self-service
            sign-up.
          </p>

          <div className="p-4 bg-zinc-800/60 rounded-xl border border-zinc-700/40 mb-6">
            <p className="text-zinc-400 text-sm">
              Contact{" "}
              <span className="text-amber-400 font-medium">
                your administrator
              </span>{" "}
              to request access or to have your credentials reset.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
