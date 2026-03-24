"use client"

import * as React from "react"
import { motion } from "framer-motion"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="flex flex-col items-center"
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-5xl font-serif text-white italic"
          >
            M
          </motion.div>
          <span className="text-4xl font-bold tracking-tight text-white">Mantoric</span>
        </div>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-zinc-500 font-light tracking-[0.3em] uppercase text-[10px]"
        >
          The Elite Knowledge Ecosystem
        </motion.p>
      </motion.div>
    </div>
  )
}
