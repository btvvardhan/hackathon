import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-gray-900 to-emerald-950 text-white">
      {/* Hero */}
      <motion.header
        className="py-20 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-emerald-300 via-white to-emerald-400 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-gray-300 max-w-md mx-auto">
          Have questions? Reach out — we’d love to hear from you.
        </p>
      </motion.header>

      {/* Form */}
      <motion.div
        className="max-w-lg w-full mx-auto bg-black/40 border border-emerald-800 rounded-2xl shadow-lg p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <form className="space-y-4">
          <motion.div whileHover={{ scale: 1.02 }}>
            <Input
              placeholder="Your Name"
              className="bg-black/40 text-white border-gray-700 focus:border-emerald-400 text-sm"
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Input
              type="email"
              placeholder="Your Email"
              className="bg-black/40 text-white border-gray-700 focus:border-emerald-400 text-sm"
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Textarea
              placeholder="Your Message"
              className="min-h-[100px] bg-black/40 text-white border-gray-700 focus:border-emerald-400 text-sm"
            />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Button className="w-full text-sm py-5 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-semibold shadow-lg shadow-emerald-500/30 hover:opacity-90">
              Send Message
            </Button>
          </motion.div>
        </form>
      </motion.div>

      {/* Footer CTA */}
      <motion.footer
        className="mt-auto py-16 bg-gradient-to-r from-emerald-600 to-teal-500 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-2xl font-bold text-white">We’ll get back to you fast ⚡</h2>
        <p className="mt-2 text-base text-emerald-100">
          Your message goes straight to our team — no bots, no delays.
        </p>
      </motion.footer>
    </div>
  )
}
