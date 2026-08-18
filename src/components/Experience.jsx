import { motion } from "framer-motion";
// eslint-disable-next-line no-unused-vars
import { Briefcase, Calendar, MapPin, ChevronRight } from "lucide-react";

export default function Experience({ experiences = [] }) {
  if (!experiences || experiences.length === 0) return null;

  return (
    <section id="experience" className="py-12 space-y-10 relative z-10">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
          <Briefcase className="w-3.5 h-3.5" /> Career Journey
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Work Experience & Roles
        </h2>
        <p className="text-slate-400 text-sm">
          Professional development, engineering internships, and leadership
          milestones.
        </p>
      </div>

      {/* Vertical Glowing Timeline */}
      <div className="relative border-l-2 border-slate-800 ml-4 md:ml-6 space-y-8 pl-6 md:pl-8">
        {experiences.map((exp, index) => (
          <motion.div
            key={exp.id || index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: index * 0.1 }}
            className="relative group"
          >
            {/* Timeline Pulsing Node */}
            <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-surface border-2 border-brand group-hover:bg-brand group-hover:scale-125 transition-all duration-300 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />

            {/* Experience Card */}
            <div className="p-6 md:p-7 rounded-2xl bg-card border border-cardBorder hover:border-brand/40 transition-all duration-300 space-y-4 shadow-xl hover:-translate-y-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-brand transition-colors">
                    {exp.role}
                  </h3>
                  <div className="text-sm font-semibold text-brand/90 flex items-center gap-1.5 mt-0.5">
                    {exp.company}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                  {exp.period && (
                    <span className="flex items-center gap-1 bg-surface px-2.5 py-1 rounded-md border border-cardBorder">
                      <Calendar className="w-3.5 h-3.5 text-brand" />{" "}
                      {exp.period}
                    </span>
                  )}
                  {exp.location && (
                    <span className="flex items-center gap-1 bg-surface px-2.5 py-1 rounded-md border border-cardBorder">
                      <MapPin className="w-3.5 h-3.5 text-brand" />{" "}
                      {exp.location}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {exp.description}
              </p>

              {/* Responsibilities or Tech Stack Badges */}
              {exp.skills && exp.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                  {exp.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 text-xs rounded-md bg-surface border border-brand/20 text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
