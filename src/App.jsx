import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProjectCard from "./components/ProjectCard";
import Experience from "./components/Experience";
import ResumeModal from "./components/ResumeModal";
import ContactItem from "./components/ContactItem";
import { useVisitorTracker } from "./hooks/useVisitorTracker";
import { db } from "./firebase";
import { collection, onSnapshot, doc, query, where } from "firebase/firestore";
import { Mail, Phone, Users, Sparkles } from "lucide-react";

export default function App() {
  const [profile, setProfile] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [footerActiveContact, setFooterActiveContact] = useState(null);

  const [sectionOrder, setSectionOrder] = useState([
    { id: "projects", label: "Featured Projects", visible: true },
    { id: "experience", label: "Work Experience", visible: true },
    { id: "contact", label: "Contact Section", visible: true },
  ]);

  useVisitorTracker();

  useEffect(() => {
    // 1. Fetch Profile
    const unsubProfile = onSnapshot(
      doc(db, "content", "profile"),
      (docSnap) => {
        if (docSnap.exists()) setProfile(docSnap.data());
        setLoading(false);
      },
    );

    // 2. Fetch Sections Arrangement
    const unsubSections = onSnapshot(
      doc(db, "content", "sections"),
      (docSnap) => {
        if (docSnap.exists() && Array.isArray(docSnap.data().order)) {
          setSectionOrder(docSnap.data().order);
        }
      },
    );

    // 3. Fetch Highlights (Sorted by order)
    const unsubHighlights = onSnapshot(collection(db, "highlights"), (snap) => {
      const list = snap.docs.map((d, index) => ({
        id: d.id,
        order: d.data().order !== undefined ? Number(d.data().order) : index,
        ...d.data(),
      }));
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setHighlights(list);
    });

    // 4. Fetch Projects (Sorted by order)
    const unsubProjects = onSnapshot(collection(db, "projects"), (snap) => {
      const list = snap.docs.map((d, index) => ({
        id: d.id,
        order: d.data().order !== undefined ? Number(d.data().order) : index,
        ...d.data(),
      }));
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setProjects(list);
    });

    // 5. Fetch Work Experiences (Sorted by order)
    const unsubExperiences = onSnapshot(
      collection(db, "experiences"),
      (snap) => {
        const list = snap.docs.map((d, index) => ({
          id: d.id,
          order: d.data().order !== undefined ? Number(d.data().order) : index,
          ...d.data(),
        }));
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setExperiences(list);
      },
    );

    // 6. Fetch Active Resume
    const q = query(collection(db, "resumes"), where("isActive", "==", true));
    const unsubResume = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setActiveResume(snap.docs[0].data());
      } else {
        setActiveResume({ title: "Default CV", fileUrl: "/resume.pdf" });
      }
    });

    // 7. Fetch Total Views Counter
    const unsubCounter = onSnapshot(
      doc(db, "analytics_summary", "counter"),
      (d) => {
        if (d.exists()) setTotalViews(d.data().totalViews || 0);
      },
    );

    return () => {
      unsubProfile();
      unsubSections();
      unsubHighlights();
      unsubProjects();
      unsubExperiences();
      unsubResume();
      unsubCounter();
    };
  }, []);

  const renderSection = (sectionId) => {
    switch (sectionId) {
      case "projects":
        return (
          <section
            key="projects"
            id="projects"
            className="py-12 space-y-8 relative z-10"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Featured Projects
              </h2>
              <p className="text-slate-400 text-sm">
                Showcase of systems architecture, mobile applications, and
                embedded hardware experiments.
              </p>
            </div>

            {projects.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-card/40 rounded-2xl border border-cardBorder">
                No projects added yet. Add projects in the{" "}
                <a href="/admin" className="text-brand underline">
                  Admin Panel
                </a>
                .
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, idx) => (
                  <ProjectCard key={project.id} project={project} index={idx} />
                ))}
              </div>
            )}
          </section>
        );

      case "experience":
        return <Experience key="experience" experiences={experiences} />;

      case "contact":
        return (
          <section key="contact" id="contact" className="py-20 relative z-10">
            <div className="p-8 md:p-14 rounded-3xl bg-gradient-to-b from-card to-surface border border-brand/30 shadow-2xl text-center space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-32 bg-brand/10 blur-3xl rounded-full pointer-events-none" />

              <div className="space-y-3 relative z-10 max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
                  <Sparkles className="w-3.5 h-3.5" /> Get in Touch
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  Let’s Work Together
                </h2>
                <p className="text-slate-400 text-sm sm:text-base">
                  Click below to copy details or launch directly into your email
                  and phone dialer.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-lg mx-auto relative z-10">
                {profile?.email && (
                  <ContactItem
                    icon={Mail}
                    value={profile.email}
                    type="email"
                    id="footer-email"
                    activeId={footerActiveContact}
                    setActiveId={setFooterActiveContact}
                    className="w-full sm:w-auto"
                  />
                )}
                {profile?.phone && (
                  <ContactItem
                    icon={Phone}
                    value={profile.phone}
                    type="phone"
                    id="footer-phone"
                    activeId={footerActiveContact}
                    setActiveId={setFooterActiveContact}
                    className="w-full sm:w-auto"
                  />
                )}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-surface text-slate-200 min-h-screen selection:bg-brand selection:text-slate-950 font-sans">
      <Navbar onOpenResume={() => setIsResumeOpen(true)} />

      <main className="max-w-6xl mx-auto px-6 space-y-24">
        <Hero
          profileData={profile}
          highlights={highlights}
          activeResume={activeResume}
          onOpenResume={() => setIsResumeOpen(true)}
          totalViews={totalViews}
          loading={loading}
        />

        {sectionOrder.filter((s) => s.visible).map((s) => renderSection(s.id))}
      </main>

      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        activeResume={activeResume}
      />

      <footer className="border-t border-cardBorder py-8 mt-24 text-center text-xs text-slate-500 relative z-10 space-y-2">
        <p>
          © 2026 {profile?.name || "Developer"}. Built with React, Firebase, and
          Framer Motion.
        </p>
        <div className="inline-flex items-center gap-1.5 text-slate-400">
          <Users className="w-3.5 h-3.5 text-brand" /> Total Site Views:{" "}
          <span className="text-slate-200 font-bold">{totalViews}</span>
        </div>
      </footer>
    </div>
  );
}
