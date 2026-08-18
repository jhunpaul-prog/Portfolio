import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone, MapPin, FileText, Users } from "lucide-react";
import ContactItem from "./ContactItem";
import DynamicIcon from "./DynamicIcon";
import profilePhoto from "../assets/profile.jpg";

export default function Hero({
  profileData,
  highlights = [],
  onOpenResume,
  totalViews,
  loading,
}) {
  const [activeContactId, setActiveContactId] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  if (loading || !profileData) {
    return (
      <section
        id="hero"
        className="pt-36 pb-16 min-h-[85vh] flex items-center relative z-10"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center animate-pulse">
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start gap-4">
            <div className="w-64 h-80 sm:w-72 sm:h-96 rounded-2xl bg-card border border-cardBorder" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="h-6 w-48 bg-card rounded-full" />
            <div className="h-14 w-3/4 bg-card rounded-lg" />
            <div className="h-20 w-full bg-card rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="hero"
      className="pt-36 pb-16 min-h-[85vh] flex items-center relative z-10"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
      >
        {/* Left Side: Photo & Interactive Contact Badges */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-4 flex flex-col items-center lg:items-start gap-4"
        >
          <div className="relative group w-64 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden p-1 bg-gradient-to-b from-brand/50 via-cardBorder to-transparent shadow-2xl">
            <div className="absolute inset-0 bg-brand/20 blur-2xl rounded-2xl opacity-50 group-hover:opacity-80 transition duration-500 pointer-events-none" />

            <div className="relative w-full h-full rounded-xl overflow-hidden bg-card border border-brand/30">
              <img
                src={profileData.avatarUrl || profilePhoto}
                alt={profileData.name || "Profile"}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />
            </div>
          </div>

          {/* Contact Items with Single Open Popover Behavior */}
          <div className="w-full max-w-xs space-y-2.5">
            {profileData.email && (
              <ContactItem
                icon={Mail}
                value={profileData.email}
                type="email"
                id="hero-email"
                activeId={activeContactId}
                setActiveId={setActiveContactId}
                className="w-full"
              />
            )}
            {profileData.phone && (
              <ContactItem
                icon={Phone}
                value={profileData.phone}
                type="phone"
                id="hero-phone"
                activeId={activeContactId}
                setActiveId={setActiveContactId}
                className="w-full"
              />
            )}
            {profileData.location && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-card/60 border border-slate-800 text-slate-400 text-xs">
                <MapPin className="w-4 h-4 text-brand flex-shrink-0" />
                <span>{profileData.location}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Side: Headline, Dynamic Highlights, and CTAs */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-3"
          >
            {profileData.roleTag && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {profileData.roleTag}
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/30">
              <Users className="w-3.5 h-3.5" />
              <span>{totalViews} Visitors</span>
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            Hi, I’m <span className="text-brand">{profileData.name}</span>.{" "}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-sky-400 to-indigo-400">
              {profileData.headline}
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed"
          >
            {profileData.bio}
          </motion.p>

          {/* Dynamic Highlight Pillars with Skyblue Border + Hover Glow */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
          >
            {highlights.map((item) => (
              <div
                key={item.id || item.title}
                className="group relative p-4 rounded-xl bg-card border border-brand/40 hover:border-brand transition-all duration-300 flex items-center gap-3.5 shadow-lg shadow-black/40 hover:shadow-brand/20 hover:-translate-y-1 overflow-hidden"
              >
                {/* Ambient Hover Glow */}
                <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="p-2 rounded-lg bg-brand/10 border border-brand/20 flex-shrink-0 group-hover:scale-110 group-hover:border-brand/40 transition-all duration-300">
                  <DynamicIcon icon={item.icon} className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-slate-400 truncate">
                    {item.subtitle}
                  </div>
                  <div className="text-sm font-bold text-white truncate group-hover:text-brand transition-colors">
                    {item.title}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-4 pt-4"
          >
            <a
              href="#projects"
              className="px-6 py-3 rounded-xl bg-brand hover:bg-brandDark text-slate-950 font-bold transition flex items-center gap-2 shadow-lg shadow-brand/20"
            >
              View Projects <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={onOpenResume}
              className="px-6 py-3 rounded-xl bg-card hover:bg-slate-800 border border-brand/40 hover:border-brand font-semibold text-white transition flex items-center gap-2 shadow-lg"
            >
              <FileText className="w-4 h-4 text-brand" /> View & Download CV
            </button>

            <a
              href="#contact"
              className="px-6 py-3 rounded-xl bg-transparent hover:bg-slate-800/60 border border-slate-700 font-semibold text-slate-300 transition"
            >
              Contact Me
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
