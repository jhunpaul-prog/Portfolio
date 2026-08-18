import { motion } from "framer-motion";
import { Terminal, FileText } from "lucide-react";
import { useScrollHeader } from "../hooks/useScrollHeader";

export default function Navbar({ onOpenResume }) {
  const isVisible = useScrollHeader();

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-surface/85 border-b border-cardBorder shadow-lg shadow-black/20"
    >
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="#hero"
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2"
        >
          <span className="p-1.5 rounded-lg bg-brand/10 text-brand border border-brand/20">
            <Terminal className="w-4 h-4" />
          </span>
          <span>
            JP<span className="text-brand">.dev</span>
          </span>
        </a>

        <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
          <a href="#hero" className="hover:text-brand transition">
            About Me
          </a>
          <a href="#projects" className="hover:text-brand transition">
            Projects
          </a>
          <a href="#contact" className="hover:text-brand transition">
            Contact
          </a>
        </div>

        <button
          onClick={onOpenResume}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-brand hover:bg-brandDark text-slate-950 transition shadow-lg shadow-brand/20 flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          Resume
        </button>
      </nav>
    </motion.header>
  );
}
