import { useState, useRef, useEffect } from "react";
import { Check, Copy, ExternalLink, Mail, Phone } from "lucide-react";

export default function ContactItem({
  icon: Icon,
  value,
  type,
  activeId,
  setActiveId,
  id,
  className = "",
}) {
  const [copied, setCopied] = useState(false);
  const isOpen = activeId === id;
  const containerRef = useRef(null);

  // Close when clicking outside of this specific contact card
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        if (isOpen) {
          setActiveId(null);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setActiveId]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setActiveId(isOpen ? null : id);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setActiveId(null);
    }, 1500);
  };

  // Gmail direct browser web compose URL
  const gmailWebComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(value)}`;
  const mailtoUrl = `mailto:${value}`;
  const telUrl = `tel:${value ? value.replace(/\s+/g, "") : ""}`;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Contact Badge Button */}
      <div
        onClick={handleToggle}
        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-card border transition-all duration-300 cursor-pointer select-none shadow-lg ${
          isOpen
            ? "border-brand ring-2 ring-brand/30 bg-card shadow-brand/20"
            : "border-brand/40 hover:border-brand hover:shadow-brand/10"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && <Icon className="w-4 h-4 text-brand flex-shrink-0" />}
          <span className="truncate text-xs font-semibold text-slate-100">
            {value}
          </span>
        </div>
        <span className="text-[10px] text-brand/80 font-bold uppercase tracking-wider ml-2 flex-shrink-0">
          {isOpen ? "Close" : ""}
        </span>
      </div>

      {/* Popover Action Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 right-0 top-full mt-2 p-2 rounded-xl bg-surface/95 border border-brand/50 shadow-2xl z-50 flex flex-col sm:flex-row items-center gap-2 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
        >
          {type === "email" ? (
            <>
              {/* Web Gmail (Desktop-Safe) */}
              <a
                href={gmailWebComposeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActiveId(null)}
                className="w-full sm:flex-1 py-2 px-3 rounded-lg bg-brand/15 hover:bg-brand/25 text-brand text-xs font-bold flex items-center justify-center gap-1.5 transition border border-brand/20"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Gmail Web
              </a>

              {/* Default Mail App */}
              <a
                href={mailtoUrl}
                onClick={() => setActiveId(null)}
                className="w-full sm:flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition border border-cardBorder"
              >
                <Mail className="w-3.5 h-3.5" />
                Mail App
              </a>
            </>
          ) : (
            <a
              href={telUrl}
              onClick={() => setActiveId(null)}
              className="w-full sm:flex-1 py-2 px-3 rounded-lg bg-brand/15 hover:bg-brand/25 text-brand text-xs font-bold flex items-center justify-center gap-1.5 transition border border-brand/20"
            >
              <Phone className="w-3.5 h-3.5" />
              Direct Dial
            </a>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="w-full sm:flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition border border-cardBorder"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
