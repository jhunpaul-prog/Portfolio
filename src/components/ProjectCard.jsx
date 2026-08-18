import { motion } from "framer-motion";
import { ExternalLink, Layers } from "lucide-react";

export default function ProjectCard({ project, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group relative rounded-2xl bg-card border border-cardBorder hover:border-brand/50 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl overflow-hidden"
    >
      {/* Glow on hover */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand/10 rounded-full blur-3xl group-hover:bg-brand/20 transition-all duration-500 pointer-events-none" />

      <div className="space-y-4">
        {/* Category & Link Icons */}
        <div className="flex justify-between items-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            {project.category}
          </span>
          <div className="flex items-center gap-2 text-slate-400">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition"
              >
                {/* Clean GitHub SVG */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Live Demo"
                className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="text-xl font-bold text-white group-hover:text-brand transition">
          {project.title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Tech Tags */}
      <div className="flex flex-wrap gap-2 pt-6">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-surface border border-cardBorder text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.article>
  );
}
