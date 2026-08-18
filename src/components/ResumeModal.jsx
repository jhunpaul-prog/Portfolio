import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ExternalLink, FileText } from "lucide-react";

export default function ResumeModal({ isOpen, onClose, activeResume }) {
  if (!isOpen) return null;

  const fileUrl = activeResume?.fileUrl || "/resume.pdf";
  const fileName = activeResume?.title || "Jhun_Paul_Ceniza_CV.pdf";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl h-[85vh] rounded-2xl bg-card border border-cardBorder flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-cardBorder flex items-center justify-between bg-surface/60">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand" />
              <div>
                <h3 className="text-sm font-bold text-white">{fileName}</h3>
                <p className="text-[10px] text-slate-400">
                  PDF Document Preview
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={fileUrl}
                download={fileName}
                className="px-3 py-1.5 rounded-lg bg-brand hover:bg-brandDark text-slate-950 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Embedded PDF / Viewer Frame */}
          <div className="flex-1 bg-surface relative">
            <iframe
              src={`${fileUrl}#toolbar=0`}
              title="Resume Preview"
              className="w-full h-full border-none"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
